import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {canInitializeActorSheetFlags} from "../../modules/actors/sheet-flags.js";
test("actor sheet init must not attempt writes to read-only compendium actors", () => {
  assert.equal(canInitializeActorSheetFlags({pack:"swffg-mitos-starter.sw-adversarios",isOwner:true}), false);
  assert.equal(canInitializeActorSheetFlags({pack:"any.locked.pack",isOwner:false}), false);
  assert.equal(canInitializeActorSheetFlags({pack:null,isOwner:false}), false);
  assert.equal(canInitializeActorSheetFlags({pack:null,isOwner:true}), true);
  assert.equal(canInitializeActorSheetFlags({pack:undefined,isOwner:true}), true);
  assert.equal(canInitializeActorSheetFlags(null),false);
  const src=readFileSync(fileURLToPath(new URL("../../modules/actors/actor-sheet-ffg.js",import.meta.url)),"utf8");
  const constructor=src.split("  pools = new Map();")[0];
  assert.match(constructor,/if \(canInitializeActorSheetFlags\(this.object\)\) \{\s*this.object.setFlag/);
});
