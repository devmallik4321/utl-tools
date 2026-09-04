import fs from "fs";
import path from "path";

// 1. Utilities registry
const utils = JSON.parse(fs.readFileSync("registry/utilities.json", "utf-8"));
console.log("Registry Utilities Count:", utils.length);

// 2. Component files (excluding ToolDispatcher.tsx)
function getTsxFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getTsxFiles(filePath));
    } else if (file.endsWith(".tsx") && file !== "ToolDispatcher.tsx") {
      results.push(filePath);
    }
  }
  return results;
}
const toolComponents = getTsxFiles("apps/web-shell/src/components/tools");
console.log("Total Tool Component Files:", toolComponents.length);

// 3. Dispatcher cases/keys
const dispatcherContent = fs.readFileSync("apps/web-shell/src/components/tools/ToolDispatcher.tsx", "utf-8");
const mapMatches = [...dispatcherContent.matchAll(/"([^"]+)":\s*[A-Za-z0-9_]+/g)].map(m => m[1]);
const uniqueMapSlugs = new Set(mapMatches);

const utilSlugs = new Set(utils.map(u => u.slug));
const matchedSlugs = mapMatches.filter(s => utilSlugs.has(s));
const aliasSlugs = mapMatches.filter(s => !utilSlugs.has(s));
const missingSlugs = utils.filter(u => !uniqueMapSlugs.has(u.slug)).map(u => u.slug);

console.log("ToolDispatcher Total Mappings:", mapMatches.length);
console.log("ToolDispatcher Unique Keys:", uniqueMapSlugs.size);
console.log("ToolDispatcher Matched Utilities:", matchedSlugs.length);
console.log("ToolDispatcher Aliases / Extra:", aliasSlugs.length, aliasSlugs);
console.log("Missing Utilities in Dispatcher:", missingSlugs.length, missingSlugs);

// 4. Pre-rendered routes
// Check sitemap / app routes
const categories = JSON.parse(fs.readFileSync("registry/categories.json", "utf-8"));
const widgets = JSON.parse(fs.readFileSync("registry/widgets.json", "utf-8"));
const widgetCategories = JSON.parse(fs.readFileSync("registry/widgetCategories.json", "utf-8"));

console.log("Categories Count:", categories.length);
console.log("Widgets Count:", widgets.length);
console.log("Widget Categories Count:", widgetCategories.length);

// Check Next.js prerendered routes if .next exists
const prerenderManifestPath = "apps/web-shell/.next/prerender-manifest.json";
if (fs.existsSync(prerenderManifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(prerenderManifestPath, "utf-8"));
  const routes = Object.keys(manifest.routes);
  console.log("Prerender Manifest Routes Count:", routes.length);
} else {
  console.log("Prerender Manifest not found (need to check build or calculate standard static routes).");
}
