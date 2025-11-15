const Strahd = (() => {
    const version = '2025.11.14';
    if (!state.Strahd) {state.Strahd = {}};


    let outputCard = {title: "",subtitle: "",side: "",body: [],buttons: [],};

    const ModelArray = {};

    const playerCodes = {
        "Don": "2520699",
        "DonAlt": "5097409",
        "Ted": "6951960",
        "Vic": "4892",
        "Ian": "4219310",
    }

    const simpleObj = (o) => {
        let p = JSON.parse(JSON.stringify(o));
        return p;
    };

    const getCleanImgSrc = (imgsrc) => {
        let parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
        if(parts) {
            return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
        }
        return;
    };

    const tokenImage = (img) => {
        //modifies imgsrc to fit api's requirement for token
        img = getCleanImgSrc(img);
        img = img.replace("%3A", ":");
        img = img.replace("%3F", "?");
        img = img.replace("med", "thumb");
        return img;
    };

    const DeepCopy = (variable) => {
        variable = JSON.parse(JSON.stringify(variable))
        return variable;
    };

    const PlaySound = (name) => {
        let sound = findObjs({type: "jukeboxtrack", title: name})[0];
        if (sound) {
            sound.set({playing: true,softstop:false});
        }
    };

    const FX = (fxname,model1,model2) => {
        //model2 is target, model1 is shooter
        //if its an area effect, model1 isnt used
        let pt1 = new Point(model1.token.get("left"),model1.token.get("top"))
        let pt2 =  new Point(model2.token.get("left"),model2.token.get("top"))
log(pt1)
log(pt2)
        spawnFxBetweenPoints(pt1, pt2,"missile-frost");




        return


        if (fxname.includes("System")) {
            //system fx
            fxname = fxname.replace("System-","");
            if (fxname.includes("Blast")) {
                fxname = fxname.replace("Blast-","");
                spawnFx(model2.token.get("left"),model2.token.get("top"), fxname);
            } else {
                spawnFxBetweenPoints(new Point(model1.token.get("left"),model1.token.get("top")), new Point(model2.token.get("left"),model2.token.get("top")), fxname);

            }
        } else {
            let fxType =  findObjs({type: "custfx", name: fxname})[0];
            if (fxType) {
                spawnFxBetweenPoints(new Point(model1.token.get("left"),model1.token.get("top")), new Point(model2.token.get("left"),model2.token.get("top")), fxType.id);
            }
        }
    }

    const pointInPolygon = (point,vertices) => {
        //evaluate if point is in the polygon
        px = point.x
        py = point.y
        collision = false
        len = vertices.length - 1
        for (let c=0;c<len;c++) {
            vc = vertices[c];
            vn = vertices[c+1]
            if (((vc.y >= py && vn.y < py) || (vc.y < py && vn.y >= py)) && (px < (vn.x-vc.x)*(py-vc.y)/(vn.y-vc.y)+vc.x)) {
                collision = !collision
            }
        }
        return collision
    }

    const translatePoly = (poly) => {
        //translate points in a pathv2 polygon to map points
        let vertices = [];
        let points = JSON.parse(poly.get("points"));
        let centre = new Point(poly.get("x"), poly.get("y"));
        //covert path points from relative coords to actual map coords
        //define 'bounding box;
        let minX = Infinity,minY = Infinity, maxX = 0, maxY = 0;
        _.each(points,pt => {
            minX = Math.min(pt[0],minX);
            minY = Math.min(pt[1],minY);
            maxX = Math.max(pt[0],maxX);
            maxY = Math.max(pt[1],maxY);
        })
        //translate each point back based on centre of box
        let halfW = (maxX - minX)/2 + minX;
        let halfH = (maxY - minY)/2 + minY
        let zeroX = centre.x - halfW;
        let zeroY = centre.y - halfH;
        _.each(points,pt => {
            let x = Math.round(pt[0] + zeroX);
            let y = Math.round(pt[1] + zeroY);
            vertices.push(new Point(x,y));
        })
        return vertices;
    }

    const Factions = {
        "PC": {
            "backgroundColour": "#FFFFFF",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#00FF00",
            "borderStyle": "5px ridge",
        },
        "NPC": {
            "backgroundColour": "#FFFFFF",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#00FF00",
            "borderStyle": "5px ridge",
        }

    }


    let ToHit = (advantage) => {
        let roll1 = randomInteger(20);
        let roll2 = randomInteger(20);
        let rollText,bonusText,roll;
        if (advantage === "Advantage") {
            roll = Math.max(roll1,roll2);
            rollText = "Rolls: " + roll1 + " / " + roll2 + " [Advantage]";
        } else if (advantage === "Disadvantage") {
            roll = Math.min(roll1,roll2);
            rollText = "Rolls: " + roll1 + " / " + roll2 + " [Disadvantage]";
        } else {
            roll = roll1;
            rollText = "Roll: " + roll;
        }
        let result = {
            roll: roll,
            rollText: rollText,
        }
        return result;
    }


    const Distance = (model1,model2) => {
        let pt1 = new Point(model1.token.get("left"),model1.token.get("top"));
        let pt2 = new Point(model2.token.get("left"),model2.token.get("top"));
        let dist = pt1.distance(pt2);





    }




    class Point {
        constructor(x,y) {
            this.x = x;
            this.y = y;
        };
        toOffset() {
            let cube = this.toCube();
            let offset = cube.toOffset();
            return offset;
        };
        toCube() {
            let x = this.x - HexInfo.pixelStart.x;
            let y = this.y - HexInfo.pixelStart.y;
            let q,r;
            if (pageInfo.type === "hex") {
                q = (M.b0 * x + M.b1 * y) / HexInfo.size;
                r = (M.b3 * y) / HexInfo.size;
            } else if (pageInfo.type === "hexr") {
                q = (M.b3 * x) / HexInfo.size;
                r = (M.b1 * x + M.b0 * y) / HexInfo.size;
            }
            let cube = new Cube(q,r,-q-r).round();
            return cube;
        };
        distance(b) {
            return Math.sqrt(((this.x - b.x) * (this.x - b.x)) + ((this.y - b.y) * (this.y - b.y)));
        }
        label() {
            return this.toCube().label();
        }
    }


    const Angle = (theta) => {
        while (theta < 0) {
            theta += 360;
        }
        while (theta >= 360) {
            theta -= 360;
        }
        return theta
    }   


    const ButtonInfo = (phrase,action,inline) => {
        //inline - has to be true in any buttons to have them in same line -  starting one to ending one
        if (!inline) {inline = false};
        let info = {
            phrase: phrase,
            action: action,
            inline: inline,
        }
        outputCard.buttons.push(info);
    };

    const SetupCard = (title,subtitle,side) => {
        outputCard.title = title;
        outputCard.subtitle = subtitle;
        outputCard.side = side;
        outputCard.body = [];
        outputCard.buttons = [];
        outputCard.inline = [];
    };

    const DisplayDice = (roll,tablename,size) => {
        roll = roll.toString();
        let table = findObjs({type:'rollabletable', name: tablename})[0];
        if (!table) {
            table = findObjs({type:'rollabletable', name: "Neutral"})[0];
        }
        let obj = findObjs({type:'tableitem', _rollabletableid: table.id, name: roll })[0];        
        let avatar = obj.get('avatar');
        let out = "<img width = "+ size + " height = " + size + " src=" + avatar + "></img>";
        return out;
    };

    const PrintCard = (id) => {
        let output = "";
        if (id) {
            let playerObj = findObjs({type: 'player',id: id})[0];
            let who = playerObj.get("displayname");
            output += `/w "${who}"`;
        } else {
            output += "/desc ";
        }

        if (!outputCard.side || !Factions[outputCard.side]) {
            outputCard.side = "Neutral";
        }

        //start of card
        output += `<div style="display: table; border: ` + Factions[outputCard.side].borderStyle + " " + Factions[outputCard.side].borderColour + `; `;
        output += `background-color: #EEEEEE; width: 100%; text-align: center; `;
        output += `border-radius: 1px; border-collapse: separate; box-shadow: 5px 3px 3px 0px #aaa;;`;
        output += `"><div style="display: table-header-group; `;
        output += `background-color: ` + Factions[outputCard.side].backgroundColour + `; `;
        output += `background-image: url(` + Factions[outputCard.side].image + `), url(` + Factions[outputCard.side].image + `); `;
        output += `background-position: left,right; background-repeat: no-repeat, no-repeat; background-size: contain, contain; align: center,center; `;
        output += `border-bottom: 2px solid #444444; "><div style="display: table-row;"><div style="display: table-cell; padding: 2px 2px; text-align: center;"><span style="`;
        output += `font-family: ` + Factions[outputCard.side].titlefont + `; `;
        output += `font-style: normal; `;

        let titlefontsize = "1.4em";
        if (outputCard.title.length > 12) {
            titlefontsize = "1em";
        }

        output += `font-size: ` + titlefontsize + `; `;
        output += `line-height: 1.2em; font-weight: strong; `;
        output += `color: ` + Factions[outputCard.side].fontColour + `; `;
        output += `text-shadow: none; `;
        output += `">`+ outputCard.title + `</span><br /><span style="`;
        output += `font-family: Arial; font-variant: normal; font-size: 13px; font-style: normal; font-weight: bold; `;
        output += `color: ` +  Factions[outputCard.side].fontColour + `; `;
        output += `">` + outputCard.subtitle + `</span></div></div></div>`;

        //body of card
        output += `<div style="display: table-row-group; ">`;

        let inline = 0;

        for (let i=0;i<outputCard.body.length;i++) {
            let out = "";
            let line = outputCard.body[i];
            if (!line || line === "") {continue};
            if (line.includes("[INLINE")) {
                let end = line.indexOf("]");
                let substring = line.substring(0,end+1);
                let num = substring.replace(/[^\d]/g,"");
                if (!num) {num = 1};
                line = line.replace(substring,"");
                out += `<div style="display: table-row; background: #FFFFFF;; `;
                out += `"><div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                out += `"><span style="line-height: normal; color: #000000; `;
                out += `"> <div style='text-align: center; display:block;'>`;
                out += line + " ";

                for (let q=0;q<num;q++) {
                    let info = outputCard.inline[inline];
                    out += `<a style ="background-color: ` + Factions[outputCard.side].backgroundColour + `; padding: 5px;`
                    out += `color: ` + Factions[outputCard.side].fontColour + `; text-align: center; vertical-align: middle; border-radius: 5px;`;
                    out += `border-color: ` + Factions[outputCard.side].borderColour + `; font-family: Tahoma; font-size: x-small; `;
                    out += `"href = "` + info.action + `">` + info.phrase + `</a>`;
                    inline++;                    
                }
                out += `</div></span></div></div>`;
            } else {
                line = line.replace(/\[hr(.*?)\]/gi, '<hr style="width:95%; align:center; margin:0px 0px 5px 5px; border-top:2px solid $1;">');
                line = line.replace(/\[\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})\](.*?)\[\/[\#]\]/g, "<span style='color: #$1;'>$2</span>"); // [#xxx] or [#xxxx]...[/#] for color codes. xxx is a 3-digit hex code
                line = line.replace(/\[[Uu]\](.*?)\[\/[Uu]\]/g, "<u>$1</u>"); // [U]...[/u] for underline
                line = line.replace(/\[[Bb]\](.*?)\[\/[Bb]\]/g, "<b>$1</b>"); // [B]...[/B] for bolding
                line = line.replace(/\[[Ii]\](.*?)\[\/[Ii]\]/g, "<i>$1</i>"); // [I]...[/I] for italics
                let lineBack,fontcolour;
                if (line.includes("[F]")) {
                    let ind1 = line.indexOf("[F]") + 3;
                    let ind2 = line.indexOf("[/f]");
                    let fac = line.substring(ind1,ind2);
                    if (Factions[fac]) {
                        lineBack = Factions[fac].backgroundColour;
                        fontcolour = Factions[fac].fontColour;
                    }
                    line = line.replace("[F]" + fac + "[/f]","");

                } else {
                    lineBack = (i % 2 === 0) ? "#D3D3D3": "#EEEEEE";
                    fontcolour = "#000000";
                }
                out += `<div style="display: table-row; background: ` + lineBack + `;; `;
                out += `"><div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                out += `"><span style="line-height: normal; color:` + fontcolour + `; `;
                out += `"> <div style='text-align: center; display:block;'>`;
                out += line + `</div></span></div></div>`;                
            }
            output += out;
        }

        //buttons
        if (outputCard.buttons.length > 0) {
            for (let i=0;i<outputCard.buttons.length;i++) {
                let info = outputCard.buttons[i];
                let inline = info.inline;
                if (i>0 && inline === false) {
                    output += '<hr style="width:95%; align:center; margin:0px 0px 5px 5px; border-top:2px solid $1;">';
                }
                let out = "";
                let borderColour = Factions[outputCard.side].borderColour;
                
                if (inline === false || i===0) {
                    out += `<div style="display: table-row; background: #FFFFFF;; ">`;
                    out += `<div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                    out += `"><span style="line-height: normal; color: #000000; `;
                    out += `"> <div style='text-align: center; display:block;'>`;
                }
                if (inline === true) {
                    out += '<span>     </span>';
                }
                out += `<a style ="background-color: ` + Factions[outputCard.side].backgroundColour + `; padding: 5px;`
                out += `color: ` + Factions[outputCard.side].fontColour + `; text-align: center; vertical-align: middle; border-radius: 5px;`;
                out += `border-color: ` + borderColour + `; font-family: Tahoma; font-size: x-small; `;
                out += `"href = "` + info.action + `">` + info.phrase + `</a>`
                
                if (inline === false || i === (outputCard.buttons.length - 1)) {
                    out += `</div></span></div></div>`;
                }
                output += out;
            }

        }

        output += `</div></div><br />`;
        sendChat("",output);
        outputCard = {title: "",subtitle: "",side: "",body: [],buttons: [],};
    }


    //Retrieve Values from Character Sheet Attributes
    const Attribute = (charID,attributename) => {
        //Retrieve Values from Character Sheet Attributes
        let attributeobj = findObjs({type:'attribute',characterid: charID, name: attributename})[0]
        let attributevalue = "";
        if (attributeobj) {
            attributevalue = attributeobj.get('current');
        }
        return attributevalue;
    };


    const AttributeSet = (characterID,attributename,newvalue,max) => {
        if (!max) {max = false};
        let attributeobj = findObjs({type:'attribute',characterid: characterID, name: attributename})[0]
        if (attributeobj) {
            if (max === true) {
                attributeobj.set("max",newvalue)
            } else {
                attributeobj.set("current",newvalue)
            }
        } else {
            if (max === true) {
                createObj("attribute", {
                    name: attributename,
                    current: newvalue,
                    max: newvalue,
                    characterid: characterID,
                });            
            } else {
                createObj("attribute", {
                    name: attributename,
                    current: newvalue,
                    characterid: characterID,
                });            
            }
        }
    };

    const AttributeArray = (characterID) => {
        let aa = {}
        let attributes = findObjs({_type:'attribute',_characterid: characterID});
        for (let j=0;j<attributes.length;j++) {
            let name = attributes[j].get("name")
            let current = attributes[j].get("current")   
            if (!current || current === "") {current = " "} 
            aa[name] = current;
            let max = attributes[j].get("max")   
            if (!max || max === "") {max = " "} 
            aa[name + "_max"] = max;
        }
        return aa;
    };


    //line line collision where line1 is pt1 and 2, line2 is pt 3 and 4
    const lineLine = (pt1,pt2,pt3,pt4) => {
        //calculate the direction of the lines
        uA = ( ((pt4.x-pt3.x)*(pt1.y-pt3.y)) - ((pt4.y-pt3.y)*(pt1.x-pt3.x)) ) / ( ((pt4.y-pt3.y)*(pt2.x-pt1.x)) - ((pt4.x-pt3.x)*(pt2.y-pt1.y)) );
        uB = ( ((pt2.x-pt1.x)*(pt1.y-pt3.y)) - ((pt2.y-pt1.y)*(pt1.x-pt3.x)) ) / ( ((pt4.y-pt3.y)*(pt2.x-pt1.x)) - ((pt4.x-pt3.x)*(pt2.y-pt1.y)) );
        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            intersection = {
                x: (pt1.x + (uA * (pt2.x-pt1.x))),
                y: (pt1.y + (uA * (pt2.y-pt1.y)))
            }
            return intersection;
        }
        return;
    }

    //an array of the PCs and any other tokens on page
    //will need to rebuild on page change or when add a token
    const BuildArrays = () => {

        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
        });

        tokens.forEach((token) => {
            let character = getObj("character", token.get("represents"));           
            if (character === null || character === undefined) {
                return;
            };
            let model = new Model(token);
            model.name = token.get("name");
        });


    }

    class Model {
        constructor(token) {
            let char = getObj("character", token.get("represents")); 
            this.token = token;
            this.name = token.get("name");
            let aa = AttributeArray(char.id);
            this.charID = char.id;


            this.type = (aa.npc_type || " ").toLowerCase();

            this.immunities = (aa.npc_immunities || " ").toLowerCase();
            this.resistances = (aa.npc_resistance || " ").toLowerCase();
            this.vulnerabilities = (aa.npc_vulnerabilities || " ").toLowerCase();

            this.npc = (aa.charactersheet_type === "npc") ? true:false;
            this.displayScheme = (this.npc === true) ? "NPC":"PC";

            this.size = parseInt(aa.token_size) || 1;

            let skillNames = ["acrobatics","athletics"];
            let skills = {};

            for (let i=0;i<skillNames.length;i++) {
                let skillName = skillNames[i];
                let bonusName = skillName+"_bonus";
                let flag = "npc_" + skillName + "_flag";
                let npcName = "npc_" + skillName;
                let skill = parseInt(aa[bonusName]) || 0;
                if (aa[flag] === 1) {
                    skill = parseInt(aa[npcName]) || 0;
                }
                skills[skillName] = skill;
            }
            this.skills = skills;

            this.spellAttack = parseInt(aa.spell_attack_bonus) || 0;
            this.casterLevel = parseInt(aa.caster_level) || 0;

            this.ac = (this.npc === false) ? (parseInt(aa.ac) || 10):(parseInt(aa.npc_ac) || 10);
log(this.name)
log("AA.AC" + aa.ac)
log("NPC: " + this.npc)
log("AA.NPC.AC: "  + aa.npc_ac)


            ModelArray[token.id] = this;

        }




    }


    const Smite = (msg) => {
        let Tag = msg.content.split(";");
        let attID = Tag[1];
        let defID = Tag[2];
        let level = parseInt(Tag[3]);
        let critical = Tag[4];
        let sub = (critical === "Yes") ? "Divine Smite Critical": "Divine Smite";
        //!Smite;@{selected|token_id};@{target|token_id};?{Spell Level|1|2|3};?{Critical Hit|Yes|No}

        let attacker = ModelArray[attID];
        let defender = ModelArray[defID]; 

        let valid = false;
        let slots = parseInt(Attribute(attacker.charID,"lvl" + level + "_slots_expended")) || 0;
        if (slots === 0) {
            SetupCard(attacker.name,sub,attacker.displayScheme);
            outputCard.body.push("No Available Spell Slots of this level");
            PrintCard();
            return;
        } else {
            slots--;
            AttributeSet(attacker.charID,"lvl" + level + "_slots_expended",slots);
        }

        let dice = 2 + (level - 1);
        if (defender.type.includes("undead")) {
            dice += 1;
            sub += " vs. Undead";
        }
        if (defender.type.includes("fiend")) {
            dice += 1;
            sub += " vs. Fiend";
        }

        if (critical === "Yes") {
            dice = dice * 2;
        }
        let rolls = [];
        let damage = 0;
        for (let i=0;i<dice;i++) {
            let roll = randomInteger(8);
            rolls.push(roll);
            damage += roll;
        }
        rolls = rolls.toString();
        let extra = "";

        if (defender.immunities.includes("radiant")) {
            extra = defender.name + " is immune to Radiant Damage";   
            damage = 0;
        }
        if (defender.resistances.includes("radiant")) {
            extra = defender.name + " is resistant to Radiant Damage";
            damage = Math.round(damage * .5);
        }
        if (defender.vulnerabilities.includes("radiant")) {
            extra = defender.name + " is vulnerable to Radiant Damage";
            damage = damage * 2;
        }

        SetupCard(attacker.name,sub,attacker.displayScheme);

        let tip = "Rolls: " + rolls;
        tip = '[🎲](#" class="showtip" title="' + tip + ')';

        outputCard.body.push(tip + " Radiant Damage:  [#ff0000]" + damage + "[/#]");
        if (extra !== "") {
            outputCard.body.push(extra);
        }
        outputCard.body.push("Level " + level + " Spell Slot Used");
        if (slots === 0) {outputCard.body.push("[None Left]")};
        PrintCard();
    }

    const ShieldShove = (msg) => {
        let Tag = msg.content.split(";");
        let attID = Tag[1];
        let defID = Tag[2];
        //!SShove;@{selected|token_id};@{target|token_id}

        let attacker = ModelArray[attID];
        let defender = ModelArray[defID];

        SetupCard(attacker.name,"Shield Shove",attacker.displayScheme);
        if (defender.immunities.includes("prone")) {
            outputCard.body.push(defender.name + " is immune to Shove");
            PrintCard();
            return;
        }
        if (defender.size > attacker.size) {
            outputCard.body.push(defender.name + " is too large to Shove");
            PrintCard();
            return;
        }

        let attRoll = randomInteger(20);
        let attTotal = attRoll + attacker.skills.athletics;

        let defRoll = randomInteger(20);
        let verb;

        if (defender.skills.athletics >= defender.skills.acrobatics) {
            defAtt = " [Athletics]";
            verb = " resists ";
            bonus = defender.skills.athletics;;
        } else {
            defAtt = " [Acrobatics]";
            verb = " dodges ";
            bonus = defender.skills.acrobatics;
        }
        let defTotal = defRoll + bonus;

        let tip = attacker.name + " Rolls: " + attRoll + " + " + attacker.skills.athletics; 
        tip += "<br>" + defender.name + " Rolls: " + defRoll + " + " + bonus + defAtt;
        tip = '[🎲](#" class="showtip" title="' + tip + ')';

        outputCard.body.push(tip + " " + attacker.name + " shoves " + defender.name + " with his Shield");

        if (defTotal < attTotal) {
            outputCard.body.push("[B]Success[/b]");
            outputCard.body.push(defender.name + " can be either pushed back 5ft or knocked prone");
        } else {
            outputCard.body.push("[B][#ff0000]Failure[/b][/#]");
            outputCard.body.push(defender.name + verb + "the Shove");
        }
        PrintCard();
    }



    const SpellInfo = {
        "Ray of Frost": {
            level: 0,
            range: 60,
            damage: ["1d8","1d8","1d8","1d8","2d8","2d8","2d8","2d8","2d8","2d8","3d8","3d8","3d8","3d8",],
            damageType: "cold",
            critOn: 20,
            target: 1,
            area: " ",
            toHit: "Ranged Spell",
            note: "Target's Speed is reduced by 10 for a turn",
            fx: "System-missile-frost",
            sound: "laser",
        }


    }

    const Damage = (damageInfo,damageType,crit,defender) => {
        damageInfo = damageInfo.split("d");

        let dice = parseInt(damageInfo[0]);
        let part2 = damageInfo[1].split("+");
        let diceType = parseInt(part2[0]);
        let bonus = parseInt(part2[1] || 0);
        let rolls = [];
        let total = 0;
        let note = "";
        if (crit === true) {
            dice *= 2;
        }

        for (let i=0;i<dice;i++) {
            let roll = randomInteger(diceType);
            rolls.push(roll);
            total += roll;
        }

        total += bonus;

        if (defender.immunities.includes(damageType)) {
            total = 0;
            note = "Immune to " + damageType;
        }
        if (defender.vulnerabilities.includes(damageType)) {
            total *= 2;
            note = "Vulnerable to " + damageType;
        }
        if (defender.resistances.includes(damageType)) {
            total = Math.round(total/2);
            note = "Resistant to " + damageType;
        }



        let result = {
            rolls: rolls,
            bonus: bonus,
            total: total,
            note: note,
        }
        return result;
    }





    const DirectedSpell = (msg) => {
        let Tag = msg.content.split(";");
        let spellName = Tag[1];
        let spellInfo = SpellInfo[spellName];

        if (!spellInfo) {
            sendChat("","Need Spell Info");
            return;
        }
        let attID = Tag[2];
        let attacker = ModelArray[attID];
        let level = Tag[3];
        let advantage = "No";

//disadvantage if in HtH 
//advantage if target is prone etc


        let defenders = [];
        for (let i=4;i<(Tag.length + 1);i++) {
            let defender = ModelArray[Tag[i]];
            if (defender) {
                defenders.push(defender);
            }
        }

        if (level > 0) {
            let slots = parseInt(Attribute(attacker.charID,"lvl" + level + "_slots_expended")) || 0;
            if (slots === 0) {
                SetupCard(attacker.name,spellName,attacker.displayScheme);
                outputCard.body.push("No Available Spell Slots of level " + level);
                PrintCard();
                return;
            } else {
                slots--;
                AttributeSet(attacker.charID,"lvl" + level + "_slots_expended",slots);
            }
        }

        if (spellInfo.toHit.includes("Ranged Spell")) {
            SetupCard(attacker.name,spellName,attacker.displayScheme);
            let distance = 


//check range
//auto hit eg magic missile
//saving throws ?

            for (let i=0;i<defenders.length;i++) {
                let defender = defenders[i];
                outputCard.body.push("[B]" + defender.name + "[/b]");
                let result = ToHit(advantage);
                let total = result.roll + attacker.spellAttack;
                let tip;
                let crit = false;
                let line = "";
                if (spellInfo.toHit.includes("Auto")) {
                    line = "To Hit: Automatic";
                } else {
                    tip = "1d20 + " + attacker.spellAttack + " = " + result.roll + " + " + attacker.spellAttack;
                    tip = '[' + total + '](#" class="showtip" title="' + tip + ')';
                    line = "Attack: " + tip + " vs. AC " + defender.ac;
                    if (result.roll >= spellInfo.critOn) {
                        crit = true;
                    }
                }
                outputCard.body.push(line);

                if ((total >= defender.ac || spellInfo.toHit.includes("Auto") || crit === true) && result.roll !== 1) {
                    if (crit === true) {
                        outputCard.body.push("[ff0000]Crit![/#]");
                    }
                    let damage = Damage(spellInfo.damage[attacker.casterLevel],spellInfo.damageType,crit,defender);
                    tip = spellInfo.damage[attacker.casterLevel] + " = " + damage.rolls.toString();
                    if (damage.bonus !== 0) {
                        tip += " + " + damage.bonus;
                    }
                    if (damage.note !== "") {
                        tip += "<br>" + note;
                    }
                    tip = '[' + damage.total + '](#" class="showtip" title="' + tip + ')';
                    outputCard.body.push("Damage: " + tip);
                    if (spellInfo.note !== "") {
                        outputCard.body.push(spellInfo.note);
                    }
                } else {
                    outputCard.body.push("[B]Miss[/b]");
                }
                if (defenders.length > 1) {
                    outputCard.body.push("[hr]");
                }

                if (i===0) {
                    //FX(spellInfo.fx,attacker,defender);
                    PlaySound(spellInfo.sound);
                }

            }




            PrintCard();







        }




    }












    const handleInput = (msg) => {
        if (msg.type !== "api") {
            return;
        }
        let args = msg.content.split(";");
        log(args);
    
        switch(args[0]) {
            case '!Dump':
                log(ModelArray);
                break;
            case '!Smite':
                Smite(msg);
                break;
            case '!ShieldShove':
                ShieldShove(msg);
                break;
            case '!DirectedSpell':
                DirectedSpell(msg);
                break;

        }
    };




    const registerEventHandlers = () => {
        on('chat:message', handleInput);
    
    };
    on('ready', () => {
        log("===> CoS <===");
        log("===> Software Version: " + version + " <===");
        BuildArrays();
        registerEventHandlers();
        sendChat("","API Ready")
        log("On Ready Done")
    });
    return {
        // Public interface here
    };






})();


