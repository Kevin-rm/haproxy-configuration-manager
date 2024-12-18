import {SidebarMenu, SidebarMenuButton, SidebarMenuItem} from "@/components/ui/sidebar";
import Link from "next/link";
import {Cog, LucideProps} from "lucide-react";
import * as React from "react";
import * as react from "react";

const data: {
  title: string;
  subtitle: string;
  href: string;
  icon: react.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & react.RefAttributes<SVGSVGElement>>
} = {
  title: "HAProxy Manager",
  subtitle: "Application",
  href: "/",
  icon: Cog
};

export default function SidebarHeaderContent() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href={data.href}>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div
              className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              {<data.icon className="size-5"/>}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{data.title}</span>
              <span className="truncate text-xs">{data.subtitle}</span>
            </div>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
