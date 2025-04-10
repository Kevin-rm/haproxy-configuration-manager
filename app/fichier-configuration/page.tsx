"use client";

import React, {JSX, useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {FileCode2, Loader2, RotateCcw, Save} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Textarea} from "@/components/ui/textarea";
import ContentLayout from "@/components/content-layout";
import {HAPROXY_CONFIG_FILE_PATH} from "@/lib/constants";
import {useToast} from "@/hooks/use-toast";

const fetchConfigFile = async () => {
  const response = await fetch("/api/config-file");

  const jsonResponse = await response.json();
  if (!response.ok) throw new Error(jsonResponse.error || "Erreur lors du chargement de la configuration");

  return jsonResponse.contents;
};

const saveConfigFile = async (contents: string) => {
  const response = await fetch("/api/config-file", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({contents}),
  });

  if (response.ok) return;

  const jsonResponse = await response.json();
  throw new Error(jsonResponse.error || "Erreur lors de la sauvegarde");
};

export default function ConfigFilePage(): JSX.Element {
  const [configContent, setConfigContent] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const [hasChanges, setHasChanges] = useState<Boolean>(false);
  const {toast} = useToast();

  const handleLoadConfig = () => {
    setIsLoading(true);

    fetchConfigFile()
      .then(value => {
        setConfigContent(value);
        setOriginalContent(value);
      })
      .catch(reason =>
        toast({
          title: "Erreur",
          description: reason.message,
          variant: "destructive",
        }))
      .finally(() => setIsLoading(false));
  };

  const handleSaveConfig = () => {
    setIsLoading(true);

    saveConfigFile(configContent)
      .then(() => {
        setOriginalContent(configContent);
        setHasChanges(false);
        toast({
          title: "Succès",
          description: "Configuration correctement sauvegardée",
        });
      })
      .catch((error) =>
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        }))
      .finally(() => setIsLoading(false));
  };

  const handleReset = () => {
    if (confirm("Voulez-vous vraiment annuler tous les changements ?"))
      setConfigContent(originalContent);
  };

  useEffect(() => handleLoadConfig(), []);
  useEffect(() => setHasChanges(configContent !== originalContent), [configContent, originalContent]);

  return (
    <ContentLayout breadcrumbItems={[{label: "Fichier de configuration"}]}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Fichier de configuration</h1>
            <p className="text-muted-foreground">
              Modification directe des configurations d'HAProxy
            </p>
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isLoading || !hasChanges}
            >
              <RotateCcw/>
              Réinitialiser
            </Button>
            <Button
              onClick={handleSaveConfig}
              disabled={isLoading || !hasChanges}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? <Loader2 className="animate-spin"/> : <Save/>}
              Sauvegarder
            </Button>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="bg-secondary/50">
            <CardTitle className="flex items-center space-x-2">
              <FileCode2 className="w-5 h-5"/>
              <span>{HAPROXY_CONFIG_FILE_PATH}</span>
            </CardTitle>
            <CardDescription>
              Éditeur de configuration HAProxy
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Textarea
              className="font-mono text-sm min-h-[600px] resize-y p-4 bg-secondary/5"
              value={configContent}
              onChange={(e) => setConfigContent(e.target.value)}
              disabled={isLoading}
              spellCheck={false}
            />
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
