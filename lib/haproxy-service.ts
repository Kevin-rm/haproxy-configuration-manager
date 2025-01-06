import fs from "fs";
import {HAPROXY_CONFIG_FILE_PATH} from "@/lib/constants";

export function getConfigFileContents(): string {
  try {
    return fs.readFileSync(HAPROXY_CONFIG_FILE_PATH, "utf8");
  } catch (error) {
    throw new Error("Impossible de recupérer le contenu du fichier de configuration");
  }
}

export function parseConfigFile() {
  const lines = fs.readFileSync(HAPROXY_CONFIG_FILE_PATH, "utf-8").split("\n");
  const config = {
    global: [],
    defaults: [],
    frontends: [],
    backends: [],
  };

  let currentSection = null;

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith("frontend")) {
      currentSection = {type: "frontend", name: trimmedLine.split(" ")[1], config: []};
      config.frontends.push(currentSection);
    } else if (trimmedLine.startsWith("backend")) {
      currentSection = {type: "backend", name: trimmedLine.split(" ")[1], config: []};
      config.backends.push(currentSection);
    } else if (trimmedLine.startsWith("global")) {
      currentSection = {type: "global", config: []};
      config.global.push(currentSection);
    } else if (trimmedLine.startsWith("defaults")) {
      currentSection = {type: "defaults", config: []};
      config.defaults.push(currentSection);
    } else if (currentSection) {
      currentSection.config.push(trimmedLine);
    }
  });

  return config;
}

export function saveConfigFile(config) {
  const lines = [];

  function sectionToText(section) {
    const sectionLines = [`${section.type} ${section.name || ""}`.trim()];
    sectionLines.push(...section.config);
    return sectionLines.join("\n");
  }

  if (config.global.length) lines.push(sectionToText(config.global[0]));
  if (config.defaults.length) lines.push(sectionToText(config.defaults[0]));
  config.frontends.forEach((frontend) => lines.push(sectionToText(frontend)));
  config.backends.forEach((backend) => lines.push(sectionToText(backend)));

  fs.writeFileSync(HAPROXY_CONFIG_FILE_PATH, lines.join("\n"), "utf-8");
}
