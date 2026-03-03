import fs from "node:fs";
import path from "node:path";

const manifestPath = path.resolve("dist", "manifest.json");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

delete manifest.use_dynamic_url;

if (Array.isArray(manifest.web_accessible_resources)) {
  for (const resource of manifest.web_accessible_resources) {
    if (resource && typeof resource === "object") {
      delete resource.use_dynamic_url;
    }
  }
}

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
