"use client";

import React, {JSX, useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Save} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Textarea} from "@/components/ui/textarea";
import ContentLayout from "@/components/content-layout";
import {HAPROXY_CONFIG_FILE_PATH} from "@/lib/constants";

export default function ConfigFilePage(): JSX.Element {
  const [configContent, setConfigContent] = useState<string>("");

  const loadConfigContent = async () => {
    const response = await fetch("/api/config-file");
    return await response.json();
  };

  const saveConfigContent = async () => {

  }

  useEffect(() => {
    loadConfigContent().then(data => {
      setConfigContent(data.contents);
    });
  }, [])

  return (
    <ContentLayout breadcrumbItems={[{label: "Fichier de configuration"}]}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fichier de configuration</h1>
            <p className="text-muted-foreground">Modification directe des configurations d'HAProxy</p>
          </div>
          <div className="space-x-2">
            <Button onClick={saveConfigContent}>
              <Save/> Sauvegarder
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{HAPROXY_CONFIG_FILE_PATH}</CardTitle>
            <CardDescription>Ci-dessous le contenu du fichier</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              className="font-mono"
              rows={30}
              value={configContent}
              onChange={(e) => setConfigContent(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
