// Limestone Wings entry packer: mirror the offline game and its four shots, then seal a dossier.

import nodeFs from "node:fs";
import nodePath from "node:path";
import nodeUrl from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

/** Directory that holds this script, game/, and screenshots/. */
function entryFolder(): string {
  return nodePath.dirname(nodeUrl.fileURLToPath(import.meta.url));
}

/** Grader output root, or MAKEFUN_OUTPUT_DIR when packing locally. */
function outputFolder(): string {
  const override = process.env.MAKEFUN_OUTPUT_DIR;
  if (typeof override === "string" && override.trim().length > 0) {
    return override;
  }
  return "/output";
}

/** Replace one destination tree with a fresh copy of a source tree. */
function replaceTree(sourceName: string, root: string, dest: string): void {
  const from = nodePath.join(root, sourceName);
  const into = nodePath.join(dest, sourceName);
  nodeFs.rmSync(into, { recursive: true, force: true });
  nodeFs.cpSync(from, into, { recursive: true });
}

/** Caps the scorer uses for text, screenshots, and the game tree. */
function scorerCaps() {
  return {
    text_max_bytes: 163_840,
    screenshots: {
      max: 4,
      max_bytes: 262_144,
    },
    game_max_files: 993,
    game_max_bytes: 50_331_648,
    game_path_max_bytes: 1_000,
  };
}

function packEntry(): void {
  const root = entryFolder();
  const dest = outputFolder();
  nodeFs.mkdirSync(dest, { recursive: true });
  replaceTree("game", root, dest);
  replaceTree("screenshots", root, dest);
  const dossierPath = nodePath.join(dest, "dossier.json");
  const dossierText = buildDossier(dest, scorerCaps());
  nodeFs.writeFileSync(dossierPath, dossierText);
}

packEntry();
