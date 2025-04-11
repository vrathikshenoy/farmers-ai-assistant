"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import { DiagnosisResultCard } from "@/components/diagnosis-result"
import { useLanguage } from "@/components/language-provider"
import type { DiagnosisResult } from "@/lib/types"
import { ArrowLeft, Save, Share2 } from "lucide-react"

export default function ResultsPage() {
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    // Get diagnosis result from session storage
    const storedResult = sessionStorage.getItem("diagnosisResult")
    if (storedResult) {
      setResult(JSON.parse(storedResult))
    } else {
      // If no result, redirect back to diagnose page
      router.push("/diagnose")
    }
  }, [router])

  const handleSave = async () => {
    if (!result) return

    try {
      const response = await fetch("/api/diagnoses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          result,
          imageUrl: sessionStorage.getItem("capturedImage"),
        }),
      })

      if (response.ok) {
        // Show success message or redirect to history
        router.push("/history")
      }
    } catch (error) {
      console.error("Error saving diagnosis:", error)
    }
  }

  const handleShare = () => {
    if (!result) return

    // Use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: `Plant Disease: ${result.disease.name}`,
        text: `I found ${result.disease.name} in my plant using Farmers AI Assistant.`,
        url: window.location.href,
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      alert("Sharing is not supported in this browser.")
    }
  }

  if (!result) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <p>{t("loading")}</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col pb-16">
      <div className="p-4 border-b flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.push("/diagnose")} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">{t("diagnosisResults")}</h1>
      </div>

      <div className="flex-1 p-4 space-y-4">
        <div className="aspect-[4/3] bg-black rounded-lg overflow-hidden mb-4">
          <img
            src={sessionStorage.getItem("capturedImage") || ""}
            alt="Plant image"
            className="w-full h-full object-cover"
          />
        </div>

        <DiagnosisResultCard result={result} />

        <div className="grid grid-cols-2 gap-4 mt-6">
          <Button onClick={handleSave} className="flex items-center justify-center">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" onClick={handleShare} className="flex items-center justify-center">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <MobileNav />
    </main>
  )
}
