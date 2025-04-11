"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useLanguage } from "@/components/language-provider"
import type { Crop } from "@/lib/types"

interface CropSelectorProps {
  onSelect: (cropId: number) => void
}

export function CropSelector({ onSelect }: CropSelectorProps) {
  const [open, setOpen] = useState(false)
  const [crops, setCrops] = useState<Crop[]>([])
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null)
  const { t } = useLanguage()

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const response = await fetch("/api/crops")
        const data = await response.json()
        setCrops(data)
      } catch (error) {
        console.error("Error fetching crops:", error)
        // Fallback to common crops if API fails
        setCrops([
          {
            id: 1,
            name: "Rice",
            scientific_name: "Oryza sativa",
            description: "Staple food crop",
            common_in_regions: ["South India", "East India"],
          },
          {
            id: 2,
            name: "Wheat",
            scientific_name: "Triticum",
            description: "Cereal grain",
            common_in_regions: ["North India"],
          },
          {
            id: 3,
            name: "Cotton",
            scientific_name: "Gossypium",
            description: "Fiber crop",
            common_in_regions: ["Central India", "West India"],
          },
          {
            id: 4,
            name: "Sugarcane",
            scientific_name: "Saccharum officinarum",
            description: "Sugar crop",
            common_in_regions: ["North India", "South India"],
          },
          {
            id: 5,
            name: "Maize",
            scientific_name: "Zea mays",
            description: "Cereal grain",
            common_in_regions: ["All India"],
          },
        ])
      }
    }

    fetchCrops()
  }, [])

  const handleSelect = (crop: Crop) => {
    setSelectedCrop(crop)
    setOpen(false)
    onSelect(crop.id)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {selectedCrop ? selectedCrop.name : t("selectCrop")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`${t("selectCrop")}...`} />
          <CommandList>
            <CommandEmpty>No crop found.</CommandEmpty>
            <CommandGroup>
              {crops.map((crop) => (
                <CommandItem key={crop.id} value={crop.name} onSelect={() => handleSelect(crop)}>
                  <Check className={cn("mr-2 h-4 w-4", selectedCrop?.id === crop.id ? "opacity-100" : "opacity-0")} />
                  {crop.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
