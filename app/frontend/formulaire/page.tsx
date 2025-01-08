"use client";

import {JSX} from "react";
import ContentLayout from "@/components/content-layout";

const breadcrumbItems = [
  {label: "Frontend", link: "/frontend"},
  {label: "Ajout"}
];

export default function AddFrontend(): JSX.Element {
  return (
    <ContentLayout breadcrumbItems={breadcrumbItems}>

    </ContentLayout>
  );
}
