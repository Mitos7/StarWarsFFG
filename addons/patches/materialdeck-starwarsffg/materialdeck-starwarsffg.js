// Star Wars FFG adapter for Material Deck. Original adapter: MaterialFoundry (MIT).
// The upstream 1.0.1 adapter used Starfinder fields and roll methods.
const data = {moduleId: 'materialdeck-starwarsffg', systemId: 'starwarsffg', systemName: 'Star Wars FFG'};
class system {
    getActorData(token) { return token?.actor?.system ?? {}; }
    getItemData(item) { return item?.system ?? {}; }
    getStatsList() {
        return [
            {value:'HP',name:'Wounds / Hull trauma (suffered)'},
            {value:'HPbox',name:'Wounds / Hull trauma (box)'},
            {value:'HPbar',name:'Wounds / Hull trauma (bar)'},
            {value:'Strain',name:'Strain / System strain (suffered)'},
            {value:'DefenseMelee',name:'Melee defense'},
            {value:'DefenseRanged',name:'Ranged defense'},
            {value:'Encumbrance',name:'Encumbrance'},
            {value:'AC',name:'Soak / Armor'},
            {value:'Speed',name:'Vehicle speed'},
            {value:'Ability',name:'Characteristic'},
            {value:'Skill',name:'Skill rank'}
        ];
    }
    getAttackModes() { return []; }
    getOnClickList() { return []; }
    resource(token, characterKey, vehicleKey) {
        const key = token?.actor?.type === 'vehicle' ? vehicleKey : characterKey;
        const stat = this.getActorData(token).stats?.[key];
        return {value: Number(stat?.value ?? 0), max: Number(stat?.max ?? 0)};
    }
    getHP(token) { return this.resource(token,'wounds','hullTrauma'); }
    getStamina(token) { return this.resource(token,'strain','systemStrain'); }
    getStrain(token) { return this.getStamina(token); }
    getDefenseMelee(token) { return this.getActorData(token).stats?.defencemelee?.value ?? 0; }
    getDefenseRanged(token) { return this.getActorData(token).stats?.defenceranged?.value ?? 0; }
    getEncumbrance(token) { return this.resource(token,'encumbrance','encumbrance'); }
    getForcePool(token) { return this.resource(token,'forcePool','forcePool'); }
    getAC(token) { return Number(this.getActorData(token).stats?.[token?.actor?.type === 'vehicle' ? 'armor' : 'soak']?.value ?? 0); }
    getSpeed(token) { return this.getActorData(token).stats?.speed?.value ?? ''; }
    getTempHP() {} getKinAC() {} getShieldHP() {} getPassivePerception() {} getPassiveInvestigation() {}
    getInitiative() { return ''; }
    toggleInitiative(token) { return token?.actor?.rollInitiative({createCombatants:true}); }
    getAbility(token, ability='Brawn') { return this.getActorData(token).characteristics?.[ability]?.value ?? 0; }
    getAbilityModifier() {} getAbilitySave() {} getProficiency() {}
    getAbilityList() { return Object.entries(CONFIG.FFG.characteristics ?? {}).map(([key,value])=>({value:key,name:game.i18n.localize(value.label)})); }
    getSavesList() { return []; }
    getSkill(token,skill='Athletics') { return this.getActorData(token).skills?.[skill]?.rank ?? 0; }
    getSkillList() { return Object.entries(CONFIG.FFG.skills ?? {}).map(([key,value])=>({value:key,name:game.i18n.localize(value.label)})); }
    getConditionIcon(condition='removeAll') {
        if (condition === 'removeAll') return CONFIG.controlIcons.effects;
        const status=CONFIG.statusEffects.find(effect=>effect.id === condition);
        return status?.img ?? status?.icon;
    }
    getConditionActive(token,condition='removeAll') {
        return token?.actor?.effects.some(effect=>condition === 'removeAll' ? effect.statuses.size > 0 : effect.statuses.has(condition)) ?? false;
    }
    async toggleCondition(token,condition='removeAll') {
        const actor=token?.actor;
        if (!actor?.isOwner) return false;
        if (condition === 'removeAll') {
            const ids=actor.effects.filter(effect=>effect.statuses.size > 0).map(effect=>effect.id);
            if (ids.length) await actor.deleteEmbeddedDocuments('ActiveEffect',ids);
        } else {
            if (!CONFIG.statusEffects.some(effect=>effect.id === condition)) return false;
            await actor.toggleStatusEffect(condition,{active:!this.getConditionActive(token,condition)});
        }
        return true;
    }
    getConditionList() { return CONFIG.statusEffects.map(status=>({value:status.id,name:game.i18n.localize(status.name ?? status.label)})); }
    async roll(token,type='ability',options={},ability='Brawn',skill='Athletics') {
        const actor=token?.actor;
        if (!actor?.isOwner) return;
        if (type === 'initiative') return actor.rollInitiative({createCombatants:true,rerollInitiative:true,...options});
        const sheet=await actor.sheet.getData();
        if (type === 'skill') {
            const s=actor.system.skills?.[skill];
            if (!s) return;
            return game.ffg.DiceHelpers.rollSkillDirect(s,actor.system.characteristics[s.characteristic],2,sheet);
        }
        if (type === 'ability' && actor.system.characteristics?.[ability]) {
            const s={rank:0,label:game.i18n.localize(CONFIG.FFG.characteristics[ability].label)};
            return game.ffg.DiceHelpers.rollSkillDirect(s,actor.system.characteristics[ability],2,sheet);
        }
    }
    getRollTypes() { return [{value:'initiative',name:'Initiative'}]; }
    getItems(token,type='any') { return token?.actor?.items.filter(item=>type === 'any' ? ['weapon','shipweapon','armour','gear','itemattachment','shipattachment'].includes(item.type) : item.type === type) ?? []; }
    getItemUses(item) { return {available:this.getItemData(item).quantity?.value ?? this.getItemData(item).quantity ?? 0}; }
    getItemTypes() { return [{value:'weapon',name:'Weapons'},{value:'shipweapon',name:'Vehicle weapons'},{value:'armour',name:'Armor'},{value:'gear',name:'Gear'},{value:'itemattachment',name:'Attachments'},{value:'shipattachment',name:'Vehicle attachments'}]; }
    getWeaponRollModes() { return []; }
    getFeatures(token,type='any') { return token?.actor?.items.filter(item=>type === 'any' ? ['talent','specialization','species','career','forcepower'].includes(item.type) : item.type === type) ?? []; }
    getFeatureUses() {}
    getFeatureTypes() { return [{value:'talent',name:'Talents'},{value:'specialization',name:'Specializations'},{value:'species',name:'Species'},{value:'career',name:'Careers'},{value:'forcepower',name:'Force powers'}]; }
    getSpells(token) { return token?.actor?.items.filter(item=>item.type === 'forcepower') ?? []; }
    getSpellUses() {}
    getSpellLevels() { return [{value:'any',name:'Force powers'}]; }
    getSpellTypes() { return []; }
    async rollItem(item) {
        if (!item) return;
        const actor=item.actor;
        if (item.type === 'weapon' && actor?.isOwner) {
            const {get_dice_pool}=await import('../../../systems/starwarsffg/modules/helpers/dice-helpers.js');
            const skill=item.system.skill.value;
            let pool=get_dice_pool(actor,skill,new DicePoolFFG({difficulty:2}));
            pool=await game.ffg.DiceHelpers.getModifiers(pool,item);
            return game.ffg.DiceHelpers.displayRollDialog(await actor.sheet.getData(),pool,item.name,game.i18n.localize(CONFIG.FFG.skills[skill]?.label ?? skill),item);
        }
        return item.sheet.render(true);
    }
    getSkillRingColor() {} getSaveRingColor() {}
}
Hooks.once('MaterialDeck_Ready',()=>{
    const module=game.modules.get(data.moduleId);
    game.materialDeck.registerSystem({...data,version:module.version,manifest:module.manifest,system});
});
