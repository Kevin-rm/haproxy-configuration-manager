import {SidebarMenu, SidebarMenuButton, SidebarMenuItem} from "@/components/ui/sidebar";
import Link from "next/link";
import {LucideProps} from "lucide-react";
import * as React from "react";
import * as react from "react";

export default function SidebarHeaderContent({content}: {
  content: {
    title: string;
    subtitle: string;
    href: string;
    icon: react.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & react.RefAttributes<SVGSVGElement>>
  }
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href={content.href}>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div
              className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              {<content.icon className="size-5"/>}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{content.title}</span>
              <span className="truncate text-xs">{content.subtitle}</span>
            </div>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
