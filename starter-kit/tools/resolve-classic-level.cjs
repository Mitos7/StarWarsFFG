// Prefer an explicitly supplied build dependency, then a local installation.
// Keep the existing Foundry installation as the Windows-host fallback.
const path = require("node:path");
const candidates = [
  process.env.SWFFG_CLASSIC_LEVEL_PATH,
  "classic-level",
  process.env.FOUNDRY_APP_PATH && path.join(process.env.FOUNDRY_APP_PATH, "node_modules/classic-level"),
  "D:/Program Files/Foundry Virtual Tabletop/resources/app/node_modules/classic-level",
].filter(Boolean);
let dependency;
for (const candidate of candidates) {
  try { dependency = require(candidate); break; }
  catch (error) { if (error.code !== "MODULE_NOT_FOUND") throw error; }
}
if (!dependency) throw new Error("Install classic-level for the pack builder, or set SWFFG_CLASSIC_LEVEL_PATH to its package directory.");
module.exports = dependency;
