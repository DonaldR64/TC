const TC = (() => {
    const version = '2025.2.10';
    if (!state.TC) {state.TC = {}};

    const pageInfo = {name: "",page: "",gridType: "",scale: 0,width: 0,height: 0, hexesW: 0, hexesH: 0};
    const rowLabels = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN","AO","AP","AQ","AR","AS","AT","AU","AV","AW","AX","AY","AZ","BA","BB","BC","BD","BE","BF","BG","BH","BI"];

    let ModelArray = {}; 

    let hexMap = {}; 
    let MapEdge; //will be the x coord of the table edge
    
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
        moved: "status_Advantage-or-Up::2006462", //if model moved
        fired: "status_Shell::5553215",
       

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
            "image": "https://s3.amazonaws.com/files.d20.io/images/428505453/sjIHroRj6jS1pvF1WKnLGQ/thumb.png?1739231545",
            "backgroundColour": "#2F4F4F",
            "titlefont": "Arial",
            "fontColour": "#FFFFFF",
            "borderColour": "#000000",
            "borderStyle": "5px ridge",
            "dice": "Antioch",

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
        'Blast': "A weapon with BLAST (X) has an area of effect with a radius of hexes indicated by X. If this weapon targets a model, this radius is measured from the centre of that model’s base in all directions. If this weapon targets a point on the ground, this radius is measured from that point in all directions, including vertically. If the Attack ACTION with this weapon is successful, it hits every model within this radius that the target (either model or point) has line of sight to (i.e. not completely blocked by terrain).",
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
        



    }






    //los - if "Inside" - then only characters at edge of the terrain can see in/out, otherwise if los just crossing then is based on height - and if both inside LOS is open 
    //obstacle - can be defended behind - so if combat occuring across then gets bonus - for buildings this is if one of 2 models is 'outside'
    //trying additive hills, although may want some immediately 2 high hills also 
    const TerrainInfo = {
        "#000000": {name: "Hill", height: 1,los: "Open",cover: false,difficult: false,dangerous: false,obstacle: false},
        "#895129": {name: "Trench",height: -1,los: "Inside",cover: true,difficult: false,dangerous: false,obstacle: false},
        "#00ffff": {name: "Stream", height: 0,los: "Open",cover: true,difficult: true,dangerous: false,obstacle: false}, 
        "#00ff00": {name: "Woods",height: 3,los: "Inside",cover: true,difficult: true,dangerous: false,obstacle: false},
//fix burnt woods
        "#ffffff": {name: "Burnt Woods",height: 2,los: "",cover: true,difficult: true,dangerous: false,obstacle: false},

        "#b6d7a8": {name: "Scrub",height: 0,los: "Open",cover: true,difficult: false,dangerous: false,obstacle: false},
        "#fce5cd": {name: "Craters",height: 0,los: "Open",cover: true,difficult: true,dangerous: false,obstacle: false},
        "#0000ff": {name: "Swamp", height: 0,los: "Open",cover: true,difficult: true,dangerous: false,obstacle: false}, 

        "#ffff00": {name: "Rubble", height: 0,los: "Open",cover: true,difficult: true,dangerous: false,obstacle: false}, 
//fix
        "?????": {name: "Ruins",height: 1,los: "Inside",cover: true,difficult: true,dangerous: false,obstacle: false},
        "Building Height 1": {name: "Building",height: 1,los: "Inside",cover: true,difficult: true,dangerous: false,obstacle: true},
        "Building Height 2": {name: "Building",height: 2,los: "Inside",cover: true,difficult: true,dangerous: false,obstacle: true},
        "Building Height 3": {name: "Building",height: 3,los: "Inside",cover: true,difficult: true,dangerous: false,obstacle: true},


    };


    const MapTokenInfo = {
        "Hedge": {name: "Hedge",height: 0,los: "Open",cover: true,difficult: false,dangerous: false,obstacle: true},
        "Minefield": {name: "Minefield",height: 0,los: "Open",cover: false,difficult: true,dangerous: true,obstacle: false},
        "Barbed Wire": {name: "Barbed Wire",height: 0,los: "Open",cover: false,difficult: true,dangerous: true,obstacle: false},
        "Drums": {name: "Storage Drums",height: 0,los: "Open",cover: true,difficult: false,dangerous: false,obstacle: true},
        "Crater": {name: "Crater",height: 0,los: "Open",cover: true,difficult: true,dangerous: false,obstacle: false},
        "Boxes": {name: "Boxes",height: 0,los: "Open",cover: true,difficult: false,dangerous: false,obstacle: true},
        "Sandbags": {name: "Sandbags",height: 0,los: "Open",cover: true,difficult: false,dangerous: false,obstacle: true},
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
            this.terrain = "Open Ground";
            this.terrainID = [];
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




            let location = new Point(token.get("left"),token.get("top"));
            let cube = location.toCube();
            let offset = location.toOffset();
            let hexLabel = offset.label();

            //abilities
            let move = parseInt(attributeArray.move);
            let rangedBonus = parseInt(attributeArray.ranged);
            let meleeBonus = parseInt(attributeArray.melee);
            let baseArmour = parseInt(attributeArray.armour);

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
                for (let i=1;i<4;i++) {
                    let type = types[j] + i;
                    let wname = attributeArray[type+"name"];
                    let wequipped = attributeArray[type+"equipped"];
                    if (wequipped !== "Equipped") {continue};
                    if (!wname || wname === "" || wname === undefined || wname === " ") {continue};
                    let wtype = attributeArray[type+"type"];       
                    let wrange = parseInt(attributeArray[type+"range"]) || 0;
                    let wmodifiers = attributeArray[type+"modifiers"] || " ";
                    let wkeywords = attributeArray[type+"keywords"] || " ";
                    let wsound = attributeArray[type+"sound"] || "";
                    let wfx = attributeArray[type+"fx"] || "";
                    let weapon = {
                        name: wname,
                        type: wtype,
                        range: wrange,
                        modifiers: wmodifiers,
                        keywords: wkeywords,
                        sound: wsound,
                        fx: wfx,
                    }
                    if (weaponArray[type]) {
                        weaponArray[type].push(weapon);
                    } else {
                        weaponArray[type]= [weapon];
                    }
                    wkeywords = wkeywords.split(",");
                    _.each(wkeywords,key => {
                        if (key !== undefined && key !== " " && key !== "") {
                            keywords.push(key);
                        }
                    })
                }
            }


            for (let i=1;i<21;i++) {
                let attName = "spec" + i + "Name";
                let attText = "spec" + i + "Text";

                AttributeSet(char.id,attName,"");
                AttributeSet(char.id,attText,"");
            }

            let specNum = 1;
            let equipmentArray = [];
            for (let i=1;i<6;i++) {
                let name = attributeArray["equip" + i + "name"];
                let info = attributeArray["equip" + i + "info"];
                let equip = {
                    name: name,
                    info: info,
                }
                if (name !== undefined && name !== " " && name !== "") {
                    equipmentArray.push(equip);
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

            let abilityArray = [];
            for (let i=1;i<6;i++) {
                let name = attributeArray["ability" + i + "name"];
                let info = attributeArray["ability" + i + "info"];
                let ability = {
                    name: name,
                    info: info,
                }
                if (name !== undefined && name !== " " && name !== "") {
                    abilityArray.push(ability);
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
                return e.trim();
            });
            keywords = [...new Set(keywords)];

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


            this.name = token.get("name");
            this.id = tokenID;
            this.charID = char.id;
            this.charName = charName;

            this.player = player;
            this.faction = faction;
            this.location = location;
            this.cube = cube;
            this.hexLabel = hexLabel;

            this.move = move;
            this.rangedBonus = rangedBonus;
            this.meleeBonus = meleeBonus;
            this.baseArmour = baseArmour;
            //this.armour = armour;

            this.weaponArray = weaponArray;
            this.equipmentArray = equipmentArray;
            this.abilityArray = abilityArray;

            this.token = token;
            
            ModelArray[tokenID] = this;

            //hexMap[hexLabel].tokenIDs.push(token.id);
            














        }




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




    const ButtonInfo = (phrase,action) => {
        let info = {
            phrase: phrase,
            action: action,
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
                let out = "";
                let info = outputCard.buttons[i];
                out += `<div style="display: table-row; background: #FFFFFF;; `;
                out += `"><div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                out += `"><span style="line-height: normal; color: #000000; `;
                out += `"> <div style='text-align: centre; display:block;'>`;
                out += `<a style ="background-color: ` + Factions[outputCard.faction].backgroundColour + `; padding: 5px;`
                out += `color: ` + Factions[outputCard.faction].fontColour + `; text-align: centre; vertical-align: middle; border-radius: 5px;`;
                out += `border-color: ` + Factions[outputCard.faction].borderColour + `; font-family: Tahoma; font-size: x-small; `;
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

        
        let edges = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "map",fill: "#000000"});
        if (edges) {
            MapEdge = edges[0].get("x");
            if (edges.length > 1) {
                sendChat("","More than one Edge");
            } 
        } else {
            sendChat("","Need to add an Edge");
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

        let w = 0;
        let h = 0;

        for (let j = startY; j <= pageInfo.height;j+=HexInfo.ySpacing){
            h++;
            w = 0;
            for (let i = startX;i<= pageInfo.width;i+=HexInfo.xSpacing) {
                let point = new Point(i,j);     
                let hex = new Hex(point);

                if (point.x >= MapEdge) {
                    hexMap[hex.label].terrain = "Off Map";
                } else {
                    w++;
                }
                columnLabel++;
            }
            startX += halfToggleX;
            halfToggleX = -halfToggleX;
            rowLabelNum += 1;
            columnLabel = 1
        }

        pageInfo.hexesW = w;
        pageInfo.hexesH = h;

        //terrain
        //AddTerrain();    
        AddTokens();        
        let elapsed = Date.now()-startTime;
        log("Hex Map Built in " + elapsed/1000 + " seconds");
    };

    const AddTerrain = () => {
        let TerrainArray = {};
        //first look for graphic lines outlining hills etc
        let paths = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "map"});
        paths.forEach((pathObj) => {
            let vertices = [];
            toFront(pathObj);
            let colour = pathObj.get("stroke").toLowerCase();
            let t = TerrainInfo[colour];
            if (!t) {return};    
            let points = JSON.parse(pathObj.get("points"));
            let centre = new Point(pathObj.get("x"), pathObj.get("y"));
    
            //covert path points from relative coords to actual map coords
            let minX = Infinity,minY = Infinity, maxX = 0, maxY = 0;
            _.each(points,pt => {
                minX = Math.min(pt[0],minX);
                minY = Math.min(pt[1],minY);
                maxX = Math.max(pt[0],maxX);
                maxY = Math.max(pt[0],maxY);
            })
            //now C relative to the 0,0 of points
            midX = (Math.abs(minX) + Math.abs(maxX))/2 + minX;
            midY = (Math.abs(minY) + Math.abs(maxY))/2 + minY;

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
        let mapKeys = Object.keys(hexMap);
        const burndown = () => {
            let mapKey = mapKeys.shift();
            if (key){
                let hex = hexMap[mapKey];
                let c = hex.centre;
                if (c.x > MapEdge) {
                    hex.terrain = ["Offboard"];
                } else {
                    _.each(terrainKeys,terrainKey => {
                        let polygon = TerrainArray[terrainKey];
                        if (hex.terrain.includes(polygon.name)) {return};
                        let pts = XHEX(c);
                        pts.push(c);
                        let num = 0;
                        _.each(pts,pt => {
                            let check = pointInPolygon(pt,polygon);
                            if (check === true) {num++};
                        })
                        if (num > 2) {
                            //hex is in the terrain polygon
                            hex.terrain.push(polygon.name);
                            if (polygon.los === "Inside") {hex.los = "Inside"};
                            if (polygon.cover === true) {hex.cover = true};
                            if (polygon.difficult === true) {hex.difficult = true};
                            if (polygon.dangerous === true) {hex.dangerous = true};
                            if (polygon.obstacle === true) {hex.obstacle = true};
                            if (polygon.height !== 0) {
                                if (polygon.name = "Hill") {
                                    hex.elevation = hex.elevation + polygon.height;
                                } else if (polygon.name.includes("Trench")) {
                                    hex.elevation = hex.elevation - 1;
                                } else {
                                    hex.height = Math.max(hex.elevation + polygon.height,hex.height);
                                }
                            }
                        };
                    });
                };
                hexMap[mapKey] = hex;
                setTimeout(burndown,0);
            }
        }
        burndown();
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


    const XHEX = (point) => {
        //makes a small group of points for checking around centre
        let points = [];
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
            firstPlayer: -1,
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
        if (state.TC.turn === 0) {
            //start of game stuff


        }


        state.TC.turn++;

        //check for end of game


        let currentTurn = state.TC.turn;
        let models = [0,0];
        _.each(ModelArray,model => {
            models[model.player]++;
        })

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

        //update turn indicator on side


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
                bar3_value: 0,
                bar3_max: "",
                bar2_value: 0,
                bar2_max: "",
                bar1_value: 0,
                bar1_max: "",
                name: name,
            })
            





        })        














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
        outputCard.body.push("Elevation: " + h.elevation); //modify for character height - using token markers
        if (model.token.get("aura1_color") === "#FF0000") {
            outputCard.body.push("Model is Down");
        }
        if (h.cover === true) {
            outputCard.body.push("Target is in Cover");
        }

        PrintCard();
        
    }

    const CheckLOS = (msg) => {
        let Tag = msg.content.split(";");
        let shooterID = Tag[1];
        let targetID = Tag[2];
        
        let shooter = ModelArray[shooterID];
        let target = ModelArray[targetID];

        SetupCard("LOS","",shooter.faction);
        
        

    }



    const ChangeHex = (model,oldHexLabel,newHexLabel) => {
    


        let index = hexMap[oldHexLabel][label].indexOf(model.id);
        if (index > -1) {
            hexMap[oldHexLabel][label].splice(index,1);
        }
        if (newHexLabel) {
            hexMap[newHexLabel][label].push(model.id);
            model.hexLabel = newHexLabel;
            model.location = hexMap[newHexLabel].centre;
            if (model.hexLabel !== model.lastHexLabel && model.type !== "Ordnance" && model.type !== "Defence") {
                let h1 = hexMap[model.hexLabel];
                let h2 = hexMap[model.lastHexLabel];
                let d = h1.cube.distance(h2.cube);
                if (d <= 1 && model.type !== "Ordnance" && model.type !== "Defence") {
                    model.token.set(SM.slow,true);
                } else {
                    model.token.set(SM.slow,false);
                }
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


    const AddAbilities = (msg) => {
        let tokenIDs = [];
        for (let i=0;i<msg.selected.length;i++) {
            tokenIDs.push(msg.selected[i]._id);
        }
        if (!msg.selected || tokenIDs.length === 0) {
            sendChat("","No Token Selected");
            return;
        };
        _.each(tokenIDs,id => {
            let model = ModelArray[id];
            if (!model) {return};
            let abilityName,action;
            let abilArray = findObjs({_type: "ability", _characterid: model.charID});
            //clear old abilities
            for(let a=0;a<abilArray.length;a++) {
                abilArray[a].remove();
            } 

       
        })

        sendChat("","Abilities Added to " + tokenIDs.length + " Units")


    }






    const changeGraphic = (tok,prev) => {
        if (tok.get('subtype') === "token") {
            log(tok.get("name") + " moving in changeGraphic");
            if ((tok.get("left") !== prev.left) || (tok.get("top") !== prev.top) || (tok.get("rotation") !== prev.rotation)) {
                let model = ModelArray[tok.id];
                if (!model) {return};

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

                tok.set({
                    left: newLocation.x,
                    top: newLocation.y,
                    rotation: newRotation,
                });

               

                //ChangeHex(model,oldHexLabel,newHex.label);

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