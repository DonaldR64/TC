const TC = (() => {
    const version = '2025.2.14';
    if (!state.TC) {state.TC = {}};

    const pageInfo = {name: "",page: "",gridType: "",scale: 0,width: 0,height: 0};
    const rowLabels = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN","AO","AP","AQ","AR","AS","AT","AU","AV","AW","AX","AY","AZ","BA","BB","BC","BD","BE","BF","BG","BH","BI"];

    let ModelArray = {}; 
    let activeModelID = "";
    let hexMap = {}; 
    let attackInfo;
    let testInfo;
    let checkModels;
    let nextStep;

    //Regular Hexagons, 'width' in Roll20 is 70
    let HexSize = 70/Math.sqrt(3);
    const HexInfo = {
        size: HexSize,
        pixelStart: {
            x: 35,
            y: HexSize,
        },
        width: 70,
        height: 2*HexSize,
        xSpacing: 70,
        ySpacing: 3/2 * HexSize,
        directions: {},
    }
    //to reduce overhead re calculating sqrts
    const M = {
        f0: Math.sqrt(3),
        f1: Math.sqrt(3)/2,
        f2: 0,
        f3: 3/2,
        b0: Math.sqrt(3)/3,
        b1: -1/3,
        b2: 0,
        b3: 2/3,
    };


    const DIRECTIONS = ["Northeast","East","Southeast","Southwest","West","Northwest"];

//fix below
    const SM = {
        blood: "status_red",
        blessing: "status_green",
        wounded: "status_Dying-2::2006644",
        diving: "status_lightning-helix",
        up1: "status_Green-01::2006603",
        up2: "status_Green-01::2006607",
        up3: "status_Green-01::2006611",
        up4: "status_Green-01::2006614",
        up5: "status_Green-01::2006615",
        morale: "status_blue", ///temp for fear immune
        aim: "status_blue", //temp
        cover: "status_blue",

    }; 


    const TurnMarkers = ["","https://s3.amazonaws.com/files.d20.io/images/361055772/zDURNn_0bbTWmOVrwJc6YQ/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055766/UZPeb6ZiiUImrZoAS58gvQ/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055764/yXwGQcriDAP8FpzxvjqzTg/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055768/7GFjIsnNuIBLrW_p65bjNQ/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055770/2WlTnUslDk0hpwr8zpZIOg/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055771/P9DmGozXmdPuv4SWq6uDvw/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055765/V5oPsriRTHJQ7w3hHRBA3A/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055767/EOXU3ujXJz-NleWX33rcgA/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055769/925-C7XAEcQCOUVN1m1uvQ/thumb.png?1695998303"];


    let outputCard = {title: "",subtitle: "",faction: "",body: [],buttons: [],};

    const Factions = {
        "New Antioch": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/428505453/sjIHroRj6jS1pvF1WKnLGQ/thumb.png?1739231545",
            "backgroundColour": "#2F4F4F",
            "titlefont": "Arial",
            "fontColour": "#FFFFFF",
            "borderColour": "#000000",
            "borderStyle": "5px ridge",
            "dice": "Antioch",

        },
       
        "Heretic Legion": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/429477660/liolC5NqztkkkZO7VAiCgA/thumb.png?1739845619",
            "backgroundColour": "#FFFFFF",
            "titlefont": "Arial",
            "fontColour": "#FF0000",
            "borderColour": "#FF0000",
            "borderStyle": "5px ridge",
            "dice": "Heretic",
        },
       



        "Neutral": {
            "image": "",
            "dice": "Neutral",
            "backgroundColour": "#FFFFFF",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#00FF00",
            "borderStyle": "5px ridge",
            "dice": "Neutral",
        },

    };

    let Keywords = {
        'Artificial': "This model is not of natural origin but is instead constructed from non-organic elements.",
        'Assault': "Ranged attacks made with weapons that have this Keyword do not prevent a model from charging during the same activation. A charge may only be made if a single ranged attack is made with a weapon with this Keyword, regardless of any other rules that the weapon might have.",
        'Blast (X)': "A weapon with BLAST (X) has an area of effect with a radius of hexes indicated by X. If this weapon targets a model, this radius is measured from the centre of that model’s base in all directions. If this weapon targets a point on the ground, this radius is measured from that point in all directions, including vertically. If the Attack ACTION with this weapon is successful, it hits every model within this radius that the target (either model or point) has line of sight to (i.e. not completely blocked by terrain).",
        "Consumable": "An item with this keyword can only be used once. After the battle, any items with this keyword that were used are lost.",
        "Critical": "When attacking with a weapon with this keyword, add +2 DICE (instead of 1) to any injury rolls the weapon causes if you roll a Critical (i.e. 12+) on the Action Success Chart",
        "Cumbersome": "Model always requires two hands to use this weapon, even if the model has the Keyword STRONG. A weapon with the Keyword CUMBERSOME ignores this restriction when benefitting from the Shield Combo rule.",
        "Elite": "The most senior and heroic models of the warband. They have different rules for experience and advancement, and often enjoy a different weapon, armour and equipment selection.",
        "Fear": "Enemies of models with this Keyword suffer -1 DICE in melee combat against this model. Some units are immune to this effect. Models that cause FEAR are not affected by FEAR themselves.",
        "Fire": "A model hit by a weapon with this Keyword suffers a BLOOD MARKER in addition to any other effects of the attack. The model suffers this BLOOD MARKER even if the attack has no other effects or is otherwise negated. Some equipment or abilities can negate the additional BLOOD MARKER caused by this Keyword.",
        "Fireteam": "This model is part of a Fireteam made up of two models. All models that are part of this Fireteam can be activated at the same time without the opponent getting their turn in between. They can take their ACTIONS in any order they wish, switching between the two models. Note that if the activation of either member of the Fireteam forcefully ends (due to a failed RISKY ACTION for example), it ends both Activations. Allies cannot be part of a Fireteam.",
        "Gas": "A model hit by a weapon with this Keyword suffers a BLOOD MARKER, in addition to any other effects of the attack. The model suffers this BLOOD MARKER even if the attack has no other effects or is otherwise negated. Some equipment or abilities can negate the additional BLOOD MARKER caused by this Keyword.",
        "Grenade": "Grenade-type weapons ignore penalties for cover and long range. They do not count towards the number of ranged weapons a model can carry and do not have to be held in your hand at all times. A model armed with grenades can use them as many times as they wish.",
        "Heavy": "If carrying a weapon, armour or equipment with this Keyword, the model cannot move/dash and shoot during its Activation, and the model cannot roll D6 and add it to the Charge move. A model can only carry one item with this Keyword.",
        "Infiltrator": " Models with this Keyword can be deployed anywhere on the table out of line of sight of any enemies, but at least 8 hexes away from the closest enemy. They are deployed after all other models without this Keyword. If any infiltrators cannot be deployed according to these restrictions then those models can always be placed in your deployment zone. If a scenario does not allow for infiltrators, deploy models with this Keyword during standard deployment as if they didn’t have this Keyword.",
        "Limit": "You can only purchase as many of this piece of equipment/weapon/armour as indicated by the number in parenthesis for your warband. If you find more via looting/exploration, you can break this limit.",
        "Shrapnel": "A model hit by a weapon with this Keyword suffers a BLOOD MARKER, in addition to any other effects of the attack. The model suffers this BLOOD MARKER even if the attack has no other effects or is otherwise negated. Some equipment or abilities can negate the additional BLOOD MARKER caused by this Keyword.",
        "Skirmisher": "When a model with this Keyword is targeted by an enemy’s Charge, it may immediately move D3 hexes in any direction, except into Melee Combat. A Skirmisher may also make this move when a charging enemy model would enter Melee Combat with it during a Charge that is not targeting it. After either of these moves is resolved, the Charge continues as normal toward the original target. These moves can only be taken if the Skirmisher is not in Melee Combat and only one such move may be taken per Charge",
        "Strong": " A model with this Keyword ignores the rules for weapons/armour/equipment with Keyword HEAVY, including not being limited to carrying only one HEAVY item (though other limitations apply as normal). In addition, it may use a single two-handed Melee weapon as a one-handed weapon.",
        "Tough": " If a TOUGH model would be taken Out Of Action, it is knocked Down instead. After a TOUGH model has been knocked Down in this way once, it can be taken Out of Action as normal.",
        "Targeted": " Weapon can use a Target Reticule to attack a Hex",



    }






    //los - Open - no effect beyond height, blocked - blocks los past the 1 hex, partial - blocks los once transitions to other terrain
    //obstacle - can be defended behind - so if combat occuring across then gets bonus - for buildings this is if one of 2 models is 'outside'
    //trying additive hills, although may want some immediately 2 high hills also 
    const TerrainInfo = {
        "#000000": {name: "Hill", height: 1,los: "Open",cover: false,difficult: false,dangerous: false,obstacle: false},
        "#ff0000": {name: "Trench",height: -1,los: "Blocked",cover: true,difficult: false,dangerous: false,obstacle: false},
        "#00ffff": {name: "Stream", height: 0,los: "Open",cover: true,difficult: true,dangerous: false,obstacle: false}, 
        "#00ff00": {name: "Woods",height: 2,los: "Partial",cover: true,difficult: true,dangerous: false,obstacle: false},
        "#6aa84f": {name: "Dead Woods",height: 1,los: "Partial",cover: true,difficult: true,dangerous: false,obstacle: false},

        "#b6d7a8": {name: "Scrub",height: 0,los: "Open",cover: true,difficult: false,dangerous: false,obstacle: false},
        "#fce5cd": {name: "Craters",height: 0,los: "Open",cover: true,difficult: true,dangerous: false,obstacle: false},
        "#0000ff": {name: "Swamp", height: 0,los: "Open",cover: true,difficult: true,dangerous: false,obstacle: false}, 

        "#ffff00": {name: "Rubble", height: 0,los: "Open",cover: true,difficult: true,dangerous: false,obstacle: false}, 
        "#9900ff": {name: "Ruins",height: 1,los: "Partial",cover: true,difficult: true,dangerous: false,obstacle: false},
        "#5b0f00": {name: "Building 1",height: 1,los: "Blocked",cover: true,difficult: true,dangerous: false,obstacle: true},
        //"": {name: "Building 2 ",height: 10,los: "Blocked",cover: true,difficult: true,dangerous: false,obstacle: true},
        //"": {name: "Building 3",height: 15,los: "Blocked",cover: true,difficult: true,dangerous: false,obstacle: true},


    };


    const MapTokenInfo = {
        "Hedge": {name: "Hedge",height: 0,los: "Open",cover: true,difficult: false,dangerous: false,obstacle: true},
        "Minefield": {name: "Minefield",height: 0,los: "Open",cover: false,difficult: true,dangerous: true,obstacle: false},
        "Barbed Wire": {name: "Barbed Wire",height: 0,los: "Open",cover: false,difficult: true,dangerous: true,obstacle: false},
        "Drums": {name: "Storage Drums",height: 0,los: "Open",cover: true,difficult: false,dangerous: false,obstacle: true},
        "Crater": {name: "Crater",height: 0,los: "Open",cover: true,difficult: true,dangerous: false,obstacle: false},
        "Boxes": {name: "Boxes",height: 0,los: "Open",cover: true,difficult: false,dangerous: false,obstacle: true},
        "Sandbag": {name: "Sandbags",height: 0,los: "Open",cover: true,difficult: false,dangerous: false,obstacle: true},
        "Barricade": {name: "Barricade",height: 0,los: "Open",cover: true,difficult: false,dangerous: false,obstacle: true},
    }





    //Classes
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
            let q = (M.b0 * x + M.b1 * y) / HexInfo.size;
            let r = (M.b3 * y) / HexInfo.size;

            let cube = new Cube(q,r,-q-r).round();
            return cube;
        };
        distance(b) {
            return Math.sqrt(((this.x - b.x) * (this.x - b.x)) + ((this.y - b.y) * (this.y - b.y)));
        }
    }

    class Offset {
        constructor(col,row) {
            this.col = col;
            this.row = row;
        }
        label() {
            let label = rowLabels[this.row] + (this.col + 1).toString();
            return label;
        }
        toCube() {
            let q = this.col - (this.row - (this.row&1)) / 2;
            let r = this.row;
            let cube = new Cube(q,r,-q-r);
            cube = cube.round(); 
            return cube;
        }
        toPoint() {
            let cube = this.toCube();
            let point = cube.toPoint();
            return point;
        }
    };

    class Cube {
        constructor(q,r,s) {
            this.q = q;
            this.r =r;
            this.s = s;
        }

        add(b) {
            return new Cube(this.q + b.q, this.r + b.r, this.s + b.s);
        }
        angle(b) {
            //angle between 2 hexes
            let origin = this.toPoint();
            let destination = b.toPoint();

            let x = Math.round(origin.x - destination.x);
            let y = Math.round(origin.y - destination.y);
            let phi = Math.atan2(y,x);
            phi = phi * (180/Math.PI);
            phi = Math.round(phi);
            phi -= 90;
            phi = Angle(phi);
            return phi;
        }        
        subtract(b) {
            return new Cube(this.q - b.q, this.r - b.r, this.s - b.s);
        }
        static direction(direction) {
            return HexInfo.directions[direction];
        }
        neighbour(direction) {
            //returns a hex (with q,r,s) for neighbour, specify direction eg. hex.neighbour("NE")
            return this.add(HexInfo.directions[direction]);
        }
        neighbours() {
            //all 6 neighbours
            let results = [];
            for (let i=0;i<DIRECTIONS.length;i++) {
                results.push(this.neighbour(DIRECTIONS[i]));
            }
            return results;
        }

        len() {
            return (Math.abs(this.q) + Math.abs(this.r) + Math.abs(this.s)) / 2;
        }
        distance(b) {
            return this.subtract(b).len();
        }
        lerp(b, t) {
            return new Cube(this.q * (1.0 - t) + b.q * t, this.r * (1.0 - t) + b.r * t, this.s * (1.0 - t) + b.s * t);
        }
        linedraw(b) {
            //returns array of hexes between this hex and hex 'b'
            var N = this.distance(b);
            var a_nudge = new Cube(this.q + 1e-06, this.r + 1e-06, this.s - 2e-06);
            var b_nudge = new Cube(b.q + 1e-06, b.r + 1e-06, b.s - 2e-06);
            var results = [];
            var step = 1.0 / Math.max(N, 1);
            for (var i = 0; i < N; i++) {
                results.push(a_nudge.lerp(b_nudge, step * i).round());
            }
            return results;
        }
        label() {
            let offset = this.toOffset();
            let label = offset.label();
            return label;
        }
        radius(rad) {
            //returns array of hexes in radius rad
            //Not only is x + y + z = 0, but the absolute values of x, y and z are equal to twice the radius of the ring
            let results = [];
            let h;
            for (let i = 0;i <= rad; i++) {
                for (let j=-i;j<=i;j++) {
                    for (let k=-i;k<=i;k++) {
                        for (let l=-i;l<=i;l++) {
                            if((Math.abs(j) + Math.abs(k) + Math.abs(l) === i*2) && (j + k + l === 0)) {
                                h = new Cube(j,k,l);
                                results.push(this.add(h));
                            }
                        }
                    }
                }
            }
            return results;
        }

        ring(radius) {
            let results = [];
            let b = new Cube(-1 * radius,0,1 * radius);  //start at west 
            let cube = this.add(b);
            for (let i=0;i<6;i++) {
                //for each direction
                for (let j=0;j<radius;j++) {
                    results.push(cube);
                    cube = cube.neighbour(DIRECTIONS[i]);
                }
            }
            return results;
        }

        round() {
            var qi = Math.round(this.q);
            var ri = Math.round(this.r);
            var si = Math.round(this.s);
            var q_diff = Math.abs(qi - this.q);
            var r_diff = Math.abs(ri - this.r);
            var s_diff = Math.abs(si - this.s);
            if (q_diff > r_diff && q_diff > s_diff) {
                qi = -ri - si;
            }
            else if (r_diff > s_diff) {
                ri = -qi - si;
            }
            else {
                si = -qi - ri;
            }
            return new Cube(qi, ri, si);
        }
        toPoint() {
            let x = (M.f0 * this.q + M.f1 * this.r) * HexInfo.size;
            x += HexInfo.pixelStart.x;
            let y = 3/2 * this.r * HexInfo.size;
            y += HexInfo.pixelStart.y;
            let point = new Point(x,y);
            return point;
        }
        toOffset() {
            let col = this.q + (this.r - (this.r&1)) / 2;
            let row = this.r;
            let offset = new Offset(col,row);
            return offset;
        }


     
    };

    class Hex {
        constructor(point) {
            this.centre = point;
            let offset = point.toOffset();
            this.offset = offset;
            this.cube = offset.toCube();
            this.label = offset.label();
            this.terrain = [];
            this.terrainIDs = [];
            this.modelIDs = [];
            this.elevation = 0;
            this.height = 0;
            this.los = "Open";
            this.cover = false;
            this.difficult = false;
            this.dangerous = false;
            this.obstacle = false;
            hexMap[this.label] = this;

        }
    }

    class Model {
        constructor(tokenID) {
            let token = findObjs({_type:"graphic", id: tokenID})[0];
            let char = getObj("character", token.get("represents")); 
            let attributeArray = AttributeArray(char.id);
            let faction = attributeArray.faction;
            let charName = char.get("name");
            let player;
            if (faction === "New Antioch" || faction === "Trench Pilgrims" || faction === "Iron Sultanate") {
                player = 0;
            } else {
                player = 1;
            }
            if (state.TC.factions[player] === "") {
                state.TC.factions[player] = faction
            }

            let size = "Normal";
            if (token.get("width") > 100) {
                size = "Large";
            }


            let location = new Point(token.get("left"),token.get("top"));
            let cube = location.toCube();
            let offset = location.toOffset();
            let hexLabel = offset.label();

            //abilities
            let move = parseInt(attributeArray.move);
            let moveType = attributeArray.movetype;
            let rangedBonus = parseInt(attributeArray.ranged);
            let meleeBonus = parseInt(attributeArray.melee);
            let baseArmour = parseInt(attributeArray.basearmour) || 0;
            let armour = baseArmour;

            let words = attributeArray.keywords || " ";
            words = words.split(",");
            let keywords = [];
            _.each(words,word => {
                if (word !== undefined && word !== " " && word !== "") {
                    keywords.push(word);
                }
            })
            
            let weaponArray = {};
            let types = ["melee","ranged"];
            for (let j=0;j<types.length;j++) {
                let type = types[j];
                for (let i=1;i<4;i++) {
                    let attName = type + i;
                    let wname = attributeArray[attName+"name"];
                    let wequipped = attributeArray[attName+"equipped"];
                    if (wequipped !== "Equipped") {continue};
                    if (!wname || wname === "" || wname === undefined || wname === " ") {continue};
                    let wtype = attributeArray[attName+"type"];       
                    let wrange = parseInt(attributeArray[attName+"range"]) || 0;
                    let wmodifiers = attributeArray[attName+"modifiers"] || " ";
                    wmodifiers = wmodifiers.split(",");
                    _.each(wmodifiers,mod => {
                        mod = mod.trim();
                        return mod;
                    })
                    let wkeywords = attributeArray[attName+"keywords"] || " ";
                    let wsound = attributeArray[attName+"sound"] || "";
                    let wfx = attributeArray[attName+"fx"] || "";

                    if (wname.includes("Satchel") && charName.includes("Combat Engineer")) {
                        wkeywords.replace("Heavy","");
                    }
                    let attacks = 1;
                    _.each(wmodifiers,mod => {
                        if (mod.includes("Attacks")) {
                            attacks = mod.replace(/\D/g,'');
                        }
                    })

                    wkeywords = wkeywords.split(",");
                    let wk2 = [];
                    _.each(wkeywords,key => {
                        if (key !== undefined && key !== " " && key !== "") {
                            key = key.trim();
                            keywords.push(key);
                            wk2.push(key);
                        }
                    })
                    wkeywords = wk2.toString();



                    let weapon = {
                        name: wname,
                        number: i,
                        type: wtype,
                        range: wrange,
                        attacks: attacks,
                        modifiers: wmodifiers, //array
                        keywords: wkeywords, //string
                        sound: wsound,
                        fx: wfx,
                    }
                    if (weaponArray[type]) {
                        weaponArray[type].push(weapon);
                    } else {
                        weaponArray[type]= [weapon];
                    }
                    
                }
            }
log(weaponArray)

            for (let i=1;i<21;i++) {
                let attName = "spec" + i + "Name";
                let attText = "spec" + i + "Text";

                AttributeSet(char.id,attName,"");
                AttributeSet(char.id,attText,"");
            }

            let specNum = 1;
            let equipmentArray = [];
            for (let i=1;i<6;i++) {
                let name = attributeArray["equip" + i + "name"] || "";
                let info = attributeArray["equip" + i + "info"] || "";
                
                if (name !== undefined && name !== " " && name !== "") {
                    equipmentArray.push(name);
                    if (name === "Trench Shield") {
                        armour -= 1;
                    }
                    if (name === "Standard Armour") {
                        armour -= 1;
                    }
                    if (name === "Reinforced Armour") {
                        armour -= 2;
                    }
                    if (name === "Light Machine Armour") {
                        armour -= 2;
                    }
                    if (name === "Machine Armour") {
                        armour -= 3;
                    }
                    if (name === "Engineer Body Armour") {
                        armour -= 2;
                    }






                    if (Keywords[name]) {
                        keywords.push(name);
                    } else {
                        let attName = "spec" + specNum + "Name";
                        let attText = "spec" + specNum + "Text";
                        AttributeSet(char.id,attName,name);
                        AttributeSet(char.id,attText,info);
                        specNum++;
                    }
                }
            }

            armour = Math.max(-3,armour) || 0;
            AttributeSet(char.id,"armour",armour);

            let abilityArray = [];
            for (let i=1;i<6;i++) {
                let name = attributeArray["ability" + i + "name"] || "";
                let info = attributeArray["ability" + i + "info"] || "";
                if (name !== undefined && name !== " " && name !== "") {
                    abilityArray.push(name);
                    if (Keywords[name]) {
                        keywords.push(name);
                    } else {
                        let attName = "spec" + specNum + "Name";
                        let attText = "spec" + specNum + "Text";
                        AttributeSet(char.id,attName,name);
                        AttributeSet(char.id,attText,info);
                        specNum++;
                    }
                }
            }

            //eliminate duplicates from keywords and trim spaces
            keywords = keywords.map(e => {
                e = e.replace(/[0-9]/g, "(X)")
                return e.trim();
            });



            keywords = [...new Set(keywords)];

            let abilities = abilityArray.map(e => {
                return e.trim();
            });
            abilities = [...new Set(abilities)];

            let equipment = equipmentArray.map(e => {
                return e.trim();
            });
            equipment = [...new Set(equipment)];






            //update character sheet
            for (let i=0;i<keywords.length;i++) {
                let keyword = keywords[i];
                let info = Keywords[keyword];
                if (info) {
                    let attName = "spec" + specNum + "Name";
                    let attText = "spec" + specNum + "Text";
                    AttributeSet(char.id,attName,keyword);
                    AttributeSet(char.id,attText,info);
                    specNum++;
                }
            }

            keywords = keywords.toString();

            let heavy = false;
            if (keywords.includes("Heavy")) {
                let exclusions = ["Strong","Assault Drill"];
                _.each(exclusions,e => {
                    if (keywords.includes(e) || abilityArray.includes(e)) {
                        heavy = false;
                    } else {
                        heavy = true;
                    }
                })
            }






            this.name = token.get("name");
            this.id = tokenID;
            this.charID = char.id;
            this.charName = charName;

            this.player = player;
            this.faction = faction;
            this.location = location;
            this.cube = cube;
            this.hexLabel = hexLabel;

            this.oldLevel = 0;

            this.move = move;
            this.moveType = moveType;
            this.heavyMove = heavy;
            this.keywords = keywords;
            this.rangedBonus = rangedBonus;
            this.meleeBonus = meleeBonus;
            this.baseArmour = baseArmour;
            this.armour = armour;


            //this.armour = armour;

            this.size = size;

            this.weaponArray = weaponArray;
            this.equipment = equipment.toString() || " ";
            this.abilities = abilities.toString() || " ";

            this.token = token;
            
            this.actionsTaken = [];
            this.extraDice = 0; //used for tests
            this.diceRolled = 2; //used for tests, default is 2
            this.injuryNote = "";


            ModelArray[tokenID] = this;

            hexMap[hexLabel].modelIDs.push(token.id);
            














        }


        ChangeMarker(type,number) {
            //number to be +X or -X
            if (!number) {number = 1};
            let bar,dot;
            if (type.includes("Blood")) {
                bar = "bar3_value";
                dot = SM.blood;
            } else if (type === "Blessing") {
                bar = "bar1_value";
                dot = SM.blessing;
            }
            let current = parseInt(this.token.get(bar));
            current = Math.min(Math.max(current + number,0),6);
            this.token.set(bar,current);
            if (current === 0) {
                this.token.set(dot,false);
            } else {
                this.token.set(dot,current);
            }
        }


        Injury(type,blood) {
            if (!blood) {blood = 1};
            if (type === "Minor Hit" || type === "Down") {
                this.ChangeMarker("Blood",blood);
            }
            if (type === "Down") {
                this.token.set({
                    tint_color: "#FF0000",
                })
            }
            if (type === "Out of Action") {
return;
                this.token.set({
                    status_dead: true,
                    layer: "map",
                })
                //remove from ModelArray
                //adjust counters
                //add info to end stuff for survival etc
            }
        }

        Stand() {
            this.token.set({
                tint_color: "transparent",
            })
        }













    }


    const ModelHeight = (model) => {
        let hex = hexMap[model.hexLabel];
        let ele = Math.max(hex.elevation,0);
        let level = 0;
        let symbol = "";
        for (let i=1;i<6;i++) {
            let sym = "up" + i;
            if (model.token.get(SM[sym]) === true) {
                level = i;
                symbol = SM[sym];
                break;
            }
        }
        let height = level + ele;

        let info = {
            heightSymbol: symbol,
            height: height,
            level: level,
            elevation: ele,
        }

log(info)

        return info;
    }












    //Various Functions
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

    const stringGen = () => {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 6; i++) {
            text += possible.charAt(Math.floor(randomInteger(possible.length)));
        }
        return text;
    };

    const findCommonElements = (arr1,arr2) => {
        //iterates through array 1 and sees if array 2 has any of its elements
        //returns true if the arrays share an element
        return arr1.some(item => arr2.includes(item));
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


    //Retrieve Values from Character Sheet Attributes
    const Attribute = (character,attributename) => {
        //Retrieve Values from Character Sheet Attributes
        let attributeobj = findObjs({type:'attribute',characterid: character.id, name: attributename})[0]
        let attributevalue = "";
        if (attributeobj) {
            attributevalue = attributeobj.get('current');
        }
        return attributevalue;
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

    const DeleteAttribute = (characterID,attributeName) => {
        let attributeObj = findObjs({type:'attribute',characterid: characterID, name: attributeName})[0]
        if (attributeObj) {
            attributeObj.remove();
        }
    }




    const ButtonInfo = (phrase,action,colour) => {
        let info = {
            phrase: phrase,
            action: action,
            colour: colour,
        }
        outputCard.buttons.push(info);
    };

    const SetupCard = (title,subtitle,faction) => {
        outputCard.title = title;
        outputCard.subtitle = subtitle;
        outputCard.faction = faction;
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


    const getAbsoluteControlPt = (controlArray, centre, w, h, rot, scaleX, scaleY) => {
        let len = controlArray.length;
        let point = new Point(controlArray[len-2], controlArray[len-1]);
        //translate relative x,y to actual x,y 
        point.x = scaleX*point.x + centre.x - (scaleX * w/2);
        point.y = scaleY*point.y + centre.y - (scaleY * h/2);
        point = RotatePoint(centre.x, centre.y, rot, point);
        return point;
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

    const RotatePoint = (cX,cY,angle, p) => {
        //cx, cy = coordinates of the centre of rotation
        //angle = clockwise rotation angle
        //p = point object
        let s = Math.sin(angle);
        let c = Math.cos(angle);
        // translate point back to origin:
        p.x -= cX;
        p.y -= cY;
        // rotate point
        let newX = p.x * c - p.y * s;
        let newY = p.x * s + p.y * c;
        // translate point back:
        p.x = Math.round(newX + cX);
        p.y = Math.round(newY + cY);
        return p;
    }


    const PrintCard = (id) => {
        let output = "";
        if (id) {
            let playerObj = findObjs({type: 'player',id: id})[0];
            let who = playerObj.get("displayname");
            output += `/w "${who}"`;
        } else {
            output += "/desc ";
        }

        if (!outputCard.faction || !Factions[outputCard.faction]) {
            outputCard.faction = "Neutral";
        }

        //start of card
        output += `<div style="display: table; border: ` + Factions[outputCard.faction].borderStyle + " " + Factions[outputCard.faction].borderColour + `; `;
        output += `background-color: #EEEEEE; width: 100%; text-align: centre; `;
        output += `border-radius: 1px; border-collapse: separate; box-shadow: 5px 3px 3px 0px #aaa;;`;
        output += `"><div style="display: table-header-group; `;
        output += `background-color: ` + Factions[outputCard.faction].backgroundColour + `; `;
        output += `background-image: url(` + Factions[outputCard.faction].image + `), url(` + Factions[outputCard.faction].image + `); `;
        output += `background-position: left,right; background-repeat: no-repeat, no-repeat; background-size: contain, contain; align: centre,centre; `;
        output += `border-bottom: 2px solid #444444; "><div style="display: table-row;"><div style="display: table-cell; padding: 2px 2px; text-align: centre;"><span style="`;
        output += `font-family: ` + Factions[outputCard.faction].titlefont + `; `;
        output += `font-style: normal; `;

        let titlefontsize = "1.4em";
        if (outputCard.title.length > 12) {
            titlefontsize = "1em";
        }

        output += `font-size: ` + titlefontsize + `; `;
        output += `line-height: 1.2em; font-weight: strong; `;
        output += `color: ` + Factions[outputCard.faction].fontColour + `; `;
        output += `text-shadow: none; `;
        output += `">`+ outputCard.title + `</span><br /><span style="`;
        output += `font-family: Arial; font-variant: normal; font-size: 13px; font-style: normal; font-weight: bold; `;
        output += `color: ` +  Factions[outputCard.faction].fontColour + `; `;
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
                out += `"> <div style='text-align: centre; display:block;'>`;
                out += line + " ";

                for (let q=0;q<num;q++) {
                    let info = outputCard.inline[inline];
                    out += `<a style ="background-color: ` + Factions[outputCard.faction].backgroundColour + `; padding: 5px;`
                    out += `color: ` + Factions[outputCard.faction].fontColour + `; text-align: centre; vertical-align: middle; border-radius: 5px;`;
                    out += `border-color: ` + Factions[outputCard.faction].borderColour + `; font-family: Tahoma; font-size: x-small; `;
                    out += `"href = "` + info.action + `">` + info.phrase + `</a>`;
                    inline++;                    
                }
                out += `</div></span></div></div>`;
            } else {
                line = line.replace(/\[hr(.*?)\]/gi, '<hr style="width:95%; align:centre; margin:0px 0px 5px 5px; border-top:2px solid $1;">');
                line = line.replace(/\[\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})\](.*?)\[\/[\#]\]/g, "<span style='color: #$1;'>$2</span>"); // [#xxx] or [#xxxx]...[/#] for color codes. xxx is a 3-digit hex code
                line = line.replace(/\[[Uu]\](.*?)\[\/[Uu]\]/g, "<u>$1</u>"); // [U]...[/u] for underline
                line = line.replace(/\[[Bb]\](.*?)\[\/[Bb]\]/g, "<b>$1</b>"); // [B]...[/B] for bolding
                line = line.replace(/\[[Ii]\](.*?)\[\/[Ii]\]/g, "<i>$1</i>"); // [I]...[/I] for italics
                let lineBack = (i % 2 === 0) ? "#D3D3D3" : "#EEEEEE";
                out += `<div style="display: table-row; background: ` + lineBack + `;; `;
                out += `"><div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                out += `"><span style="line-height: normal; color: #000000; `;
                out += `"> <div style='text-align: centre; display:block;'>`;
                out += line + `</div></span></div></div>`;                
            }
            output += out;
        }

        //buttons
        if (outputCard.buttons.length > 0) {
            for (let i=0;i<outputCard.buttons.length;i++) {
                if (i>0) {
                    output += '<hr style="width:95%; align:centre; margin:0px 0px 5px 5px; border-top:2px solid $1;">';
                }
                let out = "";
                let info = outputCard.buttons[i];
                let borderColour = info.colour ||  Factions[outputCard.faction].borderColour;

                out += `<div style="display: table-row; background: #FFFFFF;; `;
                out += `"><div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                out += `"><span style="line-height: normal; color: #000000; `;
                out += `"> <div style='text-align: centre; display:block;'>`;
                out += `<a style ="background-color: ` + Factions[outputCard.faction].backgroundColour + `; padding: 5px;`
                out += `color: ` + Factions[outputCard.faction].fontColour + `; text-align: centre; vertical-align: middle; border-radius: 5px;`;
                out += `border-color: ` + borderColour + `; font-family: Tahoma; font-size: x-small; `;
                out += `"href = "` + info.action + `">` + info.phrase + `</a></div></span></div></div>`;
                output += out;
            }
        }

        output += `</div></div><br />`;
        sendChat("",output);
        outputCard = {title: "",subtitle: "",faction: "",body: [],buttons: [],};
    }

    //related to building hex map
    const LoadPage = () => {
        //build Page Info and flesh out Hex Info
        pageInfo.page = getObj('page', Campaign().get("playerpageid"));
        pageInfo.name = pageInfo.page.get("name");
        pageInfo.scale = pageInfo.page.get("snapping_increment");
        pageInfo.width = pageInfo.page.get("width") * 70;
        pageInfo.height = pageInfo.page.get("height") * 70;

        HexInfo.directions = {
            "Northeast": new Cube(1, -1, 0),
            "East": new Cube(1, 0, -1),
            "Southeast": new Cube(0, 1, -1),
            "Southwest": new Cube(-1, 1, 0),
            "West": new Cube(-1, 0, 1),
            "Northwest": new Cube(0, -1, 1),
        }

    }

    const BuildMap = () => {
        let startTime = Date.now();
        hexMap = {};
        //builds a hex map, assumes Hex(V) page setting
        let halfToggleX = 35;
        let rowLabelNum = 0;
        let columnLabel = 1;

        let startX = HexInfo.pixelStart.x;
        let startY = HexInfo.pixelStart.y;

        for (let j = startY; j <= pageInfo.height;j+=HexInfo.ySpacing){
            for (let i = startX;i<= pageInfo.width;i+=HexInfo.xSpacing) {
                let point = new Point(i,j);     
                let hex = new Hex(point);
                columnLabel++;
            }
            startX += halfToggleX;
            halfToggleX = -halfToggleX;
            rowLabelNum += 1;
            columnLabel = 1
        }

        //terrain
        AddTerrain();    
        AddTokens();        
        let elapsed = Date.now()-startTime;
        log("Hex Map Built in " + elapsed/1000 + " seconds");
    };

    const AddTerrain = () => {
        let TerrainArray = {};
        //first look for graphic lines outlining hills etc
        let paths = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "map"});
        _.each(paths,pathObj => {
            let vertices = [];
            toFront(pathObj);
            let colour = pathObj.get("stroke").toLowerCase();
            let t = TerrainInfo[colour];
            if (!t) {return};    
            let points = JSON.parse(pathObj.get("points"));
            let centre = new Point(pathObj.get("x"), pathObj.get("y"));
    
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


            let id = stringGen();
            if (TerrainArray[id]) {
                id += stringGen();
            }
            let info = {
                name: t.name,
                id: id,
                vertices: vertices,
                centre: centre,
                height: t.height,
                cover: t.cover,
                los: t.los,
                difficult: t.difficult,
                dangerous: t.dangerous,
                obstacle: t.obstacle,
            };
            TerrainArray[id] = info;


        });

        //add tokens on map eg woods, crops
        let mta = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "map",});
        mta.forEach((token) => {
            let truncName = token.get("name").replace(/[0-9]/g, '');
            truncName = truncName.trim();
            let t = MapTokenInfo[truncName];
            if (!t) {return};
            let vertices = TokenVertices(token);
            let centre = new Point(token.get('left'),token.get('top'));
            let id = stringGen();
            if (TerrainArray[id]) {
                id += stringGen();
            }
            let info = {
                name: t.name,
                id: id,
                vertices: vertices,
                centre: centre,
                height: t.height,
                cover: t.cover,
                los: t.los,
                difficult: t.difficult,
                dangerous: t.dangerous,
                obstacle: t.obstacle,
            };
            TerrainArray[id] = info;
        });

        //now run through hexMap and see if a hex fits into any of terrain above
        let terrainKeys = Object.keys(TerrainArray);
        let tNum = terrainKeys.length;
        let mapKeys = Object.keys(hexMap);
        const burndown = () => {
            let mapKey = mapKeys.shift();
            if (mapKey){
                let hex = hexMap[mapKey];
                let c = hex.centre;
                _.each(terrainKeys,terrainKey => {
                    let polygon = TerrainArray[terrainKey];
                    if (hex.terrain.includes(polygon.name)) {return};
                    let pts = XHEX(c);
                    let num = 0;
                    let threshold = 1;
                    if (polygon.name.includes("Building") === false) {
                        threshold = 2;
                    }
                    _.each(pts,pt => {
                        let check = pointInPolygon(pt,polygon.vertices);
                        if (check === true) {num++};
                    })

                    if (num > threshold) {
                        //hex is in the terrain polygon
                        hex.terrainIDs.push(polygon.id)
                        hex.terrain.push(polygon.name);
                        if (polygon.los.includes("Blocked")) {
                            hex.los = "Blocked";
                        };
                        if (polygon.los === "Partial" && hex.los.includes("Blocked") === false) {
                            hex.los = "Partial"
                        }
                        if (polygon.cover === true) {hex.cover = true};
                        if (polygon.difficult === true) {hex.difficult = true};
                        if (polygon.dangerous === true) {hex.dangerous = true};
                        if (polygon.obstacle === true) {hex.obstacle = true};
                        if (polygon.height !== 0) {
                            if (polygon.name.includes("Hill")) {
                                hex.elevation = hex.elevation + polygon.height;
                            } else if (polygon.name.includes("Trench")) {
                                hex.elevation = hex.elevation - 1;
                            } else {
                                hex.height = Math.max(hex.elevation + polygon.height,hex.height);
                            }
                        }
                    };
                });
                if (hex.terrain.length === 0) {hex.terrain = ["Open Ground"]};
                hexMap[mapKey] = hex;
                setTimeout(burndown,0);
            }
        }
        burndown();
        log(tNum + " Terrain Items added")
    }




    const TokenVertices = (tok) => {
      //Create corners with final being the first
      let corners = []
      let tokX = tok.get("left")
      let tokY = tok.get("top")
      let w = tok.get("width")
      let h = tok.get("height")
      let rot = tok.get("rotation") * (Math.PI/180)
      //define the four corners of the target token as new points
      //also rotate those corners around the target tok centre
      corners.push(RotatePoint(tokX, tokY, rot, new Point( tokX-w/2, tokY-h/2 )))     //Upper left
      corners.push(RotatePoint(tokX, tokY, rot, new Point( tokX+w/2, tokY-h/2 )))     //Upper right
      corners.push(RotatePoint(tokX, tokY, rot, new Point( tokX+w/2, tokY+h/2 )))     //Lower right
      corners.push(RotatePoint(tokX, tokY, rot, new Point( tokX-w/2, tokY+h/2 )))     //Lower left
      corners.push(RotatePoint(tokX, tokY, rot, new Point( tokX-w/2, tokY-h/2 )))     //Upper left
      return corners
    }


     
    const AddTokens = () => {
        //add tokens on token layer
        ModelArray = {};
        //create an array of all tokens
        let start = Date.now();
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "objects",
        });

        let c = tokens.length;
        let s = (1===c?'':'s');     
        
        tokens.forEach((token) => {
            let character = getObj("character", token.get("represents"));           
            if (character === null || character === undefined) {
                return;
            };
            let model = new Model(token.id);
            model.name = token.get("name");
        


        });



        let elapsed = Date.now()-start;
        log(`${c} token${s} checked in ${elapsed/1000} seconds - ` + Object.keys(ModelArray).length + " placed in Model Array");



    }






    const translatePoly = (poly) => {
        //translate points in a path2 polygon to map points
        let points = JSON.parse(poly.get("points"));
        let c = new Point(poly.get("x"),poly.get("y")); //actual point on map
        //find dimensions of path2 'box'
        let minX = Infinity;
        let minY = Infinity;
        let maxX = 0;
        let maxY = 0;
        _.each(points,point => {
            minX = Math.min(minX,point[0]);
            minY = Math.min(minY,point[1]);
            maxX = Math.max(maxX,point[0]);
            maxY = Math.max(maxY,point[1]);
        });
    //log(minX + " , " + minY)
    //log(maxX + " , " + maxY)
    
        let dx = Math.abs(maxX - minX)/2;
        let dy = Math.abs(maxY - minY)/2;
    //log("Deltas: " + dx + " , " + dy)
    
        let topLeft = new Point(c.x - dx, c.y - dy);
        let zero = new Point(topLeft.x + Math.abs(minX),topLeft.y + Math.abs(minY));
    //log("Top Left: " + topLeft)
    //log("Zero Point: " + zero) 

        let mapPoints = [];
        _.each(points,point => {
            let x = point[0] + zero.x;
            let y = point[1] + zero.y
            mapPoints.push(new Point(x,y));
        })
    
        return mapPoints;
    }
    
    const PolyHexes = (mapPoints) => {
        //which hexes are in the polygon
        let labels = [];
        _.each(hexMap,hex => {
            let check = pointInPolygon(hex.centre,mapPoints);
            if (check === true) {
                labels.push(hex.label);
            }
        })
        return labels;
    }


    const pointInPolygon = (point,vertices) => {
        //evaluate if point is in the polygon
        collision = false
        len = vertices.length - 1
        for (let c=0;c<len;c++) {
            vc = vertices[c];
            vn = vertices[c+1]
            if (((vc.y >= point.y && vn.y < point.y) || (vc.y < point.y && vn.y >= point.y)) && (point.x < (vn.x-vc.x)*(point.y-vc.y)/(vn.y-vc.y)+vc.x)) {
                collision = !collision
            }
        }
        return collision
    }


    const XHEX = (point) => {
        //makes a small group of points for checking around centre
        let points = [point];
        points.push(new Point(point.x - 20,point.y - 20));
        points.push(new Point(point.x + 20,point.y - 20));
        points.push(new Point(point.x + 20,point.y + 20));
        points.push(new Point(point.x - 20,point.y + 20));
        return points;
    }



    //game functions
    const ClearState = (msg) => {
        //clear arrays
        ModelArray = {};
        //clear token info
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "objects",
        })
       

        tokens.forEach((token) => {
            if (token.get("name").includes("Objective") === true) {return};
    
            token.set({
                name: "",
                tint_color: "transparent",
                aura1_color: "transparent",
                aura1_radius: 0,
                aura2_color: "transparent",
                aura2_radius: 0,
                showplayers_bar1: true,
                showname: true,
                showplayers_aura1: true,
                bar3_value: 0,
                bar3_max: "",
                bar2_value: 0,
                bar2_max: "",
                bar1_value: 0,
                bar1_max: "",
                gmnotes: "",
                statusmarkers: "",
                tooltip: "",
                rotation: 0,
            });                
        });
    
        state.TC = {
            factions: ["",""],
            players: {},
            playerInfo: [[],[]],
            turn: 0,
            gameLength: 6,
            scenario: 1,
            firstPlayer: -1,
            models: [],
            shaken: [false,false], //used to track if force is currently shaken
            broken: [false,false], //used to track if force has failed a morale test
        }
        
        
        //CleanMap("All");
        //BuildMap();
        sendChat("","Cleared State/Arrays");
    }


    const CleanMap = (type) => {
        let list = [""];
        if (type !== "All") {
            list = [type];
        } 

        let mta = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "map",});
        _.each(mta,token => {
            let name = token.get("name")
            if (list.includes(name)) {
                token.remove();
            }
        })
    }

    const NextTurn = () => {
        let models = [0,0];
        let downModels = [0,0];
        _.each(ModelArray,model => {
            models[model.player]++;
            if (model.token.get("tint_color") === "#FF0000") {
                downModels[model.player]++;
            }
        })


        if (state.TC.turn === 0) {
            //start of game stuff
            //save models for end of turn references
            state.TC.models = models;
        
            _.each(ModelArray,model => {
                if (model.equipment.includes("Shovel") && ModelHeight(model).level === 0) {
                    model.set(SM.cover,true);
                }
            })




        } else {
            //check if any remaining unactivated models
            let unactivated = [];
            _.each(ModelArray,model => {
                if (model.token.get("aura1_color") === "#00FF00") {
                    unactivated.push(model);
                }
            })
            if (unactivated.length > 0) {
                sendPing(unactivated[0].token.get("left"),unactivated[0].token.get("top"),Campaign().get("playerpageid"),null,true);
                sendChat("","At least one model has not activated");
                return;
            }

            //check # of models vs starting
            for (let i=0;i<2;i++) {
                state.TC.shaken[i] = false;
                let m = (state.TC.models[i] - models[i]) + downModels[i]; //dead + down models
                if (m > Math.round(state.TC.models[i]/2)) {
                    SetupCard("Morale Test","",state.TC.factions[i]);
                    let results = ActionSuccess(0);    
                    outputCard.body.push(results.line2);                 
                    if (results.success === false) {
                        if (state.TC.broken[i] === true) {
                            outputCard.body.push("The " + state.TC.factions[i] + " Warband Routs from the Field");
                        } else {
                            state.TC.shaken[i] = true;
                            state.TC.broken[i] = true;
                            outputCard.body.push("The " + state.TC.factions[i] + " Warband is Shaken");
                            outputCard.body.push("Actions taken by models in a Shaken Warband are considered RISKY ACTIONS.");
                            outputCard.body.push("After one turn, the warband recovers to its normal state and is no longer considered Shaken. If it fails a Morale test again (shaken or not), it flees as standard.");
                            outputCard.body.push("The Warband may also choose to strategically retreat...");
                        }
                    } else {
                        outputCard.body.push("Morale Test Succeeds");
                    }
                    PrintCard();
                }
            }
        }

        activeModelID = "";
        state.TC.turn++;
        let currentTurn = state.TC.turn;


        //check for end of game



        let firstPlayer,line0,line1,blurb;
        let fewestModels = false;
        if (models[0] < models[1]) {
            firstPlayer = 0;
            fewestModels = true;
        } else if (models[1] < models[0]) {
            firstPlayer = 1;
            fewestModels = true;
        } else {
            let roll0 = randomInteger(6);
            let roll1 = randomInteger(6);
            line0 = state.TC.factions[0] + ": " + DisplayDice(roll0,Factions[state.TC.factions[0]].dice,24);
            line1 = state.TC.factions[1] + ": " + DisplayDice(roll1,Factions[state.TC.factions[1]].dice,24);
            if (roll0 < roll1) {
                firstPlayer = 1;
            } else if (roll0 > roll1) {
                firstPlayer = 0;
            } else {
                firstPlayer = (state.TC.firstPlayer === 0) ? 1:0;
            }
        }
        state.TC.firstPlayer = firstPlayer;
        if (fewestModels === true) {
            blurb = "Fewest Models";
        } else {
            blurb = "Roll Off";
        }
        SetupCard("Turn " + currentTurn,blurb,state.TC.factions[firstPlayer]);
        outputCard.body.push("First Activation goes to " + state.TC.factions[firstPlayer]);
        if (fewestModels === false) {
            outputCard.body.push(line0);
            outputCard.body.push(line1);
        }
        PrintCard();



        _.each(ModelArray,model => {
            //reset things
            model.actionsTaken = [];
            model.token.set("aura1_color","#00FF00");
            model.token.set(SM.diving,false);
            model.token.set(SM.morale,false);
            model.token.set(SM.aim,false);
        })





    }

    const UpDown = (msg) => {
        if (!msg) {return};
        let Tag = msg.content.split(";");
        let id = Tag[1];
        if (!id) {return};
        let direction = Tag[2];
        let model = ModelArray[id];
        let maxHeight = hexMap[model.hexLabel].height - hexMap[model.hexLabel].elevation;
log(maxHeight)        
        let info = ModelHeight(model);
        let level = info.level;
        if (info.heightSymbol !== "") {
            model.token.set(info.heightSymbol,false);
        }
        if (direction === "+") {
            level = Math.max(0,Math.min(level + 1,maxHeight));
        } else {
            level = Math.max(0,Math.min(level - 1,maxHeight));
        }
log("Level: " + level)
        if (level > 0) {
            let marker = SM["up" + level]
log(marker)
            model.token.set(marker,true);
        }
    }









    const GameInfo = () => {
        //use this to convey info re turn, objectives etc
        SetupCard("Game Info","","Neutral");
        outputCard.body.push("Turn " + state.TC.turn + " of " + state.TC.gameLength);
        outputCard.body.push("[hr]");
        let downModels = [0,0];
        let models = [0,0];
        _.each(ModelArray,model => {
            models[model.player]++;
            if (model.token.get("tint_color") === "#FF0000") {
                downModels[model.player]++;
            }
        })
        let breakpoints = [Math.round(state.TC.models[0]/2),Math.round(state.TC.models[1]/2)];

        for (let i=0;i<2;i++) {
            let outModels = state.TC.models[i] - models[i];
            let breakpoint = Math.round(state.TC.models[i]/2);
            outputCard.body.push("[U]" + state.TC.factions[i] + "[/u]");
            let breakable = false;
            let active = models[i] - downModels[i];
            let m = (state.TC.models[i] - models[i]) + downModels[i];
            if (m > breakpoint) {breakable = true};
            if (state.TC.broken[i] === true) {
                outputCard.body.push("Warband is [#FF0000]Broken[/#] and will Rout if they fail another Morale Test");
                if (state.TC.shaken[i] === true) {
                    outputCard.body.push("The Warband is also currently Shaken and any actions are considered RISKY ACTIONS");
                }
            } else if (breakable === true) {
                outputCard.body.push("Warband may Break if they fail a Morale Check at the end of this turn");
            } else {
                outputCard.body.push("Warband Morale is [#00FF00]Good[/#]");
                outputCard.body.push("Currently there are:");
                outputCard.body.push("Active: " + active);
                outputCard.body.push("Currently Down: " + downModels[i]);
                outputCard.body.push("Out of Action: " + outModels);
                outputCard.body.push("Breakpoint: " + breakpoint);
            }



            outputCard.body.push("[hr]")
        }





        PrintCard();
    }

    const Movement = (msg) => {
        let Tag = msg.content.split(";");
        if (!Tag) {return};
        let modelID = Tag[1];
        let type = Tag[2];
        let subtype = Tag[3];

        let model = ModelArray[modelID];
        if (!model) {return};
        let errorMsg = [];

        if (model.token.get("aura1_color") === "#000000") {
            errorMsg.push("Model has already been activated");
        } 
        if (model.actionsTaken.includes(type)) {
            errorMsg.push("Model has already been taken this action this turn");
        } 
        let assaultFire = false;
        _.each(model.actionsTaken,actionTaken => {
            if (actionTaken.includes("Ranged") && model.heavyMove === true) {
                errorMsg.push("Model has a Heavy Weapon, and cannot Move AND Shoot");
                return;
            }
            if (actionTaken.includes("Ranged") && subtype === "Charge") {
                let wnum = actionTaken.replace("Ranged ");
                if (model.weaponArray.ranged[wnmum].keywords.includes("Assault") && assaultFire === false) {
                    assaultFire = true;
                } else {
                    errorMsg.push("Model cannot Charge due to Ranged Fire");
                    if (assaultFire === true) {
                        errorMsg.push("Assault Weapons can only fire once before Charge");
                    }
                }
            }
        })







        SetupCard(model.name,type,model.faction);
        //errors re range, los
        if (errorMsg.length > 0) {
            _.each(errorMsg,msg => {
                outputCard.body.push(msg);
            })
            PrintCard();
            PlaySound("Error");
            return;
        }
        
        if (type === "Move") {
            let downed = (model.token.get("tint_color") === "#FF0000") ? true:false
            let move = model.move;
            let d6 = randomInteger(6);   
            if (model.abilities.includes("Shock Charge")) {
                let d6two = randomInteger(6);   
                d6 = Math.max(d6,d6two);
            }           
            let chargeMove = Math.min(move + d6,12);
            if (model.heavyMove === true) {
                chargeMove = move;
            }
            if (model.token.get(SM.cover) === true) {
                outputCard.body.push("The model is no longer considered to be in cover");
                model.token.set(SM.cover,false);
            }

            if (downed === true) {
                move = Math.round(move/2);
                chargeMove = Math.round(chargeMove/2);
                outputCard.body.push("The model stands up");
                outputCard.body.push("All Movement is Halved");
                model.Stand();
            }
            //check if in combat
            let neighbourCubes = model.cube.neighbours();
            ncloop1:
            for (let i=0;i<neighbourCubes.length;i++) {
                let nHex = hexMap[neighbourCubes[i].label()];
                if (nHex.modelIDs.length > 0) {
                    for (let j=0;j<nHex.modelIDs.length;j++) {
                        let m = ModelArray[nHex.modelIDs[j]];
                        if (m) {
                            if (m.faction !== model.faction) {
                                outputCard.body.push("Model is in combat");
                                outputCard.body.push("If it leaves combat with [U]any[/u] enemy all enemies in contact may immediately take a Melee Attack ACTION with a single melee weapon that it has. Resolve the effects of this attack before moving the retreating model.");
                                break ncloop1;
                            }
                        }
                    }
                }
            }

            //if charge - check if has used ranged attack (with exceptions)



            model.actionsTaken.push("Move");

            if (subtype === "Move") {
                //no test
                outputCard.body.push("Model can move " + move + " Hexes")
                if (model.moveType === "Flying") {
                    outputCard.body.push(" Flying models treat Difficult and/or Dangerous Terrain as Open Terrain and they do not trigger mines and similar devices. Flying models can climb up and down and they can jump over gaps of up to their Movement characteristic without taking ACTIONS.");
                }
            } else if (subtype === "Charge") {
                outputCard.body.push("Roll: " + DisplayDice(d6,Factions[model.faction].dice),24);
                outputCard.body.push("Model can charge " + chargeMove + " Hexes");
                outputCard.body.push("Taking the shortest route. If the model cannot see the target, a RISKY ACTION TEST must be taken");
            } else if (subtype === "Retreat") {
                outputCard.body.push("The model moves up to " + move + " hexes, and it may leave Melee Combat during this movement. Each enemy model in Melee Combat with the retreating model may immediately take a Melee Attack ACTION with a single melee weapon that it has. Resolve the effects of this attack before moving the retreating model.");
//flag  
            } else if (subtype === "Diving Charge") {
                //risky action test
                ActionTest(subtype,model.id,"",true,0,0);
                return; //no need to printcard
            }


        } else if (type === "Dash") {
            let downed = (model.token.get("tint_color") === "#FF0000") ? true:false           
            model.actionsTaken.push("Dash");
            let dice = (downed === true) ? -1:0
            let results = ActionSuccess(dice);
            outputCard.body.push(results.line2);
            if (results.success === false) {
                outputCard.body.push("[#FF0000]Test Fails![/#]");
                outputCard.body.push("The Model's Activation ends...");
                if (downed === true) {
                    outputCard.body.push("It also remains Downed");
                }
            } else {
                if (model.token.get(SM.cover) === true) {
                    model.token.set(SM.cover,false);
                    outputCard.body.push("The model is no longer considered to be in cover");
                }
                let move = model.move;
                if (downed === true) {
                    move = Math.round(move/2);
                    outputCard.body.push("The model stands up");
                    outputCard.body.push("All Movement is Halved");
                    model.Stand();
                }
                outputCard.body.push("Success! The model may move " + model.move + " Hexes");
            } 




        }

        PrintCard();
    }

















    const RollD6 = (msg) => {
        let Tag = msg.content.split(";");
        PlaySound("Dice");
        let roll = randomInteger(6);
        if (Tag.length === 1) {
            let playerID = msg.playerid;
            let faction = "Neutral";
            if (msg.selected) {
                let id = msg.selected[0]._id;
                if (id) {
                    let tok = findObjs({_type:"graphic", id: id})[0];
                    let char = getObj("character", tok.get("represents")); 
                    faction = Attribute(char,"faction");
                    if (!state.TC.players[playerID] || state.TC.players[playerID] === undefined) {
                        state.TC.players[playerID] = faction;
                    }
                }
            } else if (!state.TC.players[playerID] || state.TC.players[playerID] === undefined) {
                sendChat("","Click on one of your Units then select Roll again");
                return;
            } else {
                faction = state.TC.players[playerID];
            }
            let res = "/direct " + DisplayDice(roll,Factions[faction].dice,40);
            sendChat("player|" + playerID,res);
        } else {
            let type = Tag[1];
            //type being used for times where fed back by another function
        }
    }

    const AddModels = (msg) => {
        if (!msg.selected) {return};
        let tokenIDs = [];
        for (let i=0;i<msg.selected.length;i++) {
            tokenIDs.push(msg.selected[i]._id);
        }
        _.each(tokenIDs,id => {
            let model = new Model(id);
            let name = model.charName || "Unnamed";
            name = name.replace(model.faction,"");
            name = name.trim();
            model.name = name;
            //special names here



            model.token.set({
                aura1_color: "#00FF00",
                aura1_radius: 0.1,
                tint_color: "transparent",
                bar3_value: 0,
                bar3_max: "",
                bar2_value: 0,
                bar2_max: "",
                bar1_value: 0,
                bar1_max: "",
                name: name,
                statusmarkers: "",
            })
            





        })        














    }


    const ActionSuccess = (extraDice,modifier,number) => {
        //extraDice to be either +X or -X and adds X dice, taking top or bottom 2
        //modifier is added or subtracted to roll
        //number = number of dice used, usually 2
        if (!number) {number = 2};
        if (!modifier) {modifier = 0};
        let sign = Math.sign(extraDice);
        extraDice = Math.abs(extraDice);
        let dice = 2 + extraDice;
        let rolls = [];
        for (let i=0;i<dice;i++) {
            let roll = randomInteger(6);
            rolls.push(roll);
        }
        rolls.sort(); //will be lowest to highest
        let usedRolls = [];
        if (sign < 0) {
            usedRolls = rolls.slice(0,number); //lowest 
        } else {
            usedRolls = rolls.slice(-number); //highest
        }      
        let total = 0;
        _.each(usedRolls,roll => {
            total += roll;
        })
        total += modifier;
        let success = false;
        if (total > 6 && total < 12) {
            success = true;
        } else if (total > 11) {
            success = "Critical";
        }
   
        let line2 = "Rolls: ";
        for (let i=0;i<rolls.length;i++) {
            line2 += DisplayDice(rolls[i],"Neutral",24) + " ";
            if ((sign >=0 && i === (rolls.length - number - 1)) && rolls.length > number) {
                line2 += "▶ ";
            }
            if ((sign < 0 && i === (number-1)) && rolls.length > number) {
                line2 += "◀ "
            }



        }

        let results = {
            success: success,
            line2: line2,
        }
        return results;
    }



    const ActionTest = (reason,id,targetIDs,risky,bonusDice,rollMod,numDice) => {
        //fed from other sources eg from a melee attack or an ability
        if (!targetIDs) {targetIDs = []};
        if (targetIDs.constructor !== Array) {
            targetIDs = [targetIDs]; //a single id was passed
        }
        if (!risky) {risky = false};
        if (!bonusDice) {bonusDice = 0}; //   +/- Dice
        if (!rollMod) {rollMod = 0}; // +/- to final roll
        if (!numDice) {numDice = 2}; // # of dice used to determine test result
    
        testInfo = {
            id: id,
            risky: risky,
            targetIDs: targetIDs,
            bonusDice: bonusDice,
            rollMod: rollMod,
            numDice: numDice,
            reason: reason,
        }

        checkModels = [ModelArray[id]];
        nextStep = "ActionTest2"
        CheckMarkers();
    }
    
    const ActionTest2 = () => {
        let model = ModelArray[testInfo.id];
        SetupCard(model.name,testInfo.reason,model.faction);
        let bdText = (testInfo.bonusDice === 0) ? "No Modifier":(testInfo.bonusDice<0?"":"+") + testInfo.bonusDice + " Dice";
        let rmText = (testInfo.rollMod === 0) ? "":(testInfo.rollMod<0?" ":" +") + testInfo.rollMod;
        let tip = "Base: " + bdText + rmText;
        if (markerDice !== 0) {
            tip += "<br>Markers: " + (markerDice<0? "":"+") + markerDice + " Dice";
        }
    
        let extraDice = testInfo.bonusDice + markerDice;
        //modifiers
        if (model.token.get("tint_color") === "#FF0000") {
            extraDice--;
            tip += "<br>Down: -1 Dice";
        }
        if (model.keywords.includes("Blasphemous")) {
            tip += "<br>Blasphemous: +1 Dice";
            extraDice++;
        }
    
        tip = '[🎲](#" class="showtip" title="' + tip + ')';
        let results = ActionSuccess(extraDice);
        outputCard.body.push(tip + " " + results.line2);
log(results)
log(results.success)
        ActionTest3(results.success);
    }

    const ActionTest3 = (success) => {
        //either using original card or a new one created after Marker
        //this routine works on results of the action test
        //success might come in as false/true and "Critical" - so !== false 
        let model = ModelArray[testInfo.id];
        let targets = [];
        for (let i=0;i<testInfo.targetIDs.length;i++) {
            targets.push(ModelArray[testInfo.targetIDs[i]]);
        }

        if (success === false) {
            outputCard.body.push("Action Fails");
        }
        if (success === false && testInfo.risky === true) {
            outputCard.body.push(model.name + "'s activation is over");
            model.token.set("aura1_color","#000000");
        }
    
        if (testInfo.reason === "Standard" && success !== false) {
            if (success === "Critical") {
                outputCard.body.push("Critical Success!")
            } else {
                outputCard.body.push("Success!")
            }          
        }
    
    
        if (testInfo.reason === "God is With Us!" && success !== false) {
            outputCard.body.push("The Cleric Blesses the Target");
            PlaySound("Angels");
            targets[0].ChangeMarker("Blessing",1);
        }
        if (testInfo.reason === "Aim" && success !== false) {
            outputCard.body.push("The Sniper Priest takes Careful Aim");
            outputCard.body.push("Any Ranged Attack Rolls get +2 Dice");
            model.token.set(SM.aim,true);
        }
        if (testInfo.reason === "Fortify" && success !== false) {
            outputCard.body.push("The Engineer is considered to be in Cover until the model moves.");
            model.token.set(SM.cover,true);
        }
        if (testInfo.reason === "De-mine") {
            if (success !== false) {
                outputCard.body.push("The Engineer disables the mine/trap");
                ///

            } else {
                outputCard.body.push("The Engineer fails to disable the mine/trap");
                //Run this ?

            }
        }
        if (testInfo.reason === "Medi-Kit" && success !== false) {
            outputCard.body.push("The Medi-Kit is used successfully");
            if (targets[0].token.get("tint_color") === "#FF0000") {
                outputCard.body.push(targets[0].name + " regains their footing and is no longer Down");
                targets[0].Stand();
            } else {
                targets[0].ChangeMarker("Blood",-1);
                outputCard.body.push("One Blood Marker is removed");
            }
        }
        if (testInfo.reason === "Diving Charge") {
            if (success === false) {
                let info = ModelHeight(model);
                let level = Math.max(info.level,model.oldLevel); // in case moved then tested
                outputCard.body.push(model.name + " lands hard and is Down. Place the charging model next to the target.");
                PrintCard();
                attackInfo = {
                    attacker: model,
                    defenders: [model],
                    weapon: "",
                    extraDice: [level],
                    reason: "Fall",
                }
                Injury(0);
                model.token.set("tint_color","#FF0000");
                model.token.set(info.heightSymbol,false);
                return;
            } else {
                outputCard.body.push("Place the charging model next to the target. It gains a +1 Dice bonus to hit and injure the target, and ignores any defended Obstacle");
                model.token.set(SM.diving,true);
            }
        }
        if (testInfo.reason === "Climb") {
            if (success === false) {
                outputCard.body.push("The Model stays where it is")
            } else {
                outputCard.body.push("The Model climbs up the vertical surface and can complete its movement");
            }
        }
        if (testInfo.reason === "Jump over Gap") {
            if (success === false) {
                let info = ModelHeight(model);
                let level = Math.max(info.level,model.oldLevel); // in case moved then tested
                outputCard.body.push("The Jump is misjudged and the Model Falls");
                outputCard.body.push("Place the model at the first hex it would have fallen");
                PrintCard();
                attackInfo = {
                    attacker: model,
                    defenders: [model],
                    weapon: "",
                    extraDice: [level],
                    reason: "Fall",
                }
                Injury(0);
                model.token.set("tint_color","#FF0000");
                model.token.set(info.heightSymbol,false);
                return;
            } else {
                outputCard.body.push("The Model Jumps the gap");
                outputCard.body.push("The Model can complete its movement");
            }
        }
        if (testInfo.reason === "Dangerous Terrain") {
            if (success === false) {
                outputCard.body.push("The model takes Damage from the Terrain");
                PrintCard();
                attackInfo = {
                    attacker: model,
                    defenders: [model],
                    weapon: "",
                    extraDice: [0],
                    reason: "Dangerous Terrain",
                }
                Injury(0);
                return;
            } else {
                outputCard.body.push("The Model avoids taking Damage");
                outputCard.body.push("If it remains in the Dangerous Terrain, it will need to take an Action test next round");
            }
        }
      
    
    
    
    
    
    
        PrintCard();
    }

    const Test = (msg) => {
        //command line test: !Test;?{Reason|Standard|Climb|Jump over Gap|Enter Dangerous|Fall};
        let id = msg.selected[0]._id;
        if (!id) {return};
        let Tag = msg.content.split(";");
        let reason = Tag[1];
        let model = ModelArray[id];
        SetupCard(model.name,reason,model.faction);
    
        let drisk = false;
        if (reason === "Dangerous Terrain") {
            //check if has moved, in which case is risky
            if (model.actionsTaken.includes("Move") || model.actionsTaken.includes("Dash")) {
                drisk = true;
            } 
        }
        if (reason === "Standard" || (drisk === false && reason === "Dangerous Terrain")) {
            ActionTest(reason,id);
        }
        if (reason === "Climb" || reason === "Jump over Gap" || (reason === "Dangerous Terrain" && drisk === true)) {
            //risky
            ActionTest(reason,id,"",true);
        }
        if (reason === "Fall") {
            let info = ModelHeight(model);
            let level = Math.max(info.level,model.oldLevel); // in case moved then tested
            attackInfo = {
                attacker: model,
                defenders: [model],
                weapon: "",
                reason: "Fall",
            }
            model.extraDice = 0;
            model.diceRolled = 2;
            model.injuryNote = "";
            checkModels = [model];
            nextStep = "Injury"
            CheckMarkers();
        }
    }
    
    


    

    const Ranged = (msg) => {
        let Tag = msg.content.split(";");
        let attackerID = Tag[1];
        let defenderID = Tag[2];
        let weaponNum = Tag[3];
        let attacker = ModelArray[attackerID];
        let defender = ModelArray[defenderID];
        let weapon = attacker.weaponArray.ranged[weaponNum]
log(weapon)
        let losResult = LOS(attacker,defender);
        let errorMsg = [];
        if (losResult.distance > weapon.range) {
            errorMsg.push("Target is Out of Range");
        }
        if (losResult.los === false && weapon.keywords.includes("Indirect") === false) {
            errorMsg.push("Target is not in Line of Sight");
            errorMsg.push(losResult.reason);
        }
        if ((attacker.actionsTaken.includes("Move") || attacker.actionsTaken.includes("Dash")) && attacker.heavyMove === true) {
            errorMsg.push("Attacker is carrying a Heavy Weapon and cannot Move/Dash AND Shoot in the same turn");
        }
        let firedTimes = 0;
        _.each(attacker.actionsTaken,actionTaken => {
            if (actionTaken.includes(weapon.number)) {
                firedTimes++;
            }
        })
        if (firedTimes >= weapon.attacks) {
            errorMsg.push("Weapon has been fired its max. # of times");
        }

        SetupCard(attacker.name,weapon.name,attacker.faction);
        //errors re range, los
        if (errorMsg.length > 0) {
            _.each(errorMsg,msg => {
                outputCard.body.push(msg);
            })
            PrintCard();
            PlaySound("Error");
            return;
        }
    
        attackInfo = {
            attacker: attacker,
            attackerExtraDice: 0,
            weapon: weapon,
            defenders: [defender],
            result: "",
        }
        
        checkModels = [attacker];
        nextStep = "Ranged2";
        CheckMarkers();
    }
    
    const Ranged2 = () => {
        //entry from CheckMarkers once all markers checked
        //check if in melee
        let attacker = attackInfo.attacker;
        let defender = attackInfo.defenders[0];
        let weapon = attackInfo.weapon;
        let extraDice = attacker.extraDice;
        SetupCard(attacker.name,weapon.name,attacker.faction);
        let tip;
    
        let neighbourCubes = defender.cube.neighbours()
        let friendlies = [];
        _.each(neighbourCubes,cube => {
            let nHex = hexMap[cube.label()];
            if (nHex.modelIDs.length > 0) {
                _.each(nHex.modelIDs,id => {
                    let model = ModelArray[id];
                    if (model) {
                        if (model.faction === attacker.faction) {
                            let checkLOS = LOS(attacker,model);
                            if (checkLOS.los === true) {
                                friendlies.push(model);
                            }
                        }
                    }
                })
            }
        });
        if (friendlies.length > 0) {
            let roll = randomInteger(6);
            let fTip = "Friendly Roll: " + roll + " vs 4+";
            fTip = '[🎲](#" class="showtip" title="' + fTip + ')';

            if (roll < 4) {
                let i = randomInteger(friendlies.length) - 1;
                defender = friendlies[i];
                attackInfo.defenders[0] = defender;
                outputCard.body.push(fTip + " [#FF0000]Shooting into Melee targets an Ally![/#]");
                outputCard.body.push("[#FF0000]" + defender.name + " is targetted[/#]");
            } else {
                outputCard.body.push(fTip + " Shooting into melee targets the Enemy");
            }
            outputCard.body.push("[hr]");
        }
        let losResult = LOS(attacker,defender);
    
        //To Hit
        //attacker modifiers
        tip = "Base: " + (attacker.rangedBonus<0?"":"+") + attacker.rangedBonus + " Dice";
    
        if (extraDice !== 0) {
            tip += "<br>Markers: " + (extraDice<0?"":"+") + extraDice + " Dice"; 
        }
        if (attacker.token.get("tint_color") === "#FF0000") {
            tip += "<br>Downed: -1 Dice";
            extraDice--;
        }
        extraDice += attacker.rangedBonus;
    
        //weapon modifiers
        let mods = weapon.modifiers;
        _.each(mods,mod => {
            if (mod.includes("Hit")) {
                let bonus = parseInt(mod)
                extraDice += bonus;
                tip += "<br>Weapon: " + (bonus < 0 ? "":"+") + bonus + " Dice";
            }
    
        })
    
        let cover = (losResult.cover === true || losResult.loscover === true) ? true:false;
        if (weapon.keywords.includes("Grenade") || weapon.modifiers.includes("Ignore Cover") === false) {
            cover = false;
        }

        if (cover === true) {
            extraDice--;
            tip += "<br>Cover -1 Dice";
        }
    
        let longRange = (losResult.distance > Math.round(weapon.range/2)) ? true:false;
        if (weapon.keywords.includes("Grenade")) {
            longRange = false;
        }

        if (longRange === true) {
            extraDice--;
            tip += "<br>Long Range -1 Dice";
        }

    
        if (losResult.heightAdvantage === true) {
            extraDice++;
            tip += "<br>Elevated Position +1 Dice";
        }
    
        let modifier = 0;
    //? any in weapons or characters - would be like +1 to hit vs +1 DIce
    
        tip = "Total: " + (extraDice<0?"":"+") + extraDice + " Dice" + "<br>----------------------<br>" + tip;
        tip = '[🎲](#" class="showtip" title="' + tip + ')';


        let results = ActionSuccess(extraDice,modifier,2)
        outputCard.body.push(tip + " " + results.line2);
        attackInfo.result = results.success;
        if (results.success === false) {
            outputCard.body.push("Attack Misses");
        } else if (results.success === "Critical") {
            outputCard.body.push("Attack Hits and scores a Critical");
        } else {
            outputCard.body.push("Attack Hits");
        }
    
        //mark weapon fired and action
        attacker.actionsTaken.push("Ranged " + weapon.number);
        PlaySound(weapon.sound);
        //FX 




        //Injuries
        PrintCard();
        if (results.success !== false) {
            defender.extraDice = 0;
            defender.diceRolled = 2;
            defender.injuryNote = "";
            
    //modify here ?
            if (weapon.keywords.includes("Blast")) {
                let index = weapon.keywords.indexOf("Blast");
                let radius = parseInt(weapon.keywords.charAt(index + 6));
                _.each(ModelArray,model => {
                    if (model.id === defender.id) {return}
                    let dist = model.cube.distance(defender.cube);
                    let vertical = Math.abs(ModelHeight(defender).level - ModelHeight(model).level);
                    if (dist <= radius && vertical <= radius) {
                        attackInfo.defenders.push(model);
                        model.injuryNote = "";
                        model.extraDice = 0;
                        model.diceRolled = 2;
                        if (weapon.type === "Grenade") {
                            model.extraDice = -1; //used in injury
                        }
                    }
                })
            } 
    
log("Length: " + attackInfo.defenders.length)
            checkModels = [];
            _.each(attackInfo.defenders,defender => {
                checkModels.push(defender);
            })
            nextStep = "Injury"
            CheckMarkers();
        }
    }

    const Melee = (msg) => {
        let Tag = msg.content.split(";");
        let attackerID = Tag[1];
        let defenderID = Tag[2];
        let weaponNum = Tag[3];
        let attacker = ModelArray[attackerID];
        let defender = ModelArray[defenderID];
        let weapon = attacker.weaponArray.melee[weaponNum];
    
        let errorMsg = [];
        let distance = attacker.cube.distance(defender.cube);
        let minimum = 1;
        if (attacker.size === "Large" || defender.size === "Large") {
            minimum = 2;
        }
        if (distance > minimum) {
            errorMsg.push("Target is Out of Range");
        }
        //bit about having fired assault weapon here
    
        SetupCard(attacker.name,weapon.name,attacker.faction);
        //errors re range, los
        if (errorMsg.length > 0) {
            _.each(errorMsg,msg => {
                outputCard.body.push(msg);
            })
            PrintCard();
            return;
        }
    
        attackInfo = {
            attacker: attacker,
            attackerExtraDice: 0,
            defenders: [defender],
            weapon: weapon,
            result: "",
        }

        checkModels = [attacker];
        nextStep = "Melee2";
        CheckMarkers();
    }
    
    const Melee2 = () => {
        //entry from Melee or from Marker
        let attacker = attackInfo.attacker;
        let defender = attackInfo.defenders[0];
        let weapon = attackInfo.weapon;
        let extraDice = attacker.meleeBonus;
        SetupCard(attacker.name,weapon.name,attacker.faction);
        let tip;
    
        //To Hit
        //attacker modifiers
        tip = "<br>Base: " + (attacker.meleeBonus < 0 ? "":"+") + attacker.meleeBonus + " Dice";

        if (attackInfo.attackerExtraDice !== 0) {
            tip += "<br>Markers: " + (attackInfo.attackerExtraDice < 0 ? "":"+") + attackInfo.attackerExtraDice + " Dice"; 
            extraDice += attackInfo.attackerExtraDice;
        }

        if (attacker.token.get(SM.diving) === true) {
            tip += "<br>Diving Charge: +1 Dice";
            extraDice++;
        }
        if (attacker.token.get("tint_color") === "#FF0000") {
            tip += "<br>Downed: -1 Dice";
            extraDice--;
        }
        if (weapon.type.includes("Offhand")) {
            tip += "<br>Offhand Weapon -1 Dice";
            extraDice--
        }
    
        let fearImmune = false;
        let list = ["Fear","Convent Conditioning"];
        if (Exclusion(attacker,list) === true) {
            fearImmune = true;
        }
    
    
    
        //weapon modifiers
        let mods = weapon.modifiers;
        _.each(mods,mod => {
            if (mod.includes("Hit")) {
                let bonus = parseInt(mod)
                extraDice += bonus;
                tip += "<br>Weapon: " + (bonus < 0 ? "":"+") + bonus + " Dice";
            }
    
        })
    
        //defender abilities
        if (defender.abilities.includes("Fear") && fearImmune === false) {
            extraDice--;
            tip += "<br>Defender Causes Fear"
        }


    
    
        //defender obstacle
        let defendedObstacle = false;
        if (defender.token.get("tint_color") !== "#FF0000" && attacker.token.get(SM.diving) === false) {
            let hexes = [hexMap[defender.hexLabel]];
            if (attacker.size === "Large" || defender.size === "Large") {
                let midCube = hexMap[attacker.hexLabel].cube.linedraw(hexMap[defender.hexLabel].cube);
                if (midCube) {
                    hexes.push(hexMap[midCube.label()]);
                }
            }
            for (let i=0;i<hexes.length;i++) {
                if (hexes[i].obstacle === true) {
                    defendedObstacle = true;
                    break;
                }
            }
        }
        if (defendedObstacle === true) {
            tip += "<br>Defended Obstacle: -1 Dice";
            extraDice--;
        }
    
        let modifier = 0;
        //? any in weapons or characters - would be like +1 to hit vs +1 DIce
        
        tip = "Total: " + (extraDice < 0 ? "":"+") + extraDice + " Dice" + "<br>----------------------" + tip;
        tip = '[🎲](#" class="showtip" title="' + tip + ')';
    
        let results = ActionSuccess(extraDice,modifier,2)
        outputCard.body.push(tip + " " + results.line2);
        attackInfo.result = results.success;
        if (results.success === false) {
            outputCard.body.push("Attack Misses");
        } else if (results.success === "Critical") {
            outputCard.body.push("Attack Hits and scores a Critical");
        } else {
            outputCard.body.push("Attack Hits");
        }
    
        //mark weapon fired and action
        attacker.actionsTaken.push("Melee " + weapon.number);
        PlaySound(weapon.sound);
        //FX 







        //Injuries
        PrintCard();
        if (results.success !== false) {
            defender.extraDice = 0;
            defender.diceRolled = 2;
            defender.injuryNote = "";

            checkModels = [];
            _.each(attackInfo.defenders,defender => {
                checkModels.push(defender);
            })
            nextStep = "Injury"
            CheckMarkers();
        }
    }
    
    
    


    



    const Exclusion = (model,exclusions) => {
        _.each(exclusions,e => {
            if (model.keywords.includes(e) || model.abilities.includes(e)) {
                return true;
            }
        })
        return false;
    }

    const CheckMarkers = () => {
        //checks markers of models in checkModels and goes to next step once all checked
        //context will be given by nextStep
        let model = checkModels.shift();
        if (model) {
            let id = model.id;
            let blood = parseInt(model.token.get("bar3_value"));
            let blessing = parseInt(model.token.get("bar1_value"));
            if (nextStep === "Injury") {
                if (attackInfo.attacker.faction === model.faction) {
                    blood = 0; //wont use blood on friendly
                }
            }
            if (nextStep === "Ranged2" && model.abilities.includes("Absolute Faith")) {
                blood = 0;  //sniper priest ability - ignores blood markers
            }
            if (blood > 0 || blessing > 0) {
                SetupCard(model.name,"Markers",model.faction);
                sendPing(model.token.get("left"),model.token.get("top"),Campaign().get("playerpageid"),null,true);
                if (blood > 0) {
                    outputCard.body.push("[B]Blood Markers[/b]");
                    let bb = 6;
                    if (model.token.get("tint_color") === "#FF0000") {
                        bb = 3
                    }
                    ButtonInfo("Skip Blood Markers","!Marker;0;Nil;" + id,"#FF0000");
                    if (nextStep === "Injury" && blood >= bb) {
                        ButtonInfo("Bloodbath!","!Marker;" + bb + ";Bloodbath;" + id,"#FF0000");
                    } else {
                        let s = (blood === 1) ? "":"s";
                        outputCard.body.push("Model has " + blood + " Blood Marker" + s);
                        let howmany;
                        switch(blood) {
                            case 1:
                                howmany = "1";
                                break;
                            case 2:
                                howmany = "?{How Many|1|2}";
                                break;
                            case 3:
                                howmany = "?{How Many|1|2|3}";
                                break;
                            case 4:
                                howmany = "?{How Many|1|2|3|4}";
                                break;
                            case 5:
                                howmany = "?{How Many|1|2|3|4|5}";
                                break;
                            case 6:
                                howmany = "?{How Many|1|2|3|4|5|6}";
                                break;
                        }
                        ButtonInfo("Use Blood Markers","!Marker;" + howmany + ";Blood;" + id,"#FF0000");
                    }
                } else if (blessing > 0) {
                    outputCard.body.push("[B]Blessing Markers[/b]");
                    let s = (blessing === 1) ? "":"s";
                    outputCard.body.push("Model has " + blessing + " Blessing Marker" + s);
                    ButtonInfo("Skip Blessing Markers","!Marker;0;Nil;" + id,"#00FF00");
                    let howmany;
                    switch(blessing) {
                        case 1:
                            howmany = "1";
                            break;
                        case 2:
                            howmany = "?{How Many|1|2}";
                            break;
                        case 3:
                            howmany = "?{How Many|1|2|3}";
                            break;
                        case 4:
                            howmany = "?{How Many|1|2|3|4}";
                            break;
                        case 5:
                            howmany = "?{How Many|1|2|3|4|5}";
                            break;
                        case 6:
                            howmany = "?{How Many|1|2|3|4|5|6}";
                            break;
                    }
                    ButtonInfo("Use Blessing Markers","!Marker;" + howmany + ";Blessing;" + id,"#00FF00");
                }
                PrintCard();
            } else {
                CheckMarkers();
            }
        } else {
            if (nextStep === "Injury") {
                Injury();
            } 
            if (nextStep === "Ranged2") {
                Ranged2();
            } 
            if (nextStep === "Melee2") {
                Melee2();
            }
            if (nextStep === "ActionTest2") {
                ActionTest2();
            }
    
        }
    }
    
    const Marker = (msg) => {
        let Tag = msg.content.split(";");
        let number = parseInt(Tag[1]);
        let type = Tag[2];
        let id = Tag[3];
        let bb = (type === "Bloodbath") ? true:false;
        let model = ModelArray[id];
        let extraDice = model.extraDice;
        let blood = parseInt(model.token.get("bar3_value"));
        let blessing = parseInt(model.token.get("bar1_value"));
        if (type.includes("Blood")) {
            if (bb === true) {
                number = (blood - number); //remaining after 'cost' of bloodbath
                model.diceRolled = 3;
                model.injuryNote = "Bloodbath"
            }
            model.ChangeMarker(type,-number);
        } else if (type === "Blessing") {
            model.ChangeMarker(type,-number)
        } 
        extraDice += number;
        if (nextStep === "Ranged2" || nextStep === "Melee2") {
            attackInfo.attackerExtraDice = extraDice;
        }
        if (nextStep === "Injury") {
            model.extraDice = extraDice;
        }

        if (blessing > 0 && type.includes("Blood")) {
            SetupCard(model.name,"Markers",model.faction);
            let s = (blessing === 1) ? "":"s";
            outputCard.body.push("Model also has " + blessing + " Blessing Marker" + s);
            ButtonInfo("Skip Blessing Markers","!Marker;0;Nil;" + id,"#00FF00");
            let howmany;
            switch(blessing) {
                case 1:
                    howmany = "1";
                    break;
                case 2:
                    howmany = "?{How Many|1|2}";
                    break;
                case 3:
                    howmany = "?{How Many|1|2|3}";
                    break;
                case 4:
                    howmany = "?{How Many|1|2|3|4}";
                    break;
                case 5:
                    howmany = "?{How Many|1|2|3|4|5}";
                    break;
                case 6:
                    howmany = "?{How Many|1|2|3|4|5|6}";
                    break;
            }
            ButtonInfo("Use Blessing Markers","!Marker;" + howmany + ";Blessing;" + id,"#00FF00");
            PrintCard();
         } else {
            CheckMarkers();
         }
    }

    const TokenInfo = (msg) => {
        if (!msg.selected) {
            sendChat("","No Token Selected");
            return;
        };
        let id = msg.selected[0]._id;
        let model = ModelArray[id];
        if (!model) {
            sendChat("","Not in Array Yet");
            return
        }
        let h = hexMap[model.hexLabel];
        let faction = model.faction;
        if (!faction) {faction = "Neutral"};
        SetupCard(model.name,model.hexLabel,model.faction);
        outputCard.body.push("Terrain: " + h.terrain.toString());
        let info = ModelHeight(model);
        let height = h.elevation;
        if (info.heightSymbol !== "") {
            let s = (info.level === 1) ? "":"s"
            outputCard.body.push(info.level + " Level" + s + " above the base/floor");
            height += info.level;
        }
        outputCard.body.push("Final Height: " + height);


        if (model.token.get("tint_color") === "#FF0000") {
            outputCard.body.push("Model is Down");
        }
        if (h.cover === true) {
            outputCard.body.push("Defender is in Cover");
        }
        PrintCard();
        
    }

    const CheckLOS = (msg) => {
        let Tag = msg.content.split(";");
        let attackerID = Tag[1];
        let defenderID = Tag[2];
        
        let attacker = ModelArray[attackerID];
        let defender = ModelArray[defenderID];

        SetupCard("LOS","",attacker.faction);
        
        let result = LOS(attacker,defender);


        outputCard.body.push("Defender is " + result.distance + " Hexes away");
        if (result.los === true) {
            outputCard.body.push("Defender is in LOS");
            if (result.cover === true) {
                outputCard.body.push("Defender is IN COVER");
            } else if (result.loscover === true) {
                outputCard.body.push("Defender has cover due to intervening terrain");
            }
            if (result.heightAdvantage === true) {
                outputCard.body.push("Attacker has a Height Advantage");
            }
        } else {
            outputCard.body.push("LOS is " + result.reason);
        }
       
        
        _.each(attacker.weaponArray.ranged,weapon => {
            let range = weapon.range;
            if (range <= result.distance) {
                if (result.distance > Math.round(range/2)) {
                    outputCard.body.push("Defender is in Long Range of " + weapon.name);
                } else {
                    outputCard.body.push("Defender is in range of " + weapon.name);
                }
             }
        })


        PrintCard();
        

    }


    const LOS = (model1,model2) => {
        let los = true;
        let losCover = false;

        let distance = model1.cube.distance(model2.cube);
        let model1Hex = hexMap[model1.hexLabel];
        let model2Hex = hexMap[model2.hexLabel];

        let model1Height = ModelHeight(model1).height;
        let model2Height = ModelHeight(model2).height;
        let heightAdvantage = (model1Height > model2Height) ? true:false;
      
        //reduce to lowest level
        let modelLevel = Math.min(model1Height,model2Height);
        model1Height -= modelLevel;
        model2Height -= modelLevel;
//log("m1H: " + model1Height)
//log("m2H: " + model2Height)

        let interCubes = model1Hex.cube.linedraw(model2Hex.cube); 
        //interCubes.pop();

        let sameTerrain = findCommonElements(model1Hex.terrainIDs,model2Hex.terrainIDs);

        let reason = "";
        //where A is height of target, C is distance to target and D is the distance to obstacle
        //B is height of obstacle that blocks - B = D * (A/C)
        let AC,D;

        let partialFlag = false;
        let blockedHexes = 0;
        for (let i=1;i<interCubes.length;i++) {
            let B;
            let flag = false;
            //D is distance in hexes to hex being checked for height/cover etc
            let label = interCubes[i].label()
            let interHex = hexMap[label];
//log(label)
            let interSame = findCommonElements(model1Hex.terrainIDs,interHex.terrainIDs);

            let interHeight = interHex.height - modelLevel;
            let interElevation = interHex.elevation - modelLevel;

//log("iH: " + interHeight)
//log("iE: " + interElevation)


            if (model1Height === model2Height) {
                if (interHex.elevation > model1Height) {
                    los = false;
                    reason = "Blocked by Hill at " + label;
                    break;
                }
                if (interHeight > 0) {
                    flag = true;
                }
            } else if (model1Height > model2Height) {
                //model1 is at higher height than model2
                D = interCubes.length + 1 - i;
                AC = model1Height/distance;
                B = D * AC;
//log("S2 B: " + B)
                if (interElevation >= B && interElevation > model1Height) {
                    los = false;
                    reason = "Blocked by Hill at " + label;
                    break;
                }
                if (interHeight >= B) {
                    flag = true;
                }
            } else if (model1Height < model2Height) {
                //model2 is at higher height than model1
                AC = model2Height/distance;
                D = i;
                B = D * AC;
//log("S3 B: " + B)
                if (interElevation >= B && interElevation > model2Height) {
                    los = false;
                    reason = "Blocked by Hill at " + label;
                    break;
                }
                if (interHeight >= B) {
                    flag = true;
                }
            }
//log(interHex.label)
//log(interHex.los)
            if (flag === true) {
                //LOS goes through the terrain
                if (interHex.cover === true) {losCover = true};
                if (interHex.los.includes("Blocked") && sameTerrain === false) {
                    blockedHexes++;
                    if (blockedHexes >= int) {
                        los = false;
                        reason = "Blocked by Terrain at " + label;
                        break;
                    }
                } else if (interHex.los === "Partial" && partialFlag === false && interSame === false) {
                    //entering partially obscuring terrain
                    partialFlag = true;
                    losCover = true;
                }
            } else if (partialFlag === true && interHex.los !== "Partial") {
                //leaving partially obscuring terrain
                los = false;
                reason = "Other Side of Obscuring Terrain, LOS ending at " + label;
                break;
            }





        }

        if (los === true && model2Hex.los !== "Partial" && partialFlag === true) {
            los = false;
            reason = "Just on other side of Obscuring Terrain";
        }

        let cover = model2Hex.cover;

        let result = {
            los: los,
            reason: reason,
            cover: cover, //if target is IN cover terrain
            loscover: losCover,  //if intervening terrain offers cover 
            distance: distance,
            heightAdvantage: heightAdvantage,
        }


        return result;



    }


    const Injury = () => {
    
        let attacker = attackInfo.attacker;
        let result = attackInfo.result;
    
        let weapon = attackInfo.weapon;
        if (weapon === "") {
            weapon = {name: "",keywords: " ",modifiers: []}
        }
    
        let defender = attackInfo.defenders.shift();
        if (defender) {
log(defender.name)
            let downed = (defender.token.get("tint_color") === "#FF0000") ? true:false;
            let numberDice = defender.diceRolled;
log(numberDice)
            let tip = "Rolling: " + numberDice + " Dice;"
            if (defender.injuryNote === "Bloodbath") {
                tip += "<br>Bloodbath!!!"
            }

            let extraDice = defender.extraDice;
log(extraDice)
            if (extraDice !== 0) {
                tip += "<br>Markers: " + (extraDice < 0 ? "":"+") + extraDice + " Dice";
            }
            let diceAddition = 0; //added to final roll
    
            //fall 
    
            //attacker modifiers
            if (result === "Critical") {
                extraDice++;
                tip += "<br>Critical: +1 Dice";
            }
            if (attacker) {
                if (attacker.token.get(SM.diving) === true) {
                    tip += "<br>Diving Charge: +1 Dice";
                    extraDice++;
                }
                if (attacker.abilities.includes("Finish the Fallen") && downed === true) {
                    if (defender.faction !== "Black Grail" && defender.keywords.includes("Demonic") === false) {
                        tip += "<br>Finish the Fallen: +1 Dice";
                        extraDice++;
                    }
                }
    
            }
            
            //Defender Modifiers
            if (downed === true) {
                extraDice++;
                tip += "<br>Down: +1 Dice";
            }
    
    
    
            let ignoreArmour = false;
            //bonus from weapon
            _.each(weapon.modifiers,modifier => {
                let sign = 1;
                if (modifier.includes("-")) {
                    sign = -1
                }
                let number = modifier.replace(/\D/g,'');
                let bonus = sign * number;
                if (modifier.includes("Injury" && modifier.includes("Dice"))) {
                    extraDice += bonus;
                    tip += "<br>Weapon: " + (bonus < 0 ? "":"+") + bonus + " Dice";
                }
                if (modifier.includes("Injury" && modifier.includes("Roll"))) {
                    diceAddition += bonus;
                    tip += "<br>Weapon: " + (bonus < 0 ? "":"+") + bonus + " To Roll";
                }
                if (result === "Critical" && modifier.includes("Critical")) {
                    extraDice++;
                    tip += "<br>Weapon Critical +1 Dice";
                }
                if (modifier.includes("Ignore Armour")) {
                    if (modifier.includes("Down") && downed === false) {return};
                    if (modifier.includes("Critical") && result !== "Critical") {return};
    
                    tip += "<br>Ignores Armour";
                    ignoreArmour = true;
                }
    
            })
    
            //armour and such
            if (ignoreArmour === false && defender.armour !== 0) {
                diceAddition += defender.armour;
                tip += "<br>Armour: " +  (defender.armour < 0 ? "":"+") + defender.armour + " To Roll";
            }
            if (defender.equipment.includes("Engineer Body Armour") && weapon.keywords.includes("Shrapnel")) {
                tip += "<br>Engineer Body Armour: -1 Dice";
                extraDice--;
            }
            if (defender.equipment.includes("Gas Mask") && weapon.keywords.includes("Gas")) {
                tip += "<br>Gas Mask: -1 Dice";
                extraDice--;
            }
    
            let dice = numberDice + Math.abs(extraDice);
            let sign = Math.sign(extraDice);
            let rolls = [];
            for (let i=0;i<dice;i++) {
                let roll = randomInteger(6);
                rolls.push(roll);
            }
            rolls.sort();
            let usedRolls = [];
            if (sign < 0) {
                usedRolls = rolls.slice(0,numberDice); //lowest 
            } else {
                usedRolls = rolls.slice(-numberDice); //highest
            }
            let total = 0;
            _.each(usedRolls,roll => {
                total += roll;
            })
            total += diceAddition;
    
            tip = '[🎲](#" class="showtip" title="' + tip + ')';
            let line = tip + " Rolls: ";
            for (let i=0;i<rolls.length;i++) {
                line += DisplayDice(rolls[i],"Neutral",24) + " ";
                if ((sign >=0 && i === (rolls.length - numberDice - 1)) && rolls.length > numberDice) {
                    line += "▶ ";
                }
                if ((sign < 0 && i === (numberDice-1)) && rolls.length > numberDice) {
                    line += "◀ "
                }
            }
            
            let btip = "";
            let subtitle = weapon.name;
            if (weapon.name === "") {
                subtitle = attackInfo.reason;
            }
            let blood = 1;
            if (downed === true) {
                blood++;
                btip += "<br>+1 Blood due to Down";
            }

            let remains = (downed === true) ? " remains ":" ";
    
            let extraLines = [];
            if (weapon.keywords.includes("Fire")) {
                //negating stuff here
                let list = [""];
                if (Exclusion(defender,list) === false) {
                    blood++;
                    btip += "<br>+1 Blood from Fire";
                }
            }
            if (weapon.keywords.includes("Gas")) {
                //negating stuff here
                let list = ["Gas Mask"];
                if (Exclusion(defender,list) === false) {
                    blood++;
                    btip += "<br>+1 Blood from Gas";
                }
            }
            if (weapon.keywords.includes("Shrapnel")) {
                //negating stuff here
                let list = ["Engineer Body Armour"];
                if (Exclusion(defender,list) === false) {
                    blood++;
                    btip += "<br>+1 Blood from Shrapnel";
                }
            }
    
            btip = "Total: " + blood + " Blood" + "<br>----------------------" + btip;
            btip = '[🎲](#" class="showtip" title="' + btip + ')';

            SetupCard(defender.name,subtitle,defender.faction);
            outputCard.body.push(line);
            sendPing(defender.token.get("left"),defender.token.get("top"),Campaign().get("playerpageid"),null,true);
             
            let s = (blood === 1) ? "":"s";
    
            if (total < 2 && blood === 0) {
                outputCard.body.push("No Effect")
            } else if (total < 7) {
                //will catch no effect rolls with blood from gas or shrapnel or whatever
                outputCard.body.push("Minor Hit")
                outputCard.body.push(btip + " " + blood + " Blood Marker" + s);
                defender.Injury("Minor Hit",blood);
            } else if (total > 6 && total < 9) {
                outputCard.body.push("Defender" + remains + "Downed")
                outputCard.body.push(btip + " " + blood + " Blood Marker" + s);
                defender.Injury("Down",blood);
            } else if (total > 8) {
                let toughFlag = (defender.abilities.includes("Tough") && defender.token.get(SM.wounded) === false) ? true:false;
    
                if (toughFlag === true) {
                    outputCard.body.push(defender.name + " Survives a Major Injury");
                    outputCard.body.push("Defender" + remains + "Downed")
                    outputCard.body.push(btip + " " + blood + " Blood Marker" + s);
                    defender.token.set(SM.wounded,true);
                    defender.Injury("Down",blood);
                } else {
                    outputCard.body.push(defender.name + " taken Out of Action");
                    defender.Injury("Out of Action");
                }
            }

            if (attackInfo.reason === "Fall") {
                model.token.set("tint_color","#FF0000");
                let info = ModelHeight(model);
                model.token.set(info.heightSymbol,false);
            }
    
    
            if (attackInfo.defenders.length > 0) {
                ButtonInfo("Next Defender","!Injury");
            }
            PrintCard();
        }
    }
    
    
    















    const ChangeHex = (model,oldHexLabel,newHexLabel) => {

        let index = hexMap[oldHexLabel].modelIDs.indexOf(model.id);
        if (index > -1) {
            hexMap[oldHexLabel].modelIDs.splice(index,1);
        }
        if (newHexLabel) {
            hexMap[newHexLabel].modelIDs.push(model.id);
            model.hexLabel = newHexLabel;
            model.location = hexMap[newHexLabel].centre;
            model.cube = hexMap[newHexLabel].cube;
            model.offset = hexMap[newHexLabel].offset;
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


    const AddAbilities = (msg) => {
        if (!msg.selected) {
            sendChat("","No Token Selected");
            return;
        };
        let id = msg.selected[0]._id;
        let model = ModelArray[id];
        if (!model) {return};
        let abilityName,action;
        let abilArray = findObjs({_type: "ability", _characterid: model.charID});
        //clear old abilities
        for(let a=0;a<abilArray.length;a++) {
            abilArray[a].remove();
        } 

        abilityName = "Move";
        action = "!Movement;@{selected|token_id};Move;?{Type|Move|Charge|Diving Charge|Retreat}";
        AddAbility(abilityName,action, model.charID);

        abilityName = "Dash";
        action = "!Movement;@{selected|token_id};Dash}";
        AddAbility(abilityName,action, model.charID);

        //token info
        //los



        let num = 0;
        let melee = model.weaponArray.melee;
        if (melee) {
            for (let i=0;i<melee.length;i++) {
                let weapon = melee[i];
    //multiple attacks
                num++;
                abilityName = num + ": " + weapon.name;
                action = "!Melee;@{selected|token_id};@{target|token_id};" + i;
                AddAbility(abilityName,action, model.charID);
            }
        }
       

        let ranged = model.weaponArray.ranged;
        if (ranged) {
            for (let i=0;i<ranged.length;i++) {
                let weapon = ranged[i];
    //multiple attacks
                num++;
                abilityName = num + ": " + weapon.name;
                action = "!Ranged;@{selected|token_id};@{target|token_id};" + i;
                AddAbility(abilityName,action, model.charID);
            }
        }
        
        //Model Abilities needing macros - in form of name and # of targets
        let macros = [["On My Command!",1],["God is With Us!",1],["Onwards, Christian Soldiers!",0],["Aim",0],["Fortify",0],["De-mine",0]]
        for (let i=0;i<macros.length;i++) {
            let macroName = macros[i][0];
            if (model.abilities.includes(macroName)) {
                num++;
                abilityName = num + ": " + macroName;
                action = "!ModelAbilities;" + macroName + ";@{selected|token_id}";
                for (let j=0;j<macros[i][1];j++) {
                    action += ";@{target|Target " + (j+1) + "|token_id}";
                }
                AddAbility(abilityName,action, model.charID);
            }
        }

        //Equipment macros
        macros = [["Medi-Kit",1]];
        for (let i=0;i<macros.length;i++) {
            let macroName = macros[i][0];
            if (model.equipment.includes(macroName)) {
                num++;
                abilityName = num + ": " + macroName;
                action = "!ModelEquipment;" + macroName + ";@{selected|token_id}";
                for (let j=0;j<macros[i][1];j++) {
                    action += ";@{target|Target " + (j+1) + "|token_id}";
                }
                AddAbility(abilityName,action, model.charID);
            }
        }
            
    







       
    

        sendChat("","Abilities Added")


    }

    const ModelAbilities = (msg) => {
        //if it doenst go to a test, need to have a PrintCard

        let Tag = msg.content.split(";");
        let abilityName = Tag[1];
        let attackerID = Tag[2]; //model using ability
        let attacker = ModelArray[attackerID];
        if (attacker.token.get("aura1_color") === "#000000") {
            sendChat("","Model has finished its activation");
            return;
        }


        let defenderIDs = [];
        for (let i=3;i<Tag.length;i++) {
            defenderIDs.push(Tag[i]);
        }

        SetupCard(attacker.name,abilityName,attacker.faction);
        if (abilityName === "On My Command!") {
            let defender = ModelArray[defenderIDs[0]];
            let losResult = LOS(attacker,defender);
            if (losResult.los === false) {
                outputCard.body.push("Target has to be in LOS");
            } else {
                outputCard.body.push(defender.name + " must Activate Next");
                outputCard.body.push(attacker.name + "'s turn is over");
                attacker.token.set("aura1_color","#000000");
            }
            PrintCard();
        }
        if (abilityName === "God is With Us!") {
            let defender = ModelArray[defenderIDs[0]];
            let distance = attacker.cube.distance(defender.cube);
            if (distance > 6) {
                outputCard.body.push("Target is too far away");
                PrintCard();
            } else {
                //risky action
                ActionTest(abilityName,attacker.id,defender.id,true);
            }
        }
        if (abilityName === "Onwards, Christian Soldiers!") {
            outputCard.body.push("All friendly models that are within 8 of the Trench Cleric at the start of their Activation are not affected by FEAR for the turn.");
            _.each(ModelArray,model2 => {
                if (model2.faction === attacker.faction) {
                    let distance = attacker.cube.distance(model2.cube);
                    if (distance <= 8) {
                        model2.token.set(SM.morale,true);
                    }
                }
            })
            PrintCard();
        }
        if (abilityName === "Aim") {
            //risky action
            ActionTest(abilityName,attacker.id,"",true);            
        }
        if (abilityName === "Fortify") {
            let neighbourCubes = attacker.cube.neighbours();
            let check = false;
            loop1:
            for (let i=0;i<neighbourCubes.length;i++) {
                let cube = neighbourCubes[i];
                let hex = hexMap[cube.label()];
                if (hex) {
                    let modelIDs = hex.modelIDs;
                    for (let j=0;j<modelIDs.length;j++) {
                        let m3 = ModelArray[modelIDs[j]];
                        if (m3.faction !== attacker.faction) {
                            check = true;
                            break loop1;
                        }
                    }
                }
            }
            if (check === true) {
                outputCard.body.push("Engineer is in Combat and cannot Fortify");
                PrintCard();
            } else {
                ActionTest(abilityName,attacker.id,"",true,1);
            }
        }
        if (abilityName === "De-mine") {
            //As a RISKY ACTION the Engineer can disable any mine or trapped terrain they move in contact with. If they fail, the mine blows up as described in applicable rules.
            ActionTest(abilityName,attacker.id,"",true,1);


        }






    }


    const ModelEquipment = (msg) => {
        let Tag = msg.content.split(";");
        let equipName = Tag[1];
        let attackerID = Tag[2]; //model using ability
        let attacker = ModelArray[attackerID];
        if (attacker.token.get("aura1_color") === "#000000") {
            sendChat("","Model has finished its activation");
            return;
        }



        let defenderIDs = [];
        for (let i=3;i<Tag.length;i++) {
            defenderIDs.push(Tag[i]);
        }

        SetupCard(attacker.name,equipName,attacker.faction);
        if (equipName === "Medi-Kit") {
            let defender = ModelArray[defenderIDs[0]];  
            let distance = attacker.cube.distance(defender.cube);
            if (distance > 1) {
                outputCard.body.push("Need to be with 1 hex");
                PrintCard();
            } else {
                let bonus = 0;
                if (attacker.abilities.includes("Expert Medic")) {
                    bonus = 1;
                }
                ActionTest(equipName,attacker.id,defender.id,true,bonus)
            }
        }






    }






    const changeGraphic = (tok,prev) => {
        if (tok.get('subtype') === "token") {
            log(tok.get("name") + " moving in changeGraphic");
            if ((tok.get("left") !== prev.left) || (tok.get("top") !== prev.top) || (tok.get("rotation") !== prev.rotation)) {
                let model = ModelArray[tok.id];
                if (!model) {return};
                let oldHex = hexMap[model.hexLabel];
                let newLocation = new Point(tok.get("left"),tok.get("top"));
                let newHex = hexMap[newLocation.toOffset().label()];
                let oldHexLabel = model.hexLabel;
                let oldRotation = Angle(prev.rotation);
                let newRotation = Angle(tok.get("rotation"));
                //rotate in 60 degree increments
                let delta = (newRotation - oldRotation + 180) % 360 - 180;
                if (delta < 0) {newRotation = oldRotation - 60};
                if (delta > 0) {newRotation = oldRotation + 60};

                newLocation = newHex.centre; //centres it in hex

                //check if has moved out into lower height area
                let info = ModelHeight(model);
                if (info.heightSymbol !== "") {
                    let level = info.level;
                    let maxHeight = newHex.height - newHex.elevation;
                    if (level > maxHeight) {
                        level = maxHeight;
                    }
                    model.oldLevel = info.level;
                    model.token.set(info.heightSymbol,false);
                    model.token.set(SM["up" + level],true);
                }



                tok.set({
                    left: newLocation.x,
                    top: newLocation.y,
                    rotation: newRotation,
                });

               

                ChangeHex(model,oldHexLabel,newHex.label);

            };
        };
    };

    const handleInput = (msg) => {
        if (msg.type !== "api") {
            return;
        }
        let args = msg.content.split(";");
        log(args);
    
        switch(args[0]) {
            case '!Dump':
                log("STATE");
                log(state.TC);
                log("Model Array");
                log(ModelArray);
                break;
            case '!ClearState':
                ClearState(msg);
                break;
            case '!Roll':
                RollD6(msg);
                break;
            case '!AddModels':
                AddModels(msg);
                break;
            case '!TokenInfo':
                TokenInfo(msg);
                break;
            case '!CheckLOS':
                CheckLOS(msg);
                break;
            case '!AddAbilities':
                AddAbilities(msg);
                break;
            case '!NextTurn':
                NextTurn();
                break;
            case '!Test':
                Test(msg);
                break;
            case '!GameInfo':
                GameInfo();
                break;
            case '!Movement':
                Movement(msg);
                break;
            case '!Ranged':
                Ranged(msg);
                break;
            case '!Melee':
                Melee(msg);
                break;
            case '!Marker':
                Marker(msg);
                break;
            case '!UpDown':
                UpDown(msg);
                break;
            case '!ModelAbilities':
                ModelAbilities(msg);
                break;
            case '!ModelEquipment':
                ModelEquipment(msg);
                break;
            case '!Injury':
                Injury();
                break;
        }
    };



    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('change:graphic',changeGraphic);
        //on('destroy:graphic',destroyGraphic);
    };
    on('ready', () => {
        log("===> Trench Crusade Version: " + version + " <===");
        LoadPage();
        BuildMap();
        registerEventHandlers();
        sendChat("","API Ready, Map Loaded")
        log("On Ready Done")
    });
    return {
        // Public interface here
    };






})();