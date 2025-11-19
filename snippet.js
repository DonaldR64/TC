const RollDamage = (damageInfo,crit,attacker) => {
    //spellinfo if a spell, weaponinfo if a weapon
    //eg 1d8+1d6+3 or even 3
    let base;
    if (damageInfo.cat === "Spell") {
        if (damageInfo.cLevel[attacker.casterLevel]) {
            base = damageInfo.cLevel[attacker.casterLevel];
        }
        if (level > damageInfo.level) {
            base = damageInfo.sLevel[level];
        }
    }




    base = base.split("+");
    let comp = [];
    _.each(base,e => {
        e = e.split("d");
        n = parseInt(e[0]) || 1;
        if (e[1]) {
            t = parseInt(e[1]);
        } else {
            t = 0;
        }
        info = {
            num: n,
            type: t,
        }
        comp.push(info);
    })

    let rolls = [];
    let bonus = 0;
    let total = 0;
    let text = [];

    for (let i=0;i<comp.length;i++) {
        let info = comp[i];
        if (info.type === 0) {
            bonus += info.num;
        } else {
            let dice = info.num;
            if (crit === true) {
                dice *= 2;
            }                
            text.push(dice + "d" + info.type);
            for (let d=0;d<dice;d++) {
                let roll = randomInteger(info.type);
                rolls.push(roll);
                total += roll;
            }
        }
    }


    total += bonus;
    let result = {
        rolls: rolls,
        bonus: bonus,
        diceText: text,
        total: total,
    }

    return result;
}

const ApplyDamage = (damageInfo,defender,damageRolls) => {
        //as for area damage, damage starts same but then applied to individuals
        let total = parseInt(damageRolls.total);
        let immune = false, vulnerable = false, resistant = false;
        if (defender.immunities.includes(damageInfo.damageType)) {
            if (damageInfo.cat === "Weapon") {
                immune = true;
                if (defender.immunities.includes("nonmagical") && (damageInfo.info.includes("+") || damageInfo.info.includes("Magic"))) {
                    immune = false;
                }
                if (defender.immunities.includes("silver") && damageInfo.info.includes("Silver")) {
                    immune = false;
                }
            }
            if (damageInfo.cat === "Spell") {
                immune = true;
            }
        }
        if (defender.resistances.includes(damageInfo.damageType)) {
            if (damageInfo.info.includes("Weapon")) {
                resistant = true;
                if (defender.immunities.includes("nonmagical") && (damageInfo.info.includes("+") || damageInfo.info.includes("Magic"))) {
                    resistant = false;
                }
                if (defender.resistances.includes("silver") && damageInfo.info.includes("Silver")) {
                    resistant = false;
                }
            }
            if (damageInfo.info.includes("Spell")) {
                resistant = true;
            }
        }
        if (defender.vulnerabilities.includes(damageInfo.damageType)) {
            vulnerable = true;
        }

//add in any other damage reductions here

        //Immunities, Resistances, Vulnerabilities
        if (immune === true) {
            total = 0;
            note = "Immune to " + damageInfo.damageType;
        } else if (resistant === true) {
            total = Math.round(total/2);
            note = "Resistant to " + damageInfo.damageType + " = Half";
        } else if (vulnerable === true) {
            total *= 2;
            note = "Vulnerable to " +  damageInfo.damageType + " = Double";
        }

        if (damageInfo.savingThrow !== "No") {
            let dc = 10;
            if (damageInfo.cat === "Spell") {
                dc = attacker.spellDC;
            }
            let result= Save(defender,dc,damageInfo.savingThrow);
            if (result.save === true) {
                saved = true;
                tip = tip = '[Saves](#" class="showtip" title="' + result.tip + ')';
                if (spellInfo.saveEffect === "No Damage") {
                    tip += " and takes No Damage";
                    total = 0;
                }
                if (spellInfo.saveEffect === "Half Damage") {
                    tip += " and takes 1/2 Damage";
                    total = Math.round(total/2);
                }
            } else {
                tip = tip = '[Fails](#" class="showtip" title="' + result.tip + ')' + " the Save";
            }
            outputCard.body.push(defender.name + " " + tip);
        }

        let result = {
            total: total,
            note: note,
        }

        return result;
} 