"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MobileNav } from "@/components/mobile-nav";
import { CameraCapture } from "@/components/camera-capture";
import { CropSelector } from "@/components/crop-selector";
import { ModeToggle } from "@/components/mode-toggle";
import { useLanguage } from "@/components/language-provider";
import { Loader2 } from "lucide-react";
import type { AppMode } from "@/lib/types";

export default function DiagnosePage() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedCropId, setSelectedCropId] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [appMode, setAppMode] = useState<AppMode>("online");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const router = useRouter();
  const { t } = useLanguage();

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    // Also store in session storage immediately in case we need it
    if (typeof window !== "undefined") {
      sessionStorage.setItem("capturedImage", imageData);
    }
  };

  const handleUpload = (file: File) => {
    setUploadedFile(file);
  };

  const handleCropSelect = (cropId: number) => {
    setSelectedCropId(cropId);
  };

  const handleModeChange = (mode: AppMode) => {
    setAppMode(mode);
  };

  const analyzePlant = async () => {
    if (!capturedImage || !selectedCropId) return;

    setIsAnalyzing(true);

    try {
      // Determine which API endpoint to use based on the selected mode
      const apiEndpoint =
        appMode === "online" ? "/api/diagnose/online" : "/api/diagnose/offline";

      // Make the actual API call
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: capturedImage,
          cropId: selectedCropId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();

      // Store result in session storage for the results page
      if (typeof window !== "undefined") {
        sessionStorage.setItem("diagnosisResult", JSON.stringify(result));
        // Ensure the image is stored
        if (capturedImage) {
          sessionStorage.setItem("capturedImage", capturedImage);
        }
      }

      router.push("/diagnose/results");
    } catch (error) {
      console.error("Error analyzing plant:", error);
      alert(
        "Failed to analyze the plant image. Please try again or switch modes.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

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
                `Analyze Plant (${appMode} mode)`
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </main>
  );
}
