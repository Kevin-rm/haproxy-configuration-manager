"use client";

import {JSX} from "react";
import ContentLayout from "@/components/content-layout";

const breadcrumbItems = [
  {label: "Backend", link: "/backend"},
  {label: "Ajout"}
];

export default function AddBackend(): JSX.Element {
  return (
    <ContentLayout breadcrumbItems={breadcrumbItems}>

    </ContentLayout>
  );
}
