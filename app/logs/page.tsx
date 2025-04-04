"use client";

import { JSX, useEffect, useState } from "react";
import ContentLayout from "@/components/content-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Search, Filter, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type LogEntry = {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: string;
};

export default function LogsPage(): JSX.Element {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [limit, setLimit] = useState<number>(100);
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchQuery, levelFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/haproxy/logs?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des logs:", error);
      setError("Impossible de récupérer les logs HAProxy");
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];
    
    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(query) || 
        log.timestamp.toLowerCase().includes(query)
      );
    }
    
    // Filter by log level
    if (levelFilter !== "all") {
      filtered = filtered.filter(log => log.level === levelFilter);
    }
    
    setFilteredLogs(filtered);
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      case 'warning':
        return <Badge variant="warning" className="bg-yellow-500">Attention</Badge>;
      case 'info':
        return <Badge variant="secondary">Info</Badge>;
      default:
        return <Badge>{level}</Badge>;
    }
  };

  return (
    <ContentLayout breadcrumbItems={[{label: "Logs"}]}>
      <div className="flex flex-col space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Logs HAProxy</h1>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card className="shadow-sm">
          <CardHeader className="bg-secondary/50">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5"/>
              <span>Logs du serveur</span>
              <div className="ml-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchLogs} 
                  disabled={loading}
                  className="flex items-center bg-secondary/5 hover:bg-secondary/20 transition-colors"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Consultez les logs de votre serveur HAProxy
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher dans les logs..."
                    className="pl-8 h-11 bg-secondary/5"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="w-[180px] h-11 bg-secondary/5">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filtrer par niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">Tous les niveaux</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Attention</SelectItem>
                        <SelectItem value="error">Erreur</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value, 10))}>
                    <SelectTrigger className="w-[150px] h-11 bg-secondary/5">
                      <SelectValue placeholder="Nombre de logs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="50">50 logs</SelectItem>
                        <SelectItem value="100">100 logs</SelectItem>
                        <SelectItem value="200">200 logs</SelectItem>
                        <SelectItem value="500">500 logs</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-10">
                  <RefreshCw className="h-10 w-10 animate-spin text-muted-foreground" />
                </div>
              ) : filteredLogs.length > 0 ? (
                <div className="rounded-md border bg-card mt-4">
                  <Table>
                    <TableHeader className="bg-secondary/10">
                      <TableRow>
                        <TableHead className="w-[200px] font-medium">Horodatage</TableHead>
                        <TableHead className="w-[100px] font-medium">Niveau</TableHead>
                        <TableHead className="font-medium">Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log, index) => (
                        <TableRow key={index} className={index % 2 === 0 ? "" : "bg-secondary/5"}>
                          <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                          <TableCell>{getLevelBadge(log.level)}</TableCell>
                          <TableCell className="font-mono text-xs">{log.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex justify-center py-10 text-muted-foreground">
                  {searchQuery || levelFilter !== "all" ? 
                    "Aucun log ne correspond à vos critères de recherche" : 
                    "Aucun log disponible"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
