const AreaSpell = (msg) => {
    let targetID = msg.selected[0]._id;
    let target = ModelArray[targetID];
    let Tag = msg.content.split(";");
    let spellName = Tag[1];
    let caster = ModelArray[Tag[2]];
    let level = parseInt(Tag[3]);
    let dc = caster.spellDC;

    spell = DeepCopy(SpellInfo[spellName]);

    SetupCard(caster.name,spellName,caster.displayScheme);

    let squares = caster.Distance(target);
    let spellDistance = squares * pageInfo.scaleNum;

    if (spellDistance > spellInfo.range) {
        outputCard.body.push("Out of Range of Spell");
        PrintCard();
        return;
    }

    let targets = [];
    if (spell.area.includes("Square")) {
        targets = AOETargets(target);
    }
    if (spell.area.includes("Cone")) {
        targets = Cone(target);
    }

    if (spellName === "Sleep") {
        targets = Sleep(targets,level); //refine based on hp
    }

//effect AND damage - ? 
    if (spell.areaEffect === "Effect") {
        _.each(targets,target => {
            if (spell.areaSave === "No") {
                outputCard.body.push(target.name + spell.areaTextF);
                target.token.set(spell.effectMarker,true);
            } else {
                if (spell.conditionImmune && target.conditionImmunities.includes(spell.conditionImmune)) {
                    outputCard.body.push(target.name + " is Immune");
                } else {
                    let saveResult = Save(target,dc,spell.areaSave);
                    let tip = '(#" class="showtip" title="' + saveResult.tip + ')';
                    if (result.save === true) {
                        outputCard.body.push(target.name + '[saves]' + tip + spell.areaTextS);
                    } else {
                        outputCard.body.push(target.name + '[fails]' + tip + spell.areaTextS);
                        target.token.set(spell.effectMarker,true);
                    }
                }
            }
        })
    } else if (spell.areaEffect === "Damage") {




    }

    if (spell.moveEffect === true) {
        target.token.set({
            represents: "",
            layer: map,
        })
        delete ModelArray[targetID];
    } else {
        target.Destroy();
    }
    if (spell.emote) {
            outputCard.body.push("[hr]");
            outputCard.body.push(spell.emote);
    }
    //Fx ??
    PlaySound(spell.sound);

}



const Sleep = (targets,level) => {
    let finalTargets = [];
    targets.sort((a,b) => parseInt(a.token.get("bar1_value")) - parseInt(b.token.get("bar1_value"))); // b - a for reverse sort
    let dice = 2 * level + 3;
    let hp = 0;
    let rolls = [];
    for (let i=0;i<dice;i++) {
        let roll = randomInteger(8);
        rolls.push(roll);
        hp += roll;
    }
    let tip = "[" + rolls.toString() + "]<br>[" + dice + "d8]";
    tip = '[' + hp + '](#" class="showtip" title="' + tip + ')';
    outputCard.body.push(tip + " HP Affected");
    for (let i = 0;i<targets.length; i++) {
        let target = targets[i];
        if (target.type.includes("undead")) {
            outputCard.body.push(target.name + " is Immune");
            continue;
        };
        if (target.conditionImmunities.includes("charmed")) {
            outputCard.body.push(target.name + " is Immune");
            continue;
        };
        let posMarkers = Markers(target.token.get("statusmarkers"));
        if (posMarkers.includes("Unconscious")) {
            outputCard.body.push(target.name + " is already Unconscious");
            continue;
        };

        let phb = parseInt(target[i].token.get("bar1_value"));
        if (phb > hp) {
            break
        };
        hp -= phb;
        finalTargets.push(target);
    }
    return finalTargets;
}