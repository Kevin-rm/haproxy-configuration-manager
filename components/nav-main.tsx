"use client"

import {type LucideIcon} from "lucide-react"
import {SidebarGroup, SidebarGroupLabel, SidebarMenu,} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Paramètres</SidebarGroupLabel>
      <SidebarMenu>

      </SidebarMenu>
    </SidebarGroup>
  );
}
