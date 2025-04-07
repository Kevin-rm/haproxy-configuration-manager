"use client";

import { JSX, useEffect, useState } from "react";
import ContentLayout from "@/components/content-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertCircle, CheckCircle, RefreshCw, PlayCircle, StopCircle, 
  RotateCw, ActivitySquare, Sliders, ShieldCheck 
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

type ServiceStatus = {
  running: boolean;
  enabled: boolean;
  version: string;
  uptime: string;
};

export default function ServerControl(): JSX.Element {
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/haproxy/status");
      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Erreur lors de la récupération du statut:", error);
      setError("Impossible de récupérer l'état du service HAProxy");
      toast({
        title: "Erreur",
        description: "Impossible de récupérer l'état du service HAProxy",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const performAction = async (action: string) => {
    setActionLoading(action);
    try {
      const response = await fetch(`/api/haproxy/${action}`, { method: "POST" });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur lors de l'action ${action}`);
      }
      
      let successMessage = "";
      switch (action) {
        case "start":
          successMessage = "Le service HAProxy a été démarré avec succès";
          break;
        case "stop":
          successMessage = "Le service HAProxy a été arrêté avec succès";
          break;
        case "restart":
          successMessage = "Le service HAProxy a été redémarré avec succès";
          break;
        case "reload":
          successMessage = "La configuration HAProxy a été rechargée avec succès";
          break;
        case "validate":
          const validationResult = await response.json();
          if (validationResult.valid) {
            toast({
              title: "Succès",
              description: validationResult.message
            });
          } else {
            toast({
              title: "Erreur de configuration",
              description: validationResult.message,
              variant: "destructive"
            });
          }
          setActionLoading(null);
          return;
        default:
          successMessage = "Action exécutée avec succès";
      }
      
      toast({
        title: "Succès",
        description: successMessage
      });
      
      // Refresh status after action
      if (action !== "validate") {
        setTimeout(() => fetchStatus(), 1000);
      }
    } catch (error) {
      console.error(`Erreur lors de l'action ${action}:`, error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : `Erreur lors de l'action ${action}`,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <ContentLayout breadcrumbItems={[{label: "Contrôle du serveur"}]}>
      <div className="flex flex-col space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Contrôle du serveur HAProxy</h1>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Carte d'état du service */}
          <Card className="shadow-sm">
            <CardHeader className="bg-secondary/50">
              <CardTitle className="flex items-center space-x-2">
                <ActivitySquare className="w-5 h-5"/>
                <span>État du service</span>
                <div className="ml-auto">
                  <Button variant="ghost" size="sm" onClick={fetchStatus} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Informations sur le service HAProxy en cours d'exécution
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex justify-center py-4">
                  <RefreshCw className="h-10 w-10 animate-spin text-muted-foreground" />
                </div>
              ) : status ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">État:</span>
                    {status.running ? (
                      <Badge variant="success" className="bg-green-500">En cours d'exécution</Badge>
                    ) : (
                      <Badge variant="destructive">Arrêté</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Démarrage automatique:</span>
                    {status.enabled ? (
                      <Badge variant="outline" className="border-green-500 text-green-500">Activé</Badge>
                    ) : (
                      <Badge variant="outline" className="border-red-500 text-red-500">Désactivé</Badge>
                    )}
                  </div>
                  <Separator />
                  <div>
                    <span className="font-medium">Version:</span>
                    <p className="mt-1 text-sm text-muted-foreground">{status.version}</p>
                  </div>
                  {status.running && (
                    <div>
                      <span className="font-medium">Temps de fonctionnement:</span>
                      <p className="mt-1 text-sm text-muted-foreground">{status.uptime}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  Aucune information disponible
                </div>
              )}
            </CardContent>
          </Card>

          {/* Carte de contrôle du service */}
          <Card className="shadow-sm">
            <CardHeader className="bg-secondary/50">
              <CardTitle className="flex items-center space-x-2">
                <Sliders className="w-5 h-5"/>
                <span>Actions du service</span>
              </CardTitle>
              <CardDescription>
                Contrôlez le service HAProxy avec ces actions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => performAction('start')}
                  disabled={loading || actionLoading !== null || (status?.running ?? false)}
                  className="flex items-center h-11 bg-secondary/5 hover:bg-secondary/20 transition-colors"
                >
                  {actionLoading === 'start' ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlayCircle className="mr-2 h-4 w-4" />
                  )}
                  Démarrer
                </Button>
                <Button
                  onClick={() => performAction('stop')}
                  disabled={loading || actionLoading !== null || !(status?.running ?? false)}
                  variant="destructive"
                  className="flex items-center h-11"
                >
                  {actionLoading === 'stop' ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <StopCircle className="mr-2 h-4 w-4" />
                  )}
                  Arrêter
                </Button>
                <Button
                  onClick={() => performAction('restart')}
                  disabled={loading || actionLoading !== null || !(status?.running ?? false)}
                  variant="secondary"
                  className="flex items-center h-11 bg-secondary/5 hover:bg-secondary/20 transition-colors"
                >
                  {actionLoading === 'restart' ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCw className="mr-2 h-4 w-4" />
                  )}
                  Redémarrer
                </Button>
                <Button
                  onClick={() => performAction('reload')}
                  disabled={loading || actionLoading !== null || !(status?.running ?? false)}
                  variant="secondary"
                  className="flex items-center h-11 bg-secondary/5 hover:bg-secondary/20 transition-colors"
                >
                  {actionLoading === 'reload' ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Recharger
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Carte de validation de la configuration */}
          <Card className="md:col-span-2 shadow-sm">
            <CardHeader className="bg-secondary/50">
              <CardTitle className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5"/>
                <span>Validation de la configuration</span>
              </CardTitle>
              <CardDescription>
                Vérifier la validité de la configuration HAProxy actuelle
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Button
                onClick={() => performAction('validate')}
                disabled={loading || actionLoading !== null}
                variant="outline"
                className="w-full flex items-center justify-center h-11 bg-secondary/5 hover:bg-secondary/20 transition-colors"
              >
                {actionLoading === 'validate' ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Valider la configuration
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ContentLayout>
  );
}
