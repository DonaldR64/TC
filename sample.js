const CC = (() => {
    const version = '2025.7.5';
    if (!state.CC) {state.CC = {}};

    const MapAreas = {};

    const areaColours = {
        "#355e3b": "Allies Order",
        "#40826d": "Allies Action",
        "#228b22": "Allies Event",
        "#4f7942": "Allies Hex",
        "#023020": "Allies Roll",
        "#008000": "Allies Radio",
        "#000000": "Axis Radio",
        "#36454f": "Axis Order",
        "#301934": "Axis Action",
        "#343434": "Axis Event",
        "#1b1212": "Axis Hex",
        "#28282b": "Axis Roll",
        "#ff0000": "Elite",
        "#ffff00": "Line",
        "#00ff00": "Green",
        "#9900ff": "Secret0",
        "#4a86e8": "Open",
        "#00ffff": "Secret1",
        "#5b0f00": "Allies Smoke",
        "#e69138": 'Axis Smoke',
        "#ff00ff": 'Axis Casualty',
        "#cfe2f3": 'Allies Casualty',
        "#073763": 'Weapon Casualty'
    }

    const pageInfo = {};
    const rowLabels = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN","AO","AP","AQ","AR","AS","AT","AU","AV","AW","AX","AY","AZ","BA","BB","BC","BD","BE","BF","BG","BH","BI"];

    let HexSize, HexInfo, DIRECTIONS;

    //math constants
    const M = {
        f0: Math.sqrt(3),
        f1: Math.sqrt(3)/2,
        f2: 0,
        f3: 3/2,
        b0: Math.sqrt(3)/3,
        b1: -1/3,
        b2: 0,
        b3: 2/3,
    }


    const DefineHexInfo = () => {
        HexSize = (70 * pageInfo.scale)/M.f0;
        if (pageInfo.type === "hex") {
            HexInfo = {
                size: HexSize,
                pixelStart: {
                    x: 35 * pageInfo.scale,
                    y: HexSize,
                },
                width: 70  * pageInfo.scale,
                height: pageInfo.scale*HexSize,
                xSpacing: 70 * pageInfo.scale,
                ySpacing: 3/2 * HexSize,
                directions: {
                    "Northeast": new Cube(1,-1,0),
                    "East": new Cube(1,0,-1),
                    "Southeast": new Cube(0,1,-1),
                    "Southwest": new Cube(-1,1,0),
                    "West": new Cube(-1,0,1),
                    "Northwest": new Cube(0,-1,1),
                },
                halfToggleX: 35 * pageInfo.scale,
                halfToggleY: 0,
            }
            DIRECTIONS = ["Northeast","East","Southeast","Southwest","West","Northwest"];
        } else if (pageInfo.type === "hexr") {
            //Hex H or Flat Topped
            HexInfo = {
                size: HexSize,
                pixelStart: {
                    x: HexSize,
                    y: 35 * pageInfo.scale,
                },
                width: pageInfo.scale*HexSize,
                height: 70  * pageInfo.scale,
                xSpacing: 3/2 * HexSize,
                ySpacing: 70 * pageInfo.scale,
                directions: {
                    "North": new Cube(0, -1, 1),
                    "Northeast": new Cube(1, -1, 0),
                    "Southeast": new Cube(1,0,-1),
                    "South": new Cube(0,1,-1),
                    "Southwest": new Cube(-1,1,0),
                    "Northwest": new Cube(-1,0,1),
                },
                halfToggleX: 0,
                halfToggleY: 35 * pageInfo.scale,
            }
            DIRECTIONS = ["North","Northeast","Southeast","South","Southwest","Northwest"];
        }
    }


    let UnitArray = {};
    let DeckInfo = {};
    let PlayerHands = {};
    let PlayerInfo = {};
    let MasterCardList = {};
    let MCList2 = {};
    let playedCardInfo = {};
    let currentCardIDs = [];
    let objectiveInfo = [{},{},{},{},{}];
    let currentPlayer = 0;
    let triggerFlag = false; //prevent triggers within trigger or time events
    let fireFlag = false;
    let orderNumber = [0,0];
    let activePlayer = -1;

    let outputCard = {title: "",subtitle: "",side: "",body: [],buttons: [],};

    const playerCodes = {
        "Don": "2520699",
        "DonAlt": "5097409",
        "Ted": "6951960",
        "Vic": "4892",
        "Ian": "4219310",
    }

    const PlayerIDs = () => {
        let players = Object.keys(playerCodes);
        for (let i=0;i<players.length;i++) {
            let roll20ID = playerCodes[players[i]];
            let playerObj = findObjs({_type:'player',_d20userid: roll20ID})[0];
            if (playerObj) {
                PlayerInfo[playerObj.get("id")] = players[i];
            }
        }
    }

    const Axis = ["German","Germany","Italy","Italian"];

    const Nations = {
        "Soviet": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/324272729/H0Ea79FLkZIn-3riEhuOrA/thumb.png?1674441877",
            "backgroundColour": "#FF0000",
            "titlefont": "Anton",
            "fontColour": "#000000",
            "borderColour": "#FFFF00",
            "borderStyle": "5px groove",
            "objectiveImages": ["https://s3.amazonaws.com/files.d20.io/images/445304877/D8ucERb5s8nd0DOIsl9CMQ/thumb.png?1750123755","https://s3.amazonaws.com/files.d20.io/images/445304874/dJ6xVWhfLCm4Uou48vnCfg/thumb.png?1750123755","https://s3.amazonaws.com/files.d20.io/images/445304876/4odiUvSOkxHf00qcx1ppmA/thumb.png?1750123755","https://s3.amazonaws.com/files.d20.io/images/445304868/igTVJFTaZwvaxTmPsfkCkw/thumb.png?1750123756","https://s3.amazonaws.com/files.d20.io/images/445304873/d_CPIui5A3wFCIKGDPHbIg/thumb.png?1750123755"],
        },
        "German": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/329415788/ypEgv2eFi-BKX3YK6q_uOQ/thumb.png?1677173028",
            "backgroundColour": "#000000",
            "titlefont": "Bokor",
            "fontColour": "#FFFFFF",
            "borderColour": "#000000",
            "borderStyle": "5px double",
            "objectiveImages": ["https://s3.amazonaws.com/files.d20.io/images/445304878/7sv6_pVqHCFGbGiWCuqbzg/thumb.png?1750123755","https://s3.amazonaws.com/files.d20.io/images/445304871/FIF-LpYU5qgw9JBsP2dJLw/thumb.png?1750123755","https://s3.amazonaws.com/files.d20.io/images/445304865/YuJzFMH6lFfsuyTYx6bVOw/thumb.png?1750123755","https://s3.amazonaws.com/files.d20.io/images/445304875/StDmyn9pVDrtwEyTE-frIw/thumb.png?1750123755","https://s3.amazonaws.com/files.d20.io/images/445304883/Y_Vl02FG29U-l1Vc6f1WUw/thumb.png?1750123758"],

        },
        "British": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/330506939/YtTgDTM3q7p8m0fJ4-E13A/thumb.png?1677713592",
            "backgroundColour": "#0E2A7A",
            "titlefont": "Merriweather",
            "fontColour": "#FFFFFF",
            "borderColour": "#BC2D2F",
            "borderStyle": "5px groove",            
        },
        "US Army": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/327595663/Nwyhbv22KB4_xvwYEbL3PQ/thumb.png?1676165491",
            "backgroundColour": "#FFFFFF",
            "titlefont": "Arial",
            "fontColour": "#006400",
            "borderColour": "#006400",
            "borderStyle": "5px double",
            "objectiveImages": ["https://s3.amazonaws.com/files.d20.io/images/445304872/fIy67Yo923_h0TgDzZRStA/thumb.png?1750123755","https://s3.amazonaws.com/files.d20.io/images/445304866/VzJBeQWNHTOxTxRQDsgA_w/thumb.png?1750123755","https://s3.amazonaws.com/files.d20.io/images/445304867/ssuK9PNe0tDCLfvJ0GDo1g/thumb.png?1750123755","https://s3.amazonaws.com/files.d20.io/images/445304869/hR1vO3ArlDpfSukaRqNIzw/thumb.png?1750123755","https://s3.amazonaws.com/files.d20.io/images/445304870/hhliLOiwpA8kQNZShdVr-Q/thumb.png?1750123755"],
            
        },

        "Neutral": {
            "image": "",
            "backgroundColour": "#FFFFFF",
            "dice": "UK",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#00FF00",
            "borderStyle": "5px ridge",
            "objectiveImages": ["https://s3.amazonaws.com/files.d20.io/images/445305278/d0gD6ulV_LWL6GqXLHl4Lg/thumb.png?1750123999","https://s3.amazonaws.com/files.d20.io/images/445305279/Qlfo7DUpfqQytnDDj1iNFw/thumb.png?1750124000","https://s3.amazonaws.com/files.d20.io/images/445305282/dDimDBtHc8VQCygdSvUsqA/thumb.png?1750123999","https://s3.amazonaws.com/files.d20.io/images/445305281/N-hzu0glUwi30tzyPJrmHA/thumb.png?1750123999","https://s3.amazonaws.com/files.d20.io/images/445305280/Km2iwf_F-BC_5ZBf0EaJ8A/thumb.png?1750123999"],

        },

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

    const PlaySound = (name) => {
        let sound = findObjs({type: "jukeboxtrack", title: name})[0];
        if (sound) {
            sound.set({playing: true,softstop:false});
        }
    };

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


    //Retrieve Values from character Sheet Attributes
    const Attribute = (character,attributename) => {
        //Retrieve Values from character Sheet Attributes
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
            let q,r;
            if (pageInfo.type === "hex") {
                q = this.col - (this.row - (this.row&1))/2;
                r = this.row;
            } else if (pageInfo.type === "hexr") {
                q = this.col;
                r = this.row - (this.col - (this.col&1))/2;
            }
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

    const Angle = (theta) => {
        while (theta < 0) {
            theta += 360;
        }
        while (theta >= 360) {
            theta -= 360;
        }
        return theta
    }   

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
            let x,y;
            if (pageInfo.type === "hex") {
                x = (M.f0 * this.q + M.f1 * this.r) * HexInfo.size;
                y = 3/2 * this.r * HexInfo.size;
            } else if (pageInfo.type === "hexr") {
                x = 3/2 * this.q * HexInfo.size;
                y = (M.f1 * this.q + M.f0 * this.r) * HexInfo.size;
            }
            x += HexInfo.pixelStart.x;
            y += HexInfo.pixelStart.y;
            let point = new Point(x,y);
            return point;
        }
        toOffset() {
            let col,row;
            if (pageInfo.type === "hex") {
                col = this.q + (this.r - (this.r&1))/2;
                row = this.r;
            } else if (pageInfo.type === "hexr") {
                col = this.q;
                row = this.r + (this.q - (this.q&1))/2;
            }
            let offset = new Offset(col,row);
            return offset;
        }
        whatDirection(b) {
            let delta = new Cube(b.q - this.q,b.r - this.r, b.s - this.s);
            let dir = "Unknown";
            let keys = Object.keys(HexInfo.directions);
            for (let i=0;i<6;i++) {
                let d = HexInfo.directions[keys[i]];
                if (d.q === delta.q && d.r === delta.r && d.s === delta.s) {
                    dir = keys[i];
                }
            }
            return dir
        }

     
    };

    class Hex {
        constructor(point) {
            this.centre = point;
            let offset = point.toOffset();
            this.offset = offset;
            this.tokenIDs = [];
            this.cube = offset.toCube();
            this.label = offset.label();
            HexMap[this.label] = this;
        }
    }

    class Unit {
        constructor(token) {
            let id = token.get("id");
            let location = new Point(token.get("left"),token.get("top"));
            let cube = location.toCube();
            let label = cube.label();
            let charID = token.get("represents");
            let char = getObj("character", charID); 
            let nation = Attribute(char,"nation") || "Neutral";

            this.name = token.get("name");
            this.charName = char.get("name");
            this.id = id;
            this.hexLabel = label;
            this.nation = nation;
            UnitArray[id] = this;
            HexMap[label].tokenIDs.push(id);
        }
    }





    const AddAbility = (abilityName,action,characterID) => {
        createObj("ability", {
            name: abilityName,
            characterid: characterID,
            action: action,
            istokenaction: true,
        })
    }    

    const AddAbilities = (msg) => {
        if (!msg.selected) {
            sendChat("","No Token Selected");
            return;
        };
        //!AddAbilities;?{Type|Marker|Squad|Team|Weapon};?{Nation|Soviet|German|American};
        let type = msg.content.split(";")[1];
        let nation = msg.content.split(";")[2];
        let side = (Axis.includes(nation)) ? "Axis":"Allies";

        let id = msg.selected[0]._id;
        let token = findObjs({_type:"graphic", id: id})[0];

        let charID = token.get("represents");
        if (!charID) {
            sendChat("","No Associated Character for this Token");
            return;
        }
        let char = getObj("character", charID);   

        AttributeSet(charID,"nation",nation);
        AttributeSet(charID,"type",type);
        AttributeSet(charID,"side",side);


        let abilityName,action;
        let abilArray = findObjs({_type: "ability", _characterid: charID});
        //clear old abilities
        for(let a=0;a<abilArray.length;a++) {
            abilArray[a].remove();
        } 



        if (type === "Marker") {
            size = 40;
            abilityName = "Flip";
            action = "!Flip";
            AddAbility(abilityName,action,charID);
        }
        if (type === "Weapon" || type === "Squad" || type === "Team" || type === "Leader") {
            abilityName = "Break/Rally";
            action = "!Flip";
            AddAbility(abilityName,action,charID);       
        }
        if (type === "Weapon") {
            size = 50;
            abilityName = "Remove";
            action = "!Casualty";
            AddAbility(abilityName,action,charID);
        }
        if (type === "Squad" || type === "Team" || type === "Leader") {
            size = 70;
            abilityName = "Suppress";
            action = "!AddMarker;Suppress";
            AddAbility(abilityName,action,charID);
            abilityName = "Veteran";
            action = "!AddMarker;Veteran";
            AddAbility(abilityName,action,charID);
            abilityName = "Casualty";
            action = "!Casualty";
            AddAbility(abilityName,action,charID);
        }





        if (type === "Squad") {
            abilityName = "Deploy";
            action = "!Deploy;Deploy";
            AddAbility(abilityName,action,charID);  
            abilityName = "Light Wounds";
            action = "!Deploy;Light";
            AddAbility(abilityName,action,charID);  
        }


        token.set({
            width: size,
            height: size,
            disableSnapping: true,
            disableTokenMenu: true,
        })


        setDefaultTokenForCharacter(char,token);



        sendChat("","Abilities Added")
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

        if (!outputCard.side || !Nations[outputCard.side]) {
            outputCard.side = "Neutral";
        }

        //start of card
        output += `<div style="display: table; border: ` + Nations[outputCard.side].borderStyle + " " + Nations[outputCard.side].borderColour + `; `;
        output += `background-color: #EEEEEE; width: 100%; text-align: center; `;
        output += `border-radius: 1px; border-collapse: separate; box-shadow: 5px 3px 3px 0px #aaa;;`;
        output += `"><div style="display: table-header-group; `;
        output += `background-color: ` + Nations[outputCard.side].backgroundColour + `; `;
        output += `background-image: url(` + Nations[outputCard.side].image + `), url(` + Nations[outputCard.side].image + `); `;
        output += `background-position: left,right; background-repeat: no-repeat, no-repeat; background-size: contain, contain; align: center,center; `;
        output += `border-bottom: 2px solid #444444; "><div style="display: table-row;"><div style="display: table-cell; padding: 2px 2px; text-align: center;"><span style="`;
        output += `font-family: ` + Nations[outputCard.side].titlefont + `; `;
        output += `font-style: normal; `;

        let titlefontsize = "1.4em";
        if (outputCard.title.length > 12) {
            titlefontsize = "1em";
        }

        output += `font-size: ` + titlefontsize + `; `;
        output += `line-height: 1.2em; font-weight: strong; `;
        output += `color: ` + Nations[outputCard.side].fontColour + `; `;
        output += `text-shadow: none; `;
        output += `">`+ outputCard.title + `</span><br /><span style="`;
        output += `font-family: Arial; font-variant: normal; font-size: 13px; font-style: normal; font-weight: bold; `;
        output += `color: ` +  Nations[outputCard.side].fontColour + `; `;
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
                    out += `<a style ="background-color: ` + Nations[outputCard.side].backgroundColour + `; padding: 5px;`
                    out += `color: ` + Nations[outputCard.side].fontColour + `; text-align: center; vertical-align: middle; border-radius: 5px;`;
                    out += `border-color: ` + Nations[outputCard.side].borderColour + `; font-family: Tahoma; font-size: x-small; `;
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
                    if (Nations[fac]) {
                        lineBack = Nations[fac].backgroundColour;
                        fontcolour = Nations[fac].fontColour;
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
                let borderColour = Nations[outputCard.side].borderColour;
                
                if (inline === false || i===0) {
                    out += `<div style="display: table-row; background: #FFFFFF;; ">`;
                    out += `<div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                    out += `"><span style="line-height: normal; color: #000000; `;
                    out += `"> <div style='text-align: center; display:block;'>`;
                }
                if (inline === true) {
                    out += '<span>     </span>';
                }
                out += `<a style ="background-color: ` + Nations[outputCard.side].backgroundColour + `; padding: 5px;`
                out += `color: ` + Nations[outputCard.side].fontColour + `; text-align: center; vertical-align: middle; border-radius: 5px;`;
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

    //related to building hex map
    const LoadPage = () => {
        //build Page Info and flesh out Hex Info
        pageInfo.page = getObj('page', Campaign().get("playerpageid"));
        pageInfo.name = pageInfo.page.get("name");
        pageInfo.scale = pageInfo.page.get("snapping_increment");
        pageInfo.width = pageInfo.page.get("width") * 70;
        pageInfo.height = pageInfo.page.get("height") * 70;
        pageInfo.type = pageInfo.page.get("grid_type");

    }

    const BuildMap = () => {
        let startTime = Date.now();
        HexMap = {};

        //define areas with lines
        let paths = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "map",});
        _.each(paths,path => {
            let colour = path.get("stroke").toLowerCase();
            let type = areaColours[colour];
            if (type) {
                let centre = new Point(Math.round(path.get("x")), Math.round(path.get("y")));
                let vertices = translatePoly(path);
                MapAreas[type] = {'vertices': vertices, 'centre': centre};
            }
        });



        let startX = HexInfo.pixelStart.x;
        let startY = HexInfo.pixelStart.y;
        let halfToggleX = HexInfo.halfToggleX;
        let halfToggleY = HexInfo.halfToggleY;
        if (pageInfo.type === "hex") {
            for (let j = startY; j <= pageInfo.height;j+=HexInfo.ySpacing){
                for (let i = startX;i<= pageInfo.width;i+=HexInfo.xSpacing) {
                    let point = new Point(i,j);     
                    let hex = new Hex(point);
                }
                startX += halfToggleX;
                halfToggleX = -halfToggleX;
            }
        } else if (pageInfo.type === "hexr") {
            for (let i=startX;i<=pageInfo.width;i+=HexInfo.xSpacing) {
                for (let j=startY;j<=pageInfo.height;j+=HexInfo.ySpacing) {
                    let point = new Point(i,j);     
                    let hex = new Hex(point);
                }
                startY += halfToggleY;
                halfToggleY = -halfToggleY;
            }
        }
        AddTokens();        
        //Objectives
        IdentifyObjectives();
        //terrain
        //AddTerrain();    
        let elapsed = Date.now()-startTime;
        log("Hex Map Built in " + elapsed/1000 + " seconds");
    };


    const IdentifyObjectives = () => {
        let tokens = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "map",});
        _.each(tokens,token => {
            let name = token.get("name");
            if (name && name.includes("Objective")) {
                let pos = parseInt(name.replace(/\D/g, ''));
                if (isNaN(pos) === false && pos < 6 && pos > 0) {
                    pos -= 1;
                    let point = new Point(token.get("left"),token.get("top"));
                    let hexLabel = point.toCube().label();
                    let info = {
                        hexLabel: hexLabel,
                        tokenID: token.get("id"),
                    }
                    objectiveInfo[pos] = info;
                } 
            }
        })
    }





    const AddTerrain = () => {
        //add terrain using tokens
        let tokens = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "map",});
        _.each(tokens,token => {
            let name = token.get("name");
            if (name === "Smoke" || name === "Dispersed Smoke") {
                let centre = new Point(token.get("left"),token.get('top'));
                let centreLabel = centre.toCube().label();
                let hex = HexMap[centreLabel];
                if (name === "Smoke") {
                    hex.smoke = true;
                } else {
                    hex.smoke = "Dispersed";
                }
                hex.smokeID = token.id;
            }
            let terrain = TerrainInfo[name];
            if (terrain) {
                let centre = new Point(token.get("left"),token.get('top'));
                let centreLabel = centre.toCube().label();
                let hex = HexMap[centreLabel];
                let keys = Object.keys(terrain);
                _.each(keys,key => {
                    hex[key] = terrain[key];
                })        
            }
        })
        AddRivers();
        AddRoads();
    }


    const AddRivers = () => {
        let paths = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "map",});

        _.each(paths,path => {
            let types = {"#0000ff": "River","#000000": "Bridge"};
            let type = types[path.get("stroke").toLowerCase()];
            if (type) {
                let vertices = translatePoly(path);
                //work through pairs of vertices
                for (let i=0;i<(vertices.length -1);i++) {
                    let pt1 = vertices[i];
                    let pt2 = vertices[i+1];
                    let midPt = new Point((pt1.x + pt2.x)/2,(pt1.y + pt2.y)/2);
                    //find nearest hex to midPt
                    let hexLabel = midPt.label();
                    //now run through that hexes neighbours and see what intersects with original line to identify the 2 neighbouring hexes
                    let hex1 = HexMap[hexLabel];
                    if (!hex1) {continue}
                    let pt3 = hex1.centre;
                    let neighbourCubes = hex1.cube.neighbours();
                    for (let j=0;j<neighbourCubes.length;j++) {
                        let k = j+3;
                        if (k> 5) {k-=6};
                        let hex2 = HexMap[neighbourCubes[j].label()];
                        if (!hex2) {continue}
                        let pt4 = hex2.centre;
                        let intersect = lineLine(pt1,pt2,pt3,pt4);
                        if (intersect) {
                            if (hex1.edges[DIRECTIONS[j]] !== "Bridge") {
                                hex1.edges[DIRECTIONS[j]] = type;
                            }
                            if (hex2.edges[DIRECTIONS[k]] !== "Bridge") {
                                hex2.edges[DIRECTIONS[k]] = type;
                            }
                        }
                    }
                }
            }
        })
    }
    
    const AddRoads = () => {
        let roads = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "map",}).filter(el => {
            return el.get("stroke").toLowerCase() === "#ffffff";
        });
        _.each(roads,road => {
            let vertices = translatePoly(road);
            for (let i=0;i<(vertices.length-1);i++) {
                let cube1 = vertices[i].toCube();
                let cube2 = vertices[i+1].toCube();
                let interCubes = cube1.linedraw(cube2);
                _.each(interCubes, cube => {
                    HexMap[cube.label()].road = true;
                })
                HexMap[cube1.label()].road = true;
                HexMap[cube2.label()].road = true;
            }
        })
    }



     
    const AddTokens = () => {
        UnitArray = {};
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
            if (character) {
                let unit = new Unit(token);
            }   
        });




        let elapsed = Date.now()-start;
        log(`${c} token${s} checked in ${elapsed/1000} seconds - ` + Object.keys(UnitArray).length + " placed in Unit Array");



    }

    const DefineOffboard = (token) => {
        let centre = new Point(token.get("left"),token.get('top'));
        let halfW = token.get("width")/2;
        let halfH = token.get("height")/2;
        let minX = centre.x - halfW;
        let maxX = centre.x + halfW;
        let minY = centre.y - halfH;
        let maxY = centre.y + halfH;
        _.each(HexMap,hex => {
            if (hex.centre.x < minX || hex.centre.x > maxX || hex.centre.y < minY || hex.centre.y > maxY) {
                hex.terrain = "Offboard";
                hex.offboard = true;
            }
        })
    }







    const TokensInArea = (type,areas) => {
        //find all tokens of a type in an array of areas
        //send back an array of same
        let array = [];
        if (Array.isArray(areas) === false) {
            areas = [areas];
        }
        _.each(areas,area => {
            let zone = MapAreas[area];
            let tokens = findObjs({_pageid:  Campaign().get("playerpageid") ,_type: "graphic"});
            _.each(tokens,token => {
                let name = token.get("name");
                let x = token.get("left");
                let y = token.get("top");
                if (x < zone.vertices[0].x || x > zone.vertices[1].x || y < zone.vertices[0].y || y > zone.vertices[1].y) {
                    return;
                };
                log(name)
                if (areas[0] === "Elite" || areas[0] === "Line" || areas[0] === "Green") {
                    name = name.split(" ");
                    if (type === "Axis" && Axis.includes(name[0])) {
                        array.push(name);
                    } else if (type !== "Axis" && Axis.includes(name[0]) === false) {
                        array.push(name);
                    }
                }
                if (type === "fate") {
                    array.push(name);
                }
                if (type === "casualty") {
                    array.push(name);
                }
            })
        })
        return array;
    }

    const Event = (msg) => {
        let type = msg.content.split(";")[1];
        let playerID = msg.playerid;
        let side = state.CC.players[playerID];
        if (!side) {return};
        let player = (side === "Axis") ? 0:1;
        let nation = state.CC.nations[player];
        let area = side + " " + type;

        RemoveLines();

        let location = DeepCopy(MapAreas[area].centre);
        let deckName = nation + " Fate Deck";
        let deckID = DeckInfo[deckName].id;
        let cardID = drawCard(deckID);
        if (cardID === false || !cardID) {
            //empty deck
            AdvanceTime(player);
            cardID = drawCard(deckID);
        }
        currentPlayer = player;

        let card = MasterCardList[cardID];
        playCardToTable(cardID, {left: location.x, top: location.y, width: 250, height: 350});
        currentCardIDs.push(cardID);

        if (type === "Event") {
            let eventName = card.event;
            let eventText = EventInfo[eventName];
            SetupCard(eventName,"",nation);
            outputCard.body.push(eventText);
            triggerFlag = false;
            PrintCard();
            if (eventName === "Mission Objective") {
                EventObjective("Mission",currentPlayer);
            }
            if (eventName === "Strategic Objective") {
                EventObjective("Strategic");
            }

        } else if (type === "Roll") {
            let whiteRoll = parseInt(card.whiteRoll);
            let redRoll = parseInt(card.redRoll);
            let totalRoll = whiteRoll + redRoll;
            if (fireFlag === true) {
                PlaySound("Small Arms");
                fireFlag = false;
            }
            SetupCard("Roll","",nation);
            //replace with graphics of dice as white or red
            let white = DisplayDice(whiteRoll,"White",36);
            let red = DisplayDice(redRoll,"Red",36);
            outputCard.body.push(white + "  +  " + red);
            outputCard.body.push("Total: " + totalRoll);
            if (card.trigger !== false && triggerFlag === false) {
                outputCard.body.push("[hr]");
                outputCard.body.push("Trigger Possible");
                PrintCard();
                Trigger(card.trigger,player);
            } else {
                triggerFlag = false;
                PrintCard();
            }
        } else if (type === "Hex") {
            let hex = card.hex;
            SetupCard(hex,"",nation);
            outputCard.body.push("Check Broken Weapons Also");
            triggerFlag = false;
            PrintCard();
        }

    }

    const EventObjective = (type,player) => {
        let rnd = state.CC.objectivesInPlay.length - 1;
        let obj = state.CC.objectivesInPlay[rnd];
        state.CC.objectivesInPlay.splice(rnd,1);
        if (type === "Mission") {
            AddObjective("Hidden",obj,player);
        } else if (type === "Strategic") {
            AddObjective("Open",obj);
        }
    }



    const Trigger = (type,player) => {
        PlaySound("Chime");
        triggerFlag = true;
        let nation = state.CC.nations[player];
        SetupCard(type,"Trigger",nation);
        if (type === "Event") {
            outputCard.body.push("Draw an Event and resolve before resolving the Dice Roll");
        } else if (type === "Jammed") {
            outputCard.body.push("If the Roll is for an attack, all weapons are Jammed");
        } else if (type === "Sniper") {
            outputCard.body.push("Draw a Random Hex for the effect");
        } else if (type === "Time") {
            outputCard.body.push("Play stops temporarily while Time Advances");
            AdvanceTime(player,true);
        }
        if (type !== "Time") {
            outputCard.body.push("Resolve the previous roll once " + type + " Trigger Done");
            PrintCard();
        }    
    }


    const Order = () => {
        RemoveLines();
        let cardID = playedCardInfo.id;
        currentCardIDs.push(cardID);
        let nation = playedCardInfo.nation;
        let side = (Axis.includes(nation)) ? "Axis":"Allies";
        let player = (side === "Axis") ? 0:1;        
        let type = playedCardInfo.type;
        //'register' it so only displays once
        let card = MasterCardList[cardID];
        
        if (type === "Order") {
            let subtitle;
            if (activePlayer === -1) {
                activePlayer = player; //beg of game
            }
            if (player === activePlayer) {
                orderNumber[player]++
                subtitle = "Order #:" + orderNumber[player];
            } else {
                subtitle = "OP Fire";
            }
            let order = card.order;
            SetupCard(order,subtitle,nation);
            if (order === "Fire") {
                fireFlag = true;
            }
        } else if (type === "Action") {
            let action = card.action;
            SetupCard(action,"Action",nation);
            outputCard.body.push(ActionInfo[action]);
        }
        PrintCard();
        triggerFlag = false;
    }


    const AddMarker = (msg) => {
        let id = msg.selected[0]._id;
        let type = msg.content.split(";")[1];
        let token = findObjs({_type:"graphic", id: id})[0];
        let charID,img;
        if (type === "Veteran") {
            charID = "-OSevl13S7Q6iSaFbutR";
        } else if (type === "Suppress") {
            charID = "-OSew5Cn6ReQ0Arco_HQ";
        }
        let char = getObj("character", charID);
        let tokenID = summonToken(char,token.get("left") - 15,token.get('top') - 15,0,40);
        if (tokenID) {
            token = findObjs({_type:"graphic", id: tokenID})[0];
            toFront(token);
        }
    }

    const PlaceSmoke = (msg) => {
        let id = msg.selected[0]._id;
        let playerID = msg.playerid;
        let side = state.CC.players[playerID];

        let token = findObjs({_type:"graphic", id: id})[0];
        let roll = randomInteger(50);
        let level;
        if (roll <= 30) {
            level = Math.ceil(roll/6);
        } else if (roll > 30) {
            roll -= 30;
            level = Math.ceil(roll/4) + 5;
        }
        let charName = "Smoke " + level;
        let character = findObjs({_type: "character", name: charName})[0];
        summonToken(character,token.get('left'),token.get("top"),0,160);
        let smokeAreaName = side + " Smoke";
        let zone = MapAreas[smokeAreaName];
        token.set({
            left: zone.centre.x,
            top: zone.centre.y,
        })
       let tokens = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "objects",});
        _.each(tokens,token => {
            if (token.get("name").includes("Smoke")) {
                token.set("disableSnapping",false);
                toBack(token);
            }
        })
    }





    const Deploy = (msg) => {
        let id = msg.selected[0]._id;
        let mode = msg.content.split(";")[1]; 
        let token = findObjs({_type:"graphic", id: id})[0];
        let charID = token.get("represents");
        let char = getObj("character", charID);
        let name = char.get("name");
        let nation = name.split(" ")[0];
        let side = (Axis.includes(nation)) ? "Axis":"Allies";
        let player = (side === "Axis") ? 0:1;
        let type = state.CC.forceType[player]; //green, line, elite
        let teamName = nation + " " + type + " Team";
        let teamChar = findObjs({_type: "character", name: teamName})[0];
        let currentSide = token.get('currentSide');
        let number = (mode === "Deploy") ? 2:1;
        let left = token.get("left");
        let top = token.get('top');
        for (let i=0;i<number;i++) {
            if (i===1) {
                let pt = new Point(left,top);
                let cube = pt.toCube();
                let hex = HexMap[cube.label()];
                left = (2 * hex.centre.x) - left;
                top = (2 * hex.centre.y) - top;
                if (left === hex.centre.x && top === hex.centre.y) {
                    left -= 50;
                    top -= 50;
                }
            }
            summonToken(teamChar,left,top,currentSide);
        }
    
        token.remove();
        SetupCard(mode,"",nation);
        if (mode === "Deploy") {
            outputCard.body.push("Any Markers such as Weapons, Suppressed or Veteran are allocated to one team");
        } else {
            outputCard.body.push("1 VP Is awarded to the other player");
        }
        PrintCard();


    }

	summonToken = function(character,left,top,currentSide,size){
        if (!currentSide) {currentSide = 0};
        if (!size) {size = 70};
		character.get('defaulttoken',function(defaulttoken){
		    const dt = JSON.parse(defaulttoken);
            let img;
            if (dt.sides) {
                sides = dt.sides.split("|")
                img = sides[currentSide] || dt.imgsrc;
            } else {
                img = dt.imgsrc;
            }
            img = tokenImage(img);
			if(dt && img){
				dt.imgsrc=img;
				dt.left=left;
				dt.top=top;
				dt.pageid = pageInfo.page.get('id');
                dt.layer = "objects";
                dt.width = size;
                dt.height = size;
                dt.currentSide = currentSide;
                log(dt)
                let newToken = createObj("graphic", dt);
                newToken.set({
                    disableSnapping: true,
                    disableTokenMenu: true,
                })
                return newToken.get("id");
			} else {
				sendChat('','/w gm Cannot create token for <b>'+character.get('name')+'</b>');
			}
		});
	};


    const TokenInfo = (msg) => {
        let id = msg.selected[0]._id;
        let token = findObjs({_type:"graphic", id: id})[0];
        log(token)


    }


    const Flip = (msg) => {
        let id = msg.selected[0]._id;
        let token = findObjs({_type:"graphic", id: id})[0];
        let currentSide = token.get('currentSide');
        let tsides = token.get("sides");
        tsides = tsides.split("|");
        let sides = [];
        _.each(tsides,tside => {
            if (tside) {
                let side = tokenImage(tside);
                sides.push(side);
            }
        })        
        newSide = (currentSide === 0) ? 1:0;
        token.set({
            currentSide: newSide,
            imgsrc: sides[newSide],
        })
    }

    const BuildDecks = () => {
        DeckInfo = {};
        PlayerHands = {};
        MasterCardList = {};
        let decks = findObjs({_type: "deck"});
        let hands = findObjs({_type: "hand"});

        log(decks)

        _.each(decks,deck => {
            let deckID = deck.get("id");
            let deckName = deck.get("name");
            if (deckName !== "Playing Cards") {
                let cardIDs = deck.get("currentDeck").split(",");
                let cards = {};
                let nation,side,ci;
                _.each(cardIDs,cardID => {
                    let card = findObjs({_type: "card", id:cardID})[0];
                    let cardName = card.get("name") || "Unknown";
                    cards[cardID] = cardName;
                    if (deckName.includes("German")) {
                        ci = GermanFate[cardName];
                        nation = "German";
                        side = "Axis";
                    } else if (deckName.includes("Soviet")) {
                        ci = SovietFate[cardName];
                        nation = "Soviet";
                        side = "Allies";
                    }


            if (!ci) {
                ci = {'order': 'Nil','action': 'Nil','event': 'Nil','hex': 'Nil','totalRoll': 12,'whiteRoll': 6,'redRoll': 6,'trigger': false,}
            }

                    MasterCardList[cardID] = {
                        deckID: deckID,
                        deckName: deckName,
                        nation: nation,
                        side: side,
                        name: cardName,
                        id: cardID,
                        order: ci.order,
                        action: ci.action,
                        event: ci.event,
                        hex: ci.hex,
                        totalRoll: ci.totalRoll,
                        whiteRoll: ci.whiteRoll,
                        redRoll: ci.redRoll,
                        trigger: ci.trigger,
                    };

                    MCList2[cardName] = cardID;
                })
                DeckInfo[deckName] = {
                    name: deckName,
                    id: deckID,
                    cards: cards,
                }



            }
        })
        _.each(hands,hand => {
            let handID = hand.get("id");
            let playerID = hand.get("parentid");
            PlayerHands[playerID] = handID;
        })



    }


    const DrawCard = (msg) => {
        let playerID = msg.playerid;
        let deckType = msg.content.split(";")[1];
        let side = state.CC.players[playerID];
        let deckName = side + " " + deckType;
        DrawCard2(playerID,deckName);
    }

    const DrawCard2 = (playerID,deckName) => {
        let deck = DeckInfo[deckName];  
        let cardID = drawCard(deck.id);
        log(cardID)
        if (cardID === false) {
            return false;
        }
        giveCardToPlayer(cardID, playerID);
        return true;
    }

    const DrawCards = (playerID) => {
        //draw cards to hand size
        let side = state.CC.players[playerID];
        let player = (side === "Axis") ? 0:1;
        let handSize = state.CC.handSize[player];
        let handID = PlayerHands[playerID];
        let hand = findObjs({_type: "hand",id: handID})[0];
        hand = hand.get("currentHand").split(",");
        let number = 0;
        _.each(hand,card => {
            if (card !== "") {number++};
        })
        let deckName = state.CC.nations[player] + " Fate Deck";
        let drawNumber = handSize - number;
        let cardsLeft = state.CC.cards[player] - drawNumber;
        if (cardsLeft < 0) {
            cardsLeft = 72 + cardsLeft;
        }
        state.CC.cards[player] = cardsLeft;
        for (let i=0;i<drawNumber;i++) {
            let result = DrawCard2(playerID,deckName);
            if (result === false) {
                //deck empty, move to approp function
                SetupCard("Empty Deck","",state.CC.nations[player]);
                PrintCard();
                AdvanceTime(player);
                DrawCard2(playerID,deckName);
            }
        }
    }

    const Objectives = (msg) => {
        //!Objectives;?{Objective|1|2|3|4|5};?{Owner|Neutral|German|Soviet|US}
        let Tag = msg.content.split(";");
        let objNum = parseInt(Tag[1]) - 1;
        let nation = Tag[2];
        let img = Nations[nation].objectiveImages[objNum];
        if (img) {
            img = getCleanImgSrc(img);
        }
        let objID = objectiveInfo[objNum];
        if (img && objID) {
            let obj = findObjs({_type:"graphic", id: objID})[0];
            if (obj) {
                 obj.set({
                    imgsrc: img,
                })
            }
        }
    }


    const AdvanceTime = (player,trigger) => {
        if (!trigger) {trigger = false};
        PlaySound("Trumpet");
        let nation = state.CC.nations[player]
        let opponent = (player === 0) ? 1:0;
        if (trigger === false) {
            SetupCard("Advance Time","",nation);
        }
        outputCard.body.push("Advance the Time Marker");
        outputCard.body.push("The " + nation + " Player's's deck is shuffled");
        //get current hand
        let playerID = state.CC.playerIDs[player];
        let deckID = state.CC.fateDeckIDs[player];
        let handID = PlayerHands[playerID];
        let hand = findObjs({_type: "hand",id: handID})[0];
        hand = hand.get("currentHand").split(",");
        recallCards(deckID);
        shuffleDeck(deckID);
        //deal hand back
        _.each(hand,cardID => {
            giveCardToPlayer(cardID,playerID);
        })

        outputCard.body.push("The " + nation + " Player should then Roll for Sudden Death if appropriate");
        outputCard.body.push("Rolling less than Current Time = Game Ends");
        if (state.CC.stance[opponent] === "Defender") {
            outputCard.body.push("The " + state.CC.nations[opponent] + " player gets 1 VP");
        }
        outputCard.body.push("The " + nation + " Player must remove any 1 Smoke Marker");
        outputCard.body.push("Bring in any Reinforcements on the Time Track");
        outputCard.body.push("Both Player may play Dig In Actions");
        if (trigger === true) {
            state.CC.cards[player] = 72 - hand.length;
            outputCard.body.push("[hr]");
            outputCard.body.push("Resolve the previous roll once Time Trigger Done");
        }
        PrintCard();
        triggerFlag = true;
    }

    const Setup = (msg) => {
        //!Setup;?{Scenario|0}
        let scenario = parseInt(msg.content.split(";")[1]);
        let nations = ["German","Soviet"]
        let removeObjectives = [];
        let secretObjectives = [["Random"],["Random"]];
        let openObjectives = ["Random"];
        let objectiveOwner = {1: "Neutral",2: "Neutral",3:"Neutral",4:"Neutral",5:"Neutral"};
        let sh = [[],[]]; //cards that start in players hand
        let scenarioName;

        switch(scenario) {
            case 0: 
                scenarioName = "Training Day";
                nations[1] = "American"
                removeObjectives = ["R","W","X"];
                openObjectives = ["J"];
                break;
            case 1:
                scenarioName = "Fat Lipki";
                break;
            case 2: 
                scenarioName = "Hedgerows and Hand Grenades"
                nations[1] = "American"
                openObjectives = ["T"];
                objectiveOwner = {1:"German",2:"German",3:"German",4:"German",5:"German"};
                break;
            case 3:
                scenarioName = "Bonfire of the NKVD"
                openObjectives = ["Q","R","S"];
                secretObjectives = [[],[]];
                removeObjectives = ["V","W",'X'];
                objectiveOwner = {1:"Soviet",2:"Soviet",3:"Soviet",4:"Soviet",5:"Soviet"};
                sh = [["G-65"],[]];
                break;
            case 4: 
                scenarioName = "Closed for Renovation"
                nations[1] = "American"
                openObjectives = ["Q","R"];
                secretObjectives = [[],[]];
                objectiveOwner = {1:"German",2:"German",3:"German",4:"German",5:"German"};
                break;
            case 5: 
                scenarioName = "Cold Front";
                openObjectives = ["W"];
                secretObjectives = [[],[]];
                removeObjectives = ["R","V",'X'];
                objectiveOwner = {1:"German",2:"German",3:"German",4:"German",5:"German"};
                break;
            case 6:
                scenarioName = "Paralyzed";
                nation[1] = "American"
                openObjectives = ["V","X"];
                secretObjectives = [[],["Random"]];
                removeObjectives = ["W"];
                objectiveOwner = {1:"German",2:"German",3:"German",4:"German",5:"German"};
                break;
            case 7: 
                scenarioName = "Bessarabian Nights";
                openObjectives = ["V","X"];
                removeObjectives = ["R","W"];
                sh = [[],["S-31"]];
                break;
            case 8: 
                scenarioName = "Breakout Dance";
                openObjectives = ["W"];
                secretObjectives = [[],[]];
                objectiveOwner = {1:"Soviet",2:"German",3:"German",4:"Soviet",5:"German"};
                break;
            case 10: 
                scenarioName = "Commando School";
                openObjectives = ["W"];
                objectiveOwner = {1:"Soviet",2:"German",3:"Soviet",4:"German",5:"Soviet"};
                break;




        }
        
        state.CC.nations = nations;
        state.CC.scenarioName = scenarioName;

        //set objective markers to owner
        for (let i=0;i<5;i++) {
            let owner = objectiveOwner[i+1];
            let objImg = getCleanImgSrc(Nations[owner].objectiveImages[i]);
            let objID = objectiveInfo[i].tokenID;
            if (objImg && objID) {
                let obj = findObjs({_type:"graphic", id: objID})[0];
                if (obj) {
                    obj.set({
                        imgsrc: objImg,
                    })
                }
            }
        }
        //remove objetives from 'cup'
        _.each(removeObjectives,obj => {
            let index = state.CC.objectivesInPlay.indexOf(obj);
            if (index > -1) {
                state.CC.objectivesInPlay.splice(index,1);
            }
        })
        sendChat("","Objectives Placed - " + scenarioName);
        //place open objectives
        _.each(openObjectives,obj => {
            if (obj === "Random") {
                let rnd = randomInteger(state.CC.objectivesInPlay.length) - 1;
                obj = state.CC.objectivesInPlay[rnd];
            } 
            let index = state.CC.objectivesInPlay.indexOf(obj);
            if (index > -1) {
                state.CC.objectivesInPlay.splice(index,1);
            }
            AddObjective("Open",obj);
        })
        if (openObjectives.length > 1) {
            sendChat("","Spread out the " + openObjectives.length + " Open Objectives");
        }
        //place secret Objectives
        for (let player = 0;player < 2;player++) {
            _.each(secretObjectives[player],obj => {
                if (obj === "Random") {
                    let rnd = randomInteger(state.CC.objectivesInPlay.length) - 1;
                    obj = state.CC.objectivesInPlay[rnd];
                }
                let index = state.CC.objectivesInPlay.indexOf(obj);
                if (index > -1) {
                    state.CC.objectivesInPlay.splice(index,1);
                }
                state.CC.hiddenObjectives[player].push(obj);
                AddObjective("Hidden",obj,player);
            })
            if (secretObjectives[player].length > 1) {
                sendChat("","Spread out the " + secretObjectives[player].length + " Secret Objectives");
            }
        }
        let tokens = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "objects",});
        _.each(tokens,token => {
            if (token.get("name").includes("Chit")) {
                token.set({
                    name: "Objective",
                    represents: "-OT9cfC9c3hSZS24F-rE",
                })
            }
        })

        state.CC.startingHand = [sh[0],sh[1]];






    }

    const AddObjective = (type,obj,player) => {
            let objName = "Chit " + obj;
            let objChar = findObjs({_type: "character", name: objName})[0];
            let c;
            if (type === "Open") {
                side = 1;
                c = MapAreas["Open"].centre;
            } else if (type === "Hidden") {
                side = 0;
                c = MapAreas["Secret" + player].centre;
            }
            summonToken(objChar,c.x,c.y,side);
    }



    const DrawLine = (hex1,hex2) => {
        let x1 = hex1.centre.x;
        let x2 = hex2.centre.x;
        let y1 = hex1.centre.y;
        let y2 = hex2.centre.y;

        let x = (x1+x2)/2;
        let y = (y1+y2)/2;

        x1 = x - x1;
        x2 = x - x2;
        y1 = y - y1;
        y2 = y - y2;

        let pts = [[x1,y1],[x2,y2]];
        

        let page = getObj('page',Campaign().get('playerpageid'));
        let newLine = createObj('pathv2',{
            layer: "foreground",
            pageid: page.id,
            shape: "pol",
            stroke: '#000000',
            stroke_width: 3,
            fill: '#000000',
            x: x,
            y: y,
            points: JSON.stringify(pts),
        });

        
    }

    const RemoveLines = () => {
        let paths = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "foreground",});
        _.each(paths,path => {
            path.remove();
        })
    }




    const PickSides = (msg) => {
        //!PickSides;?{Side|Axis|Allies}
        let side = msg.content.split(";")[1];
        let player = (side === "Axis") ? 0:1;
        let playerID = msg.playerid;

        let forceType,info;
        state.CC.players[playerID] = side;
        state.CC.playerIDs[player] = playerID;
        let elite = TokensInArea(side,"Elite")[0];
        let line = TokensInArea(side,"Line")[0];
        let green = TokensInArea(side,"Green")[0];
        if (elite) {
            forceType = "Elite";
            info = elite;
        } else if (line) {
            forceType = "Line";
            info = line;
        } else if (green) {
            forceType = "Green";
            info = green;
        } else {
            sendChat("","Need a " + side + " OB Token in the OB Display Area");
            return;
        }


        let nation = info[0];
        let obType = info[2];
        let stances = {"Recon": 5,"Attack": 6,"Defend": 4};
        let handSize = stances[obType] || 5;
        let deckName = nation + " Fate Deck";
        let deckID = DeckInfo[deckName].id;
        state.CC.forceType[player] = forceType;
        state.CC.stance[player] = obType;
        state.CC.handSize[player] = handSize;
        state.CC.fateDeckIDs[player] = deckID;
        SetupCard(side,"",nation);
        outputCard.body.push(PlayerInfo[playerID] + " will be controlling the " + nation + " Forces.");
        PrintCard();
        let startingHand = state.CC.startingHand[player];
        _.each(startingHand,cardName => {
            let cardID = MCList2[cardName];
            let deckID = MasterCardList[cardID].deckID;
            let card = drawCard(deckID,cardID);
            if (card) {
                giveCardToPlayer(cardID,playerID);
            }
        })
        DrawCards(playerID);
    }   


    const ClearState = (msg) => {
        //rebuild array of card IDs for each deck, will track which ones are played using this
        //DeckInfo is the master array of full deck

        LoadPage();
        BuildMap();

        _.each(DeckInfo,info => {
            let deckID = info.id;
            recallCards(deckID);
            sendChat("","Shuffled " + info.name);
            shuffleDeck(deckID);
        })



        state.CC = {
            playerIDs: ["",""],
            players: {},
            nations: ["",""],
            handSize: [0,0],
            forceType: ["",""], //green, line, elite
            stance: ["",""], //attacker, defender, recon
            fateDeckIDs: ["",""], //ids of deck
            objectivesInPlay: ["A","B","C","D","E","F","G","H","J","K","L","M","N","P","Q","R","S","T","U","V","W","X"],
            hiddenObjectives: [[],[]],
            scenarioName: "",
            lines: [],
            cards: [72,72],
        }
    
        for (let i=0;i<5;i++) {
            let objImg = getCleanImgSrc(Nations["Neutral"].objectiveImages[i]);
            let objID = objectiveInfo[i].tokenID;
            if (objImg && objID) {
                let obj = findObjs({_type:"graphic", id: objID})[0];
                if (obj) {
                    obj.set({
                        imgsrc: objImg,
                    })
                }
            }
        }
        let tokens = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "objects",});
        _.each(tokens,token => {
            if (token.get("name").includes("Objective")) {
               token.remove();
            }
        })




        sendChat("","Cleared State/Arrays, rebuilt and shuffled Decks");
    }

    const EndRound = (msg) => {
        let playerID = msg.playerid;
        orderNumber[activePlayer] = 0;
        let opponent = (activePlayer === 0) ? 1:0;
        ClearCards();
        DrawCards(playerID);
        let oppNation = state.CC.nations[opponent];
        SetupCard(oppNation + " Turn","",oppNation);
        outputCard.body.push("Axis Cards Remaining: " + state.CC.cards[0]);
        outputCard.body.push("Allies Cards Remaining: " + state.CC.cards[1]);
        PrintCard();
        ObjectiveOwnership();
        activePlayer = opponent;
    }

    const ShowHidden = (msg) => {
        let playerID = msg.playerid;
        let side = state.CC.players[playerID];
        let player = (side === "Axis") ? 0:1;
        let hiddenObjectives = state.CC.hiddenObjectives[player];
        SetupCard("Hidden Objectives","",state.CC.nations[player]);
        if (hiddenObjectives.length === 0) {
            outputCard.body.push("There are none");
        } else {
            _.each(hiddenObjectives,obj => {
                outputCard.body.push("[B]" + obj + "[/b]:" + ObjectiveInfo[obj]);
            })
        }
        PrintCard(playerID);
    }

    const ObjectiveOwnership = () => {

        for (let i=0;i<5;i++) {
            let objID = objectiveInfo[i].tokenID;
            let hexLabel = objectiveInfo[i].hexLabel;
            _.each(UnitArray,unit => {
                let hl = unit.hexLabel;
                if (hl === hexLabel) {
                    let nation = unit.nation;
                    let img = getCleanImgSrc(Nations[nation].objectiveImages[i]);
                    let obj = findObjs({_type:"graphic", id: objID})[0];
                    if (img && obj) {
                        obj.set({
                            imgsrc: img,
                        })
                    }
                    return;
                }
            })
        }
    }


    const LOS = (msg) => {
        RemoveLines();
        let Tag = msg.content.split(";");
        let shooterID = Tag[1];
        let shooter = UnitArray[shooterID];
        if (!shooter) {return};
        let shooterHex = HexMap[shooter.hexLabel];

        let targetID = Tag[2];
        let target = UnitArray[targetID];
        if (!target) {return};
        let targetHex = HexMap[target.hexLabel];


        let distance = shooterHex.cube.distance(targetHex.cube);
        let interCubes = shooterHex.cube.linedraw(targetHex.cube);



        //for segments will need to work out moore math as not centre to centre




        DrawLine(shooterHex,targetHex);   
        SetupCard("LOS","",shooter.nation);
        outputCard.body.push("Distance: " + distance + " Hexes [" + distance * 100 + " Feet]");
        ButtonInfo("Remove Line","!RemoveLines");
        PrintCard();



    }



    const ClearCards = () => {
        _.each(currentCardIDs,cardID => {
            let obj = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "card",layer: "objects",cardid: cardID})[0];
            if (obj) {
                obj.remove();
            }
        })
        currentCardIDs = [];
    }

    const EventInfo = {
        'Shellholes': 'Place Foxholes in a Random Hex',
        'Booby Trap': 'Place Mines in a Random Hex',
        'Rubble': 'Place Wire in a Random Hex',
        'Dust': 'Place Smoke in a Random Hex',
        'Mission Objective': "One (Secret) Objective was placed in Player's Box",
        'Strategic Objective': 'One (Open) Objective was placed in the Box',
        'Medic': 'Rally One Broken Unit',
        'KIA': 'Eliminate One Broken Unit',
        'Air Support': 'Determine a Random Hex. You may Break all units in the occupied hex closest to the Random Hex',
        'Shell Shock': 'Break the Unit Closest to a Random Hex',
        'Elan': 'Increase your Surrender Level by One',
        'Breeze 1': "Remove all Smoke Markers, all Blazes Spread in Direction '1'",
        'Breeze 2': "Remove all Smoke Markers, all Blazes Spread in Direction '2'",
        'Breeze 3': "Remove all Smoke Markers, all Blazes Spread in Direction '3'",
        'Breeze 4': "Remove all Smoke Markers, all Blazes Spread in Direction '4'",
        'Breeze 5': "Remove all Smoke Markers, all Blazes Spread in Direction '5'",
        'Breeze 6': "Remove all Smoke Markers, all Blazes Spread in Direction '6'",
        'Blaze': 'Place a Blaze Marker in a Random Hex',
        'Field Promotion (German)': 'If not already in play, you may place Private Herzog into a Hex containing a Broken German Unit',
        'Reconnaissance': 'Your Opponent must reveal a Secret Objective',
        'Deploy': 'You may remove a friendly squad from the map. If you do, replace it with 2 Matching Teams',
        'Interdiction': 'Suppress One Unit in a Hex with less than 1 Cover',
        'Sappers': 'You may remove one Mine or Wire Marker',
        'Battlefield Integrity': "Gain 1 VP for each of your Opponent's Eliminated Units",
        'Suppressing Fire': 'Suppress One Enemy Unit in a Hex within both Range and LOS of a Friendly Machine Gun',
        'Command & Control': 'Gain 1 VP for each Objective you control',
        'Interrogation': "Look at your Opponent's Hand. You may Select one Card there and place it in their discard pile",
        'Malfunction': 'Break the Unbroken Weapon closest to a random Hex',
        'Walking Wounded': 'Select One Eliminated Unit. Return that unit to play in or adjacent to a random hex, Broken',
        'Infiltration': 'Roll on the Support Table. Select an Available Unit then place it in or adjacent to a random Hex',
        'Reinforcements': 'Roll on the Support Table. Select one unit or radio then place it along your Map Edge',
        'Scrounge': 'Return an Eliminated Weapon to Play under your control',
        'Battle Harden': 'One Friendly Unit becomes Veteran',
        'Cower': "Suppress all Friendly Squads not Currently within a Friendly Leader's Command Radius",
        'Prisoners of War': 'Eliminate one friendly unit adjacent to an Enemy Unit',
        'Hero': 'If not already in play, place your armies Hero in a Friendly Hex. Rally up to one Broken Unit there',
        'Fog of War': 'Each Player discards one card from their hand at random',
        'Commissar': 'Make a roll for one Broken Soviet Unit. If greater than its current morale, eliminate it, if not, rally it',
        'Entrench': 'You may place Foxholes in a Friendly Hex',
        'Field Promotion (Soviet)': 'If not already in play, you may place Private Gelon into a Hex containing a broken Soviet Unit',

    }

    const ActionInfo = {
        'Assault Fire': 'Make One Fire Attack with Any number of your units/weapons with boxed Firepower that are CURRENTLY activated to move.',
        'Hand Grenades': 'Add +2 when firing at an adjacent Hex',
        'Spray Fire': 'Play when making a Fire Attack if all firing pieces have Boxed Range. Target 2 adjacent hexes instead of 1',
        'Crossfire': 'Add +2 When Firing at a Moving Target',
        'Concealment': 'Play before making a Defense Roll. Reduce the Fire Attack Total by the Cover in the Targeted Hex',
        'Hidden Unit': '(Defender Only) Play when your Opponent Discards one or more cards. Roll on your Support Table, slecting one available unit. Place it in a Set-Up Hex with no Units and at least 1 cover',
        'Hidden Mines': "(Defender Only) Place Mines in a Hex into which a Unit just Moved or Advanced. The Mines attack immediately",
        'Dig In': 'Play at the End of a Time Marker Advance. Place Foxholes in a Friendly-Occupied Hex',
        'Hidden Entrenchments': '(Defender Only) Place Foxholes in a non-Building Hex into which your opponent just fired (before Defense Roll)',
        'Hidden Pillbox': '(Defender Only) If not already in play, place the pillbox in an Objective Hex into which your Opponent just Fired (before Defense Roll)',
        'Hidden Wire': '(Defender Only) Place Wire into a Hex into which your Opponent just Moved or Advanced',
        'Bore Sighting': '(Defender Only) Add +2 when Firing any Weapon with a Printed FP of 5 or more',
        'Sustained Fire': 'Add +2 when Firing a Mortar or Machine Gun. If the Fire Attack roll is "Doubles", break it',
        'Light Wounds': 'Play when a friendly Squad is about to Break. Replace with a matching Team instead. Lose 1 VP',
        'Smoke Grenades': 'Place Smoke in or adjacent to a Hex occupied by a friendly unit with Boxed movement that is currently activated to move',
        'Ambush': 'Play at the Beginning of Melee. Your Opponent must break one of their participating Units',
        'No Quarter (German)': 'Play when a German Unit survives a Melee vs Soviets. Gain 2 VP',
        'Demolitions': 'Play when your Opponent discards one or more cards (due to Passing). Select a hex containing a friendly unit. Eliminate a Fortification there.',
        'Marksmanship': 'Add +2 when firing with a Squad or Team',
        'No Quarter (Soviet)': 'Play when a Soviet Unit survives a Melee. Gain 2 VP',
    }

    const ObjectiveInfo = {
        'A': "Objective 1 = 1 VP",
        'B': "Objective 2 = 1 VP",
        'C': "Objective 3 = 1 VP",
        'D': "Objective 4 = 1 VP",
        'E': "Objective 5 = 1 VP",
        'F': "Objective 2 = 2 VP",
        'G': "Objective 3 = 2 VP",
        'H': "Objective 4 = 2 VP",
        'J': "Objective 5 = 2 VP",
        'K': "Objective 3 = 3 VP",
        'L': "Objective 4 = 3 VP",
        'M': "Objective 5 = 3 VP",
        'N': "Objective 4 = 4 VP",
        'P': "Objective 5 = 4 VP",
        'Q': "Objective 5 = 5 VP",
        'R': "Objective 5 = 10 VP",
        'S': "Each Objective = 1 VP",
        'T': "Each Objective = 2 VP",
        'U': "Each Objective = 3 VP",
        'V': "Take All Objectives = Sudden Death Win",
        'W': "Exit points are doubled",
        'X': "Elimination points are doubled",
    }





    const playedCard = (obj) => {
        toFront(obj);
        let cardID = obj.get("cardid"); 
        let ci = MasterCardList[cardID];
        log(ci.name + " From " + ci.deckName);
        obj.set("name",ci.name);
        let nation = ci.deckName.replace(" Fate Deck","");
        let side = (Axis.includes(nation)) ? "Axis":"Allies";
        let x = obj.get("left");
        let y = obj.get("top");
        let zones = ["Order","Action"];
        let flag = (ci.name.includes("Initiative")) ? true:false;

        for (let i=0;i<2;i++) {
            let type = zones[i];
            let zone = MapAreas[side + " " + type];
            if (x >= zone.vertices[0].x && x <= zone.vertices[1].x && y >= zone.    vertices[0].y && y <= zone.vertices[1].y) {
                PlaceCard2(obj,type); 
                flag = true;
                break;
            }
        }
        if (flag === false) {
            SetupCard(ci.name,"",nation);
            ButtonInfo("Play To?","!PlaceCard;?{Play To|Order|Action|Discard};" + cardID);
            PrintCard();
        }



    }

    const PlaceCard = (msg) => {
        let Tag = msg.content.split(";");
        let type = Tag[1];
        let cardID = Tag[2];
        let obj = findObjs({_pageid:  Campaign().get("playerpageid"), layer: "objects", cardid: cardID})[0];
        if (type === "Discard") {
            obj.remove();
        } else {          
            PlaceCard2(obj,type);
        }
    }

    const PlaceCard2 = (obj,type) => {
        let cardID = obj.get("cardid"); 
        let ci = MasterCardList[cardID];
        let side = ci.side;
        let nation = ci.nation;
        let zone = MapAreas[side + " " + type];
        obj.set({
            left: zone.centre.x,
            top: zone.centre.y,
        })
        playedCardInfo = {
            id: cardID,
            nation: nation,
            type: type,
        }
        Order();
    }

    const Casualty = (msg) => {
        let id = msg.selected[0]._id;
        let token = findObjs({_type:"graphic", id: id})[0];
        let charID = token.get("represents");
        let char = getObj("character", charID);
        let type = Attribute(char,"type");
        let side = Attribute(char,"side");
        let zoneName;
        if (type === "Weapon") {
            zoneName = "Weapon Casualty";
        } else {
            zoneName = side + " Casualty";
        }
        let zone = MapAreas[zoneName];
        let y = zone.centre.y;
        let x = zone.vertices[0].x;
        let casualties = Math.max(0,TokensInArea("casualty",zoneName).length - 1); //-1 for casualty marker
        x += (casualties * 74) + 40;
        let tsides = token.get("sides");
        tsides = tsides.split("|");
        let sides = [];
        _.each(tsides,tside => {
            if (tside) {
                let side = tokenImage(tside);
                sides.push(side);
            }
        })      


        token.set({
            currentSide: 0,
            imgsrc: sides[0],
            left: x,
            top: y,
        })
    }




    const changeGraphic = (obj,prev) => {
        RemoveLines();
        let cardID = obj.get("cardid");
        let ci = MasterCardList[cardID];
        if (ci && currentCardIDs.includes(cardID) === false) {
            playedCard(obj);
        }

        let id = obj.get("id");
        let unit = UnitArray[id];

        if (unit) {
            let location = new Point(obj.get("left"),obj.get("top"));
            let newHexLabel = location.toCube().label();
            if (newHexLabel !== unit.hexLabel) {
                let index = HexMap[unit.hexLabel].tokenIDs.indexOf(id);
                if (index > -1) {
                    HexMap[unit.hexLabel].tokenIDs.splice(index,1);
                }
                HexMap[newHexLabel].tokenIDs.push(id);
                unit.hexLabel = newHexLabel;
            }
        }



        //fix the token size in case accidentally changed while game running - need check that game is running
        return
        if (state.CC.turn === 0) {return};
        let name = obj.get("name");
        if (obj.get("width") !== prev.width || obj.get("height") !== prev.height) {
            obj.set({
                width: prev.width,
                height: prev.height,
            })
        }

    }

    const addGraphic = (obj) => {
        log(obj)
        RemoveLines();
        let cardID = obj.get("cardid");
        let ci = MasterCardList[cardID];
        if (ci && currentCardIDs.includes(cardID) === false) {
            playedCard(obj);
        }
        let id = obj.get("id");
        if (!UnitArray[id]) {
            let character = getObj("character", obj.get("represents"));      
            if (character) {
                let unit = new Unit(obj);
            }
        }




    }
    
    const destroyGraphic = (obj) => {
        let name = obj.get("name");
        log(name + " Destroyed")


    }


    const Align = () => {
        let mapWidth, trackerHeight, mapHeight, colour;
        let objs = findObjs({_pageid:  Campaign().get("playerpageid") ,_type: "graphic"});

        _.each(objs,obj => {
            let w = obj.get("width");
            let h = obj.get("height");
            if (obj.get("name") === "Map") {
                obj.set({
                    left: w/2,
                    top: pageInfo.height/2,
                })
                mapWidth = w;
                mapHeight = h;
            }
            if (obj.get("name") === "Trackers") {
                let x = (pageInfo.width - mapWidth)/2 + mapWidth;
                obj.set({
                    left: x,
                    top: pageInfo.height/2,
                })
                trackerHeight = h;
            }
        })

        //Boxes for Radios
        let rx = mapWidth - 100;
        let rdy = Math.round((pageInfo.height - mapHeight)/4);
        let rys = [pageInfo.height - rdy,rdy];
        let boxColours = [["#000000","#36454f","#301934","#343434","#1b1212","#28282b"],["#008000","#355e3b","#40826d","#228b22","#4f7942","#023020"]];


        for (let i=0;i<rys.length;i++) {
            colour = boxColours[i][0];
            let ry = rys[i];
            createObj('pathv2',{
                layer: "map",
                pageid: pageInfo.page.id,
                shape: "rec",
                stroke: colour,
                stroke_width: 3,
                fill: 'transparent',
                x: rx,
                y: ry,
                points: "[[0,0],[100,100]]"
            });
        
            createObj('text',{
                layer: "map",
                pageid: pageInfo.page.id,
                color: colour,
                font_size: 28,
                fill: 'transparent',
                left: rx,
                top: ry,
                text: "Radio",
                font_family: "Arial",
            });
        }

        //Boxes for Cards
        let gapX = Math.round((pageInfo.width - mapWidth - (5 * 250))/6);

        let x = gapX + mapWidth + 125;
        
       let gapY = Math.round(((pageInfo.height - trackerHeight)/2 - 350)/2);

        let y2 = [(pageInfo.height + trackerHeight)/2 + gapY + 175,(pageInfo.height - trackerHeight)/2 - gapY - 175];


        let names = ["Order","Action","Event","Hex","Dice"];
        for (let i=0;i<5;i++) {
            for (let j=0;j<2;j++) {
                let y = y2[j];
                colour = boxColours[j][i+1];
                let cX = x + i*(gapX+250);
                createObj('pathv2',{
                    layer: "map",
                    pageid: pageInfo.page.id,
                    shape: "rec",
                    stroke: colour,
                    stroke_width: 3,
                    fill: 'transparent',
                    x: cX,
                    y: y,
                    points: "[[0,0],[250,350]]"
                });
            
                createObj('text',{
                    layer: "map",
                    pageid: pageInfo.page.id,
                    color: colour,
                    font_size: 56,
                    fill: 'transparent',
                    left: cX,
                    top: y,
                    text: names[i],
                    font_family: "Arial",
                });
            }    
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
                log(MasterCardList)
                log("State");
                log(state.CC);
                log("Deck Info");
                log(DeckInfo);
                log("Map Areas");
                log(MapAreas);
                log("Player Hands");
                log(PlayerHands);
                log("Units");
                log(UnitArray)
                log("Objective Info")
                log(objectiveInfo)
                break;
            case '!ClearState':
                ClearState(msg);
                break;
            case '!EndRound':
                EndRound(msg);
                break;
            case '!Flip':
                Flip(msg);
                break;
            case '!PickSides':
                PickSides(msg);
                break;
            case '!Event':
                Event(msg);
                break;
            case '!Objectives':
                Objectives(msg);
                break;
            case '!AddAbilities':
                AddAbilities(msg);
                break;
            case '!AddMarker':
                AddMarker(msg);
                break;
            case '!Deploy':
                Deploy(msg);
                break;
            case '!TokenInfo':
                TokenInfo(msg);
                break;
            case '!AdvanceTime':
                AdvanceTime(currentPlayer);
                break;
            case '!Setup':
                Setup(msg);
                break;
            case '!ShowHidden':
                ShowHidden(msg);
                break;
            case '!PlaceSmoke':
                PlaceSmoke(msg);
                break;
            case '!PlaceCard':
                PlaceCard(msg);
                break;
            case '!LOS':
                LOS(msg);
                break;
            case '!RemoveLines':
                RemoveLines();
                break;
            case '!Casualty':
                Casualty(msg);
                break;
        }
    };




    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on("add:graphic", addGraphic);
        on('change:graphic',changeGraphic);
        on('destroy:graphic',destroyGraphic);
    };
    on('ready', () => {
        log("===> Combat Commander <===");
        log("===> Software Version: " + version + " <===")
        LoadPage();
        PlayerIDs();
        DefineHexInfo();
        BuildMap();
        BuildDecks(); //the master array of id and names
        registerEventHandlers();
        sendChat("","API Ready")
        log("On Ready Done")
    });
    return {
        // Public interface here
    };






})();
