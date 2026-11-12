import test from "node:test";
import assert from "node:assert/strict";
import ItemOptions from "../../modules/items/item-ffg-options.js";

test("opening a locked item compendium never initializes flags or tries writing",async()=>{
  const data={
    object:{
      pack:"starwarsffg.sw-armas",
      isOwner:true,
      flags:{},
      async setFlag(){throw new Error("No writes are allowed during sheet opening");}
    }
  };
  const instance=Object.create(ItemOptions.prototype);
  instance.data=data;
  instance.options={};
  // For a compendium sheet no editor control is injected. init must return
  // before accessing the DOM/jQuery and register must not call setFlag.
  instance.init(null);
  await instance.register("enablePrice",{default:true,type:"Boolean"});
  await instance.register("enableAmmo",{default:false,type:"Boolean"});
  await instance.register("enableRarity",{default:true,type:"Boolean"});
  assert.equal(instance.options.enablePrice.value,true);
  assert.equal(instance.options.enableAmmo.value,false);
  assert.equal(instance.options.enableRarity.value,true);
  assert.deepEqual(data.object.flags,{});
});
test("item options read existing flags without overwriting, including false values",async()=>{
  const instance=Object.create(ItemOptions.prototype);
  instance.data={object:{
    pack:null,isOwner:true,
    flags:{starwarsffg:{config:{enablePrice:false,enableAmmo:true}}}
  }};
  instance.options={};
  await instance.register("enablePrice",{default:true});
  await instance.register("enableAmmo",{default:false});
  await instance.register("enableRarity",{default:true});
  assert.equal(instance.options.enablePrice.value,false);
  assert.equal(instance.options.enableAmmo.value,true);
  assert.equal(instance.options.enableRarity.value,true);
});
