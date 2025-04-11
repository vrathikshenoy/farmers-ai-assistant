import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import { LanguageSelector } from "@/components/language-selector"
import { ModeToggle } from "@/components/mode-toggle"
import { Camera, History, Settings } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col pb-16">
      {/* Hero Section */}
      <section className="relative h-[40vh] bg-gradient-to-b from-green-600 to-green-800 flex items-center justify-center text-white p-6">
        <div className="text-center space-y-4 z-10">
          <h1 className="text-3xl font-bold">Farmers AI Assistant</h1>
          <p className="text-lg">Diagnose plant diseases instantly with your camera</p>
        </div>
        <div className="absolute inset-0 bg-black/20"></div>
      </section>

      {/* Main Content */}
      <section className="flex-1 p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Welcome</h2>
          <p className="text-muted-foreground">
            Take a photo of your plant to identify diseases and get treatment recommendations.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/diagnose">
            <Button className="w-full flex items-center justify-center h-16 text-lg">
              <Camera className="mr-2 h-5 w-5" />
              Diagnose Plant Disease
            </Button>
          </Link>

          <div className="grid grid-cols-2 gap-4">
            <Link href="/history">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center">
                <History className="h-5 w-5 mb-1" />
                View History
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center">
                <Settings className="h-5 w-5 mb-1" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">App Settings</h3>
          <LanguageSelector />
          <ModeToggle />
        </div>

        <div className="rounded-lg border bg-card p-4 mt-6">
          <h3 className="font-medium mb-2">Offline Mode Available</h3>
          <p className="text-sm text-muted-foreground">
            This app works without internet. Switch to offline mode when you're in the field with limited connectivity.
          </p>
        </div>
      </section>

      <MobileNav />
    </main>
  )
}
