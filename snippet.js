const RollDamage = (damageInfo,crit) => {
        //spellinfo if a spell, weaponinfo if a weapon
        //eg 1d8+1d6+3 or even 3
        let base = damageInfo.base.split("+");
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

//? just return the output with tip ?

        return result;
}

const ApplyDamage = (damageInfo,defender,damage) => {
        let immune = false, vulnerable = false, resistant = false;
        if (defender.immunities.includes(damageInfo.damageType)) {
            if (damageInfo.info.includes("Weapon")) {
                immune = true;
                if (defender.immunities.includes("nonmagical") && (damageInfo.info.includes("+") || damageInfo.info.includes("Magic"))) {
                    immune = false;
                }
                if (defender.immunities.includes("silver") && damageInfo.info.includes("Silver")) {
                    immune = false;
                }
            }
            if (damageInfo.info.includes("Spell")) {
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

        text = text.toString();
        text = text.replace(","," + ");
        text += " + " + bonus;


//move saves into here also

//? just return the output with tip ?




        let result = {
            rolls: rolls,
            bonus: bonus,
            total: total,
            text: text,
            note: note,
        }
        return result;





} 