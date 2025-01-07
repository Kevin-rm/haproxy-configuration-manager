"use client";

import React, {JSX, useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Loader2, Save} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Textarea} from "@/components/ui/textarea";
import ContentLayout from "@/components/content-layout";
import {HAPROXY_CONFIG_FILE_PATH} from "@/lib/constants";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {useToast} from "@/hooks/use-toast";

export default function ConfigFilePage(): JSX.Element {
  const [configContent, setConfigContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {toast} = useToast();

  const loadConfigContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/config-file");
      const data = await response.json();
      setConfigContent(data.contents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement du fichier");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger le fichier de configuration",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfigContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/config-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({contents: configContent}),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la sauvegarde: ${response.statusText}`);
      }

      toast({
        title: "Succès",
        description: "Configuration sauvegardée avec succès",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder le fichier de configuration",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfigContent();
  }, []);

  return (
    <ContentLayout breadcrumbItems={[{label: "Fichier de configuration"}]}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fichier de configuration</h1>
            <p className="text-muted-foreground">
              Modification directe des configurations d'HAProxy
            </p>
          </div>
          <div className="space-x-2">
            <Button
              onClick={saveConfigContent}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
              ) : (
                <Save className="mr-2 h-4 w-4"/>
              )}
              Sauvegarder
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {HAPROXY_CONFIG_FILE_PATH}
            </CardTitle>
            <CardDescription>
              Ci-dessous le contenu du fichier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              className="font-mono min-h-[600px] resize-y"
              placeholder="Chargement..."
              value={configContent}
              onChange={(e) => setConfigContent(e.target.value)}
              disabled={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
