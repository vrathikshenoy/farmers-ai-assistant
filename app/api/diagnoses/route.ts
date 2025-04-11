import { NextResponse } from "next/server"
import sql from "@/lib/db"

export async function GET() {
  try {
    const diagnoses = await sql`
      SELECT 
        d.*, 
        dis.name as disease_name, 
        dis.symptoms as disease_symptoms,
        c.name as crop_name
      FROM diagnoses d
      JOIN diseases dis ON d.disease_id = dis.id
      JOIN crops c ON d.crop_id = c.id
      ORDER BY d.created_at DESC
      LIMIT 20
    `

    // Transform the results to match the expected format
    const formattedDiagnoses = diagnoses.map((d) => ({
      id: d.id,
      user_id: d.user_id,
      crop_id: d.crop_id,
      disease_id: d.disease_id,
      image_url: d.image_url,
      confidence_score: d.confidence_score,
      notes: d.notes,
      created_at: d.created_at,
      is_offline: d.is_offline,
      disease: {
        id: d.disease_id,
        name: d.disease_name,
        symptoms: d.disease_symptoms,
      },
      crop: {
        id: d.crop_id,
        name: d.crop_name,
      },
    }))

    return NextResponse.json(formattedDiagnoses)
  } catch (error) {
    console.error("Error fetching diagnoses:", error)
    return NextResponse.json({ error: "Failed to fetch diagnoses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { result, imageUrl } = await request.json()

    if (!result || !result.disease) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Save the diagnosis to the database
    const diagnosis = await sql`
      INSERT INTO diagnoses (
        crop_id, 
        disease_id, 
        image_url, 
        confidence_score, 
        notes,
        is_offline
      ) VALUES (
        ${result.disease.crop_id}, 
        ${result.disease.id}, 
        ${imageUrl ? imageUrl.substring(0, 255) : null}, 
        ${result.confidence}, 
        ${result.notes || null},
        ${result.isOffline || false}
      )
      RETURNING *
    `

    return NextResponse.json(diagnosis[0])
  } catch (error) {
    console.error("Error saving diagnosis:", error)
    return NextResponse.json({ error: "Failed to save diagnosis" }, { status: 500 })
  }
}
