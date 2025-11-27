const DirectAttackSpell = (spellInfo) => {
    let caster = spellInfo.caster;
    let targetIDs = spellInfo.targetIDs;
    let spell = spellInfo.spell;
    let level = spellInfo.level;
    let squares = spellInfo.squares;
    let attMarkers = Markers(caster.token.get("statusmarkers"));

    let emote = spellInfo.emote;
    emote = emote.replace("%%C%%",caster.name);
    outputCard.body.push(emote);

    for (let i=0;i<targetIDs.length;i++) {
        let defender = ModelArray[targetIDs[i]];
        let defMarkers = Markers(defender.token.get("statusmarkers"));
        if (!defender) {log("No Target at " + targetIDs[i]);continue};
        let advResult = Advantage(caster,defender,spell);

        //attack bonuses
        let attackBonus = caster.spellAttack;
        //other mods to attack bonus
        let additionalText = "";
        if (attMarkers.includes("Bless")) {
            bless = randomInteger(4);
            additionalText += " +" + bless + " [Bless]";
            attackBonus += bless;
        }

        let attackResult = D20(advResult.advantage);
        let attackTotal = attackResult.roll + attackBonus;
        if (spell.autoHit === true) {attackTotal = 50; attackResult.roll = 21};

        let tip;
        let crit = false;
        if ((defMarkers.includes("Paralyzed") || defMarkers.includes("Unconscious")) && squares === 1) {
            crit = true;
        }

        //1464 in dnd2
        




    }









}