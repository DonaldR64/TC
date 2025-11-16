const Attack = (msg) => {
    let Tag = msg.content.split(";");
    let attID = Tag[1];
    let defID = Tag[2];
    let weaponName = Tag[3];
    let attAdvantage = Tag[4];

    let bonusTH = parseInt(Tag[5]);
    let bonusD = parseInt(Tag[6]);


    //!Attack;@{selected|token_id};@{target|token_id};Longsword;?{Advantage|No,0|Yes|1,Disadvantage,-1};0,2;
    //incorporate magic item etc bonuses into above
    //? redo the advantage later


    let attacker = ModelArray[attID];
    let defender = ModelArray[defID];

    let errorMsg = [];
    let HtH = false;

    if (!attacker) {
        errorMsg.push("Attacker not in Array");
        attacker = defender;
    }
    if (!defender) {
        errorMsg.push("Defender not in Array");
        defender = attacker;
    }
    let weapon = DeepCopy(Weapons[weaponName]);
    weapon.bonus += bonusD;

    if (!weapon) {
        errorMsg.push("Weapon not in Array");
        weapon = {range: 1000};
    }

    let distance = Distance(attacker,defender);

    if (weapon.range === "reach") {
        weapon.range = pageInfo.scaleNum; //1 square
        HtH = true;
    }
    if (distance > weapon.range) {
        errorMsg.push("Target is Out of Range");
    }



    if (errorMsg.length > 0) {
        _.each(errorMsg,msg => {
            sendChat("",msg);
        })
        return;
    }

    SetupCard(attacker.name,weaponName,attacker.displayScheme);

    let defAdvantage = 0;
    let defMarkers = Markers(defender.token.get("statusmarkers"));
    let defPos = ["Blind","Paralyzed","Restrained","Stunned","Unconscious"];
    let defNeg = ["Invisible","Dodge"];
    for (let i=0;i<defPos.length;i++) {
        if (defMarkers.includes(defPos[i])) {
            defAdvantage = 1;
            break;
        }
    }
    for (let i=0;i<defNeg.length;i++) {
        if (defMarkers.includes(defNeg[i])) {
            defAdvantage -= 1;
            break;
        }
    }
    
    if (defMarkers.includes("Prone")) {
        if (distance <= 5) {
            defAdvantage += 1;
        } else {
            defAdvantage -= 1;
        }
    }
    defAdvantage = Math.min(Math.max(-1,defAdvantage),1);
    log("Def Adv: " + defAdvantage)

    let advantage = attAdvantage + defAdvantage;
    advantage = Math.min(Math.max(-1,advantage),1);
    ("Final Adv: " + advantage)

    let result = ToHit(advantage);
    let bonus = attacker.statBonus[weapon.stat] + attacker.pb + bonusTH;
    let total = result.roll + bonus;
    let tip;
    let crit = false;
    if ((defMarkers.includes("Paralyzed") || defMarkers.includes("Unconscious")) && HtH === true) {
        crit = true;
    }

    tip = "1d20 + " + attacker.bonus + " = " + result.rollText + " + " + attacker.bonus;
    tip = '[' + total + '](#" class="showtip" title="' + tip + ')';
    if (result.roll >= weapon.critOn) {
        crit = true;
    }
    outputCard.body.push("Attack: " + tip + " vs. AC " + defender.ac);
    if (crit === true) {
        outputCard.body.push("[#ff0000]Crit![/#]");
    }

    if ((total >= defender.ac && result.roll !== 1) || crit === true) {
        let damage = Damage(weapon,crit,defender);
        tip = damage.diceType + " = " + damage.rolls.toString();
        if (damage.bonus !== 0) {
            tip += " + " + damage.bonus;
        }
        if (damage.note !== "") {
            tip += "<br>" + note;
        }
        let totalDamage = damage.total;
        tip = '[' + totalDamage + '](#" class="showtip" title="' + tip + ')';
        outputCard.body.push("Damage: " + tip);
    } else {
        outputCard.body.push("[B]Miss[/b]");
    }

    PlaySound(weapon.sound);

    PrintCard();









}