"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MobileNav } from "@/components/mobile-nav"
import { CameraCapture } from "@/components/camera-capture"
import { CropSelector } from "@/components/crop-selector"
import { ModeToggle } from "@/components/mode-toggle"
import { useLanguage } from "@/components/language-provider"
import { Loader2 } from "lucide-react"
import type { AppMode } from "@/lib/types"

export default function DiagnosePage() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [selectedCropId, setSelectedCropId] = useState<number | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [appMode, setAppMode] = useState<AppMode>("online")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const router = useRouter()
  const { t } = useLanguage()

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData)
    // Also store in session storage immediately in case we need it
    if (typeof window !== "undefined") {
      sessionStorage.setItem("capturedImage", imageData)
    }
  }

  const handleUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleCropSelect = (cropId: number) => {
    setSelectedCropId(cropId)
  }

  const handleModeChange = (mode: AppMode) => {
    setAppMode(mode)
  }

  const analyzePlant = async () => {
    if (!capturedImage || !selectedCropId) return

    setIsAnalyzing(true)

    try {
      // For preview/demo purposes, we'll simulate the API call
      // In a real app, we would call the actual API endpoint
      const simulateApiCall = async () => {
        // Wait for 1.5 seconds to simulate processing
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Create a mock result
        return {
          disease: {
            id: 1,
            name: "Leaf Rust",
            crop_id: selectedCropId,
            symptoms:
              "Yellow-orange pustules on leaves, often in circular patterns. Leaves may turn yellow and fall prematurely.",
            causes: "Fungal infection caused by Puccinia species. Spreads in warm, humid conditions.",
            prevention: "Plant resistant varieties, ensure proper spacing for air circulation.",
            organic_treatment: "Remove infected leaves; apply neem oil or sulfur-based fungicides.",
            chemical_treatment: "Apply copper-based fungicides or systemic fungicides containing triazoles.",
            image_url: null,
          },
          confidence: 0.87,
          treatments: {
            organic: [
              "Remove and destroy infected plant parts",
              "Apply neem oil spray (mix 2-3 ml per liter of water)",
              "Use sulfur-based organic fungicides as directed",
              "Apply compost tea as a preventative measure",
            ],
            chemical: [
              "Apply copper oxychloride (2-3g per liter of water)",
              "Use systemic fungicides containing tebuconazole",
              "Alternate fungicides to prevent resistance",
              "Apply as directed on product label, typically every 7-14 days",
            ],
          },
        }
      }

      // Simulate API call for preview purposes
      const result = await simulateApiCall()

      // Store result in session storage for the results page
      if (typeof window !== "undefined") {
        sessionStorage.setItem("diagnosisResult", JSON.stringify(result))
        // Ensure the image is stored
        if (capturedImage) {
          sessionStorage.setItem("capturedImage", capturedImage)
        }
      }

      router.push("/diagnose/results")
    } catch (error) {
      console.error("Error analyzing plant:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col pb-16">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">{t("diagnose")}</h1>
      </div>

      <div className="flex-1 p-4 space-y-4">
        <ModeToggle onChange={handleModeChange} />

        <CameraCapture onCapture={handleCapture} onUpload={handleUpload} />

        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="font-medium">{t("selectCrop")}</h2>
            <CropSelector onSelect={handleCropSelect} />

            <Button
              onClick={analyzePlant}
              disabled={!capturedImage || !selectedCropId || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("loading")}
                </>
              ) : (
                "Analyze Plant"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </main>
  )
}
