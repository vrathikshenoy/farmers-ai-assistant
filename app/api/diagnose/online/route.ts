import { NextResponse } from "next/server"
import sql from "@/lib/db"
import type { Disease } from "@/lib/types"

// This would normally use the Gemini API for image analysis
export async function POST(request: Request) {
  try {
    const { image, cropId } = await request.json()

    if (!image || !cropId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In a real implementation, we would:
    // 1. Send the image to Gemini API for analysis
    // 2. Process the response to identify diseases
    // 3. Return the results

    // For now, we'll simulate by fetching a random disease for the crop
    const diseases = await sql<Disease[]>`
      SELECT * FROM diseases
      WHERE crop_id = ${cropId}
      LIMIT 5
    `

    if (diseases.length === 0) {
      return NextResponse.json({ error: "No diseases found for this crop" }, { status: 404 })
    }

    // Simulate AI analysis by selecting a random disease
    const randomDisease = diseases[Math.floor(Math.random() * diseases.length)]

    // Generate a confidence score between 0.6 and 0.95
    const confidence = 0.6 + Math.random() * 0.35

    // Parse treatments from the database fields
    const organicTreatments = randomDisease.organic_treatment
      ? randomDisease.organic_treatment.split(";").map((t) => t.trim())
      : ["Apply neem oil spray", "Use compost tea as a natural fungicide"]

    const chemicalTreatments = randomDisease.chemical_treatment
      ? randomDisease.chemical_treatment.split(";").map((t) => t.trim())
      : ["Apply copper-based fungicide", "Use systemic fungicide as per label instructions"]

    const result = {
      disease: randomDisease,
      confidence,

      treatments: {
        organic: organicTreatments,
        chemical: chemicalTreatments,
      },
    }

    // Save the diagnosis to the database
    await sql`
      INSERT INTO diagnoses (
        crop_id, 
        disease_id, 
        image_url, 
        confidence_score, 
        is_offline
      ) VALUES (
        ${cropId}, 
        ${randomDisease.id}, 
        ${image.substring(0, 255)}, 
        ${confidence}, 
        false
      )
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error diagnosing plant:", error)
    return NextResponse.json({ error: "Failed to diagnose plant" }, { status: 500 })
  }
}
