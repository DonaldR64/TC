const Strahd = (() => {
    const version = '2025.11.14';
    if (!state.Strahd) {state.Strahd = {}};


    let outputCard = {title: "",subtitle: "",side: "",body: [],buttons: [],};

    let ModelArray = {};

    const pageInfo = {name: "",page: "",gridType: "",scale: 0,width: 0,height: 0};

    const LoadPage = () => {
        //build Page Info
        pageInfo.page = getObj('page', Campaign().get("playerpageid"));
        pageInfo.name = pageInfo.page.get("name");
        pageInfo.scale = pageInfo.page.get("snapping_increment");
        pageInfo.width = pageInfo.page.get("width") * 70;
        pageInfo.height = pageInfo.page.get("height") * 70;
        pageInfo.scaleNum = pageInfo.page.get("scale_number");

        _.each(playerCodes,pID => {
            let pObj = getObj('player', pID);
            if (pObj) {
                let colour = playerColours[pID];
                pObj.set({color: colour});
            }
        })

    }

    const playerCodes = {
        "-OdzmtPMDNNfcmdvIN5m": "Ted",
        "all": "Allied",
        "-OdyHPJkwRBH1F9Zn5AU": "Ian",
        "A": "Vic",
    }

    const playerColours = {
        "-OdzmtPMDNNfcmdvIN5m": "#ffd700",
        "-OdyHPJkwRBH1F9Zn5AU": "#228C22",
        "A": "#0000ff",
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
        "NPC": {
            "backgroundColour": "#FFFFFF",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#ff0000",
            "borderStyle": "5px ridge",
        },
        "Allied": {
            "backgroundColour": "#FFFFFF",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#00ff00",
            "borderStyle": "5px ridge",
        },
        "Ted": {
            "backgroundColour": "#ffd700",
            "titlefont": "Candal",
            "fontColour": "#000000",
            "borderColour": "#000000",
            "borderStyle": "5px double",
        },
        "Vic": {
            "backgroundColour": "#0000ff",
            "titlefont": "Merriweather",
            "fontColour": "#ffffff",
            "borderColour": "#0000ff",
            "borderStyle": "5px groove",
        },
        "Ian": {
            "backgroundColour": "#228c22",
            "titlefont": "Tahoma",
            "fontColour": "#ffffff",
            "borderColour": "#000000",
            "borderStyle": "5px inset",
        },






    }












    let ToHit = (advantage) => {
        let roll1 = randomInteger(20);
        let roll2 = randomInteger(20);
        let rollText,bonusText,roll;
        if (advantage > 0) {
            roll = Math.max(roll1,roll2);
            rollText = roll1 + " / " + roll2 + " [Advantage]";
        } else if (advantage < 0) {
            roll = Math.min(roll1,roll2);
            rollText = roll1 + " / " + roll2 + " [Disadvantage]";
        } else {
            roll = roll1;
            rollText = roll;
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
        dist -= (model1.size - 1) * 35;
        dist -= (model2.size - 1) * 35;
        dist = Math.round(dist/70)
        dist *= pageInfo.scaleNum;
log(dist)
        return dist;
    }

const Distance2 = (model1,model2) => {
    let pt1 = new Point(model1.token.get("left"),model1.token.get("top"));
    let pt2 = new Point(model2.token.get("left"),model2.token.get("top"));
    let x = Math.round(Math.abs(pt1.x - pt2.x) / 70);
    let y = Math.round(Math.abs(pt2.y - pt2.y) / 70);
    x -= ((model1.size-1) + (model2.size - 1));
    y -= ((model1.size-1) + (model2.size - 1));
    let squares = Math.max(x,y);
    let distance = squares * pageInfo.scaleNum;
    let result = {
        squares: squares,
        distance: distance,
    }
    return result

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
log(outputCard.side)

        if (!outputCard.side || !Factions[outputCard.side]) {
            outputCard.side = "Allied";
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
        ModelArray = {};
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
            this.id = token.get("id");
            this.name = token.get("name");
            let aa = AttributeArray(char.id);
            this.charID = char.id;

log(this.name)
            this.type = (aa.npc_type || " ").toLowerCase();

            this.immunities = (aa.npc_immunities || " ").toLowerCase();
            this.conditionImmunities = (aa.npc_condition_immunities || " ").toLowerCase();
            this.resistances = (aa.npc_resistances || " ").toLowerCase();
            this.vulnerabilities = (aa.npc_vulnerabilities || " ").toLowerCase();

            this.npc = (aa.charactersheet_type === "npc") ? true:false;
            this.displayScheme = "NPC";

            this.ac = (this.npc === false) ? (parseInt(aa.ac) || 10):(parseInt(aa.npc_ac) || 10); //here as wildshapes are coming up as NPCs




            let control = char.get("controlledby");
log("C: " + control)
            let playerName;
            if (control) {
                playerName = playerCodes[control.split(",")[0]];
                this.displayScheme = playerName;
                this.npc = false;
            }
if (this.name === "Eivirin" || this.name.includes("Ratatoskr")) {
    this.displayScheme = "Vic";
}


log("pN: " + playerName)
            let dim = Math.max(token.get("width"),token.get("height"));
            dim = Math.round(dim/70);
            this.size = dim;

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
            this.spellDC = parseInt(aa.spell_save_dc) || 0;

            let saveBonus = {
                strength: parseInt(aa.strength_save_bonus) || 0,
                dexterity: parseInt(aa.dexterity_save_bonus) || 0,
                constitution: parseInt(aa.constitution_save_bonus) || 0,
                intelligence: parseInt(aa.intelligence_save_bonus) || 0,
                wisdom: parseInt(aa.wisdom_save_bonus) || 0,
                charisma: parseInt(aa.charisma_save_bonus) || 0,
            }
            this.saveBonus = saveBonus;

            let statBonus = {
                strength: parseInt(aa.strength_mod) || 0,
                dexterity: parseInt(aa.dexterity_mod) || 0,
                constitution: parseInt(aa.constitution_mod) || 0,
                intelligence: parseInt(aa.intelligence_mod) || 0,
                wisdom: parseInt(aa.wisdom_mod) || 0,
                charisma: parseInt(aa.charisma_mod) || 0,
            }
            this.statBonus = statBonus;

            this.pb = parseInt(aa.pb) || 0;






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

        spawnFx(defender.token.get("left"),defender.token.get("top"), "nova-holy",defender.token.get("_pageid"));

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
            base: '1d8',
            cLevel: {5: '2d8', 11: '3d8'},
            sLevel: 0,
            damageType: "cold",
            critOn: 20,
            savingThrow: "No",
            saveEffect: "",
            toHit: "Direct",
            note: "Target's Speed is reduced by 10 for a turn",
            sound: "Laser",
            fx: "missile-frost",
        },
        "Acid Splash": {
            level: 0,
            range: 60,
            base: '1d6',
            cLevel: {5: '2d6', 11: '3d6'},
            sLevel: 0,
            damageType: "acid",
            critOn: 20,
            savingThrow: "dexterity",
            saveEffect: "No Damage",
            toHit: "Direct",
            note: "",
            sound: "",
        },
        "Burning Hands": {
            level: 1,
            range: 15,
            base: '3d6',
            cLevel: {},
            sLevel: ['4d6','5d6','6d6','7d6'],
            damageType: "fire",
            critOn: 20,
            savingThrow: "dexterity",
            saveEffect: "Half Damage",
            toHit: "Cone",
            note: "",
            sound: "Inferno",
        },
        "Magic Missile": {
            level: 1,
            range: 120,
            base: '1d4+1',
            cLevel: {},
            sLevel: 0,
            damageType: "force",
            critOn: 20,
            savingThrow: "No",
            saveEffect: "",
            toHit: "Direct Auto",
            note: "",
            sound: "Splinter2",
            fx: "missile-magic",
        }


    }


    const WeaponInfo = {
        Longsword: {
            base: '1d8',
            properties: "Versatile",
            damageType: "slashing",
            type: "Melee",
            range: [0,0],
            critOn: 20,
            sound: "Sword",
        },
        Dagger: {
            base: '1d4',
            properties: "Finesse, Thrown",
            damageType: "slashing",
            type: "Melee,Ranged",
            range: [20,60],
            critOn: 20,
            sound: "Club",
        },
        Acornbringer: {
            base: '1d1',
            properties: "Finesse",
            damageType: "piercing",
            type: "Melee",
            range: [0,0],
            critOn: 20,
            sound: "Sword",
        },
        'Quarterstaff (2H)': {
            base: '1d8',
            properties: "",
            damageType: "bludgeoning",
            type: "Melee",
            range: [0,0],
            critOn: 20,
            sound: "Staff",
        },
        'Scimitar': {
            base: "1d6",
            properties: "Finesse",
            damageType: "slashing",
            type: "Melee",
            range: [0,0],
            critOn: 20,
            sound: "Sword",
        },
       



    }

    const Attack = (msg) => {
        let Tag = msg.content.split(";");
        let attID = Tag[1];
        let defID = Tag[2];
        let weaponName = Tag[3];
        let magicInfo = Tag[4] || "Non-Magic"


        //!Attack;@{selected|token_id};@{target|token_id};Longsword;any magic info or Silver or similar goes here

        let attacker = ModelArray[attID];
        let defender = ModelArray[defID];

        let errorMsg = [];

        if (!attacker) {
            errorMsg.push("Attacker not in Array");
            attacker = defender;
        }
        if (!defender) {
            errorMsg.push("Defender not in Array");
            defender = attacker;
        }
        let weapon = WeaponInfo[weaponName];
        if (weapon) {
            weapon = DeepCopy(WeaponInfo[weaponName]);
        } else {
            errorMsg.push("Weapon not in Array");
            weapon = {range: 1000};
        }
        weapon.info = "Weapon, " + magicInfo;

        let adjacent = false;

        let distance2 = Distance2(attacker,defender);
        let distance = distance2.distance;
        let squares = distance2.squares;
log(distance2)

        if (squares === 1) {
            adjacent = true;
        }
        if (weapon.properties.includes("Reach") && squares <= 2) {
            adjacent = true;
        }
        if (adjacent !== true && weapon.type.includes("Ranged") === false) {
            errorMsg.push("Target not in Reach");
        } 

        let statBonus = attacker.statBonus["strength"];
        if (adjacent === false && weapon.properties.includes("Thrown") === false) {
            statBonus = attacker.statBonus["dexterity"];
        }
        if (weapon.properties.includes("Finesse")) {
            statBonus = Math.max(attacker.statBonus["strength"],attacker.statBonus["dexterity"]);
        }

        if (distance > weapon.range[1] && weapon.type.includes("Ranged")) {
            errorMsg.push("Target is Out of Max Range");
        }

        //damage bonuses, move into weapon for Damage routine
        //stat
        if (weapon.type.includes("Melee") || weapon.properties.includes("Thrown")) {
            weapon.base += "+" + statBonus;
        }
        //abilities
        if (attacker.name === "Wirsten" && adjacent === true) {
            weapon.base += "+2"; //Duellist
        }


        //attack bonuses - later check has proficiency?
        attackBonus = statBonus + attacker.pb;

        //Magic Items
        if (magicInfo) {
            if (magicInfo.includes("+")) {
                magicBonus = parseInt(magicInfo.characterAt(magicInfo.indexOf("+") + 1)) || 0;
                attackBonus += magicBonus;
                weapon.base += "+" + magicBonus;
            }



        }





        if (errorMsg.length > 0) {
            _.each(errorMsg,msg => {
                sendChat("",msg);
            })
            return;
        }

        SetupCard(attacker.name,"Attack",attacker.displayScheme);
        if (adjacent === true && weapon.type.includes("Melee")) {
            outputCard.body.push(attacker.name + " strikes at " + defender.name + " with his " + weaponName);
        }
        if (adjacent === false && weapon.properties.includes("Thrown")) {
            outputCard.body.push(attacker.name + " throws his " + weaponName + " at " + defender.name);
            weapon.sound = "Shuriken"
        }
        if (adjacent === false && weapon.properties.includes("Thrown") === false) {
            outputCard.body.push(attacker.name + ' fires his ' + weaponName + " at " + defender.name);
        }

        //Advantage/Disadvantage checking
        let attAdvantage = 0;

        let attPos = ["Invisible"];
        let attNeg = ["Blind","Frightened","Poison","Restrained"];
        let ignore = ["Incapacitated","Paralyzed","Restrained","Stunned","Unconscious"];
        let attMarkers = Markers(attacker.token.get("statusmarkers"));
        //check if next to an enemy token if ranged attack, if so, disadvantage unless is Incapacitated, paralyzed, restrained,stunned,unconsciou
        if (adjacent === true && weapon.type.includes("Melee") === false) {
            let ids = Object.keys(ModelArray);
            idLoop1:
            for (let i=0;i<ids.length;i++) {
                let model2 = ModelArray[ids[i]];
                if (model2.displayScheme !== "NPC") {continue};
                let sm = model2.token.get("statusmarkers");
                for (let j=0;j<ignore.length;j++) {
                    if (sm.includes(ignore[j])) {continue idLoop1};
                }
                let squares = Distance2(attacker,model2).squares;
                if (squares > 1) {
                    continue;
                }
                attAdvantage = -1;
            }
        }    
        //prone if adjacent
        if (adjacent === true && attMarkers.includes("Prone")) {
            attAdvantage = -1;
        }
        //ranged weapons
        if (adjacent === false && distance > weapon.range[0]) {
            attAdvantage = -1;
        }
        for (let i=0;i<attPos.length;i++) {
            if (attMarkers.includes(attPos[i])) {
                attAdvantage = Math.min(attAdvantage +1,1);
                break;
            }
        }
        for (let i=0;i<attNeg.length;i++) {
            if (attMarkers.includes(attNeg[i])) {
                attAdvantage = Math.max(attAdvantage -1, -1);
                break;
            }
        }
log("Att Adv: " + attAdvantage)

        let defAdvantage = 0;
        let defMarkers = Markers(defender.token.get("statusmarkers"));
        let defPos = ["Blind","Paralyzed","Restrained","Stunned","Unconscious"];
        let defNeg = ["Invisible","Dodge"];
        if (defMarkers.includes("Prone")) {
            if (adjacent === true) {
                defAdvantage = 1;
            } else {
                defAdvantage = -1;
            }
        }
        for (let i=0;i<defPos.length;i++) {
            if (defMarkers.includes(defPos[i])) {
                defAdvantage = Math.min(defAdvantage +1,1);
                break;
            }
        }
        for (let i=0;i<defNeg.length;i++) {
            if (defMarkers.includes(defNeg[i])) {
                defAdvantage = Math.max(defAdvantage -1,-1);
                break;
            }
        }

        creatTypes = ["Aberration","Celestial","Elemental","Fey","Fiend","Undead"];
        if (defMarkers.includes("Protection") && creatTypes.includes(attacker.type)) {
            defAdvantage = Math.max(defAdvantage -1,-1);
        }





log("Def Adv: " + defAdvantage)

        let advantage = attAdvantage + defAdvantage;
        advantage = Math.min(Math.max(-1,advantage),1);
log("Final Adv: " + advantage)

        let result = ToHit(advantage);

        let total = result.roll + attackBonus;
        let tip;
        let crit = false;
        if ((defMarkers.includes("Paralyzed") || defMarkers.includes("Unconscious")) && adjacent === true) {
            crit = true;
        }

        tip = "1d20 + " + attackBonus + " = " + result.rollText + " + " + attackBonus;
        tip = '[' + total + '](#" class="showtip" title="' + tip + ')';
        if (result.roll >= weapon.critOn) {
            crit = true;
        }
        outputCard.body.push("Attack: " + tip + " vs. AC " + defender.ac);
        if (crit === true) {
            outputCard.body.push("[#ff0000]Crit![/#]");
        }

        if ((total >= defender.ac && result.roll !== 1) || crit === true) {
            outputCard.body.push("[B]Hit![/b]")
log(weapon)
            let damage = Damage(weapon,crit,defender);
            tip = damage.text + " = [" + damage.rolls.toString() + "]"
            if (damage.bonus !== 0) {
                tip += " + " + damage.bonus;
            }
            if (damage.note !== "") {
                tip += "<br>" + damage.note;
            }
            let totalDamage = damage.total;
            tip = '[' + totalDamage + '](#" class="showtip" title="' + tip + ')';
            outputCard.body.push("Damage: " + tip);
            spawnFx(defender.token.get("left"),defender.token.get("top"), "pooling-blood",defender.token.get("_pageid"));
        } else {
            outputCard.body.push("[B]Miss[/b]");
        }

        PlaySound(weapon.sound);

        PrintCard();
        










    }



    const Damage = (damageInfo,crit,defender) => {
        //spellinfo if a spell, weaponinfo if a weapon
        //1d8+1d6+3
        //3
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
        let note = "";
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
                text.push(info.num + "d" + info.type);
                for (let d=0;d<dice;d++) {
                    let roll = randomInteger(info.type);
                    rolls.push(roll);
                    total += roll;
                }
            }
        }
log(damageInfo.info)
log(defender.immunities)
log(defender.resistances)
log(defender.vulnerabilities)


        total += bonus;
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

        let result = {
            rolls: rolls,
            bonus: bonus,
            total: total,
            text: text,
            note: note,
        }
        return result;
    }


    const SetCondition = (msg) => {
        let Tag = msg.content.split(";");
        let id = msg.selected[0]._id;
        if (!id) {
            sendChat("","Select a Token");
            return;
        }
        let model = ModelArray[id];
        if (!model) {
            sendChat("","Not in Array");
            return;
        }
        let condition = Tag[1];
        let marker = ConditionMarkers[condition];
        let status = Tag[2];
        if (marker) {


        }

        if (status === "On") {
            model.token.set("status_" + marker,true);
        } else if (status === "Off") {
            model.token.set("status_" + marker,false);
        } else if (status === "Clear") {
            model.token.set("statusmarkers","");
        }
        
    }



    const ConditionMarkers = {
        "Blind": "Blind-::2006481",
        "Charmed": "Charmed::2006504",
        "Deaf": "Deaf::2006484",
        "Frightened": "Fear-or-Afraid::2006486",
        "Grappled": "Grappled::2006490",
        "Incapacitated": "interdiction",
        "Invisible": "Invisible::2006516",
        "Paralyzed": "Paralyzed::2006491",
        "Petrified": "Petrified-or-Stone-2::2006594",
        "Poisoned": "Poison::2006492",
        "Prone": "Prone::2006547",
        "Restrained": "Restrained-or-Webbed::2006494",
        "Stunned": "Stunned::2006499",
        "Unconscious": "KO::2006544",
        "Dodge": "half-haze",
        "Protection": "Shield::2006495",
    }

    const Markers = (initial) => {
        initial = initial.split(",");
        let sm = [];
        let keys = Object.keys(ConditionMarkers);
        for (let i=0;i<initial.length;i++) {
            let cond = initial[i];
            for (let j=0;j<keys.length;j++) {
                if (ConditionMarkers[keys[j]] === cond) {
                    sm.push(keys[j]);
                    break;
                }
            }
        }
        sm = sm.toString() || " ";
        return sm;
    }

    const MiscSpell = (msg) => {
        let id = msg.selected[0]._id;
        let caster = ModelArray[id];
        let Tag = msg.content.split(";");
        let spellName = Tag[1];
        let level = Tag[2]; //later can cahnge to be 'Cast at X Level'
        
        SetupCard(caster.name,spellName,caster.displayScheme);

        if (level > 0) {
            let slots = parseInt(Attribute(caster.charID,"lvl" + level + "_slots_expended")) || 0;
            if (slots === 0) {
                outputCard.body.push("No Available Spell Slots of level " + level);
                PrintCard();
                return;
            } 
        }

        if (spellName === "Sleep") {
            let charID = "-Oe8qdnMHHQEe4fSqqhm";
            //create the sleep token, place on caster, with instructions
            let img = getCleanImgSrc("https://files.d20.io/images/105823565/P035DS5yk74ij8TxLPU8BQ/thumb.png?1582679991");
            let sleepToken = PlaceTarget(caster,charID,img,70,70)
            sleepToken.set({
                aura1_radius: 17.5, //20 ft radius
                aura1_square: false, 
                aura1_color: "#cfe2f3",
                showplayers_aura1: true,
                disableSnapping: true,
                disableTokenMenu: true,
            })
            let char = getObj("character", charID);
            let abilArray = findObjs({_type: "ability", _characterid: char.id});
            //clear old abilities
            for(let a=0;a<abilArray.length;a++) {
                abilArray[a].remove();
            } 
            abilityName = "Cast Sleep";
            action = "!Spell2;Sleep;" + id + ";" + level;
            AddAbility(abilityName,action,charID);

            outputCard.body.push("Place Target and then Use Macro to Cast");
            PrintCard();
        }




        



    }


    const Spell2 = (msg) => {
        let targetID = msg.selected[0]._id;
        let Tag = msg.content.split(";");
        let spellName = Tag[1];
        let casterID = Tag[2];
        let level = parseInt(Tag[3]);
        let caster = ModelArray[casterID];

        if (spellName === "Sleep") {
            SetupCard(caster.name,"Sleep",caster.displayScheme);
            let sleepTarget = ModelArray[targetID];
            let spellDist = Distance2(sleepTarget,caster).distance;
            if (spellDist > 90) {
                outputCard.body.push("Out of Range of Spell");
                PrintCard();
                return;
            }
            let dice = 5 + ((level -1) * 2);
            //5d8 hp. +2d8 for spell level > 1
            //models within 20 ft of centre
            let possibles = [];
            _.each(ModelArray,model => {
                let squares = Distance2(sleepTarget,model).squares;
log(model.name)
log(squares)
                if (squares <= 4) {
                    possibles.push(model);
                }
            })
            //sort by hp, low to high
            possibles.sort((a,b) => parseInt(a.token.get("bar1_value")) - parseInt(b.token.get("bar1_value"))); // b - a for reverse sort
            let hp = 0;
            let rolls = [];
            for (let i=0;i<dice;i++) {
                let roll = randomInteger(8);
                rolls.push(roll);
                hp += roll;
            }
            let tip = dice + "d8 = " + rolls.toString();
            tip = '[' + hp + '](#" class="showtip" title="' + tip + ')';

            outputCard.body.push(tip + " HP Affected");
            for (let i = 0;i<possibles.length; i++) {
                let possible = possibles[i];
                if (possible.type.includes("undead")) {
                    outputCard.body.push(possible.name + " is Immune");
                    continue;
                };
                if (possible.conditionImmunities.includes("charmed")) {
                    outputCard.body.push(possible.name + " is Immune");
                    continue;
                };
                let posMarkers = Markers(possible.token.get("statusmarkers"));
                if (posMarkers.includes("Unconscious")) {
                    outputCard.body.push(possible.name + " is already Unconscious");
                    continue;
                };

                let phb = parseInt(possibles[i].token.get("bar1_value"));
                if (phb > hp) {break}
                hp -= phb;
                outputCard.body.push(possible.name + " Falls Asleep");
                possible.token.set({
                    "status_KO::2006544": true,
                })
            }
            sleepTarget.token.remove();
            delete ModelArray[targetID];
            PlaySound("Sleep");

            if (level > 0) {
                let slots = parseInt(Attribute(caster.charID,"lvl" + level + "_slots_expended")) || 0;
                slots--;
                outputCard.body.push(level + " Spell Slot Used");
                if (slots === 0) {
                    outputCard.body.push("No More of that Level");
                }
                AttributeSet(caster.charID,"lvl" + level + "_slots_expended",slots);
            }

            PrintCard();






        }





    }









    const SpellAttack = (msg) => {
        let Tag = msg.content.split(";");
        let spellName = Tag[1];
        let spellInfo = SpellInfo[spellName];
        if (spellInfo) {
            spellInfo = DeepCopy(SpellInfo[spellName]);
            spellInfo.info = "Spell";
        } else {
            sendChat("","Need Spell Info");
            return;
        }
        let attID = Tag[2];
        let level = Tag[3];

        let attacker = ModelArray[attID];
        let attPt = new Point(attacker.token.get("left"),attacker.token.get("top"));


        if (spellInfo.cLevel[attacker.casterLevel]) {
            spellInfo.base = spellInfo.cLevel[attacker.casterLevel];
        }
        if (level > spellInfo.level) {
            let delta = level - spellInfo.level - 1;
            spellInfo.base = spellInfo.sLevel[delta];
        }

        let attAdvantage = 0;

        let attPos = ["Invisible"];
        let attNeg = ["Blind","Frightened","Poison","Restrained"];
        let ignore = ["Incapacitated","Paralyzed","Restrained","Stunned","Unconscious"];
        let attMarkers = Markers(attacker.token.get("statusmarkers"));
        //check if next to an enemy token, if so, disadvantage unless is Incapacitated, paralyzed, restrained,stunned,unconsciou
        let ids = Object.keys(ModelArray);
        idLoop1:
        for (let i=0;i<ids.length;i++) {
            let model2 = ModelArray[ids[i]];
            if (model2.displayScheme !== "NPC") {continue};
            let sm = model2.token.get("statusmarkers");
            for (let j=0;j<ignore.length;j++) {
                if (sm.includes(ignore[j])) {continue idLoop1};
            }
            let squares = Distance2(attacker,model2).squares;
            if (squares > 1) {
                continue;
            }
            attAdvantage = -1;
        }
        for (let i=0;i<attPos.length;i++) {
            if (attMarkers.includes(attPos[i])) {
                attAdvantage += 1;
                break;
            }
        }
        for (let i=0;i<attNeg.length;i++) {
            if (attMarkers.includes(attNeg[i])) {
                attAdvantage -= 1;
                break;
            }
        }
        attAdvantage = Math.min(Math.max(-1,attAdvantage),1);
log("Att Adv: " + attAdvantage)

        if (level > 0) {
            let slots = parseInt(Attribute(attacker.charID,"lvl" + level + "_slots_expended")) || 0;
            if (slots === 0) {
                SetupCard(attacker.name,spellName,attacker.displayScheme);
                outputCard.body.push("No Available Spell Slots of level " + level);
                PrintCard();
                return;
            } else {
                slots--;
                if (slots === 0) {
                    outputCard.body.push("No More Level " + level + " Spell Slots");
                }
                AttributeSet(attacker.charID,"lvl" + level + "_slots_expended",slots);
            }
        }

        SetupCard(attacker.name,spellName,attacker.displayScheme);


        if (spellInfo.toHit.includes("Direct")) {
            let defenders = [];
            for (let i=4;i<(Tag.length + 1);i++) {
                let defender = ModelArray[Tag[i]];
                if (!defender) {continue};
                defenders.push(defender);
            }    
            for (let i=0;i<defenders.length;i++) {
                let defender = defenders[i];
                let defPt = new Point(defender.token.get('left'),defender.token.get('top'));
                outputCard.body.push("[B]" + defender.name + "[/b]");
                let distance = Distance2(attacker,defender).distance;
                if (distance > spellInfo.range) {
                    outputCard.body.push("Target is Out of Range");
                    outputCard.body.push("Distance to Target: " + distance);
                    outputCard.body.push("Spell Range: " + spellInfo.range);
                    continue;
                }

                let defAdvantage = 0;
                let defMarkers = Markers(defender.token.get("statusmarkers"));
                let defPos = ["Blind","Paralyzed","Restrained","Stunned","Unconscious"];
                let defNeg = ["Invisible","Dodge"];
                for (let i=0;i<defPos.length;i++) {
                    if (defMarkers.includes(defPos[i])) {
                        defAdvantage = Math.min(defAdvantage +1, 1);
                        break;
                    }
                }
                for (let i=0;i<defNeg.length;i++) {
                    if (defMarkers.includes(defNeg[i])) {
                        defAdvantage = Math.max(defAdvantage -1,-1);
                        break;
                    }
                }
                
                if (defMarkers.includes("Prone")) {
                    if (distance <= 5) {
                        defAdvantage = Math.min(defAdvantage +1, 1);
                    } else {
                        defAdvantage = Math.max(defAdvantage -1,-1);
                    }
                }

                creatTypes = ["Aberration","Celestial","Elemental","Fey","Fiend","Undead"];
                if (defMarkers.includes("Protection") && creatTypes.includes(attacker.type)) {
                    defAdvantage = Math.max(defAdvantage -1,-1);
                }




                defAdvantage = Math.min(Math.max(-1,defAdvantage),1);
log("Def Adv: " + defAdvantage)

                let advantage = attAdvantage + defAdvantage;
                advantage = Math.min(Math.max(-1,advantage),1);
log("Final Adv: " + advantage)

                let result = ToHit(advantage);
                let total = result.roll + attacker.spellAttack;
                let tip;
                let crit = false;
                if ((defMarkers.includes("Paralyzed") || defMarkers.includes("Unconscious")) && distance <= 5) {
                    crit = true;
                }
                if (spellInfo.toHit.includes("Auto")) {
                    result.roll = 21;
                } else {
                    tip = "1d20 + " + attacker.spellAttack + " = " + result.rollText + " + " + attacker.spellAttack;
                    tip = '[' + total + '](#" class="showtip" title="' + tip + ')';
                    line = "Attack: " + tip + " vs. AC " + defender.ac;
                    if (result.roll >= spellInfo.critOn) {
                        crit = true;
                    }
                    outputCard.body.push(line);
                }

                if ((total >= defender.ac || spellInfo.toHit.includes("Auto") || crit === true) && result.roll !== 1) {
                    if (crit === true) {
                        outputCard.body.push("[#ff0000]Crit![/#]");
                    }   
                    let saved = false;
                    if (spellInfo.savingThrow !== "No") {
                        let bonus = defender.saveBonus[spellInfo.savingThrow];
                        let saveRoll = randomInteger(20);
                        let saveTotal = saveRoll + bonus;
                        let saveTip = "1d20 + " + bonus + " = " + saveRoll + " + " + bonus;
                        saveTip = '[' + saveTotal + '](#" class="showtip" title="' + saveTip + ')';
                        let line = "Save: " + saveTip + " vs. DC " + attacker.spellDC;
                        if (saveTotal >= attacker.spellDC) {
                            saved = true;
                        } 
                        outputCard.body.push(line);
                    }

                    let damage = Damage(spellInfo,crit,defender);
                    tip = damage.text + " = [" + damage.rolls.toString() + "]";
                    if (damage.bonus !== 0) {
                        tip += " + " + damage.bonus;
                    }
                    if (damage.note !== "") {
                        tip += "<br>" + damage.note;
                    }

                    let totalDamage = damage.total;
                    let add = "";
                    if (saved === true) {
                        if (spellInfo.saveEffect === "No Damage") {
                            totalDamage = 0;
                            add = " - No Damage"
                        }
                        if (spellInfo.saveEffect === "Half Damage") {
                            totalDamage = Math.round(totalDamage/2);
                            add = " - 1/2 Damage"
                        }
                    }
                    tip = '[' + totalDamage + '](#" class="showtip" title="' + tip + ')';

                    outputCard.body.push("Damage: " + tip + add);
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
                    PlaySound(spellInfo.sound);
                }

        

            }


            if (level > 0) {            
                outputCard.body.push("Level " + level + " Spell Slot Used");
            }
            PrintCard();







        }


        if (spellInfo.toHit = "Cone") {
            let coneTarget = ModelArray[Tag[4]];
            let distance = Distance2(attacker,coneTarget).distance;
            if (distance > spellInfo.range) {
                outputCard.body.push("Target is Out of Range");
                outputCard.body.push("Distance to Target: " + distance);
                outputCard.body.push("Spell Range: " + spellInfo.range);
                PrintCard();
                return;
            }







        }






    }




    const AddAbility = (abilityName,action,charID) => {
        createObj("ability", {
            name: abilityName,
            characterid: charID,
            action: action,
            istokenaction: true,
        })
    }    


    


    const PlaceTarget = (caster,targetCharID,img,w,h) => {
        let newToken = createObj("graphic", {
            left: caster.token.get("left"),
            top: caster.token.get("top"),
            width: w, 
            height: h,  
            name: "",
            pageid: Campaign().get("playerpageid"),
            imgsrc: img,
            layer: "objects",
            represents: targetCharID,
        })
        toFront(newToken);
        let target = new Model(newToken);
        return newToken;
    }


    const Info = (msg) => {
        if (!msg.selected) {return};
        let id = msg.selected[0]._id;
        let model = ModelArray[id];
        if (!model) {
            sendChat("","Not in Array")
        } else {
            sendChat("",model.name);
        }


    }



    const addGraphic = (obj) => {
        log("Add")
        if (!obj.get("name")) {
            let char = getObj("character", obj.get("represents")); 
            if (!char) {return};
            obj.set({
                name: char.get("name")
            })
        }
        let model = new Model(obj);
    }

    const destroyGraphic = (obj) => {
        log("Destroy " + obj.get("name"))
        if (ModelArray[obj.get("id")]) {
            delete ModelArray[obj.get("id")];
        }
    }

    const changePage = () => {
        LoadPage();
        BuildArrays();
        sendChat("","Page Change");
    }



    const handleInput = (msg) => {
        if (msg.type !== "api") {
            return;
        }
        let args = msg.content.split(";");
        log(args);
    
        switch(args[0]) {
            case '!Dump':
                let names = [];
                _.each(ModelArray,model => {
                    names.push(model.name)
                })
                log(names);
                break;
            case '!Smite':
                Smite(msg);
                break;
            case '!ShieldShove':
                ShieldShove(msg);
                break;
            case '!SpellAttack':
                SpellAttack(msg);
                break;
            case '!SetCondition':
                SetCondition(msg);
                break;
            case '!PlaceTarget':
                PlaceTarget(msg);
                break;
            case '!MiscSpell':
                MiscSpell(msg);
                break;
            case '!Spell2':
                Spell2(msg);
                break;
            case '!Attack':
                Attack(msg);
                break;



        }
    };




    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('destroy:graphic',destroyGraphic);
        on('add:graphic',addGraphic);
        on('change:campaign:playerpageid',changePage);


    };
    on('ready', () => {
        log("===> CoS <===");
        log("===> Software Version: " + version + " <===");
        LoadPage();
        BuildArrays();
        registerEventHandlers();
        sendChat("","API Ready")
        log("On Ready Done")
    });
    return {
        // Public interface here
    };






})();


