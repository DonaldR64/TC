const DnD = (() => {
    const version = '2025.12.12';
    if (!state.DnD) {state.DnD = {}};

    //various constants used in game
    let outputCard = {title: "",subtitle: "",side: "",body: [],buttons: [],};

    let ModelArray = {};
    let nameArray = {};

    const pageInfo = {name: "",page: "",gridType: "",scale: 0,width: 0,height: 0};

    const playerCodes = {
        "-OdzmtPMDNNfcmdvIN5m": "Ted",
        "all": "Allied",
        "-OdyHPJkwRBH1F9Zn5AU": "Ian",
        "-OeTGX5FY4C70LTFBna4": "Vic",
    };

    let PCs = {
        //will put default tokenID attached to playerID here
        "-OdzmtPMDNNfcmdvIN5m": "",
        "-OdyHPJkwRBH1F9Zn5AU": "",
        "-OeTGX5FY4C70LTFBna4": "",
    }

    const playerColours = {
        "-OdzmtPMDNNfcmdvIN5m": "#ffd700",
        "-OdyHPJkwRBH1F9Zn5AU": "#228C22",
        "-OeTGX5FY4C70LTFBna4": "#00ffff",
        "all": "#ff0000"
    };

    const Factions = {
        "NPC": {
            "backgroundColour": "#000000",
            "titlefont": "Arial",
            "fontColour": "#ffffff",
            "borderColour": "#000000",
            "borderStyle": "5px ridge",
        },
        "Red": {
            "backgroundColour": "#ff0000",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#ff0000",
            "borderStyle": "5px groove",
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
            "borderColour": "#ff00ff",
            "borderStyle": "5px inset",
        },
        "Vic": {
            "backgroundColour": "#00ffff",
            "titlefont": "Merriweather",
            "fontColour": "#000000",
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

    const Markers = {
        //conditions
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
        "Restrained": "Cage::1431882",
        "Stunned": "Stunned::2006499",
        "Unconscious": "sleepy",
        "Dodge": "half-haze",
        "Disadvantage": "Minus::2006420",
        "Advantage": "Plus::2006398",
        //spells and abilities
        "Protection from Evil and Good": "Good_Evil::1432039",
        "Bless": "Effect_Blessed::1431919",
        "Divine Favour": "Slimed-Mustard-Transparent::2006560",
        "Sacred Weapon": "Torch-Light::2006651",
        "Sanctuary": "Unknown-or-Mystery-2::2006534",
        "Mage Armour": "418-MA-Buff::5818082",
        "Slow": "Slow::2006498",
        "Ray of Frost": "Cold::2006476",
        "Shield of Faith": "Shield::2006495",
        "Faerie Fire": "Effect_Faerie_Glow::1431945",
        "Web": "Effect_Web_Spider_Climb::1432012",
        "Entangle": "Effect_Entangled_Vine_Grow::1431943",
        "Hold Person": "Effect_Control_Hypno::1431929",
        "Sleep": "KO::2006544",
        "Barkskin": "Effect_Nature_Leaf::1431993",
        "Heat Metal": "Effect_Heat::1431954",
        "Magic Weapon": "Sword::7585199",
        "Heroism": "Effect_Hero_Banner_Rally::1431958",
        "Searing Smite": "400-Bordeaux::5818060",
        "Thunderous Smite": "600-kakadoi::5818087",
        "Wrathful Smite": "700-Grey::5818092",




    }

    const Incapacitated = ["Paralyzed","Stunned","Unconscious","Incapacitated","Sleep","Hold Person"];
    const Restrained = ["Restrained","Web","Entangle"];








    //Classes

    class Point {
        constructor(x,y) {
            this.x = x;
            this.y = y;
        };
        distance(b) {
            return Math.sqrt(((this.x - b.x) * (this.x - b.x)) + ((this.y - b.y) * (this.y - b.y)));
        }
        toLabel() {
            let s = this.toSquare();
            return (s.x + "/" + s.y);
        }
        toSquare() {
            let x = Math.round((this.x - 35)/70);
            let y = Math.round((this.y - 35)/70);  
            let sq = new Square(x,y);      
            return sq;
        }
    }

    class Square {
        constructor(x,y) {
            this.x = x;
            this.y = y;
        };
        toPoint() {
            let x = this.x * 70 + 35;
            let y = this.y * 70 + 35;
            return new Point(x,y);
        }
        toLabel() {
            return (this.x + "/" + this.y);
        }
        distance(b) {
            let dX = Math.abs(b.x - this.x);
            let dY = Math.abs(b.y - this.y);
            return Math.max(dX,dY);
        }
    }

    class Model {
        constructor(token) {
            let char = getObj("character", token.get("represents")); 
            this.token = token;
            this.id = token.get("id");
            this.name = token.get("name");
            let aa = AttributeArray(char.id);
    
            this.charID = char.id;
            this.type = (aa.npc_type || " ").toLowerCase();
            this.class = aa.class || " ";

            this.immunities = (aa.npc_immunities || " ").toLowerCase();
            this.conditionImmunities = (aa.npc_condition_immunities || " ").toLowerCase();
            this.resistances = (aa.npc_resistances || " ").toLowerCase();
            this.vulnerabilities = (aa.npc_vulnerabilities || " ").toLowerCase();

            this.npc = (aa.charactersheet_type === "npc") ? true:false;
            this.sheetType = "NPC";
            this.displayScheme = "NPC";

            this.ac = (this.npc === false) ? (parseInt(aa.ac) || 10):(parseInt(aa.npc_ac) || 10); //here as wildshapes are coming up as NPCs

            this.class = (aa.class || " ").toLowerCase();
            this.race = (aa.race || " ").toLowerCase();

            this.layer = token.get("layer");

            let control = char.get("controlledby");
            let inParty = char.get("inParty")
            this.inParty = inParty;
            if (inParty === true) {
                if (control) {
                    this.displayScheme = playerCodes[control.split(",")[0]];
                    this.npc = false;
                    this.sheetType = "PC";
                } else {
                    this.displayScheme = "Allied";
                }
            }
            if (this.name.includes("Haevan")) {
                PCs["-OdyHPJkwRBH1F9Zn5AU"] = this.id;
            }
            if (this.name.includes("Wirsten")) {
                PCs["-OdzmtPMDNNfcmdvIN5m"] = this.id;
            }
            if (this.name.includes("Eivirin")) {
                PCs["-OeTGX5FY4C70LTFBna4"] = this.id;
            }

            this.initBonus = parseInt(aa.initiative_bonus) || 0;

            let dim = Math.max(token.get("width"),token.get("height"));
            dim = Math.round(dim/70);
            this.size = dim;

            let skillNames = ["acrobatics","athletics","animal handling","deception","history","insight","intimidation","investigation","medicine","nature","perception","performance","persuasion","religion","sleight of hand","stealth","survival"];

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
        
            this.spells = this.Spells(aa);
            this.weapons = this.Weapons(aa);

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
            if (this.sheetType === "NPC") {
                this.pb = parseInt(aa.npc_pb) || 0;
            }

            this.special = aa.special || " ";

            this.token.set({
                showname: true,
                showplayers_name: true,
                showplayers_bar1:true,
                showplayers_aura1: true,
                playersedit_bar1: true,
                bar_location: 'overlap_bottom',
                compact_bar: 'compact',
            })

            ModelArray[token.id] = this;

        }

        Distance (model2) {
            let dist = Infinity;
            let squares1 = this.Squares();
            let squares2 = model2.Squares();
            _.each(squares1,square1 => {
                _.each(squares2, square2 => {
                    dist = Math.min(square1.distance(square2),dist);
                })
            })
            return dist;
        }

        Destroy () {
            let token = this.token;
            if (token) {
                token.remove();
            }
            if (this.isSpell) {
                //removes an ongoing spell in combat
                let spellID = state.DnD.spellList.filter((e) => {
                    e.spellName === this.name && e.casterID === this.isSpell
                })[0];
                if (spellID) {EndSpell(spellID)};
            }
            delete ModelArray[this.id];
        }

        Point () {
            let pt = new Point(this.token.get("left"),this.token.get("top"))
            return pt;
        }

        Squares() {
            let squares = [];
            let pt = this.Point();
            let w = this.token.get("width");
            let h = this.token.get("height");
            if (w === 70 && h === 70) {
                squares.push(pt.toSquare());
            } else {
                //define corners, pull in to be centres
                let tL = new Point(pt.x - w/2 + 35,pt.y - h/2 + 35);
                let bR = new Point(pt.x + w/2 - 35,pt.y + h/2 - 35);
                for (let x = tL.x;x<= bR.x;x += 70) {
                    for (let y = tL.y;y <= bR.y; y += 70) {
                        let pt2 = new Point(x,y);
                        let sq = pt2.toSquare();
                        squares.push(sq);
                    }
                }
            }
            return squares;
        }

        Spells(aa) {
            let spells = {};
            let keys = Object.keys(aa);
            let levels = ["cantrip",1,2,3,4,5,6,7];
            _.each(keys,key => {
                _.each(levels,level => {
                    if (key.includes("repeating_spell-" + level) && key.includes("spellname") && key.includes("spellname_max") === false) {
                        let name = aa[key].trim();
                        if (name) {
                            let prepkey = key.replace("spellname","spellprepared");
                            let desckey = key.replace("spellname","spelldescription");
                            let ritualkey = key.replace("spellname","spellritual");
                            let ritual = aa[ritualkey] === "Yes" || aa[ritualkey] === "{{ritual=1}}" ? true:false;                
            
                            let info = {
                                name: name,
                                prepared: prepkey,
                                desckey: desckey,
                                ritual: ritual,
                            }
                            if (spells[level]) {
                                spells[level].push(info);
                            } else {
                                spells[level] = [info];
                            }
                        }
                    }
                })
            })
            _.each(levels,level => {
                if (spells[level] && spells[level].length > 0) {
                    spells[level].sort((a, b) => a.name.localeCompare(b.name));
                }
            })
            return spells
        }

        Weapons(aa) {
            let weapons = [];
            let keys = Object.keys(aa);
            _.each(keys,key => {
                if (key.includes("itemmodifiers")) {
                    if (aa[key].includes("Weapon")) {
                        let key2 = key.replace("itemmodifiers","itemname")
                        let weaponName = aa[key2].trim();
                        if (weaponName) {
                            weapons.push(weaponName);
                        }
                    }
                }
            })
            return weapons;
        }

        Markers() {
            let statusmarkers = this.token.get("statusmarkers");
            statusmarkers = statusmarkers.split(",");
            let markers = [];
            _.each(statusmarkers,marker => {
                let m = getKeyByValue(Markers,marker);
                if (m) {
                    markers.push(m);
                }
            })
            return markers;
        }





    }












    //Functions

    const findCommon = (array1,array2) => {
        let set2 = new Set(array2);
        let common = array1.filter(item => set2.has(item));
        return common;
    }


    const getKeyByValue = (object, value) => {
        return Object.keys(object).find(key => object[key] === value);
    };

    const stringGen = () => {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 6; i++) {
            text += possible.charAt(Math.floor(randomInteger(possible.length)));
        }
        return text;
    };


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


    const Line = (start,end) => {
        //return points between start and end points
        //translate points to squares
        let p0 = start;
        let p1 = end;
        let squares = [];
        let labels = [];
        let N = diagonal_distance(p0,p1);
        for (let step = 0; step <= N; step++) {
            let t = (N=== 0) ? 0.0 : (step/N);
            let pt = round_point(lerp_point(p0,p1,t));
            let square = pt.toSquare();
            let label = square.toLabel();
            if (labels.includes(label)) {continue};//stop duplicates
            labels.push(label);
            squares.push(square);
        }
        return squares;
    }

    const diagonal_distance = (p0,p1) => {
        let dx = p1.x - p0.x, dy = p1.y - p0.y;
        let dist = Math.max(Math.abs(dx), Math.abs(dy));
        return Math.round(dist/35);
    }

    const round_point = (p) => {
        return new Point(Math.round(p.x), Math.round(p.y));
    }

    const lerp_point = (p0,p1,t) => {
        return new Point(lerp(p0.x, p1.x, t),
                        lerp(p0.y, p1.y, t));
    }

    const lerp = (start, end, t) => {
        return start * (1.0 - t) + t * end;
    }

    const EndLine = (p0,p1,length) => {
        //produces a line representing end of Cone of length x, using a start point (caster) and end pt (target)
        let sqL = Math.round(((length/pageInfo.scaleNum) - 1)/2);
        let raDist = sqL * 70;
        let angDist = sqL * 100; //larger than 70 to account for odd behaviour of 5e on angles
        let p2,p3;
        if ((p1.x - p0.x) === 0) {  
            //line 2 is horizontal
            p2 = new Point(p1.x - raDist,p1.y);
            p3 = new Point(p1.x + raDist,p1.y);
        } else if ((p1.y - p0.y) === 0) {
            //line2 is vertical
            p2 = new Point(p1.x,p1.y - raDist);
            p3 = new Point(p1.x,p1.y + raDist);
        } else {
            let m0 = (p1.y - p0.y)/(p1.x - p0.x);
            let m1 = -1/m0;
            let b1 = p1.y - (m1 * p1.x);
            p2 = findPointOnLine(p1,m1,b1,angDist,1);
            p3 = findPointOnLine(p1,m1,b1,angDist,-1);
        }

        let line = Line(p2,p3);
        return line;
    }

    const findPointOnLine = (point,m,b,distance,direction) => {
        let magnitude = Math.sqrt(1+m*m);
        let deltaX = direction * (distance / magnitude);
        let deltaY = direction * (m * distance / magnitude);
        let pt = new Point(point.x + deltaX,point.y + deltaY);
        return pt;
    }

    const Venn = (array1,array2) => {
        //for comparing arrays of squares
        //true if any of array2 are in array
        let a1 = array1.map((e) => e.toLabel());
        let a2 = array2.map((e) => e.toLabel());
        let venn = a2.some(r=> a1.includes(r))
        return venn;
    }



    const AOETargets = (target) => {
        let temp = [];
        _.each(ModelArray,model => {
            if (model.id === target.id || model.layer === "map") {return}
            if (Venn(target.Squares(),model.Squares()) === true) {
                temp.push(model.id);
            }
        })
        temp = [...new Set(temp)];
        let array = [];
        _.each(temp,id => {
            let model = ModelArray[id];
log(model.name + ": " + id)
            array.push(model);
        })
        return array;
    }


    const Cone = (caster,target,length) => {
        let startTime = Date.now();

        let start = caster.Point();
        let startSquare = start.toSquare();
        let end = target.Point();
        //length is in feet
        let sqL = length / pageInfo.scaleNum;
        let midLine = Line(start,end)
        let endLine = EndLine(start,end,length);
        //from start, draw lines to each point on endLine and add in the squares
        let array = {};
        let labels = [];
        for (let i=0;i<endLine.length;i++) {
            let line = Line(start,endLine[i].toPoint());
            for (j=0;j<line.length;j++) {
                let square = line[j];
                let label = square.toLabel();
                if (labels.includes(label)) {continue}
                if (square.x === startSquare.x && square.y === startSquare.y) {continue};
                let dist1 = startSquare.distance(square);
                if (dist1 > sqL) {continue};
                let dist2 = square.distance(midLine[dist1]);
                let info = {
                    square: square,
                    midDist: dist2,
                }
                if (array[dist1]) {
                    array[dist1].push(info);
                } else {
                    array[dist1] = [info];
                }
                labels.push(label); //prevent duplicates    
            }
        }

        _.each(array,line => {
            line.sort((a,b) => a.midDist - b.midDist);
        })

        //will be an array of objects based on distance from caster 1st and distance from midline 2nd
        //thin to 1 at d 1, 2 at d2 etc, and start with those closest to midline
        //skip if no creature so maximize targets caught
        //minimize ModelArray based on distance from caster
        let possibles = [];
        _.each(ModelArray,model => {
            if (model.id === caster.id || model.id === target.id || model.layer === "map") {return}
            if (model.Distance(caster) > sqL) {return}
            possibles.push(model)
        })

        let finalArray = [];
        let ids = [];
        let keys = Object.keys(array);
        loop1:
        for (let i=0;i<keys.length;i++) {
            let line = array[keys[i]];    
            let counter = 0;
            for (let j=0;j<line.length;j++) {
                let square = line[j].square;
                for (let k=0;k<possibles.length;k++) {
                    let model = possibles[k];
                    if (ids.includes(model.id)) {continue};
                    let squares = model.Squares();
                    if (Venn(squares,[square])) {
                        finalArray.push(model);
                        counter++;
                        ids.push(model.id); //each model 'caught' hit once
                        if (counter > i) {
                            continue loop1; //1 at distance 1, 2 at 2, etc
                        }
                        break;
                    }
                }
            }
        }
        return finalArray;
    }



    const ButtonInfo = (phrase,action,inline,level) => {
        //inline - has to be true in any buttons to have them in same line -  starting one to ending one
        if (!inline) {inline = false};
        if (!level) {level = false};
        let info = {
            phrase: phrase,
            action: action,
            inline: inline,
            level: level,
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
//log(i)
//log(line)
            if (!line || line === "") {continue};
            if (line.includes("[FORMATTED]")) {
                line = line.replace("[FORMATTED]","");
                out += line;
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
//log(output)
        sendChat("",output);
        outputCard = {title: "",subtitle: "",side: "",body: [],buttons: [],};
    }

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

    const Capit = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const LoadPage = () => {
        //build Page Info
        pageInfo.id = Campaign().get('playerpageid');
        pageInfo.page = getObj('page', Campaign().get("playerpageid"));
        pageInfo.name = pageInfo.page.get("name");
        pageInfo.scale = pageInfo.page.get("snapping_increment");
        pageInfo.width = pageInfo.page.get("width");
        pageInfo.height = pageInfo.page.get("height");
        pageInfo.scaleNum = pageInfo.page.get("scale_number");

        let pObjs = findObjs({type: "player"});
        _.each(pObjs,pObj => {
            let c = playerColours[pObj.id];
            if (c) {
                pObj.set("color",c);
            }
        })
    };


    //an array of the PCs and any other tokens on page
    //will need to rebuild on page change
    const BuildArrays = () => {
        ModelArray = {};
        nameArray = {};
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
            if (SpellInfo[model.name]) {
                let spellID = token.get("gmnotes").toString();
                let spell = state.DnD.spellList.find((e) => e.spellID === spellID);
                model.isSpell = spell.casterID;
            }   
        });
    }


    const AddAbility = (abilityName,action,charID) => {
        let ability = createObj("ability", {
            name: abilityName,
            characterid: charID,
            action: action,
            istokenaction: true,
        })
        return ability.get("id");
    }    

    const InlineButtons = (array) => {
        let output = "[FORMATTED]";
        for (let i=0;i<array.length;i++) {
            let info = array[i];
            let inline = true;
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
            
            if (inline === false || i === (array.length - 1)) {
                out += `</div></span></div></div>`;
            }
            output += out;
        }
        return output;
    }






    const PlaySound = (name) => {
        let sound = findObjs({type: "jukeboxtrack", title: name})[0];
        if (sound) {
            sound.set({playing: true,softstop:false});
        }
    };

    const FX = (fxname,model1,model2) => {
        //model2 is target, model1 is shooter
        //if its an area effect, model1 isnt used
        if (!fxname) {return};
        let pt1 = new Point(model1.token.get("left"),model1.token.get("top"))
        let pt2 =  new Point(model2.token.get("left"),model2.token.get("top"))

        if (fxname.includes("Custom")) {
            fxname = fxname.replace("Custom-","");
            let fxType =  findObjs({type: "custfx", name: fxname})[0];
            if (fxType) {
                spawnFxBetweenPoints(new Point(model1.token.get("left"),model1.token.get("top")), new Point(model2.token.get("left"),model2.token.get("top")), fxType.id);
            }
        } else {
            let directed = ["breath","beam","missile","rocket"];
            let points = directed.some(element => fxname.includes(element));
            if (points === true) {
                spawnFxBetweenPoints(new Point(model1.token.get("left"),model1.token.get("top")), new Point(model2.token.get("left"),model2.token.get("top")), fxname);
            } else {
                spawnFx(model2.token.get("left"),model2.token.get("top"), fxname);
            }
        }
    }

    const ClearState = () => {
        state.DnD = {
            combatTurn: 0,
            conSpell: {},
            regSpells: {},
            spellList: [],
            areaSpell: "",
            moveID: "",
            lastMoved: "",
        }
        nameArray = {};
    }

    const RollDamage = (damageInfo,critical = false) => {
        damageInfo = damageInfo.split(",");
        base = damageInfo[0].trim();
        damageType = damageInfo[1].trim();
log("Roll Damage")
log(damageInfo)
        base = base.split("+");
        let comp = [];
        _.each(base,e => {
            e = e.split("d");
            let n = parseInt(e[0]) || 0;
            let t; //dice type eg. d8 -> 8
            let dtype = "N";
            if (e[1]) {
                t = parseInt(e[1]);
                dtype = e[1].replace(/[^a-zA-Z]+/g, '');
            } else {
                t = 0;
            }
            info = {
                num: n,
                type: t,
                dtype: dtype,
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
                if (critical === true) {
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
        let s = (rolls.length === 1) ? "":"s";
        let bonusText = (bonus < 0) ? bonus:(bonus > 0) ? "+" + bonus:"";
        let results = "Roll" + s + ": [" + rolls.toString().replace(/,/g,"+") + "]" + bonusText + "<br>[";
        for (let i=0;i<text.length;i++) {
            if (i > 0) {results += "+"};
            results += text[i];
        }
        results += bonusText + " ]"

        let result = {
            diceText: results,
            total: total,
            damageType: damageType,
        }

        return result;
    }

    const ApplyDamage = (rollResults,dc,defender,damageInfo) => {
        if (!damageInfo) {damageInfo = {}};
log(damageInfo)
        let total = rollResults.total;
        let damageType = rollResults.damageType;
        let savingThrow = damageInfo.savingThrow;
        let saveEffect = damageInfo.saveEffect;
        let magic = damageInfo.magic === "magic" ? true:false;
        let silver = damageInfo.magic === "silver" ? true:false;
        let immune = false;
        let resistant = false;
        let irv = "";
        let saveTip = "";

        let weaponTypes = ["piercing","slashing","bludgeoning"]
log(defender.immunities)
log(defender.resistances)
log(defender.vulnerabilities)
        //Immunities
        if (defender.immunities.includes(damageType)) {
            if (weaponTypes.includes(damageType)) {
                if (defender.immunities.includes("nonmagical") && defender.immunities.includes("silver") === false && magic === false) {
                    immune = true;
                    saveTip = "Immune to " + Capit(damageType) + " Damage from Non-magical Weapons";
                }
                if (defender.immunities.includes("silver") && magic === false && silver === false) {
                    immune = true;
                    saveTip = "Immune to " + Capit(damageType) + " Damage from Non-magical, Non-Silvered Weapons";
                }
                if (defender.immunities.includes("nonmagical") === false && defender.immunities.includes("silver") === false) {
                    immune = true;
                    saveTip = "Immune to " + Capit(damageType) + " Damage";
                }
            } else {
                immune = true;
                saveTip = "Immune to " + Capit(damageType) + " Damage";
            }
        }
        //Resistances
        if (immune === false && defender.resistances.includes(damageType)) {
            if (weaponTypes.includes(damageType)) {
                if (defender.resistances.includes("nonmagical") && defender.resistances.includes("silver") === false && magic === false) {
                    resistant = true;
                    saveTip = "Resistant to " + Capit(damageType) + " Damage from Non-magical Weapons";
                }
                if (defender.resistances.includes("silver") && magic === false && silver === false) {
                    resistant = true;
                    saveTip = "Resistant to " + Capit(damageType) + " Damage from Non-magical, Non-Silvered Weapons";
                }
                if (defender.resistances.includes("nonmagical") === false && defender.resistances.includes("silver") === false) {
                    resistant = true;
                    saveTip = "Immune to " + Capit(damageType) + " Damage";
                }
            } else {
                resistant = true;
                saveTip = "Resistant to " + Capit(damageType) + " Damage";
            }
        }
        if (immune == true) {
            total = 0
            irv = " [#00ff00][Immune][/#]";        
        }
        if (resistant === true) {
            total = Math.round(total/2)
            irv = " [#00ff00][Resistant][/#]";
        }
        //Vulnerabilities
        if (immune === false && resistant === false && defender.vulnerabilities.includes(damageType)) {
            total *= 2;
            saveTip = "Vulnerable to " +  Capit(damageType);
            irv = " [#ff0000][Vulnerable][/#]";
        }

        //other Damage Reduction Here


        //advantage/disadvantage due to special considerations
        let adv = 0;
        if (damageInfo.name === "Moonbeam" && defender.type.includes("shapechanger")) {
            adv = -1;
            saveTip = "Disadvantage to Save";
            irv = " [#ff0000][Disadvantage][/#]";
        }

        //Saving Throws
        let save;
        if (savingThrow && savingThrow !== "No" && immune === false && savingThrow !== "auto") {
            let result = Save(defender,dc,savingThrow,adv); //save, saveTotal, tip
            if (saveTip !== "") {saveTip += "<br>"}
            if (result.save === true) {
                save = "Saves: ";
                saveTip += "Saves";
                if (saveEffect === "No Damage") {
                    saveTip += " and takes No Damage";
                    total = 0;
                }
                if (saveEffect === "Half Damage") {
                    saveTip += " and takes 1/2 Damage";
                    total = Math.round(total/2);
                }
                if (saveEffect === 'Special') {
                    save = "Saves " + damageInfo.saveText;
                }


                saveTip += "<br>" + result.tip
            } else {
                saveTip = "Fails<br>" + result.tip;
                save = "Fails:";
                if (saveEffect === 'Special') {
                    save = "Fails " +  damageInfo.failText; 
                }
            }
        }

        let result = {
            total: total,
            irv: irv,
            saveTip: saveTip,
            save: save,
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
        let marker = Marker[condition];
        let status = Tag[2];
        if (!marker) {
            return;
        }
        if (status === "On") {
            model.token.set("status_" + marker,true);
        } else if (status === "Off") {
            model.token.set("status_" + marker,false);
        } else if (status === "Clear") {
            model.token.set("statusmarkers","");
        }
        
    }






    const TokenInfo = (msg) => {
        let id = msg.selected[0]._id;
        let model = ModelArray[id];
        if (!id || !model) {return}
        let token = model.token;
        SetupCard(model.name,"","NPC");
        let pt = new Point(token.get("left"),token.get("left"));
        let squares = model.Squares();
        outputCard.body.push("Point: " + pt.x + "/" + pt.y)
        _.each(squares,square => {
            outputCard.body.push("Square: " + square.x + "/" + square.y)
        })
        let char = getObj("character", token.get("represents"));    
        let markers = model.Markers();
        outputCard.body.push(markers.toString());
        if (markers.includes("Web")) {
            outputCard.body.push("Has Web");
        }

log(token.get("statusmarkers"))
log(PCs)
log(state.DnD.spells)


        PrintCard();

    }

    const Save = (model,dc,stat,adv = 0) => {
        let saved = false;
        adv = (adv > 0) ? true:false;
        disadv = (adv < 0) ? true:false;
        let fail = false; //auto fail

        let advReasons = [];
        let disAdvReasons = [];
        let failReason = "";
        let bonus = model.saveBonus[stat];
        let otherBonus = 0;
        let saveTotal,saveTip,bonusText, otherBonusText;

        let markers = model.Markers();

        let incapacitated = (findCommon(markers,Incapacitated).length > 0) ? true:false;
        let restrained = (findCommon(markers,Restrained).length > 0) ? true:false;


        if ((stat === "strength" || stat === "dexterity") && incapacitated === true) {
            fail = true;
            failReason = "Incapacitated";
        }

        if (markers.includes("Bless")) {
            otherBonus = randomInteger(4);
            otherBonusText = "Including " + otherBonus + " [Bless d4]";
        }
        bonus += otherBonus;

        if (markers.includes("Dodge") && stat === "dexterity") {
            adv = true;
            advReasons.push("Dodge");
        }
        if (stat === "dexterity" && restrained === true) {
            disadv = true;
            disAdvReasons.push("Restrained");
        }

        let finalAdv = 0;
        if (adv === true && disadv === false) {finalAdv = 1};
        if (adv === true && disadv === true) {finalAdv = 0};
        if (adv === false && disadv === true) {finalAdv = -1};
        let saveRollResult = D20(finalAdv);
        
        if (dc === false) {
            //display result in chat immediately
            if (fail === true) {
                outputCard.body.push("[#ff0000]Automatic Failure[/#]");
                outputCard.body.push("Due to being " + failReason);
            } else {
                OutputRoll(saveRollResult,bonus);
                outputCard.body.push(otherBonusText);
                if (advReasons.length > 0) {
                    outputCard.body.push("[" + advReasons.toString() + "]");
                }
                if (disAdvReasons.length > 0) {
                    outputCard.body.push("[" + disAdvReasons.toString() + "]");
                }
            }
        } else {
            if (bonus >= 0) {bonusText = " + " + bonus + " Bonus"} else {bonusText = " - " + Math.abs(bonus) + " Bonus"};
            saveTotal = saveRollResult.roll + bonus;
            saveTip = "<br>Roll: " + saveRollResult.roll + bonusText;
            saveTip += "<br>" + saveRollResult.rollText
            if (otherBonusText) {saveTip += "<br>" + otherBonusText};
            if (advReasons.length > 0) {
                saveTip += "<br>" + advReasons.toString();
            }
            if (disAdvReasons.length > 0) {
                saveTip += "<br>" + disAdvReasons.toString();
            }
            if ((saveTotal >= dc || saveRollResult.roll === 20) && saveRollResult.roll !== 1) {
                saved = true;
            } 
            saveTip = "Save: " + saveTotal + " vs. DC " + dc + saveTip;
            if (fail === true) {
                saved = false,
                saveTip = "Automatically Failed Save due to " + failReason;
            }
        }

        let result = {
            save: saved,
            saveTotal:saveTotal,
            tip: saveTip,
        }
        return result;
    }

    const SavingThrow = (msg) => {
        let id;
        if (!msg.selected) {
            if (msg.playerid) {
                id = PCs[msg.playerid];
            } else {
                sendChat("","Select a Token");
                return;
            }
        } else {
            id = msg.selected[0]._id;
        }
        let model = ModelArray[id];
        if (!model) {return};
        let Tag = msg.content.split(";");
        let advantage = (Tag[1] === "Advantage") ? 1: (Tag[1] === "Disadvantage") ? -1:0;
        let stat = Tag[2];
        let statTLC = stat.toLowerCase();

        SetupCard(model.name,stat,model.displayScheme);

        Save(model,false,statTLC,advantage);

        if (model.name.includes("Wirsten") && statTLC === "dexterity") {
            let inc = findCommon(model.Markers(),Incapacitated);
            if (inc.length === 0) {
                outputCard.body.push("[hr]");
                outputCard.body.push("Shield Master: You can add 2 to your Result if the Spell/Harmful Effect targets only you");
                outputCard.body.push("If you save and would take 1/2 Damage, you can use your Reaction to take No Damage, interposing your Shield");
            }
        }

        PlaySound("Dice");

        PrintCard();

    }

    const Initiative = (msg) => {
        let id;
        if (!msg.selected) {
            if (msg.playerid) {
                id = PCs[msg.playerid];
            } else {
                sendChat("","Select a Token");
                return;
            }
        } else {
            id = msg.selected[0]._id;
        }
        let model = ModelArray[id];
        if (!model) {return};
        SetupCard(model.name,"Initiative",model.displayScheme);
        let bonus = model.initBonus + (model.initBonus/10);
        //later add in advantage/disadvantage for initiative here
        let advantage = 0;
        let roll = D20(advantage);
        let total = OutputRoll(roll,bonus);

        PrintCard();

        if (Campaign().get("turnorder") == "") {
            turnorder = [];
        } else {
            turnorder = JSON.parse(Campaign().get("turnorder"));
        }

        //replace result if already in turnorder, else add to turnorder
        let item = turnorder.filter(item => item.id === id)[0];

        if (!item) {
            turnorder.push({
                _pageid:    model.token.get("_pageid"),
                id:         id,
                pr:         total,
            });
        } else {
            item.pr = total;
        }
        turnorder.sort((a,b) => b.pr - a.pr);
        Campaign().set("turnorder", JSON.stringify(turnorder));
        PlaySound("Dice")
        Campaign().set("initiativepage",true);
    }


    

    const Check = (msg) => {
        let id;
        if (!msg.selected) {
            if (msg.playerid) {
                id = PCs[msg.playerid];
            } else {
                sendChat("","Select a Token");
                return;
            }
        } else {
            id = msg.selected[0]._id;
        }
        let model = ModelArray[id];
        if (!model) {return};
        let Tag = msg.content.split(";");
        let advantage = (Tag[1] === "Advantage") ? 1: (Tag[1] === "Disadvantage") ? -1:0;
        let text = Tag[2];
        let skill = text.toLowerCase();
        skill = skill.replace(/ /g,"_");
        SetupCard(model.name,text,model.displayScheme);
        let stats = ["strength","dexterity","constitution","intelligence","wisdom","charisma"];
        let bonus;
        if (stats.includes(skill)) {
            bonus = model.statBonus[skill];
        } else {
            bonus = model.skills[skill];
        }
        let result = D20(advantage);
        OutputRoll(result,bonus);
        PlaySound("Dice")
        PrintCard();
    }

    const ReloadTokens = (msg) => {
        let ids = [];
        _.each(msg.selected,s => {
            ids.push(s._id);
        })
        _.each(ids,id => {
            let token = findObjs({_type:"graphic", id: id})[0];
            if (token) {
                let m = new Model(token);
            }
        })
        sendChat("","/w GM Reloaded")
    }

    let D20 = (advantage) => {
        let roll1 = randomInteger(20);
        let roll2 = randomInteger(20);
        let addText,roll,s = "s"
        if (advantage > 0) {
            roll = Math.max(roll1,roll2);
            addText = " [Advantage]";
        } else if (advantage < 0) {
            roll = Math.min(roll1,roll2);
            addText = " [Disadvantage]";
        } else {
            roll = roll1;
            s = "";
        }
        let altRoll = (roll === roll1) ? roll2:roll1;
        let text = "Roll" +s + ": " + roll;
        if (advantage !== 0) {
            text += "/" + altRoll + addText; 
        }
        let result = {
            roll: roll,
            rollText: text,
        }
        return result;
    }
    
    let OutputRoll = (result,bonus) => {
        //used to output Save Roll, Check Roll, Initiative Roll etc
        //if needed, returns the total
        let c1 = "",c2 = "";
        if (result.roll === 20) {
            c1 = "[#008000]";
            c2 = "[/#]";
        }
        if (result.roll === 1) {
            c1 = "[#ff0000]";
            c2 = "[/#]";
        }
        let rollTotal = Math.max(result.roll + bonus,1);
        let bonusText;
        if (bonus >= 0) {bonusText = " + " + bonus + " Bonus"} else {bonusText = " - " + Math.abs(bonus) + " Bonus"};
        outputCard.body.push("[B]" + c1 + "Result: " + rollTotal + "[/b]" + c2);
        outputCard.body.push(result.rollText + bonusText);
        return rollTotal;
    }

    const Attack = (msg) => {
        let Tag = msg.content.split(";");
        let attID = Tag[1];
        let defID = Tag[2];
        let weaponName = Tag[3];
        let extra = Tag[4] || "Non-Magic";

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

        let attMarkers = attacker.Markers();
        let defMarkers = defender.Markers();

        let weapon = WeaponInfo[weaponName];
        if (weapon) {
            weapon = DeepCopy(WeaponInfo[weaponName]);
        } else {
            errorMsg.push("Weapon not in Array");
            weapon = {range: 1000,type: " ",properties: " "};
        }
        weapon.info = extra;
        //set some defaults
        if (!weapon.critOn) {weapon.critOn = 20};
        if (!weapon.range) {weapon.range = [0,0]};
        if (!weapon.properties) {weapon.properties = " "};
        weapon.magic = " ";

        let inReach = false;

        let squares = attacker.Distance(defender);
        let distance = squares * pageInfo.scaleNum;

        if (squares === 1) {
            inReach = true;
        }
        if (weapon.properties.includes("Reach") && squares <= 2) {
            inReach = true;
        }
        if (inReach !== true && weapon.type.includes("Ranged") === false) {
            errorMsg.push("Target not in Reach");
        } 

        let statBonus = attacker.statBonus["strength"];
        if (inReach === false && weapon.properties.includes("Thrown") === false) {
            statBonus = attacker.statBonus["dexterity"];
        }
        if (weapon.properties.includes("Finesse")) {
            statBonus = Math.max(attacker.statBonus["strength"],attacker.statBonus["dexterity"]);
        }
        if (weapon.properties.includes("Spell")) {
            statBonus = 0;
            weapon.magic = "magic";
            if (weapon === "Flame Blade") {
                let spellID = state.DnD.conSpell[attID];
                let spell = state.DnD.spellList.find((e) => e.spellID = spellID);
                if (!spell) {
                    errorMsg.push("Flame Blade isn't active");
                } else {
                    let d = Math.floor((spell.castLevel - 2)/2) + 3;
                    weapon.base = d + "d6";
                }
            }
        }

        if (distance > weapon.range[1] && weapon.type.includes("Ranged")) {
            errorMsg.push("Target is Out of Max Range");
        }

        if (errorMsg.length > 0) {
            _.each(errorMsg,msg => {
                sendChat("",msg);
            })
            return;
        }
        //damage bonuses, add into weaponInfo.base for Damage routine
        //stat
        if (weapon.type.includes("Melee") || weapon.properties.includes("Thrown")) {
            weapon.base += "+" + statBonus;
        }
        //abilities
        if (attacker.name === "Wirsten" && inReach === true) {
            weapon.base += "+2"; //Duellist
        }

        //attack bonuses
        attackBonus = statBonus + attacker.pb;

        //other mods to attack bonus
        let additionalText = "";
        if (attMarkers.includes("Bless")) {
            bless = randomInteger(4);
            additionalText += "<br>inc +" + bless + " Bless";
            attackBonus += bless;
        }
        if (attMarkers.includes("Sacred Weapon") && weapon.type === "Melee") {
            attackBonus += 2;
            weapon.magic = "magic";
            additionalText += "<br>inc +2 Sacred Weapon";
        }

        //Magic Items
        let magicBonus;
        if (extra !== "Non-Magic" && extra !== "No") {
            if (extra.includes("+")) {
                magicBonus = parseInt(magicInfo.characterAt(magicInfo.indexOf("+") + 1)) || 0;
                attackBonus += magicBonus;
                weapon.base += "+" + magicBonus;
                weapon.magic = "magic";
            }
        }
        if (extra.includes("Silver") && weapon.magic.includes("magic") === false) {
            weapon.magic = "silver";
        }

        if (attMarkers.includes("Magic Weapon") && weapon.magic !== "magic") {
            magicBonus = parseInt(attacker.token.get("status_" + Markers["Magic Weapon"])) || 1;
            weapon.base += "+" + magicBonus;
            attackBonus += magicBonus;
            weapon.magic = "magic";
        }


        weapon.damage = [weapon.base + "," + weapon.damageType];
        if (attMarkers.includes("Divine Favour")) {
            weapon.damage.push('1d4,radiant');
        }
        if (attMarkers.includes("Searing Smite")) {
            weapon.damage.push('1d6,fire');
        }
        if (attMarkers.includes("Thunderous Smite")) {
            weapon.damage.push('2d6,thunder');
        }
        if (attMarkers.includes("Wrathful Smite")) {
            weapon.damage.push('1d6,psychic');
        }


        SetupCard(attacker.name,"Attack",attacker.displayScheme);
        if (inReach === true && weapon.type.includes("Melee")) {
            outputCard.body.push(attacker.name + " strikes at " + defender.name + " with his " + weaponName);
            weapon.type = "Melee";
        }
        if (inReach === false && weapon.properties.includes("Thrown")) {
            outputCard.body.push(attacker.name + " throws his " + weaponName + " at " + defender.name);
            weapon.sound = "Shuriken";
            weapon.type = "Ranged";
        }
        if (inReach === false && weapon.properties.includes("Thrown") === false) {
            outputCard.body.push(attacker.name + ' fires his ' + weaponName + " at " + defender.name);
            weapon.type = "Ranged";
        }
log(weapon)

        let advResult = Advantage(attacker,defender,weapon); 

        let attackResult = D20(advResult.advantage);
        let attackTotal = attackResult.roll + attackBonus;
        let tip;
        let crit = false;

        if ((findCommon(defMarkers,Incapacitated).length > 0) && inReach === true) {
            crit = true;
        }
        let abText = (attackBonus < 0) ? attackBonus:(attackBonus > 0) ? "+" + attackBonus:"";

        tip = attackResult.rollText + abText;
        tip += "<br>[1d20" + abText + "]" + additionalText;
        if (advResult.advText.length > 0) {
            tip += "<br>Advantage from: " + advResult.advText.toString();
        }
       if (advResult.disText.length > 0) {
            tip += "<br>Disadvantage from: " + advResult.disText.toString();
        }

        tip = '[' + attackTotal + '](#" class="showtip" title="' + tip + ')';
        if (attackResult.roll >= weapon.critOn) {
            crit = true;
        }
        let ac = defender.ac;
        if (defMarkers.includes("Shield of Faith")) {
            ac += 2;
        }
        if (defMarkers.includes("Mage Armour")) {
            ac = 13 + defender.statBonus.dexterity;
        }
        if (defMarkers.includes("Barkskin")) {
            ac = Math.max(16,ac);
        }


        let cover = CheckCover(defender);
        if (cover === "Light") {
            ac += 2;
        }

        let dc = 10;//modify???


        outputCard.body.push("Attack: " + tip + " vs. AC " + ac);
        if (crit === true) {
            outputCard.body.push("[#ff0000]Crit![/#]");
        }

log(weapon)
        if ((attackTotal >= ac && attackResult.roll !== 1) || crit === true) {
            outputCard.body.push("[B]Hit![/b]")
            let finalDamage = 0;
            for (let i=0;i<weapon.damage.length;i++) {
                //normally one eg 1d8+1, slashing damage for a longsword
                //might have a 2nd eg 1d6,fire for a flaming longsword
                //roll damage for each damage type then 'apply' it to defender
                let rollResults = RollDamage(weapon.damage[i],crit); //total, diceText
                let damageResults = ApplyDamage(rollResults,dc,defender,weapon);
                let tip = rollResults.diceText;  
                tip = '[' + damageResults.total + '](#" class="showtip" title="' + tip + ') ';
                let saveTip = "";
                if (damageResults.save) {
                    saveTip = '[' + damageResults.save + '](#" class="showtip" title="' + damageResults.saveTip + ') ';
                }

                outputCard.body.push(saveTip + tip + Capit(rollResults.damageType) + " Damage" + damageResults.irv);



                if (crit === true) {
                    spawnFx(defender.token.get("left"),defender.token.get("top"), "burn-blood",defender.token.get("_pageid"));
                } else {
                    spawnFx(defender.token.get("left"),defender.token.get("top"), "pooling-blood",defender.token.get("_pageid"));
                }
                finalDamage += damageResults.total;
            }            
            if (weapon.damage.length > 1) {
                outputCard.body.push("[hr]");
                outputCard.body.push("Total Damage: " + finalDamage);
            }

            if (finalDamage > 0) {
                if (attMarkers.includes("Searing Smite")) {
                    outputCard.body.push("At the start of each of its turns until the spell ends, the target must make a Constitution saving throw. On a failed save, it takes 1d6 fire damage. On a successful save, the spell ends. If the target or a creature within 5 feet of it uses an action to put out the flames, or if some other effect douses the flames (such as the target being submerged in water), the spell ends.");
                    let spell = FindSpell("Searing Smite",attacker.id);
                    EndSpell(spell.spellID);
                }
                if (attMarkers.includes("Thunderous Smite")) {
                    outputCard.body.push("The Thunderclap is audible within 300 feet");
                    let saveResult = Save(defender,attacker.spellDC,"strength");
                    let noun = "Fails"
                    let tip = '(#" class="showtip" title="' + saveResult.tip + ')';
                    if (saveResult.save === true) {
                        outputCard.body.push(defender.name + " " +  '[saves]' + tip + " and resists the Shockwave");
                    } else {
                        outputCard.body.push(defender.name + " " + '[fails]'
                            + tip + " its save and is knocked back and Prone!");
                        defender.token.set("status_" + Markers["Prone"],true);
                        MoveTarget(attacker,defender,10);
                    }
                    let spell = FindSpell("Thunderous Smite",attacker.id);
                    EndSpell(spell.spellID);
                }
                if (attMarkers.includes("Wrathful Smite")) {
                    let saveResult = Save(defender,attacker.spellDC,"wisdom");
                    let tip = '(#" class="showtip" title="' + saveResult.tip + ')';
                    if (saveResult.save === true) {
                        outputCard.body.push(defender.name + " " +  '[saves]' + tip);
                    } else {
                        outputCard.body.push(defender.name + " " + '[fails]'
                            + tip + " its save and is Frightened. It can make a Wisdom Save each round to overcome this.");
                        defender.token.set("status_" + Markers["Frightened"],true);
                    }
                    let spell = FindSpell("Wrathful Smite",attacker.id);
                    EndSpell(spell.spellID);
                }


            }




            if (attacker.class.includes("paladin") && inReach === true) {
                //add option of smite if has spell slots
                let c = (crit === true) ? 1:0;
                let line = "!SpecialAbility;Smite;" + attacker.id + ";" + defender.id + ";" + c + ";";
                let levels = [];
                for (let level = 1;level < 6;level++) {
                    if (SpellSlots(attacker,level) > 0) {
                        levels.push(level);
                    }
                }
                if (levels.length === 1) {
                    line += levels[0];
                } else {
                    line += "?{Level";
                    _.each(levels,level => {
                        line += "|" + level;
                    });
                    line += "}"
                }
                if (levels.length > 0) {
                    ButtonInfo("Smite!",line);
                }
            }

            if (weapon.text) {
                outputCard.body.push("[hr]");
                outputCard.body.push(weapon.text);
            }
        } else {
            outputCard.body.push("[B]Miss[/b]");
        }

        PlaySound(weapon.sound);

        PrintCard();
    }

    const Advantage = (attacker,defender,damageInfo) => {
        let inReach = false;

        let squares = attacker.Distance(defender);
        let distance = squares * pageInfo.scaleNum;

        if (squares === 1) {
            inReach = true;
        }
        if (damageInfo.properties && damageInfo.properties.includes("Reach") && squares <= 2) {
            inReach = true;
        }

        let attMarkers = attacker.Markers();
        let defMarkers = defender.Markers();

        let ids = Object.keys(ModelArray);

        let positive = ["Invisible","Advantage"];
        let attNegative = ["Blind","Frightened","Poison","Disadvantage","Heat Metal"];
        let defNegative = ["Blind","Disadvantage"];

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
                    if (findCommon(model2.Markers(),Incapacitated).length === 0) {
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
        if (inReach === false && damageInfo.type === "Ranged" && distance > damageInfo.range[0]) {
            disText.push("Long Range");
            disadvantage = true;
        }

        //check for conditions, spells etc
        let attPos = findCommon(positive,attMarkers);
        let attNeg = findCommon(attNegative,attMarkers);
        attNeg = attNeg.concat(findCommon(Restrained,attMarkers));

        let defPos = findCommon(positive,defMarkers);
        let defNeg = findCommon(defNegative,defMarkers);
        defNeg = defNeg.concat(findCommon(Incapacitated,defMarkers),findCommon(Restrained,defMarkers))

        if (attPos.length > 0) {
            advantage = true;
            advText = advText.concat(attPos);
        }
        if (attNeg.length > 0) {
            disadvantage = true;
            disText = disText.concat(attNeg);
        }
        if (defPos.length > 0) {
            disadvantage = true;
            disText = disText.concat(defPos);
        }
        if (defNeg.length > 0) {
            advantage = true;
            advText = advText.concat(defNeg);
        }

        //specials, spells etc
        if (defMarkers.includes("Faerie Fire")) {
            advantage = true;
            advText.push("Faerie Fire");
        };
        if (defMarkers.includes("Dodge")) {
            disText.push("Defender taking Dodge Action");
            disadvantage = true;
        }
        creatTypes = ["aberation","celestial","elemental","fey","fiend","undead"];
        let other = creatTypes.some(type => attacker.type.toLowerCase().includes(type));

        if (defMarkers.includes("Protection") && other === true) {
            disadvantage = true;
            disText.push("Protection from Evil/Good");
        }
        if (attacker.special.includes("Pack Tactics") && inReach === true && damageInfo.type.includes("Melee")) {
            let adj = false;
            for (let i=0;i<ids.length;i++) {
                let model2 = ModelArray[ids[i]];
                if (model2.id === attacker.id || model2.id === defender.id) {
                    continue;
                }
                if (model2.inParty === attacker.inParty) {
                    if (findCommon(model2.Markers(),Incapacitated).length === 0 && model2.Distance(defender) <= 1) {
                        advantage = true;
                        advText.push("Pack Tactics");
                        break;
                    }
                }
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


    const SpecialAbility = (msg) => {
        let Tag = msg.content.split(";");
        let abilityName = Tag[1];
        let attID = Tag[2];
        let attacker = ModelArray[attID];

        if (abilityName === "Shield Bash") {
            let defID = Tag[3];
            let defender = ModelArray[defID];
            ShieldBash(attacker,defender);
        }
        if (abilityName === "Smite") {
            let defID = Tag[3];
            let defender = ModelArray[defID];
            let critical = parseInt(Tag[4]) === 1 ? true:false;
            let level = parseInt(Tag[5]);
            Smite(attacker,defender,critical,level);
        }
        if (abilityName === "Dragon's Breath") {
            let spellID = Tag[3];
            let spell = (state.DnD.spellList.find((e) => e.spellID === spellID));
log("In Special Ability")
log(spell)

            ClearSpellTarget(spell);
            spell.displacedTokenID = attID;
            spell.tempSize = 5;
            let target = SpellTarget(spell);
            state.DnD.areaSpell = spell;
            SetupCard(attacker.name,"Dragon's Breath",attacker.displayScheme);
            outputCard.body.push("Place Target then use Macro to Cast");
            
        }
        if (abilityName === "Lucky") {
            SetupCard(attacker.name,"Lucky",attacker.displayScheme);
            outputCard.body.push("You use one of your Luck Points to roll an additional d20. This can be an attack roll (yours or one against you), an ability check or a saving throw. You can choose which d20 is used for the result.")
//resource
        }









        PrintCard();
    }

    const ShieldBash = (attacker,defender) => {
        SetupCard(attacker.name,"Shield Bash",attacker.displayScheme);
        if (defender.immunities.includes("prone")) {
            outputCard.body.push(defender.name + " is immune");
            return;
        }
        if (defender.size > attacker.size) {
            outputCard.body.push(defender.name + " is too large to Bash");
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

        outputCard.body.push(tip + " " + attacker.name + " bashes " + defender.name + " with his Shield");

        if (defTotal < attTotal) {
            outputCard.body.push("[B]Success[/b]");
            outputCard.body.push(defender.name + " can be either pushed back 5ft or knocked prone");
        } else {
            outputCard.body.push("[B][#ff0000]Failure[/b][/#]");
            outputCard.body.push(defender.name + verb + "the Shield Bash");
        }
        PlaySound("Shield");
    }

    const Smite = (attacker,defender,critical,level) => {
        let sub = (critical === true) ? "Divine Smite Critical": "Divine Smite";
        let dice = 2 + (level - 1);
        if (defender.type.toLowerCase().includes("undead")) {
            dice += 1;
            sub += " vs. Undead";
        }
        if (defender.type.toLowerCase().includes("fiend")) {
            dice += 1;
            sub += " vs. Fiend";
        }

        if (critical === "Yes") {
            sub = "Critical " + sub;
            dice = dice * 2;
        }
        SetupCard(attacker.name,sub,attacker.displayScheme);

        let damage = dice + "d8,radiant";
        let rollResults = RollDamage(damage,critical);
        let damageResults = ApplyDamage(rollResults,attacker.spellDC,defender);
        let tip = rollResults.diceText;         
        tip = '[' + damageResults.total + '](#" class="showtip" title="' + tip + ') ';
        let saveTip = "";

        if (damageResults.save) {
            saveTip = '[' + damageResults.save + '](#" class="showtip" title="' + damageResults.saveTip + '): ';
        }
        outputCard.body.push(saveTip + tip + Capit(rollResults.damageType) + " Damage" + damageResults.irv);

        spawnFx(defender.token.get("left"),defender.token.get("top"), "nova-holy",defender.token.get("_pageid"));
        PlaySound("Smite");
    }

    const SpellSlots = (caster,level) => {
        let slots = parseInt(Attribute(caster.charID,"lvl" + level + "_slots_expended")) || 0;
        return slots;
    }

    const MakeParty = (msg) => {
        if (!msg.selected) {return};
        for (let i=0;i<msg.selected.length;i++) {
            let id = msg.selected[i]._id;
            let model = ModelArray[id];
            let char = getObj("character",model.charID);
            if (char.get("inParty") === false) {
                char.set("inParty",true);
                v = " added to Party";
            } else {
                char.set("inParty",false);
                v = " removed from Party"
            }
            char.set("inParty",true);
            sendChat("",model.name + v);
        }
    }

    const Emote = (spell) => {
        let caster = ModelArray[spell.casterID];
        let targetZero = ModelArray[spell.targetIDs[0]];
        let emotes = [];
        if (spell.emote) {emotes.push(spell.emote)};
        if (spell.duration && spell.name !== "Breathe") {
            emotes.push("The Spell lasts " + spell.duration + " rounds. ");
        }
        if (spell.concentration === true) {
            emotes.push("The Spell requires Concentration");
        }
        let final = "";
        for (let i=0;i<emotes.length;i++) {
            if (i>0) {final += "<br>"};
            let emote = emotes[i];
            emote = emote.replace(/%%Caster%%/g,caster.name);
            if (targetZero) {
                emote = emote.replace(/%%Target%%/g,targetZero.name);
            }
            final += emote;
        }
        if (spell.name === "Dragon's Breath")  {
            final = final.replace("magical",spell.damageType);
        }    
        return final;        
    }

    const DirectAttackSpell = (spell) => {
        let caster = ModelArray[spell.casterID];
        let targetIDs = spell.targetIDs;
        let level = spell.castlevel;
        let attMarkers = caster.Markers();

        outputCard.body.push(Emote(spell));

        if (spell.cLevel && spell.cLevel[caster.casterLevel]) {
            spell.base = spell.cLevel[caster.casterLevel];
        }
        if (level > spell.level) {
            spell.base = spell.sLevel[level];
        }

        spell.damage = spell.base + "," + spell.damageType;
        spell.type = "Spell";


        AddSpell(spell); //adds only if has duration

        for (let i=0;i<targetIDs.length;i++) {
            let defender = ModelArray[targetIDs[i]];
            if (!defender) {continue};
            let defMarkers = defender.Markers();
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
            if ((findCommon(Incapacitated,defMarkers).length > 0) && caster.Distance(defender) === 1) {
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

            let ac = defender.ac;
            if (defMarkers.includes("Shield of Faith")) {
                ac += 2;
            }
            let cover = CheckCover(defender);
            if (cover === "Light") {
                ac += 2;
            }
            if (defMarkers.includes("Barkskin")) {
                ac = Math.max(16,ac);
            }

            if (spell.autoHit === "No") {
                if (attackResult.roll === 20) {crit = true};
                outputCard.body.push("Attack: " + tip + " vs. AC " + ac);
                if (crit === true) {
                    outputCard.body.push("[#ff0000]Crit![/#]");
                }
            }

            let dc = spell.dc;

            if ((attackTotal >= ac && attackResult.roll !== 1) || crit === true || spell.autoHit === "Yes") {
                outputCard.body.push("[B]" + defender.name +" is Hit![/b]")
                let rollResults = RollDamage(spell.damage,crit); //total, diceText
                let damageResults = ApplyDamage(rollResults,dc,defender,spell);
                let tip = rollResults.diceText;      
                tip = '[' + damageResults.total + '](#" class="showtip" title="' + tip + ')';
                let saveTip = "";
                if (damageResults.save) {
                    saveTip = '[' + damageResults.save + '](#" class="showtip" title="' + damageResults.saveTip + ')'
                }
                outputCard.body.push(saveTip + tip + " " + Capit(rollResults.damageType) + " Damage" + damageResults.irv);
                if (spell.note) {
                    outputCard.body.push("[hr]");
                    outputCard.body.push(spell.note);
                }
                if ((damageResults.save && damageResults.save !== "Saves") || (!damageResults.save)) {  
                    defender.token.set("status_" + Markers[spell.name],true);
                }
            } else {
                outputCard.body.push("[B]" + defender.name +" is Missed[/b]");
            }
            FX(spell.fx,caster,defender);
        }
        PlaySound(spell.sound);
    }

    const Spell = (msg) => {
        let Tag = msg.content.split(";");
        let spellName = Tag[1];
        let level = parseInt(Tag[2]);
        let casterID = Tag[3];
        if (!casterID) {casterID = msg.selected[0]._id};
        let targetIDs = [];
        let errorMsg = [];

        let caster = ModelArray[casterID];

        let ritual = false;
        if (spellName.includes("Ritual")) {
            spellName = spellName.replace("Ritual","");
            ritual = true;
        }

        if (!SpellInfo[spellName]) {
            outputCard.body.push("Error");
            PrintCard();
            return;
        }

        let spell = DeepCopy(SpellInfo[spellName]);

        //check spell slots, distance
        if (!spell.exempt && ritual === false && level > 0) {
            let slotsAvailable = SpellSlots(caster,level);
            if (slotsAvailable === 0) {
                errorMsg.push("No Slots of that Level Available");
            }
        }

        //range check - note range check for Area checked in AreaSpell once template placed
        let alt = 0;
        for (let i=4;i< Tag.length;i++) {
            let target = ModelArray[Tag[i]];
            if (!target) {
                let alternate = spell.alternates[alt];
                spell[alternate] = Tag[i];
                alt++;
            } else {
                let squares = caster.Distance(target);
                let distance = squares * pageInfo.scale;
                if (distance > spell.range) {
                    errorMsg.push(target.name + " is out of Range");
                } else {
                    targetIDs.push(Tag[i]);
                    //targets.push(target);
                }
            }
        }

        SetupCard(caster.name,spellName,caster.displayScheme);
        if (ritual === true) {
            outputCard.body.push("[B]Ritual[/b]");
            spell.exempt = true;
        }

        if (errorMsg.length > 0) {
            _.each(errorMsg,error => {
                outputCard.body.push(error);
            });
            PrintCard();
            return;
        } 

        if (targetIDs.length === 0) {
            targetIDs.push(caster.id);
        }

        let casterLevel = caster.casterLevel;


        spell.casterID = casterID;
        spell.targetIDs = targetIDs;
        spell.castLevel = level;
        spell.casterLevel = casterLevel;
        spell.isRitual = ritual;
        spell.dc = caster.spellDC;

        if (spell.cLevel && spell.cLevel[casterLevel]) {
            spell.base = spell.cLevel[casterLevel] || 0;
        }
        if (level > spell.level && spell.sLevel) {
            spell.base = spell.sLevel[level] || 0;
        }
        spell.damage = spell.base + "," + spell.damageType;


        if (spell.spellType === "DirectAttack") {
            //spells that directly attack the target
            DirectAttackSpell(spell);
        }
        if (spell.spellType === "Misc") {
            MiscSpell(spell);
        }
        if (spell.spellType === "Area") {
            //creates a target template (depending on spell)
            //target template will have a macro to actually cast spell
            ClearSpellTarget(spell);
            let target = SpellTarget(spell);
            outputCard.body.push("Place Target then use Macro to Cast");
        }
        if (spell.spellType === "Ongoing") {
            ClearSpellTarget(spell);
            let target = SpellTarget(spell);
            let emote = Emote(spell);
            if (emote) {
                outputCard.body.push(emote);
            }
            spell.ongoingID = target.id;
            spell.targetIDs = [target.id];
            outputCard.body.push("Move Target to Location");
            AddSpell(spell);
            target.token.set("gmnotes",spell.spellID);
            if (spell.moveEffect) {
                //moves it at start of next turn, ie after player moves
                state.DnD.moveID = target.id;
            }
        }
        PrintCard();
    }

    const EndSpell = (spellID) => {
        if (!spellID) {return};
        let spell = state.DnD.spellList.find((e)=> e.spellID === spellID);
log("In End Spell")
log(spell)
        if(!spell) {return}
        let caster = ModelArray[spell.casterID];

        let index;
        let sm = Markers[spell.name] || "";
        _.each(spell.targetIDs,targetID => {
            let target = ModelArray[targetID];
            if (target) {
                target.token.set("status_" + sm,false); 
            }
        })

        if (spell.ongoingID) {
            let spellModel = ModelArray[spell.ongoingID];
            if (spellModel) {
                spellModel.Destroy();
            }
        }

        if (caster) {
            if (spell.concentration === true) {
                state.DnD.conSpell[caster.id] = "";
                outputCard.body.push("[" + spell.name + " Ends]");
            } else {
                index = state.DnD.regSpells[caster.id].indexOf(spell.spellID);
                if (index > -1) {
                    state.DnD.regSpells[caster.id].splice(index,1);
                }
            }
        }

        if (spell.abilityID) {
            //remove ability eg if Flame Blade
            let charID = caster.charID;
            if (spell.displacedCharID) {
                charID = spell.displacedCharID;
            }
            let ability = findObjs({_type: "ability", _characterid: charID, _id: spell.abilityID})[0];
            if (ability) {
                ability.remove();
            }
        }

        if (spell.displacedSpellID) {
            EndSpell(spell.displacedSpellID);
        }

        if (spell.name === "Heroism") {
            let model = ModelArray[spell.targetIDs[0]];
            TempHP(model,0,false); //resets temp hp to 0
        } 


        index = state.DnD.spellList.findIndex((e) => e.spellID === spellID);
        if (index > -1) {
            state.DnD.spellList.splice(index,1);
        }
        return spell.name;
    }

    const AddSpell = (spell,precastFlag = false) => {
        if (!spell.duration) {return};
        spell.endTurn = state.DnD.combatTurn + spell.duration;
        if (precastFlag === true) {spell.endTurn--};
        
        if (!spell.spellID) {
            spell.spellID = stringGen();
        }

        state.DnD.spellList.push(spell);
log("In Add Spell")
log(spell)
        if (spell.concentration === true) {
            if (state.DnD.conSpell[spell.casterID]) {
                EndSpell(state.DnD.conSpell[spell.casterID]);
            } 
            state.DnD.conSpell[spell.casterID] = spell.spellID;
            outputCard.body.push(ModelArray[spell.casterID].name + " is now Concentrating on this Spell")
        } else {
            if (!state.DnD.regSpells[spell.casterID]) {
                state.DnD.regSpells[spell.casterID] = [];
            }
            state.DnD.regSpells[spell.casterID].push(spell.spellID);
        }
    }

    const CheckDuration = (spellID) => {
        let spell = state.DnD.spellList.find((e) => e.spellID === spellID);
log("In Check Duration")
log(spell)
        if (parseInt(state.DnD.combatTurn) >= parseInt(spell.endTurn)) {
            EndSpell(spellID);
        }
    }

    const EffectCheck = (model,type) => {
        //interaction of spell and model
        let spellLists = {
            "Start": ["Moonbeam","Web"],
            "ModelMove": ["Moonbeam","Web","Spike Growth"],
            "End": ["Flaming Sphere"],
            "SpellMove": ["Flaming Sphere"],
        }
        let spells = spellLists[type];
log("Effect Check")
log(model.name + " / " + type)
        if (type.includes("Spell") && spells.includes(model.name)) {
            if (model.name === "Flaming Sphere") {FlamingSphere(model)};



        } else {
            _.each(ModelArray,m => {
                if (spells.includes(m.name) && m.id !== model.id) {
                    if (Venn(m.Squares(),model.Squares()) === true) {
                        let spellID = m.token.get("gmnotes").toString();
                        let spell = state.DnD.spellList.find((e) => e.spellID == spellID);
                        if(!spell) {return};
                        //area = damage or effect
                        if (type === "End" || type === "ModelMove") {SetupCard(model.name,m.name,model.displayScheme)}
                        if (spell.effect.includes("Damage")) {
                            let rollResults = SD1(spell);
                            SpellDamage(rollResults,spell,model);
                        }
                        if (spell.effect.includes("Effect")) {
                            SpellEffect(spell,model);
                        }
                        if (type === "End" || type === "ModelMove") {PrintCard()};
                    }
                }
            })
        }






    }

    const SD1 = (spell) => {
        let rollResults = RollDamage(spell.damage,false); //total, diceText
        tip = '[' + rollResults.total + '](#" class="showtip" title="' + rollResults.diceText + ')'
        outputCard.body.push("Total: " + tip + " " + Capit(spell.damageType) + " Damage");   
        if (spell.savingThrow && spell.savingThrow != "No") {
        outputCard.body.push(Capit(spell.savingThrow) + " Save = " + spell.saveEffect);
        } else {
            outputCard.body.push("No Saving Throw");
        }
        return rollResults;
    }



    const EndModelsRound = (lastTurnInfo) => {
        let model = ModelArray[lastTurnInfo.modelID];
        let spellIDs = lastTurnInfo.spellIDs;
        if (!model || !spellIDs) {return};
        SetupCard(model.name,"",model.displayScheme);
        for (let i=0;i<spellIDs.length;i++) {
            let spellID = spellIDs[i];
            SpellCheck(spellID,model);
        }
        PrintCard();
    }


    const SpellDamage = (rollResults,spell,model) => {
        let damageResults = (ApplyDamage(rollResults,spell.dc,model,spell));
        let saveTip = "";
        if (damageResults.save) {
            saveTip = ' [' + damageResults.save + '](#" class="showtip" title="' + damageResults.saveTip + ')' + " and"
        }
        outputCard.body.push(model.name + saveTip +" takes [#ff0000]" + damageResults.total + "[/#] Damage" + damageResults.irv);
        if (spell.name === "Thunderwave" && damageResults.save === "Fails") {
            MoveTarget(ModelArray[spell.casterID],model,10);
        }
    }

    const SpellEffect = (spell,model) => {
        let saved = false;
        let noun = "Fails";
        let tip = "";
        let phrase = spell.failText || "";
        if (spell.conditionImmune && model.conditionImmunities.includes(spell.conditionImmune)) {
            saved = true;
            outputCard.body.push(model.name + " is Immune");
            return;
        }
        if (saved === false && spell.savingThrow) {
            let saveResult = Save(model,spell.dc,spell.savingThrow,0);
            saved = saveResult.save;
            if (saved === true) {
                noun = "Saves"
                phrase = spell.saveText || "";
            };
            tip = ' [' + noun + '](#" class="showtip" title="' + saveResult.tip + ')';
        }
        if (saved === false) {
            model.token.set("status_" + Markers[spell.name],true);
        }
        outputCard.body.push(model.name + tip + phrase);
        return saved;
    }

    const FlamingSphere = (model) => {
        //check if moved the sphere centre onto someone
        let spellID = model.token.get("gmnotes").toString();
        let spell = state.DnD.spellList.find((e) => e.spellID == spellID);
        let caster = ModelArray[spell.casterID]
        if(!spell) {
            log("No Spell")
            return;
        }
        let pt = model.Point();
        let square = [pt.toSquare()];
        _.each(ModelArray,m => {
            if (m.id !== model.id && m.id !== caster.id) {
                if (Venn(m.Squares(),square) === true) {
                    SetupCard("Flaming Sphere","Movement",caster.displayScheme);
                    let rollResults = SD1(spell);
                    SpellDamage(rollResults,spell,m);
                    outputCard.body.push("[hr]");
                    outputCard.body.push("The Flaming Sphere stops Moving");
                    PrintCard();
                }
            };
        })
        toBack(model.token);
    }



    const ShowSpells = (msg) => {
        if (!msg.selected) {return};
        let model = ModelArray[msg.selected[0]._id];
log(model.spells)
        SetupCard(model.name,"Available Spells",model.displayScheme);
        //cantrips
        if (model.spells.cantrip) {
            buttons = [];
            outputCard.body.push("[B][U]Cantrips[/b][/u]");
            _.each(model.spells.cantrip,cantrip => {
                let macro = "!DisplaySpellInfo;" + model.id + ";" + cantrip.name + ";" + cantrip.desckey;
                if (SpellInfo[cantrip.name]) {
                    macro = SpellInfo[cantrip.name].macro;
                    macro = macro.replace("%Selected%","&#64;&#123;selected&#124;token&#95;id&#125;");
                    macro = macro.replace("%Target%","&#64;&#123;target&#124;Target1&#124;token&#95;id&#125;");
                    macro = macro.replace("%Target1%","&#64;&#123;target&#124;Target1&#124;token&#95;id&#125;");
                    macro = macro.replace("%Target2%","&#64;&#123;target&#124;Target2&#124;token&#95;id&#125;");
                    macro = macro.replace("%Target3%","&#64;&#123;target&#124;Target3&#124;token&#95;id&#125;");




                }
                buttons.push({
                    phrase: cantrip.name,
                    action: macro,
                })
            })
            outputCard.body.push(InlineButtons(buttons));
            outputCard.body.push("<br>");
            outputCard.body.push("[hr]");
        }

        let availableSS = [0,0,0,0,0,0,0,0,0,0];
        let cumulativeSS = [0,0,0,0,0,0,0,0,0,0];
        for (let i=1;i<10;i++) {
            let ss = parseInt(SpellSlots(model,i));
            availableSS[i] = ss
            for (let j=1;j<=i;j++) {
                cumulativeSS[j] += ss;
            }
        }

log("Spell Slots: " + availableSS)
log("Cumulative Slots: " + cumulativeSS)

        for (let i=1;i<10;i++) {
            if (cumulativeSS[i] === 0) {continue};
            outputCard.body.push("[B][U]Level " + i + "[/b][/u]");
            outputCard.body.push("Spell Slots: " + SpellSlots(model,i));
            //show prepared spells for that level with a button
            let spells = model.spells[i];
            let buttons = [];
//
            _.each(spells,spell => {
                if (Attribute(model.charID,spell.prepared) == 1) {
                    let macro = "!DisplaySpellInfo;" + model.id + ";" + spell.name + ";" + spell.desckey;
                    if (SpellInfo[spell.name]) {
                        let levelMacro = "?&#123;Level&#124;" + i;
                        let availLevels = [i];
                        for (let j=(i+1);j<10;j++) {
                            if (availableSS[j] > 0) {
                                availLevels.push(j);
                                levelMacro += "	&#124;" + j;
                            }
                        }
                        levelMacro += "&#125;";
                        if (availLevels.length === 1) {
                            levelMacro = parseInt(availLevels[0]);
                        }                                 
                        macro = SpellInfo[spell.name].macro || macro;
                        macro = macro.replace("%Level%",levelMacro);
                        macro = macro.replace("%Selected%","&#64;&#123;selected&#124;token&#95;id&#125;");
                        macro = macro.replace("%Target%","&#64;&#123;target&#124;Target1&#124;token&#95;id&#125;");
                        macro = macro.replace("%Target1%","&#64;&#123;target&#124;Target1&#124;token&#95;id&#125;");
                        macro = macro.replace("%Target2%","&#64;&#123;target&#124;Target2&#124;token&#95;id&#125;");
                        macro = macro.replace("%Target3%","&#64;&#123;target&#124;Target3&#124;token&#95;id&#125;");
                    }
                    buttons.push({
                        phrase: spell.name,
                        action: macro,
                    })
                }
            })
            outputCard.body.push(InlineButtons(buttons));
            outputCard.body.push("<br>");
            outputCard.body.push("[hr]");
        }
        outputCard.body.push("[hr]");
        let ritualCasters = ['artificer', 'bard', 'cleric', 'druid',
            'wizard']

        if (ritualCasters.includes(model.class)) {
            outputCard.body.push("[B][U]Rituals[/b][/u]");
            outputCard.body.push("Out of Combat Only");
            for (let i=1;i<10;i++) {
                let spells = model.spells[i];
                let buttons = [];
                if (!spells) {continue};
                _.each(spells,spell => {
                    if (spell.ritual == true) {
                        if ((model.class === "cleric" || model.class === "druid") && (Attribute(model.charID,spell.prepared) != 1)) {
                            return;
                        } 
                        let macro = "!DisplaySpellInfo;" + model.id + ";" + spell.name + ";" + spell.desckey;
                        if (SpellInfo[spell.name]) {                  
                            macro = SpellInfo[spell.name].macro || macro;
                            macro = macro.replace("%Level%",i);
                            macro = macro.replace("%Selected%","&#64;&#123;selected&#124;token&#95;id&#125;");
                            macro = macro.replace("%Target%","&#64;&#123;target&#124;token&#95;id&#125;");
                            macro = macro.replace(spell.name,"Ritual" + spell.name);
                        }
                        buttons.push({
                            phrase: spell.name,
                            action: macro,
                        })
                    }
                })
                outputCard.body.push(InlineButtons(buttons));
                outputCard.body.push("<br>");
                outputCard.body.push("[hr]");
            }
        }


        PrintCard(); //? maybe make this a whisper to player +/- GM ?
    }

    const DisplaySpellInfo = (msg) => {
        let Tag = msg.content.split(";");
        let id = Tag[1];
        let spellName = Tag[2];
        let desckey = Tag[3];
        let model = ModelArray[id];
        let description = Attribute(model.charID,desckey);
        SetupCard(model.name,spellName,model.displayScheme);
        description = description.split('\n\n')
        _.each(description,desc => {
            outputCard.body.push(desc);
        })
        PrintCard();
    }





    const MiscSpell = (spell) => {
        let emote = Emote(spell);
        if (emote) {         
            outputCard.body.push(emote);
        }
        let someoneFailed = false;

        if (spell.name === "Heroism") {
            let target = ModelArray[spell.targetIDs[0]]
            let tempHP = parseInt(spell.dc - 10);
            TempHP(target,tempHP);
        }

        _.each(spell.targetIDs,targetID => {
            let saved = false
            let target = ModelArray[targetID];
            if (!target) {return};
            let text = spell.failText || "";
            if (spell.savingThrow && !spell.friendlySpell) {
                let saveResult = Save(target,spell.dc,spell.savingThrow,0);
                saved = saveResult.save;
                noun = "Fails";
                if (saved === true) {
                    noun = "Saves"
                    text = spell.saveText;
                };
                let tip = '[' + noun + '](#" class="showtip" title="' + saveResult.tip + ')';
                outputCard.body.push(target.name + " " + tip + text);
            }
            if (saved === false) {
                someoneFailed = true;
                target.token.set("status_" + Markers[spell.name],true);            
            }
            if (spell.name === "Magic Weapon") {
                let plus = (spell.castLevel < 4) ? true:Math.min(Math.floor(spell.castLevel/2),3);
                target.token.set("status_" + Markers["Magic Weapon"],plus);
            }


        })

        if (spell.heal) {
            let rolls = [];
            let bonus = 0;
            let bonusText = "";
            if (spell.heal.includes("Bonus")) {
                bonus = Math.max(0,(spell.dc - 10));
            }
            if (bonus !== 0) {
                bonusText = (bonus > 0) ? "+" + bonus:bonus;
            }
            let total = bonus;
            let split = spell.heal.split("d");
            let num = parseInt(split[0]);
            if (spell.heal.includes("level")) {
                num += (spell.castLevel - spell.level);
            }
            let diceType = parseInt(split[1].charAt(0));
            for (i=0;i<num;i++) {
                let roll = randomInteger(diceType);
                rolls.push(roll);
                total += roll;
            }
            let tip ="Roll: [" + rolls.toString() + "] " + bonusText + "<br>[" + num + "d" + diceType + bonusText + "]"; 
            tip = '[' + total + '](#" class="showtip" title="' + tip + ')';
            outputCard.body.push("Spell Heals for " + tip + " HP");
        }

        if (spell.name === "Flame Blade") {
            //add ability, store ID in spell
            let action = "!Attack;@{selected|token_id};@{target|token_id};Flame Blade";
            let caster = ModelArray[spell.casterID];
            let abilityID = AddAbility("Flame Blade",action,caster.charID);
            spell.abilityID = abilityID;
        }

        if (spell.name === "Dragon's Breath") {
            //create a 2nd spell to place on target of Dragon's Breath
            newSpell = DeepCopy(SpellInfo["Breathe"]);
            newSpell.casterID = spell.casterID;
            newSpell.targetIDs = spell.targetIDs;
            newSpell.castLevel = spell.castLevel;
            newSpell.casterLevel = spell.casterLevel;
            newSpell.dc = spell.dc;
            newSpell.damageType = spell.damageType;
            if (spell.castLevel > 2) {
                newSpell.base = newSpell.sLevel[spell.castLevel] || 0;
            }
            newSpell.damage = newSpell.base + "," + spell.damageType;
            newSpell.spellID = stringGen();

            let target = ModelArray[spell.targetIDs[0]];
            let action = "!SpecialAbility;Dragon's Breath;" + target.id + ";" + newSpell.spellID;
            spell.abilityID = AddAbility("Breathe " + Capit(spell.damageType),action,target.charID);
            spell.displacedCharID = target.charID;
            spell.displacedTokenID = target.id;
            spell.displacedSpellID = newSpell.spellID;
            newSpell.displacedTokenID = target.id;

            newSpell.fx = "breath-";
            switch (newSpell.damageType) {
                case 'Acid':
                    newSpell.fx += "acid";
                    break;
                case 'Cold':
                    newSpell.fx += "frost";
                    break;
                case 'Fire':
                    newSpell.fx += "fire";
                    break;
                case 'Lightning':
                    newSpell.fx += "magic";
                    break;
                case 'Poison':
                    newSpell.fx += "slime";
                    break;
            }
            AddSpell(newSpell);
        }

        if (someoneFailed === true) {
            AddSpell(spell);
        }

        PlaySound(spell.sound);
        //Use Slot if not ritual

    }



    const SpellTarget = (spell) => {
        img = getCleanImgSrc(spell.tempImg);
        let action = "!AreaSpell";
        
        let charID = (spell.charID) ? spell.charID:'-Oe8qdnMHHQEe4fSqqhm';

        let abilArray = findObjs({_type: "ability", _characterid: charID});
        //clear old abilities
        for(let a=0;a<abilArray.length;a++) {
            abilArray[a].remove();
        } 

        if (spell.spellType !== "Ongoing") {
            AddAbility("Cast " + spell.name,action,charID);
            if (isNaN(spell.tempSize)) {
                if (spell.tempSize.includes("Level")) {
                    if (spell.tempSize.includes("*")) {
                        spell.tempSize = parseInt(spell.tempSize.replace(/[^\d]/g,""));
                        spell.tempSize = spell.level * spell.tempSize;
                    }
                }
            }
        } 

        spell.tempSize = (spell.tempSize * 70) / pageInfo.scaleNum;

        let tok = ModelArray[spell.casterID].token; //place new token on casters token
        if (spell.displacedTokenID) {
            tok = ModelArray[spell.displacedTokenID].token;
        }

        let newToken = createObj("graphic", {
            left: tok.get("left"),
            top: tok.get("top"),
            disableTokenMenu: true,
            width: spell.tempSize, 
            height: spell.tempSize,  
            name: spell.name || "",
            pageid: tok.get("_pageid"),
            imgsrc: img,
            layer: "objects",
            represents: charID,
            
        })


        if (newToken) {
            toFront(newToken);
            let target = new Model(newToken);
            target.isSpell = spell.casterID;

            state.DnD.areaSpell = spell;
            return target;
        } else {
            sendChat("","Error in CreateObj")
        }
    }

    const ClearSpellTarget = (spell) => {
        if (!spell) {return};
        let charID = (spell.charID) ? spell.charID:'-Oe8qdnMHHQEe4fSqqhm';
        
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "objects",
            represents: charID,
        });
        _.each(tokens,token => {
            token.remove();
        })
    }

    const AreaSpell = (msg) => {
        let targetID = msg.selected[0]._id;
        let spellTarget = ModelArray[targetID];
        let spell = state.DnD.areaSpell;

        let caster = ModelArray[spell.casterID];
        let level = spell.castLevel;

        if (spell.name === "Breathe") {
            caster = ModelArray[spell.displacedTokenID];
        }

        SetupCard(caster.name,spell.name,caster.displayScheme);

        let squares = caster.Distance(spellTarget);
        let spellDistance = squares * pageInfo.scaleNum;

        if (spellDistance > spell.range) {
            outputCard.body.push("Out of Range of Spell");
            PrintCard();
            return;
        }

        let targets = [];

        if (spell.area.includes("Square")) {
            targets = AOETargets(spellTarget);
        } else if (spell.area.includes("Cone")) {
            targets = Cone(caster,spellTarget,spellDistance);
        }

        if (spell.name === "Sleep") {
            targets = Sleep(targets,level); //refine based on hp
        }
        let targetIDs = [];
        if (spell.areaEffect && spell.areaEffect.includes("Effect")) {
            _.each(targets,target => {
                let saved = SpellEffect(spell,target);
                if (saved === false) {
                    targetIDs.push(target.id);
                }
            })            
        }

        if (spell.areaEffect && spell.areaEffect.includes("Damage")) {
            let rollResults = SD1(spell);
            outputCard.body.push("[hr]")
            outputCard.body.push("[hr]")
            _.each(targets,target => {
                SpellDamage(rollResults,spell,target);
                targetIDs.push(target.id);
            })
        }
        FX(spell.fx,caster,spellTarget)
        PlaySound(spell.sound);

        spell.targetIDs = targetIDs;

        spell.ongoingID = targetID;

        AddSpell(spell);

        if (spell.moveEffect) {
            spellTarget.token.set({
                name: spell.name || "",
                layer: spell.moveEffect,
            })
            spellTarget.name = spell.name;
            spellTarget.layer = spell.moveEffect;
        } else {
            spellTarget.Destroy();
        }

        let emote = Emote(spell);
        if (emote) {
            outputCard.body.push("[hr]");
            outputCard.body.push(emote);
        }
        PrintCard();
//state.DnD.areaSpell = "";

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
            if (target.type.includes("undead") || target.conditionImmunities.includes("charmed") || findCommon(Incapacitated,target.Markers()).length > 0) {
                continue;
            };
            let phb = parseInt(target.token.get("bar1_value"));
            if (phb > hp) {
                break
            };
            hp -= phb;
            finalTargets.push(target);
        }
        return finalTargets;
    }

    const Paladin = (msg) => {
        let id = msg.selected[0]._id;
        if (!id) {return};
        let model = ModelArray[id];
        let ability = msg.content.split(";")[1];
        SetupCard(model.name,ability,model.displayScheme);
        if (ability === "Lay on Hands") {
            outputCard.body.push("As an action, drawing upon your Holy Power, you can heal wounds");
//resource
            outputCard.body.push("Each point can heal 1 HP, 5 points can heal a disase or cure a poison");
        }
        if (ability === "Divine Sense") {
            outputCard.body.push("Until the end of your next turn, you know the location of any celestial, fiend, or undead within 60 feet of you that is not behind total cover. You know the type (celestial, fiend, or undead) of any being whose presence you sense, but not its identity. Within the same radius, you also detect the presence of any place or object that has been consecrated or desecrated, as with the hallow spell.");
//resource
        }
        if (ability === "Sacred Weapon") {
//resource
            outputCard.body.push("As an action, you imbue your weapon with Positive Energy");
            outputCard.body.push("For 1 minute, it gains " + model.statBonus.charisma + " to Hit and is a Magical Weapon");
            outputCard.body.push("It also emits light (20 feet bright, 20 feet dim)");
            let marker = Markers["Sacred Weapon"];
            model.token.set("status_" + marker,true);
        }
        if (ability === "Turn the Unholy") {
//resource
            outputCard.body.push("As an action, you Channel Divinity and Turn Undead and Fiends within 30 feet.");
            outputCard.body.push("[hr]");
            Turn(model,["undead","fiend"],30);
        }
        PrintCard();
    }


    const Turn = (caster,types,range) => {
        _.each(ModelArray,model => {
            if (model.id !== caster.id) {
                if (types.some(e => model.type.includes(e))) {
                    let distance = caster.Distance(model) * pageInfo.scaleNum;
                    if (distance <= range) {
                        let saveResult = Save(model,caster.spellDC,"wisdom");
                        let tip = '(#" class="showtip" title="' + saveResult.tip + ')';
                        if (saveResult.save === true) {
                            outputCard.body.push(model.name + " " +  '[saves]' + tip);
                        } else {
                            outputCard.body.push(model.name + " " + '[fails]'
                                + tip + " and Flees!");
                            model.token.set("status_" + Markers["Frightened"],true);
                        }
                    }
                }
            };
        })
    }


    const UseItem = (msg) => {
//change to
//check resources and create macros
        if (!msg.selected) {return};
        let id = msg.selected[0]._id;
        let model = ModelArray[id];
        let Tag = msg.content.split(";");
        let itemName = Tag[1];

        SetupCard(model.name,itemName,model.displayScheme);

        if (itemName === "Potion of Healing") {
            let total = 0;
            let rolls = [];
            for (let i=0;i<2;i++) {
                roll = randomInteger(4);
                rolls.push(roll);
                total += roll;
            }
            total += 2;
            let tip = "Rolls: " + rolls.toString() + " + 2";
            tip = '[' + total + '](#" class="showtip" title="' + tip + ')';

            outputCard.body.push("[B]" + tip + "[/b]" + " HP are restored")
        }







            PrintCard();
    }


    const Compress = (msg) => {
        if (!msg.selected) {return};
        let id = msg.selected[0]._id;
        Compress2(id);
    }

    const Compress2 = (id) => {
        let model = ModelArray[id];
        let tokenSize = model.token.get("width");
        dis = false;
        if (tokenSize > 70) {
            tokenSize = 70;
            dis = true;
        } else {
            tokenSize = 140;
        }
        model.token.set({
            width: tokenSize,
            height: tokenSize,
            left: model.token.get("left") + 35,
            top: model.token.get("top") + 35,
        });
        model.token.set("status_Minus::2006420",dis);
    }

    const Rename = (msg) => {
        //add #s to a group of tokens with same name
        for (let i=0;i<msg.selected.length;i++) {
            let id = msg.selected[i]._id;
            let token = findObjs({_type:"graphic", id: id})[0];
            let currentName = token.get("name");
            if (nameArray[currentName]) {
                nameArray[currentName] += 1;
                let newName = currentName + " " + nameArray[currentName];
                token.set("name", newName);
                ModelArray[id].name = newName;
            } else {
                nameArray[currentName] = 1;
            }
        }
    }


    const CheckCover = (defender) => {
        let cover = "None";
        //Web only so far
        let defSquares = defender.Squares();
        //check map layer for possibles
        _.each(ModelArray,model => {
            if (model.layer === "map") {
                if (Venn(defSquares,model.Squares()) === true) {
                    if (model.name === "Web") {
                        cover = "Light";
                    }
                }
            }
        })
        return cover;
    }    

    const MoveTarget = (caster,target,distance) => {
        distance = distance/pageInfo.scaleNum * 70;
        let pt0 = new Point(caster.token.get("left"),caster.token.get("top"));
        let pt1 = new Point(target.token.get("left"),target.token.get("top"));
        let dX = (pt1.x - pt0.x);
        let dY = (pt1.y - pt0.y);
        let currentDist = Math.sqrt((dX * dX) + (dY * dY));
        if (currentDist === 0) {currentDist = 1};
        let unitX = dX / currentDist;
        let unitY = dY / currentDist;

        let x2 = pt1.x + unitX * distance;
        let y2 = pt1.y + unitY * distance;

        let pt2 = new Point(x2,y2);
        pt2 = pt2.toSquare().toPoint();
        target.token.set({
            left: pt2.x,
            top: pt2.y
        })
    }


    summonToken = function(cID,left,top,size,pr,markers) {
        if (!size) {size = 70};
        if (!pr) {pr = -1};
        let character = getObj("character", cID);
        character.get('defaulttoken',function(defaulttoken){
            const dt = JSON.parse(defaulttoken);
            let img = dt.imgsrc;
            img = tokenImage(img);
            if(dt && img){
                dt.imgsrc=img;
                dt.left=left;
                dt.top=top;
                dt.pageid = pageInfo.page.get('id');
                dt.layer = "objects";
                dt.width = size;
                dt.height = size;
                dt.statusmarkers = markers;
                let newToken = createObj("graphic", dt);
                let newModel = new Model(newToken);
                if (pr > -1) {
                    turnorder = JSON.parse(Campaign().get("turnorder"));
                    turnorder.unshift({
                        _pageid:    newToken.get("_pageid"),
                        id:         newToken.get("id"),
                        pr:         pr,
                    });
                    //assumes is that players turn, so places this init at start
                    Campaign().set("turnorder", JSON.stringify(turnorder));
                }
            } else {
                sendChat('','/w gm Cannot create token for <b>'+character.get('name')+'</b>');
            }
        });
    }

    const WildShape2 = (msg) => {
        let id = msg.selected[0]._id;
        let model = ModelArray[id];
        let Tag = msg.content.split(";");
        let cName = Tag[1]; //character shifting FROM
        let shape = Tag[2]; //Shape Shifting TO
        let shapes = {
        "Haevan": 
            {
                "Human": {
                    cID: "-Ody8dmoHKTxM6niN9LG",
                    size: 70,
                },
                "Brown Bear": {
                    cID: "-Odyv5HzmAOpBiY_xqLO",
                    size: 140,
                    hp: 34,
                },
                "Dire Wolf": {
                    cID: "-OdyaMtaDE-mfvTYRU-r",
                    size: 140,     
                    hp: 37,
                }
            },

        }

        SetupCard(model.name,"Wild Shape",model.displayScheme);

        if (model.race.includes(shape.toLowerCase())) {
            outputCard.body.push("Already in that Form");
            PrintCard();
            return;
        }
        if (model.token.get("status_Minus::2006420") === true) {
            Compress2(id);
        }
        let markers = model.token.get("statusmarkers");

        let cID = shapes[cName][shape].cID;
        let size = shapes[cName][shape].size;

        if (shape !== "Human") {        
            PlaySound("Growl");
            let hp = shapes[cName][shape].hp;
            AttributeSet(cID,"hp",hp);
        }

        let left= Math.max(model.token.get("left") - 35,35*size/70);
        let top = Math.max(model.token.get("top") - 35,35*size/70);
        let pr = -1;
        if (Campaign().get("turnorder")) {
            turnorder = JSON.parse(Campaign().get("turnorder"));
            let item = turnorder.filter(obj => obj.id === id)[0];
            if (item) {
                pr = item.pr;
            }
        }

        summonToken(cID,left,top,size,pr,markers);

        let newToken = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "objects",
            represents: cID,
        })[0];
        let newTokenID = newToken.get("id");

        //spells cast by character have tokenIDs changed, and if target also changed
        if (state.DnD.conSpell[id]) {
            state.DnD.conSpell[newTokenID] = state.DnD.conSpell[id];
            state.DnD.conSpell[id] = "";
        }
        if (state.DnD.regSpells[id]) {
            state.DnD.regSpells[newTokenID] = state.DnD.regSpells[id];
            state.DnD.regSpells[id] = [];
        }
        _.each(state.DnD.spellList,spell => {
            if (spell.casterID === id) {
                spell.casterID = newTokenID;
            }
            let index = spell.targetIDs.indexOf(id)
            if (index > -1) {
                spell.targetIDs.splice(index,1,newTokenID);
            }
        })

        outputCard.body.push("Wild Shape to " + shape);
        PrintCard();

        model.Destroy();

    }

    const StartCombat = () => {
        //api macro feeds in here and starts combat
        //add in all NPCs, sort turn order, then go to the combat routine
        if (Campaign().get("turnorder") == "") {
            turnorder = [];
        } else {
            turnorder = JSON.parse(Campaign().get("turnorder"));
        }
        Campaign().set("initiativepage",true);

        _.each(ModelArray,model => {
            let item = turnorder.filter(item => item.id === model.id)[0];
            if (!item) {
                let total = D20(0).roll + model.initBonus + (model.initBonus/10);
                turnorder.push({
                    _pageid:    model.token.get("_pageid"),
                    id:         model.token.get("id"),
                    pr:         total,
                })
            }
        })
        turnorder.sort((a,b) => b.pr - a.pr);
        turnorder.unshift({
            _pageid:    Campaign().get("playerpageid"),
            id:         "-1",
            custom: "Turn",
            pr:         1,
            formula:    "+1",
        })

        Campaign().set("turnorder", JSON.stringify(turnorder));
        state.DnD.combatTurn = 1;
        state.DnD.conSpell = {};
        state.DnD.regSpells = {};
        state.DnD.areaSpell = "";
        state.DnD.moveID = "";
        state.DnD.lastMoved = "";

        //precast spells - drop duration by 1 round
        _.each(ModelArray,model => {
            let markers = model.Markers();
            _.each(markers,marker => {
                let spell = SpellInfo[marker];
                if (spell) {
                    AddSpell(spell,spell.level,model,[model.id],true);
                }
            })
        })
        Combat();
    }

    const Combat = () => {
        if (!state.DnD.combatTurn || state.DnD.combatTurn === 0) {return};
        turnorder = JSON.parse(Campaign().get("turnorder"));
        if (!turnorder) {EndCombat();return};
        //advance
        turnorder = JSON.parse(Campaign().get("turnorder"));
        let currentTurnItem = turnorder[0];
        if (!currentTurnItem) {EndCombat();return};

        if (state.DnD.moveID !== "") {
            let s = ModelArray[state.DnD.moveID];
            if (s) {
                s.layer = "map";
                s.token.set("layer","map");
            }
            state.DnD.moveID = "";
        }
        
        if (state.DnD.lastMoved) {
            EffectCheck(ModelArray[state.DnD.lastMoved],"End");
        }

        let id = currentTurnItem.id;
        let model = ModelArray[id];
        if (currentTurnItem.custom === "Turn") {
            state.DnD.combatTurn = currentTurnItem.pr
        }
        //ping model's token
        if (model) {
            toFront(model.token);
            sendPing(model.token.get("left"),model.token.get("top"),Campaign().get("playerpageid"),null,true);
            SetupCard(model.name,"Turn " + state.DnD.combatTurn,model.displayScheme);
            ModelsRound(model);
            state.DnD.lastMoved = model.id;
        } else {
            SetupCard("Turn " + state.DnD.combatTurn,"","Red");
            state.DnD.lastMoved = "";
            //Start of Turn things
        }
        PrintCard();
    }

    const EndCombat = () => {
        let turnorder = [];
        Campaign().set("turnorder", JSON.stringify(turnorder));
        state.DnD.combatTurn = 0;
        Campaign().set("initiativepage",false);
        for (let i=0;i<state.DnD.spellList.length;i++) {
            let item = state.DnD.spellList[i];
            if (item.spellID) {
                EndSpell(item.spellID);
            }
        }

        sendChat("API","/w GM End Combat")
        state.DnD.combatTurn = 0;
        state.DnD.conSpell = {};
        state.DnD.regSpells = {};
        state.DnD.spellList = [];
        state.DnD.lastMoved = "";
    }

    const ModelsRound = (model) => {
        //check any spell areas model is in, eg Moonbeam, entangle etc
log("Start Models Round: " + model.name)
        EffectCheck(model,"Start");
        //Spells cast by model and ongoing - check duration
        let spellIDs = [];
        if (state.DnD.conSpell[model.id]) {
            spellIDs.push(state.DnD.conSpell[model.id]);
        }
        let arr2 = state.DnD.regSpells;
        if (arr2.length > 0) {
            spellIDs.concat(arr2);
        }
log("Own Spell IDs")
log(spellIDs)
        for (let i=0;i<spellIDs.length;i++) {
            let spellID = spellIDs[i];
            CheckDuration(spellID);
        }
        if (state.DnD.conSpell[model.id]) {
            let spellID = state.DnD.conSpell[model.id];
            let spell = state.DnD.spellList.find((e) => e.spellID === spellID);
            if (spell) {
                outputCard.body.push("Concentrating on " + spell.name)
            }
        }

        //spells on model based on markers, then check spell to see if/when save/ends
        let spellNames = model.Markers(); //could also be conditions, will screen out below
        for (let i=0;i<spellNames.length;i++) {
log("Marker on Model")
            let spellName = spellNames[i];
log(spellName)
            let spell = FindSpell(spellName,model.id);
            if (!spell) {continue};

            if (spell.name === "Heroism") {
                let tempHP = parseInt(spell.dc - 10);
                TempHP(model,tempHP);
            }


            if (spell.savingThrow && !spell.beneficial) {
                if (spell.name === "Heat Metal") {
                    //ongoing damage
                    let rollResults = RollDamage(spell.damage);
                    let damageResults = ApplyDamage(rollResults,spell.dc,model,spell);
                    let tip = rollResults.diceText;  
                    tip = '[' + damageResults.total + '](#" class="showtip" title="' + tip + ') ';
                    outputCard.body.push("Heat Metal: " + tip + Capit(rollResults.damageType) + " Damage" + damageResults.irv);
                    continue;
                };
                if (spell.savingThrow === "auto" && spell.when === "start") {
                    outputCard.body.push(spell.saveText);
                    model.token.set("status_" + Markers[spellName],false);
                    continue;
                }

                if (model.isParty === true) {
                    outputCard.body.push("The character is affected by " + spell.name + ", requiring a " + Capit(spell.savingThrow) + " Save with a DC of " + spellInfo.dc);
                    if (spell.when === "action") {
                        outputCard.body.push("The Character can use its Action to make the Save");
                    } else if (spell.when === "endAll" || spell.when === "end") {
                        outputCard.body.push("The Save occurs at the end of its round");
                    } else if (spell.when === "start") {
                        outputCard.body.push("The Save is made at the start of the Character's round");
                    }
                } else {
                    let spellEnds = SpellCheck(spell.spellID,model);
                    if (spell.when === "start" && spellEnds === true) {
                        outputCard.body.push(model.name + " can act normally");
                    }
                    if (spell.when === "action") {
                        let line = model.name + ' has used its Action';
                        if (Restrained.includes(spellName)) {
                            line += ", and is restrained by " + spellName + " from moving";
                        } else {
                            line += " but may Move";
                        }
                        outputCard.body.push(line);
                    }
                    if (spell.when === "endAll") {
                        outputCard.body.push(model.name + "'s turn is over");
                    }
                    if (spell.when === "end") {
                        outputCard.body.push("The Save is made at the end of its turn");
                    }
                }
            } 






        }
    }

    const FindSpell = (spellName,modelID) => {
        let spell = SpellInfo[spellName];
        for (let i=0;i<state.DnD.spellList.length;i++) {
            if (state.DnD.spellList[i].name === spellName && state.DnD.spellList[i].targetIDs.includes(modelID)) {
                spell = state.DnD.spellList[i];
                break;
            }
        }
        return spell;
    }

    const SpellCheck = (spellID,model) => {
        let spell = state.DnD.spellList.find((e) => e.spellID === spellID);
log("In Spell Check")
log("Pre")
log(spell)
        let savingThrow = (spell.actionSave) ? spell.actionSave:(spell.savingThrow) ? spell.savingThrow:false;
        let spellEnds = (savingThrow === "auto") ? true:false;

        let text = "";
        if (savingThrow !== false && savingThrow !== "auto") {
            let saveResult = Save(model,spell.dc,savingThrow);
            saved = saveResult.save;
            noun = "Failed Save";
            if (saved === true) {noun = "Saves"};
            if (noun === "Saves") {spellEnds = true};
            let tip = '[' + noun + '](#" class="showtip" title="' + saveResult.tip + ')';
            text += spell.name + ": " + tip;
        }
        if (spellEnds === true) {
            model.token.set("status_" + Markers[spell.name],false);
            text += spell.saveText;
            if (spell) {
                let index = spell.targetIDs.indexOf(model.id);
                if (index > -1) {
                    spell.targetIDs.splice(index,1);
                    if (spell.targetIDs.length === 0) {
                        EndSpell(spellID);
                    }
                }
            }
        }
log("Post")
log(state.DnD.spellList)
        outputCard.body.push(text);
        return spellEnds;
    }

    const EndConSpell = (msg) => {
        if (!msg.selected) {return};
        spellName = EndSpell(state.DnD.conSpell[msg.selected[0]._id]);
        if (!spellName) {spellName = "No Spell"}
        sendChat("","/w GM " + spellName + " Ended");
    }

    const TempHP = (model,tempHP,gain = true) => {
        if (gain === true) {
            let currentTemp = parseInt(Attribute(model.charID,"hp_temp")) || 0;
            tempHP = Math.max(currentTemp,tempHP);
            AttributeSet(model.charID,"hp_temp",tempHP);
            model.token.set({
                showplayers_bar3: true,
                bar3_value: tempHP,
            })
            outputCard.body.push(model.name + " has " + tempHP + " Temporary HP");
        } else {
            AttributeSet(model.charID,"hp_temp",0);
            model.token.set({
                showplayers_bar3: true,
                bar3_value: 0,
            })
        }
    }










    const changeGraphic = (tok,prev) => {
        let model = ModelArray[tok.id];
        if (!model) {
            let char = getObj("character", tok.get("represents")); 
            if (char) {
                addGraphic(tok);
            }
        }
        //check if entered area effect such as Moonbeam, Web
        if (model && (tok.get("left") !== prev.left || tok.get("top") !== prev.top) && state.DnD.combatTurn > 0) {
log("Is Spell: " + model.isSpell)
            if (model.isSpell) {
                EffectCheck(model,"SpellMove");
            } else {
                EffectCheck(model,"ModelMove");
            }
        }
    }

    const addGraphic = (obj) => {
        if (obj.get(["pageid"]) === pageInfo.id) {
            if (!obj.get("name")) {
                let char = getObj("character", obj.get("represents")); 
                if (!char) {return};
                obj.set({
                    name: char.get("name")
                })
            }
            log("Add " + obj.get("name"))
            let model = new Model(obj);
        }
    }

    const destroyGraphic = (obj) => {
        log("Destroy " + obj.get("name"))
        let model = ModelArray[obj.get("id")];
        if (model) {
            model.Destroy();
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
                log(state.DnD)

                break;
            case '!SpecialAbility':
                SpecialAbility(msg);
                break;
            case '!SetCondition':
                SetCondition(msg);
                break;
            case '!Spell':
                Spell(msg);
                break;
            case '!Attack':
                Attack(msg);
                break;
            case '!TokenInfo':
                TokenInfo(msg);
                break;
            case '!SavingThrow':
                SavingThrow(msg);
                break;
            case '!Initiative':
                Initiative(msg);
                break;
            case '!Check':
                Check(msg);
                break;
            case '!Compress':
                Compress(msg);
                break;
            case '!ClearState':
                ClearState();
                break;
            case '!ReloadTokens':
                ReloadTokens(msg);
                break;
            case '!UseItem':
                UseItem(msg);
                break;
            case '!MakeParty':
                MakeParty(msg);
                break;
            case '!ShowSpells':
                ShowSpells(msg);
                break;
            case '!DisplaySpellInfo':
                DisplaySpellInfo(msg);
                break;
            case '!AreaSpell':
                AreaSpell(msg);
                break;
            case '!Paladin':
                Paladin(msg);
                break;
            case '!Rename':
                Rename(msg);
                break;
            case '!WildShape2':
                WildShape2(msg);
                break;
            case '!StartCombat':
                StartCombat();
                break;
            case '!EndCombat':
                EndCombat();
                break;
            case '!EndConSpell':
                EndConSpell(msg);
                break;


        }
    };




    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('destroy:graphic',destroyGraphic);
        on('add:graphic',addGraphic);
        on('change:graphic',changeGraphic);
        on('change:campaign:playerpageid',changePage);
        on('change:campaign:turnorder',Combat);
    };
    on('ready', () => {
        log("===> DnD 5e <===");
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
