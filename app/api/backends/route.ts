import {NextRequest} from "next/server";
import {
  Backend,
  getConfigFileContents,
  parseConfigFileContents,
  writeContentsToConfigFile
} from "@/lib/haproxy-service";

export const POST = async (request: NextRequest) => {
  try {
    const backendData: Backend = await request.json();
    console.log(backendData);
    
    if (!backendData.name || !backendData.servers || backendData.servers.length === 0) {
      return new Response(JSON.stringify({ error: "Données de backend invalides" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Lire et parser le fichier de configuration existant
    const configContent = getConfigFileContents();
    const config = parseConfigFileContents(configContent);
    
    // Vérifier si le backend existe déjà
    const existingBackendIndex = config.backends.findIndex(b => b.name === backendData.name);
    
    if (existingBackendIndex !== -1) {
      // Mettre à jour un backend existant
      config.backends[existingBackendIndex] = backendData;
    } else {
      // Ajouter un nouveau backend
      config.backends.push(backendData);
    }
    
    // Générer le contenu mis à jour du fichier de configuration
    const updatedContent = generateConfigContent(config);
    
    // Écrire le contenu mis à jour dans le fichier
    writeContentsToConfigFile(updatedContent);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Backend ${backendData.name} ${existingBackendIndex !== -1 ? 'mis à jour' : 'créé'}`,
      backend: backendData
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Erreur lors de la création/modification du backend:", error);
    return new Response(JSON.stringify({ 
      error: "Erreur lors de la création/modification du backend",
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
