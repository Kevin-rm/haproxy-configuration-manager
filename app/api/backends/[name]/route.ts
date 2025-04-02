import {NextRequest} from "next/server";
import {
  Backend, 
  getConfigFileContents, 
  parseConfigFileContents,
  writeContentsToConfigFile
} from "@/lib/haproxy-service";

export const PUT = async (request: NextRequest, { params }: { params: { name: string } }) => {
  try {
    // Récupérer le nom du backend depuis l'URL
    const backendName = params.name;
    
    // Récupérer les données du backend à modifier
    const backendData: Partial<Backend> = await request.json();
    
    // Lire et parser le fichier de configuration existant
    const configContent = getConfigFileContents();
    const config = parseConfigFileContents(configContent);
    
    // Trouver le backend à modifier
    const existingBackendIndex = config.backends.findIndex(b => b.name === backendName);
    
    if (existingBackendIndex === -1) {
      return new Response(JSON.stringify({ error: `Backend '${backendName}' non trouvé` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Mettre à jour les propriétés du backend
    const updatedBackend = {
      ...config.backends[existingBackendIndex],
      ...backendData,
      name: backendName // Garder le nom d'origine
    };
    
    config.backends[existingBackendIndex] = updatedBackend as Backend;
    
    // Générer le contenu mis à jour du fichier de configuration
    const updatedContent = generateConfigContent(config);
    
    // Écrire le contenu mis à jour dans le fichier
    writeContentsToConfigFile(updatedContent);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Backend ${backendName} mis à jour`,
      backend: updatedBackend
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Erreur lors de la modification du backend:", error);
    return new Response(JSON.stringify({ 
      error: "Erreur lors de la modification du backend",
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Fonction pour générer le contenu du fichier de configuration HAProxy
function generateConfigContent(config: {
  global: string[];
  defaults: string[];
  frontends: any[];
  backends: Backend[];
}): string {
  let content = "";
  
  // Section global
  content += "global\n";
  content += config.global.map(line => `    ${line}`).join("\n") + "\n\n";
  
  // Section defaults
  content += "defaults\n";
  content += config.defaults.map(line => `    ${line}`).join("\n") + "\n\n";
  
  // Section backends
  for (const backend of config.backends) {
    content += `backend ${backend.name}\n`;
    if (backend.mode) {
      content += `    mode ${backend.mode}\n`;
    }
    
    // Ajouter les serveurs
    for (const server of backend.servers) {
      const checkOption = server.check ? " check" : "";
      content += `    server ${server.name} ${server.ip_address}:${server.port}${checkOption}\n`;
    }
    content += "\n";
  }
  
  // Section frontends
  for (const frontend of config.frontends) {
    content += `frontend ${frontend.name}\n`;
    if (frontend.mode) {
      content += `    mode ${frontend.mode}\n`;
    }
    
    // Ajouter les binds
    for (const bind of frontend.binds) {
      content += `    bind ${bind.ip_address}:${bind.port}\n`;
    }
    
    // Ajouter le backend par défaut
    if (frontend.default_backend) {
      content += `    default_backend ${frontend.default_backend.name}\n`;
    }
    content += "\n";
  }
  
  return content;
}
