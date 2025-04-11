import { NextResponse } from "next/server";
import sql from "@/lib/db";
import type { Disease } from "@/lib/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    // Log the start of the request
    console.log("Starting plant diagnosis...");

    const { image, cropId } = await request.json();

    if (!image || !cropId) {
      console.log("Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get crop information for context
    console.log("Fetching crop info for cropId:", cropId);
    const cropInfo = await sql`
      SELECT name, scientific_name FROM crops
      WHERE id = ${cropId}
      LIMIT 1
    `;

    if (cropInfo.length === 0) {
      console.log("Crop not found");
      return NextResponse.json({ error: "Crop not found" }, { status: 404 });
    }

    console.log(`Found crop: ${cropInfo[0].name}`);

    // Get all possible diseases for this crop to pass to Gemini
    console.log("Fetching diseases for this crop");
    const diseases = await sql<Disease[]>`
      SELECT * FROM diseases
      WHERE crop_id = ${cropId}
    `;

    if (diseases.length === 0) {
      console.log("No diseases found for this crop");
      return NextResponse.json(
        { error: "No diseases found for this crop" },
        { status: 404 },
      );
    }

    console.log(`Found ${diseases.length} possible diseases`);

    try {
      // Extract base64 data from the image string (remove the data:image/jpeg;base64, prefix)
      const parts = image.split(",");
      if (parts.length !== 2) {
        throw new Error("Invalid image format");
      }

      const base64Image = parts[1];

      // Validate base64 data
      if (!base64Image || base64Image.length < 100) {
        throw new Error("Invalid or empty image data");
      }

      console.log("Image data validated, length:", base64Image.length);

      // Create a model instance
      console.log("Initializing Gemini model");
      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

      // Prepare prompt with context about the crop and possible diseases
      const prompt = `
        Analyze this image of a ${cropInfo[0].name} (${cropInfo[0].scientific_name}) plant and identify any diseases.
        
        Possible diseases for this crop include:
        ${diseases.map((d) => `- ${d.name}: ${d.symptoms}`).join("\n")}
        
        Please identify the most likely disease and provide:
        1. The name of the disease
        2. Your confidence level (0-1)
        3. Detailed reasoning based on visual symptoms
        
        Format your response as JSON like this:
        {
          "diseaseName": "Disease name",
          "confidence": 0.85,
          "reasoning": "Detailed explanation of visual symptoms",
          "treatments": {
            "organic": ["Treatment 1", "Treatment 2"],
            "chemical": ["Treatment 1", "Treatment 2"]
          }
        }
      `;

      console.log("Sending request to Gemini API");

      // Process with Gemini API
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image,
          },
        },
      ]);

      console.log("Received response from Gemini");
      const response = await result.response;
      const textResponse = response.text();
      console.log("Gemini raw response:", textResponse);

      // Parse the JSON response from Gemini
      let geminiAnalysis;
      try {
        // Extract JSON from the response text (it might be wrapped in markdown code blocks)
        const jsonMatch =
          textResponse.match(/```json\n([\s\S]*?)\n```/) ||
          textResponse.match(/```\n([\s\S]*?)\n```/);

        let jsonText;
        if (jsonMatch && jsonMatch[1]) {
          jsonText = jsonMatch[1];
          console.log("Extracted JSON from markdown code block");
        } else {
          // Try to find JSON-like content in the text
          const possibleJson = textResponse.match(/\{[\s\S]*\}/);
          if (possibleJson) {
            jsonText = possibleJson[0];
            console.log("Extracted JSON-like content from text");
          } else {
            jsonText = textResponse;
            console.log("Using full text response as JSON");
          }
        }

        console.log("Attempting to parse:", jsonText);
        geminiAnalysis = JSON.parse(jsonText);
        console.log("Successfully parsed JSON response:", geminiAnalysis);
      } catch (error) {
        console.error("Error parsing Gemini response:", error);
        console.error("Raw text response:", textResponse);

        // Fall back to a simplified detection
        geminiAnalysis = {
          diseaseName: diseases[0].name,
          confidence: 0.7,
          reasoning: `Could not parse Gemini response. Raw response: ${textResponse.substring(0, 100)}...`,
          treatments: {
            organic: diseases[0].organic_treatment
              .split(";")
              .map((t) => t.trim()),
            chemical: diseases[0].chemical_treatment
              .split(";")
              .map((t) => t.trim()),
          },
        };
        console.log("Using fallback analysis:", geminiAnalysis);
      }

      // Find the matching disease from our database
      console.log("Finding matching disease in database");
      const matchedDisease =
        diseases.find(
          (d) =>
            d.name.toLowerCase() === geminiAnalysis.diseaseName.toLowerCase(),
        ) || diseases[0]; // Fallback to first disease if no match

      console.log("Matched disease:", matchedDisease.name);

      // Construct the result
      const diagnosisResult = {
        disease: matchedDisease,
        confidence: geminiAnalysis.confidence,
        reasoning: geminiAnalysis.reasoning || "Visual analysis complete",
        treatments: {
          organic:
            geminiAnalysis.treatments?.organic ||
            matchedDisease.organic_treatment.split(";").map((t) => t.trim()),
          chemical:
            geminiAnalysis.treatments?.chemical ||
            matchedDisease.chemical_treatment.split(";").map((t) => t.trim()),
        },
      };

      console.log("Final diagnosis result prepared");

      // Save the diagnosis to the database
      try {
        console.log("Saving diagnosis to database");
        await sql`
          INSERT INTO diagnoses (
            crop_id, 
            disease_id, 
            image_url, 
            confidence_score, 
            notes,
            is_offline
          ) VALUES (
            ${cropId}, 
            ${matchedDisease.id}, 
            ${image.substring(0, 255)}, 
            ${diagnosisResult.confidence}, 
            ${geminiAnalysis.reasoning || null},
            false
          )
        `;
        console.log("Diagnosis saved to database");
      } catch (dbError) {
        console.error("Database error:", dbError);
        // Continue with the response even if DB save fails
      }

      return NextResponse.json(diagnosisResult);
    } catch (aiError) {
      console.error("AI processing error:", aiError);
      return NextResponse.json(
        {
          error: "AI processing failed",
          message: aiError.message,
          stack:
            process.env.NODE_ENV === "development" ? aiError.stack : undefined,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error diagnosing plant:", error);
    return NextResponse.json(
      {
        error: "Failed to diagnose plant",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
