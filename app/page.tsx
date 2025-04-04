"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ContentLayout from "@/components/content-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, BarChart, FileText, Server, Settings, Shield, Sliders } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Backend, Frontend, ServiceStatus } from '@/lib/haproxy-service';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [config, setConfig] = useState<{ frontends: Frontend[], backends: Backend[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch service status
        const statusResponse = await fetch('/api/haproxy/status');
        if (!statusResponse.ok) {
          throw new Error('Erreur lors du chargement du statut du service');
        }
        const statusData = await statusResponse.json();
        setStatus(statusData);

        // Fetch configuration summary
        const configResponse = await fetch('/api/config-file?parse=true');
        if (!configResponse.ok) {
          throw new Error('Erreur lors du chargement de la configuration');
        }
        const configData = await configResponse.json();
        setConfig({
          frontends: configData.contents.frontends,
          backends: configData.contents.backends
        });
      } catch (error) {
        console.error('Erreur:', error);
        setError(error instanceof Error ? error.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const quickLinks = [
    { 
      title: 'Frontends', 
      icon: <Sliders className="w-5 h-5" />,
      description: 'Gérer les points d\'entrée du trafic',
      href: '/frontend',
      color: 'bg-blue-500'
    },
    { 
      title: 'Backends', 
      icon: <Server className="w-5 h-5" />,
      description: 'Configurer les serveurs de destination',
      href: '/backend',
      color: 'bg-green-500'
    },
    { 
      title: 'Contrôle Serveur', 
      icon: <Settings className="w-5 h-5" />,
      description: 'Gérer le service HAProxy',
      href: '/controle-du-serveur',
      color: 'bg-purple-500'
    },
    { 
      title: 'Logs', 
      icon: <FileText className="w-5 h-5" />,
      description: 'Consulter les journaux système',
      href: '/logs',
      color: 'bg-amber-500'
    }
  ];

  return (
    <ContentLayout breadcrumbItems={[{label: "Accueil"}]}>
      <div className="flex flex-col space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Bienvenue sur HAProxy Configuration Manager</h1>
          <p className="text-muted-foreground">
            Gérez facilement votre configuration HAProxy et surveillez l'état de votre service
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Quick Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
              <Link href={link.href} className="block h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-lg font-semibold">{link.title}</CardTitle>
                  <div className={`${link.color} text-white p-2 rounded-md`}>
                    {link.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{link.description}</CardDescription>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="bg-secondary/50">
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5"/>
                <span>État du service</span>
              </CardTitle>
              <CardDescription>
                Aperçu rapide de l'état actuel du service HAProxy
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="h-32 flex items-center justify-center">
                  <div className="animate-pulse text-muted-foreground">Chargement...</div>
                </div>
              ) : status ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">État:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      status.running ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {status.running ? 'En cours d\'exécution' : 'Arrêté'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Version:</span>
                    <span className="text-sm text-muted-foreground">{status.version}</span>
                  </div>
                  {status.running && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Temps de fonctionnement:</span>
                      <span className="text-sm text-muted-foreground">{status.uptime}</span>
                    </div>
                  )}
                  <div className="pt-2">
                    <Button 
                      onClick={() => router.push('/controle-du-serveur')} 
                      variant="outline" 
                      className="w-full flex items-center justify-center h-10 bg-secondary/5 hover:bg-secondary/20 transition-colors"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Gérer le service
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-muted-foreground">
                  Impossible de récupérer l'état du service
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="bg-secondary/50">
              <CardTitle className="flex items-center space-x-2">
                <BarChart className="w-5 h-5"/>
                <span>Configuration Actuelle</span>
              </CardTitle>
              <CardDescription>
                Aperçu de la configuration HAProxy en place
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="h-32 flex items-center justify-center">
                  <div className="animate-pulse text-muted-foreground">Chargement...</div>
                </div>
              ) : config ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Frontends:</span>
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                      {config.frontends.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Backends:</span>
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                      {config.backends.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button 
                      onClick={() => router.push('/frontend')} 
                      variant="outline" 
                      className="w-full flex items-center justify-center h-10 bg-secondary/5 hover:bg-secondary/20 transition-colors"
                    >
                      <Sliders className="mr-2 h-4 w-4" />
                      Frontends
                    </Button>
                    <Button 
                      onClick={() => router.push('/backend')} 
                      variant="outline" 
                      className="w-full flex items-center justify-center h-10 bg-secondary/5 hover:bg-secondary/20 transition-colors"
                    >
                      <Server className="mr-2 h-4 w-4" />
                      Backends
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-muted-foreground">
                  Impossible de récupérer la configuration
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ContentLayout>
  );
}
