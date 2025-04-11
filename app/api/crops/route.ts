import { NextResponse } from "next/server"
import sql from "@/lib/db"
import type { Crop } from "@/lib/types"

export async function GET() {
  try {
    const crops = await sql<Crop[]>`
      SELECT * FROM crops
      ORDER BY name ASC
    `

    return NextResponse.json(crops)
  } catch (error) {
    console.error("Error fetching crops:", error)
    return NextResponse.json({ error: "Failed to fetch crops" }, { status: 500 })
  }
}
