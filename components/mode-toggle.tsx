"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { useLanguage } from "@/components/language-provider"
import { Wifi, WifiOff } from "lucide-react"

interface ModeToggleProps {
  onChange?: (mode: "online" | "offline") => void
}

export function ModeToggle({ onChange }: ModeToggleProps) {
  const [isOnline, setIsOnline] = useState(true)
  const { t } = useLanguage()

  const handleToggle = (checked: boolean) => {
    setIsOnline(checked)
    if (onChange) {
      onChange(checked ? "online" : "offline")
    }
  }

  return (
    <div className="flex items-center space-x-4 rounded-lg border p-4">
      <div className="flex-1 space-y-1">
        <div className="flex items-center">
          {isOnline ? (
            <Wifi className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="mr-2 h-4 w-4 text-gray-500" />
          )}
          <p className="text-sm font-medium leading-none">{isOnline ? t("onlineMode") : t("offlineMode")}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          {isOnline
            ? "Using cloud AI for more accurate results (requires internet)"
            : "Using on-device AI (works without internet)"}
        </p>
      </div>
      <Switch checked={isOnline} onCheckedChange={handleToggle} />
    </div>
  )
}
