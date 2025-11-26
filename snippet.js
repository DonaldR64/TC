const Advantage = (attacker,defender,damageInfo) => {
    let inReach = false;

    let squares = attacker.Distance(defender);
    let distance = squares * pageInfo.scaleNum;

    if (squares === 1) {
        inReach = true;
    }
    if (damageInfo.properties.includes("Reach") && squares <= 2) {
        inReach = true;
    }

    let attMarkers = Markers(attacker.token.get("statusmarkers"));
    let defMarkers = Markers(defender.token.get("statusmarkers"));
    let ids = Object.keys(ModelArray);

    let positive = ["Invisible","Advantage"];
    let attNegative = ["Blind","Frightened","Poison","Restrained","Disadvantage"];
    let defNegative = ["Blind","Disadvantage"];
    let incapacitated = ["Incapacitated","Paralyzed","Restrained","Stunned","Unconscious"];

    let advantage = false;
    let advText = [];
    let disadvantage = false;
    let disText = [];

    if (damageInfo.type.includes("Melee") === false) {
        //check if any adjacent enemies that arent incapacitated, as they will impose disadvantage
        for (let i=0;i<ids.length;i++) {
            let model2 = ModelArray[ids[i]];
            if (model2.id === attacker.id) {continue};
            if (attacker.inParty !== model2.inParty) {
                let sm = Markers[model2.token.get("statusmarkers")];
                let ignore = incapacitated.some(r=> sm.includes(r)); //returns true if model 2 has a statusmarker in the incapacitated bunch
                if (ignore === false) {
                    let squares = attacker.Distance(model2);
                    if (squares <= 1) {
                        disadvantage = true;
                        disText.push("Adjacent to Enemy")
                        break;
                    }
                } 
            }
        }
    }

    //Prone
    if (inReach === true) {
        if (attMarkers.includes("Prone")) {
            //attacker at disadvantage
            disText.push("Prone Melee Attack");
            disadvantage = true;
        }
        if (defMarkers.includes("Prone")) {
            advText.push("Prone Melee Defender")
            advantage = true;
        }
    } else {
        if (defMarkers.includes("Prone")) {
            disText.push("Prone Defender at Range");
            disadvantage = true;
        }
    }

    //ranged weapons over 'normal' range; note that thrown has changed to ranged in attack routine
    if (inReach === false && distance > weapon.range[0] && damageInfo.type === "Ranged") {
        disText.push("Long Range");
        disadvantage = true;
    }

    //check for conditions
    _.each(positive,cond => {
        if (attMarkers.includes(cond)) {
            advantage = true;
            advText.push(cond);
        }
        if (defMarkers.includes(cond)) {
            disadvantage = true;
            disText.push(cond);
        }
    })
    _.each(attNegative,cond => {
        if (attMarkers.includes(cond)) {
            disadvantage = true;
            disText.push(cond);
        }
    })
    _.each(defNegative,cond => {
        if (defMarkers.includes(cond)) {
            advantage = true;
            advText.push(cond);
        }
    })
    _.each(incapacitated,cond => {
        if (defMarkers.includes(cond)) {
            advantage = true;
            advText.push(cond);
        }
    })


    //specials, spells etc
    let fFire = (defender.token.get("aura1_color") === "#ff00ff" && defender.token.get("aura1_radius") === 1) ? true:false;
    if (fFire === true) {
        advantage = true;
        advText.push("Faerie Fire");
    };
    if (defMarkers.includes("Dodge")) {
        disText.push("Defender taking Dodge Action");
        disadvantage = true;
    }
    creatTypes = ["Aberration","Celestial","Elemental","Fey","Fiend","Undead"];
    if (defMarkers.includes("Protection") && creatTypes.includes(attacker.type)) {
        disadvantage = true;
        disText.push("Protection from Evil/Good");
    }
    if (attacker.special.includes("Pack Tactics")) {
        let adj = false;
        for (let i=0;i<ids.length;i++) {
            let model2 = ModelArray[ids[i]];
            if (model2.id === attacker.id || model2.id === defender.id) {
                continue;
            }
            if (model2.inParty === attacker.inParty) {
                let squares = model2.Distance(defender);
                if (squares <= 1) {
                    adj = true;
                    break;
                }
            }
        }
        if (adj === true) {
            advantage = true;
            advText.push("Pack Tactics");
        }
    }









    finalAdv = 0;
    if (advantage === true && disadvantage === false) {
        finalAdv = 1;
    }
    if (advantage === false && disadvantage === true) {
        finalAdv = -1;
    }
    let result = {
        advantage: finalAdv,
        advText: advText,
        disText: disText,
    }
    return result;
}