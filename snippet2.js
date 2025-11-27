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

    if (spell.cLevel && spell.cLevel[attacker.casterLevel]) {
        spell.base = spell.cLevel[attacker.casterLevel];
    }
    if (level > spell.level) {
        spell.base = spell.sLevel[level];
    }

    spell.damage = [spell.base + "," + spell.damageType];

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

        let tip;
        let crit = false;
        if ((defMarkers.includes("Paralyzed") || defMarkers.includes("Unconscious")) && squares === 1) {
            crit = true;
        }

        let abText = (attackBonus < 0) ? attackBonus:(attackBonus > 0) ? "+" + attackBonus:"";

        tip = attackResult.rollText + abText + additionalText;
        tip += "<br>[1d20" + abText + additionalText + "]";
        if (advResult.advText.length > 0) {
            tip += "<br>Advantage from: " + advResult.advText.toString();
        }
       if (advResult.disText.length > 0) {
            tip += "<br>Disadvantage from: " + advResult.disText.toString();
        }

        tip = '[' + attackTotal + '](#" class="showtip" title="' + tip + ')';

        if (spell.autoHit === false) {
            if (attackResult.roll === 20) {crit = true};
            outputCard.body.push("Attack: " + tip + " vs. AC " + defender.ac);
            if (crit === true) {
                outputCard.body.push("[#ff0000]Crit![/#]");
            }
        }

        if ((attackTotal >= defender.ac && attackResult.roll !== 1) || crit === true || spell.autoHit === true) {
            outputCard.body.push("[B]Hit![/b]")
            let rollResults = RollDamage(spell.damage,crit); //total, diceText
log(rollResults)
                let damageResults = ApplyDamage(rollResults,attacker,defender,spell);
log(damageResults)
                let tip = rollResults.diceText;
                if (damageResults.note !== "") {
                    tip += "<br>" + damageResults.note;
                }                
                tip = '[' + damageResults.total + '](#" class="showtip" title="' + tip + ')';
                outputCard.body.push(Capit(rollResults.damageType) + " Damage: " + tip);
            if (spell.note) {
                outputCard.body.push("[hr]");
                outputCard.body.push(spell.note);
            }
        } else {
            outputCard.body.push("[B]Miss[/b]");
        }
        FX(spell.fx,caster,defender);
    }
    PlaySound(spell.sound);
}