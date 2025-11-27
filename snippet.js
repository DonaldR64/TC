const Spell = (msg) => {
    let Tag = msg.content.split(";");
    let type = Tag[1];
    let spellName = Tag[2];
    let level = Tag[3];
    let casterID = Tag[4];
    let targetIDs = [];
    for (let i=5;i<= Tag.length;i++) {
        targetIDs.push(Tag[i]);
    }

    let caster = ModelArray[casterID];
    let spell = SpellInfo[spellName];
    spell.name = spellName;
    let errorMsg = [];

    let spellInfo = {
        caster: caster,
        targets: targetIDs,
        spell: spell,
        level: level,
    }


    SetupCard(caster.name,spellName,caster.displayScheme);

    //check spell slots
    let slotsAvailable = SpellSlots(caster,level);
    if (slotsAvailable === false) {
        errorMsg.push("No Slots of that Level Available");
    }
    let distance = caster.Distance(target);
    if (distance > spell.range) {
        errorMsg.push("Target is out of range");
    }

    if (errorMsg.length > 0) {
        _.each(errorMsg,error => {
            outputCard.body.push(error);
        });
    } else {
        if (type === "DirectAttack") {
            //spells that directly attack the target
            DirectAttackSpell(spellInfo);
        }
        if (type === "DirectOther") {
            DirectOtherSpell(spellInfo);
        }
        if (type === "Template") {
            //spells that need a template or similar eg AOE spells
            TemplateSpell1(spellInfo);
        }
    }





    PrintCard();

}