"use client";

import {JSX} from "react";
import ContentLayout from "@/components/content-layout";

const breadcrumbItems = [
  {label: "Frontend", link: "/frontend"},
  {label: "Liste"}
];

export default function FrontendList(): JSX.Element {
  return (
    <ContentLayout breadcrumbItems={breadcrumbItems}>

    </ContentLayout>
  );
}
