const BFG = (() => {
    const version = '2025.2.8';
    if (!state.BFG) {state.BFG = {}};


    const gameScale = 5; //1 hex = this many cm on tabletop

    const pageInfo = {name: "",page: "",gridType: "",scale: 0,width: 0,height: 0, hexesW: 0, hexesH: 0};
    const rowLabels = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN","AO","AP","AQ","AR","AS","AT","AU","AV","AW","AX","AY","AZ","BA","BB","BC","BD","BE","BF","BG","BH","BI"];

    let UnitArray = {}; //Units
    let SquadronArray = {};//Squadron Info
    let BlastArray = []; // id: tokenID, hexLabel: hexLabel
    let criticalArray = [];//ids for repairs or explosions
    let launchArray = [];

    const readyValue = "https://s3.amazonaws.com/files.d20.io/images/335152677/DfyYLQdQadaBN80ZnzQJUQ/thumb.png?1680278681";
    const firedValue = "https://s3.amazonaws.com/files.d20.io/images/335152678/s6OsNT1WLWKrlRqx0qkYoA/thumb.png?1680278681";
    const hitValue = "https://s3.amazonaws.com/files.d20.io/images/335450532/KR1KXqxmzv1hHLuORpaJOA/thumb.png?1680405339";
    const normalValue = "https://s3.amazonaws.com/files.d20.io/images/425002914/lbgyDwnWHCaYYMPNYQ5Clw/thumb.png?1737077166"
    

    let hexMap = {}; 
    let MapEdge; //will be the x coord of the table edge
    let gasColours = ["#fcc9be","#fcfabe","#e5fcc3","#affffa","#afbdff","#edafff"];
    let turnOrder;
    let OrdTypes = ["Fighter","Fighter-Bomber","Torpedo-Bomber","Bomber","Assault Boat","Thunderhawk","Boarding Torpedo"];


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


    const SquadronMarkers = ["Plus-1d4::2006401","Minus-1d4::2006429","Plus-1d6::2006402","Minus-1d6::2006434","Plus-1d20::2006409","Minus-1d20::2006449","Hot-or-On-Fire-2::2006479","Animal-Form::2006480","Red-Cloak::2006523","A::6001458","B::6001459","C::6001460","D::6001461","E::6001462","F::6001463","G::6001464","H::6001465","I::6001466","J::6001467","L::6001468","M::6001469","O::6001471","P::6001472","Q::6001473","R::6001474","S::6001475"];


    const DIRECTIONS = ["Northeast","East","Southeast","Southwest","West","Northwest"];

//fix below
    const SM = {
        moved: "status_Advantage-or-Up::2006462", //if unit moved
        fired: "status_Shell::5553215",
        allahead: "status_AAF::7138242",
        newheading: "status_KTNH::7138245",  
        retros: "status_BR::7138244",
        lockon: "status_LO::7138246",
        reload: "status_RO::7138247",
        brace: "status_BFI::7138243",
        slow: "status_purple",
        damaged: "status_red",

    }; 

    let outputCard = {title: "",subtitle: "",faction: "",body: [],buttons: [],};

    const Factions = {
        "Chaos": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/426571926/VEuUAamBnn59C-dWAQBsHA/thumb.png?1738025565",
            "backgroundColour": "#FF0000",
            "titlefont": "Anton",
            "fontColour": "#000000",
            "borderColour": "#000000",
            "borderStyle": "5px groove",
            "initiativeBonus": 2,
            "dice": "Chaos",
            "captains": ["Ezekyle","Hax","Ahriman","Araghast","Ghuul","Bale","Brule","Cairne","Constantinus","Corpulax","Deadeye","Demetrius","Severin","Erebus","Fabius Bile","Gangrus","Hexoghar","Koros","Marduk","Necrosius"],
            "CruiserH": "https://s3.amazonaws.com/files.d20.io/images/426941212/men2FT18I1UjAN87PBAllw/thumb.png?1738294260",
            "CruiserB": "https://s3.amazonaws.com/files.d20.io/images/426941213/QZHcBxMTzGso32jE42Odzg/thumb.png?1738294260",
            "BattleshipH": "",
            "BattleshipB": "",
            "Torpedo": "",
            "Fighter": {"character": "-OIDPn0LSRME48V1vf34", "img": "https://files.d20.io/images/427556019/Au3wF9cIuBjHqgtfM-0e2g/thumb.png?1738630264"},
            "Bomber": {"character": "-OIDRFV5TjRi6piRy30n", "img": "https://files.d20.io/images/427556018/po0raxuTFeIN5j7bp1HPNg/thumb.png?1738630264"},
        },
        "Imperial Navy": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/426571464/URW9XKmBVBZR0bkXBG1q_A/thumb.png?1738025327",
            "backgroundColour": "#000000",
            "titlefont": "Bokor",
            "fontColour": "#FFFFFF",
            "borderColour": "#000000",
            "borderStyle": "5px double",
            "initiativeBonus": 2,
            "dice": "Imperial",
            "captains": ["Arkelius","Bastille","Corus","Crziel","Drang","Dostov","Galtaire","Gordus","Hawke","Jaxon","Khorlu","Orpheus","Thaddeon","Trasq","Wyman","Napier","Vargaz","Prisca","Wolston","D'Armitage"],
            "CruiserH": "https://s3.amazonaws.com/files.d20.io/images/426941233/RZXDW3zuO7k2pUmS7S4ZvQ/thumb.png?1738294268",
            "CruiserB": "https://s3.amazonaws.com/files.d20.io/images/426941220/bw7Iwpaqe-1KuLZjQEgoCQ/thumb.png?1738294264",
            "BattleshipH": "",
            "BattleshipB": "",
            "Torpedo": {"character": "-OHhpsYSC6rG3HZxmJ8M","img": "https://files.d20.io/images/426630475/htqalmzXTlrMOu09acPgtA/thumb.png?1738084563"},
            "Fighter": {"character": "-OIWrTt5-egNbFDZPtsh", "img": "https://files.d20.io/images/427556019/Au3wF9cIuBjHqgtfM-0e2g/thumb.png?1738630264"},
            "Bomber": {"character": "-OIX-_9UVQGSVmIdSfA3", "img": "https://files.d20.io/images/427556018/po0raxuTFeIN5j7bp1HPNg/thumb.png?1738630264"},
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

    const Gunnery = [
        [1,2,3,4,5,5,6,7,8,9,10,11,12,13,14,14,15,16,17,18],
        [1,1,2,3,4,4,5,6,6,7,8,8,9,10,11,11,12,13,13,14],
        [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10],
        [0,1,1,1,2,2,2,3,3,4,4,4,5,5,5,6,6,6,7,7],
        [0,0,1,1,1,1,1,2,2,2,2,2,3,3,3,3,3,4,4,4],
    ];




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
            this.terrain = "Empty Space";
            this.terrainID = "";
            this.shipIDs = [];
            this.ordnanceIDs = [];
            this.gravityWell = ""; //should be centre hex of planet generating the well, used for turning hulks
            hexMap[this.label] = this;

        }
    }

    class Ship {
        constructor(id,alpha) {
            if (!alpha) {alpha = false};
            let token = findObjs({_type:"graphic", id: id})[0];
            let char = getObj("character", token.get("represents"));
            let attributeArray = AttributeArray(char.id);
            let faction = attributeArray.faction;
            let player = (state.BFG.factions[0] === faction) ? 0:1;
            let type = attributeArray.type;
            let location = new Point(token.get("left"),token.get("top"));
            let hexLabel = location.toOffset().label();
    
            let hull = parseInt(token.get("bar2_value")) || 0;
            let hullMax = parseInt(attributeArray.hull_max) || 0;
            let crippled = (this.hull/this.hullMax <= .5) ? true:false;


            let weaponArray = [];
            for (let i=0;i<5;i++) {
                if (attributeArray["weapon" + i + "status"] === "On" ||attributeArray["weapon" + i + "status"] === "Damaged") {
                    let arcImage = attributeArray["weapon" + i + "arc"];
                    let arc;
                    if (arcImage === "https://s3.amazonaws.com/files.d20.io/images/331641803/n5m2i03MiMvZcA-KL4XgAQ/thumb.png?1678322493" ) {arc = "All"};
                    if (arcImage === "https://s3.amazonaws.com/files.d20.io/images/331641789/btRPXf0ap6cmx5lGOv-8_A/thumb.png?1678322488") {arc = "Front"};
                    if (arcImage === "https://s3.amazonaws.com/files.d20.io/images/331641801/cgHlQhtR2biRjvMnbve9hw/thumb.png?1678322493") {arc = "Left"};
                    if (arcImage === "https://s3.amazonaws.com/files.d20.io/images/331641790/G6GqNhT0dPWPVjxHo9kPxQ/thumb.png?1678322488") {
                        arc = "Right"};
                    if (arcImage === "https://s3.amazonaws.com/files.d20.io/images/331641802/1ldN1itC4WL_5Vfg7J3xdQ/thumb.png?1678322493") {
                        arc = "Rear";
                    };
                    if (arcImage === "https://s3.amazonaws.com/files.d20.io/images/331882761/JGnrvZZrTtKMKsLICOTqpg/thumb.png?1678475346") {
                        arc = "Left/Right";
                    }
                    if (arcImage === "https://s3.amazonaws.com/files.d20.io/images/331641774/7qd9d5VfJ9mBBWwrBBGdZQ/thumb.png?1678322481") {
                        arc = "Front,Left";
                    }
                    if (arcImage === "https://s3.amazonaws.com/files.d20.io/images/331641771/NNZtZJUq3cciDQICfjM7AA/thumb.png?1678322481") {
                        arc = "Front,Right";
                    }
                    if (arcImage === "https://s3.amazonaws.com/files.d20.io/images/331641772/8CzcE0RLYTCG90fKLOQbFw/thumb.png?1678322481") {
                        arc = "Front,Left,Right";
                    }
                    if (arcImage === "https://s3.amazonaws.com/files.d20.io/images/331641769/zNmfq26Hruh3WPBS0PesaA/thumb.png?1678322481") {
                        arc = "Left,Rear";
                    }
                    if (arcImage === "https://s3.amazonaws.com/files.d20.io/images/331641770/83Zzfi-EDoaklWs6-Tgb2g/thumb.png?1678322481") {
                        arc = "Right,Rear";
                    }
                    if (arcImage === "https://s3.amazonaws.com/files.d20.io/images/331641773/OBREO93989i2Ux4UmSxnjQ/thumb.png?1678322481") {
                        arc = "Left,Right,Rear";
                    }


                    let minRange,maxRange,speed,rangeText;
                    let r = attributeArray["weapon" + i + "rangecm"] || 0;
                    let r2 = r.toString().replace("Speed ","").split("-");
                    if (r.includes("Speed")) {
                        speed = Math.round(parseInt(r2[0])/gameScale);
                        rangeText = "Speed " + speed;
                    } else {
                        if (r2.length === 1) {
                            minRange = 0;
                            maxRange = Math.round(parseInt(r2[0])/gameScale);
                            rangeText = maxRange;
                        } else {
                            minRange = Math.round(parseInt(r2[0])/gameScale);
                            maxRange = Math.round(parseInt(r2[0])/gameScale);
                            rangeText = minRange + " - " + maxRange;
                        }
                    }

                    let fp;
                    let fpMax = parseInt(attributeArray["weapon" + i + "fp_max"]) || "Special";
                    if (crippled === true && fpMax !== "Special") {
                        fp = Math.round(fpMax/2);
                    } else {
                        fp = fpMax;
                    }
                    
                    let weapon = {
                        name: attributeArray["weapon" + i + "name"],
                        type: attributeArray["weapon" + i + "type"],
                        arc: arc,
                        rangeText: rangeText,
                        minRange: minRange,
                        maxRange: maxRange,
                        speed: speed,
                        fp: fp,
                        fpMax: fpMax,
                        fired: attributeArray["weapon" + i + "fired"],
                    }
                    weaponArray.push(weapon);
                }
            }

            let bays = [];
            let totalSquadrons = 0;
            for (let i=0;i<4;i++) {
                if (attributeArray["bay" + i + "status"] === "On" ||attributeArray["bay" + i + "status"] === "Damaged") { 
                    let bay = {
                        arc: attributeArray["bay" + i + "arc"],
                        launched: attributeArray["bay" + i + "launched"],
                        squadrons: parseInt(attributeArray["bay" + i + "squadrons"]),
                    }
                    bays.push(bay);
                    totalSquadrons += bay.squadrons;
                }
            }
            totalSquadrons *= 3;
            let initial = attributeArray["hanger"];
            let hanger = {};
            let currentSquadrons = 0;
            if (initial !== "Empty" && initial !== undefined && initial !== " ") {
                initial = initial.split(", ");
                for (let i=0;i<initial.length;i++) {
                    let group = initial[i].split("s:");
                    if (hanger[group[0]]) {
                        hanger[group[0]] += parseInt(group[1]);
                    } else {
                        hanger[group[0]] = parseInt(group[1]);
                    }
                    currentSquadrons += parseInt(group[1])
                }
            }
            
            if (currentSquadrons === 0) {
                hanger = "Empty";
            }

log("Bays")
log(bays)
log("Initial")
log(initial)
log("Hanger")
log(hanger)
            let craftTypes = [];
            if (attributeArray.fighter === "1") {
                craftTypes.push("Fighter");
            }
            if (attributeArray.bomber === "1") {
                craftTypes.push("Bomber");
            }
            if (attributeArray["fighter-bomber"] === "1") {
                craftTypes.push("Fighter-Bomber");
            }
            if (attributeArray["torpedo-bomber"] === "1") {
                craftTypes.push("Torpedo-Bomber");
            }
            if (attributeArray.assault === "1") {
                craftTypes.push("Assault Boat");
            }
            if (attributeArray.thunderhawk === "1") {
                craftTypes.push("Thunderhawk");
            }

log("Craft Types")
log(craftTypes)


            let speedMax = parseInt(attributeArray.speedcm) || 0;
            speedMax = Math.round(speedMax/gameScale);

            let speed = speedMax;
            if (crippled === true) {
                speed -= 5/gameScale;
            }            

            let turretsMax = parseInt(attributeArray.turrets_max) || 0;
            let turrets = turretsMax;
            if (crippled === true) {
                turrets = Math.round(turrets/2);
            }


            this.token = token;
            this.name = char.get("name");
            if (alpha === true) {this.name = token.get("name")};
            this.type = type;
            this.id = id;
            this.charID = char.get("id");
            this.charName = char.get("name");
            this.player = player;
            this.faction = faction;
            this.location = location;
            this.hexLabel = hexLabel;
            this.lastHexLabel = hexLabel;//last turns hex
            hexMap[hexLabel].shipIDs.push(this.id);

            this.squadronID = "";

            this.hull = hull;
            this.hullMax = hullMax;
            this.crippled = crippled;

            this.speed = speed;
            this.speedMax = speedMax;
            this.radius = parseInt(attributeArray.radius) || 0
            this.turns = parseInt(attributeArray.turns) || 0

            this.shields = parseInt(attributeArray.shields) || 0;
            this.shieldsMax = parseInt(attributeArray.shields_max) || 0;
            this.farmour = parseInt(attributeArray.farmour) || 0;
            this.sarmour = parseInt(attributeArray.sarmour) || 0;
            this.rarmour = parseInt(attributeArray.rarmour) || 0;
            this.turrets = turrets;
            this.turretsMax = turretsMax;
            
            this.engines = parseInt(attributeArray.engines) || 0;
            this.thrusters = parseInt(attributeArray.thrusters) || 0;
            this.fires = parseInt(attributeArray.fires) || 0;
            this.bridgeCrit = attributeArray.bridgecrit;
            this.shieldCrit = attributeArray.shieldcrit;
            this.weaponArray = weaponArray;
            this.bays = bays;
            this.hanger = hanger;
            this.craftTypes = craftTypes;
            this.totalSquadrons = totalSquadrons; //max squadrons
            this.currentSquadrons = currentSquadrons;

            this.leadership = 7;
            this.leaderText = "Experienced";

            this.ordnanceIDs = []; //array of ids of its ordnance



            UnitArray[id] = this;


        }

        Damage (damage,weapon) {
            if (!weapon) {
                weapon = {type: "N/A"}
            }

            //shields first
            if (weapon.type === "Lance Battery" || weapon.type === "Weapons Battery" || weapon.type === "Nova Cannon") {
                let shields = parseInt(this.token.get("bar1_value"));
                let shieldsMax = parseInt(this.token.get("bar1_max"));
                if (shields > 0) {
                    let sd = Math.min(shields,damage);
                    outputCard.body.push("Shields absorb " + sd + " Damage");
                    shields -= sd;
                    damage -= sd;
                    if (sd > 0) {
                        let hex = hexMap[this.hexLabel];
                        for (let s=0;s<sd;s++) {
                            Blast(hex);
                        }
                    }
                }
            
                this.token.set("bar1_value",shields);
                if (shields === 0) {
                    this.token.set("aura1_color","#000000");
                } else if (shields < shieldsMax) {
                    this.token.set("aura1_color","#FF0000");
                }
            }
   
            if (this.token.get(SM.brace) === true) {
                braced = 0;
                for (let i=0;i<damage;i++) {
                    let braceRoll = randomInteger(6);
                    if (braceRoll > 3) {
                        braced++
                    }
                }
                if (braced > 0) {
                    outputCard.body.push("Brace for Impact stops " + braced + " Damage");
                    damage -= braced
                }
            }
    
            if (damage > 0) {
                let hull = parseInt(this.token.get("bar2_value"));
                let hullMax = parseInt(this.token.get("bar2_max"));
                //criticals
                let criticals = 0;
                let critRolls = [];
                for (let c=0;c<damage;c++) {
                    let roll = randomInteger(6);
                    critRolls.push(roll);
                    if (roll === 6) {
                        criticals++;
                    }
                }
                critRolls.sort(function(a, b){return b-a});//sort descending
                let tip = "Critical Rolls: " + critRolls.toString();
                tip = '[🎲](#" class="showtip" title="' + tip + ')';

                outputCard.body.push(tip + " " + damage + " points of Damage are taken");
                if (criticals > 0 && (this.type === "Escort" || this.type === "Defence") && parseInt(this.token.get("bar2_max") < 3)) {
                    damage += criticals;
                } else {
                    for (let i=0;i<criticals;i++) {
                        let critRoll = randomInteger(6) + randomInteger(6);
                        damage += this.Critical(critRoll);
                    }
                }

                hull = Math.max(hull - damage,0);
                this.token.set("bar2_value",hull);
                AttributeSet(this.charID,"hull",hull);
                
                if (this.crippled === false && hull/hullMax < 0.5 && hull > 0) {
                    outputCard.body.push("The Ship is Crippled!");
                    _.each(this.weaponArray,weapon => {
                        weapon.fp = Math.round(weapon.fp);
                    })
                    this.speed -= 5/gameScale;
                    this.shields = Math.round(this.shields);
                    this.turrets = Math.round(this.turrets);
                    this.token.set({
                        bar1_max: Math.round(this.shieldsMax/2),
                        tint_color: "#FF0000",
                    })
                    this.crippled = true;
                }   
                if (hull === 0) {
                    let destroyed = this.Destroyed();
                    if (destroyed === true) {
                        this.token.remove();
                        delete UnitArray[this.id];
                    }
                }
            } else {
                outputCard.body.push("No Hull Damage was done");
            }
        }

        Destroyed () {
            //escorts vs capital
            let hex = hexMap[this.hexLabel];
            let destroyed = false;
            if (this.type === "Escort" || (this.type === "Defence" && parseInt(this.token.get("bar2_max")) < 3)) {
                Blast(hex);
                outputCard.body.push("The Ship was Destroyed!");
                this.token.remove();
                Squadron(this.squadronID).remove(this.id);
                delete UnitArray(this.id);
                destroyed = true;
            } else {
                let catRoll = randomInteger(6) + randomInteger(6);
                if (catRoll > 1 && catRoll < 7) {
                    if (this.name.includes("Hulk")) {
                        if (this.name.includes("Blazing")) {
                            outputCard.body.push("Fires burn out and this ship is now just a shattered hulk drifting in the void");
                            this.Hulk("Drifting");
                        } else {
                            outputCard.body.push("The Ship remains a shattered, drifing Hulk");
                        }
                    } else {
                        outputCard.body.push("[B]Drifting Hulk[/b]")
                        outputCard.body.push("The Ship is reduced to a shattered hulk drifting in space.");
                        this.Hulk("Drifting");
                    }
                } else if (catRoll > 6 && catRoll < 9) {
                    if (this.name.includes("Hulk")) {
                        if (this.name.includes("Blazing")) {
                            outputCard.body.push("The Ship remains a Blazing Hulk");
                        } else {
                            outputCard.body.push("Fire ignite within the Hulk and continue to burn");
                            this.Hulk("Blazing");
                        }
                    } else {
                        outputCard.body.push("[B]Blazing Hulk[/b]")
                        outputCard.body.push("The Ship is reduced to a burning wreck with uncontrolled fires blazing on every deck. In time the fires will either burn out or trigger a cataclysmic explosion.")
                        this.Hulk("Blazing");
                    }
                } else if (catRoll > 8 && catRoll < 12) {
                    outputCard.body.push("[B]Plasma Drive Overload[/b]")
                    outputCard.body.push("The ships plasma coils overload and explode in a blazing inferno of white hot plasma.");
                    let num = Math.round(this.hullMax/2);
                    for (let i=0;i<num;i++) {
                        Blast(hex);
                    }
                    //explosion
                    let range = Math.round((randomInteger(6) + randomInteger(6) + randomInteger(6))/gameScale);
                    _.each(UnitArray,unit => {
                        let dist = Distance(unit,this);
                        if (dist <= range) {
                            outputCard.body.push(unit.name + " is caught in the blast.");
                            ButtonInfo("Explosion Effects","!Explosion");
                            let info = {
                                id: unit.id,
                                strength: num,
                            }
                            criticalArray.push(info);
                        }
                    })
                    destroyed = true;
                } else if (catRoll === 12) {
                    outputCard.body.push("[B]Warp Drive Implosion[/b]")
                    outputCard.body.push("The ships warp drive implodes, ripping a hole in real space that tears at any nearby vessels with horrific force.");
                    let num = Math.round(this.hullMax);
                    for (let i=0;i<num;i++) {
                        Blast(hex);
                    }
                    //explosion
                    let range = Math.round((randomInteger(6) + randomInteger(6) + randomInteger(6))/gameScale);
                    _.each(UnitArray,unit => {
                        let dist = Distance(unit,this);
                        if (dist <= range) {
                            outputCard.body.push(unit.name + " is caught in the blast.");
                            ButtonInfo("Explosion Effects","!Explosion");
                            let info = {
                                id: unit.id,
                                strength: num,
                            }
                            criticalArray.push(info);
                        }
                    })
                    destroyed = true;
                }

            }

            return destroyed;

        }

        AdjustShields() {
            let blast = 0;
            _.each(BlastArray,b => {
                if (b.hexLabel === this.hexLabel) {
                    blast++;
                }
            })
            let s = parseInt(this.token.get("bar1_max"));
            let sMax = s;
            if (this.shieldCrit === hitValue) {
                s = 0;
            }
            s = Math.max(0,s-blast);
            this.token.set("bar1_value",s);
            if (s === 0) {
                this.token.set("aura1_color","#000000");
            } else if (s < sMax) {
                this.token.set("aura1_color","#FF0000");
            } else if (s === sMax) {
                this.token.set("aura1_color","#00FF00");
            }
        }


        Critical (roll) {
            let bonusDamage = 0;
            
            if (this.faction === "Imperial Navy" || this.faction === "Chaos") {
                if (roll === 2) {
                    let flag = false;
                    for (let i=0;i<this.weaponArray.length;i++) {
                        let weapon = this.weaponArray[i];
                        if (weapon.arc.includes("Front,Left,Right") && weapon.fired !== hitValue) {
                            outputCard.body.push(weapon.name + " is badly damaged and may not fire until repaired");
                            weapon.fired = hitValue;
                            AttributeSet(this.charID,"weapon"+i+"status","Damaged");
                            AttributeSet(this.charID,"weapon"+i+"fired",hitValue);
                            flag = true;
                            break;
                        } 
                    }
                    if (flag === false) {
                        for (let i=0;i<this.bays.length;i++) {
                            let bay = this.bays[i];
                            if (bay.arc === "Stern" && bay.launched !== hitValue) {
                                outputCard.body.push("Stern Launch Bay is badly damaged and may not Launch until repaired");
                                bay.launched = hitValue;
                                AttributeSet(this.charID,"bay"+i+"status","Damaged");
                                AttributeSet(this.charID,"bay"+i+"launched",hitValue);
                                flag = true;
                                break;
                            }
                        }
                    }
                    if (flag === false) {
                        roll = 3; //nothing hit
                    }
                }

                if (roll === 3) {
                    let flag = false;
                    for (let i=0;i<this.weaponArray.length;i++) {
                        let weapon = this.weaponArray[i];
                        if (weapon.arc.includes("Right") && weapon.fired !== hitValue) {
                            outputCard.body.push(weapon.name + " is badly damaged and may not fire until repaired");
                            weapon.fired = hitValue;
                            AttributeSet(this.charID,"weapon"+i+"status","Damaged");
                            AttributeSet(this.charID,"weapon"+i+"fired",hitValue);
                            flag = true;
                            break;
                        } 
                    }
                    if (flag === false) {
                        for (let i=0;i<this.bays.length;i++) {
                            let bay = this.bays[i];
                            if (bay.arc === "Right" && bay.launched !== hitValue) {
                                outputCard.body.push("Right Launch Bay is badly damaged and may not Launch until repaired");
                                bay.launched = hitValue;
                                AttributeSet(this.charID,"bay"+i+"status","Damaged");
                                AttributeSet(this.charID,"bay"+i+"launched",hitValue);
                                flag = true;
                                break;
                            }
                        }
                    }
                    if (flag === false) {
                        roll = 4; //nothing hit
                    }
                }

                if (roll === 4) {
                    let flag = false;
                    for (let i=0;i<this.weaponArray.length;i++) {
                        let weapon = this.weaponArray[i];
                        if (weapon.arc.includes("Left") && weapon.fired !== hitValue) {
                            outputCard.body.push(weapon.name + " is badly damaged and may not fire until repaired");
                            weapon.fired = hitValue;
                            AttributeSet(this.charID,"weapon"+i+"status","Damaged");
                            AttributeSet(this.charID,"weapon"+i+"fired",hitValue);
                            flag = true;
                            break;
                        } 
                    } 
                    if (flag === false) {
                        for (let i=0;i<this.bays.length;i++) {
                            let bay = this.bays[i];
                            if (bay.arc === "Left" && bay.launched !== hitValue) {
                                outputCard.body.push("Left Launch Bay is badly damaged and may not Launch until repaired");
                                bay.launched = hitValue;
                                AttributeSet(this.charID,"bay"+i+"status","Damaged");
                                AttributeSet(this.charID,"bay"+i+"launched",hitValue);
                                flag = true;
                                break;
                            }
                        }
                    }
                    if (flag === false) {
                        roll = 5; //nothing hit
                    }
                }

                if (roll === 5) {
                    let flag = false;
                    for (let i=0;i<this.weaponArray.length;i++) {
                        let weapon = this.weaponArray[i];
                        if (weapon.arc.includes("Front") && weapon.fired !== hitValue) {
                            outputCard.body.push(weapon.name + " is badly damaged and may not fire until repaired");
                            weapon.fired = hitValue;
                            AttributeSet(this.charID,"weapon"+i+"status","Damaged");
                            AttributeSet(this.charID,"weapon"+i+"fired",hitValue);
                            flag = true;
                            break;
                        } 
                    }
                    if (flag === false) {
                        for (let i=0;i<this.bays.length;i++) {
                            let bay = this.bays[i];
                            if (bay.arc === "Prow" && bay.launched !== hitValue) {
                                outputCard.body.push("Prow Launch Bay is badly damaged and may not Launch until repaired");
                                bay.launched = hitValue;
                                AttributeSet(this.charID,"bay"+i+"status","Damaged");
                                AttributeSet(this.charID,"bay"+i+"launched",hitValue);
                                flag = true;
                                break;
                            }
                        }
                    }
                    if (flag === false) {
                        roll = 6; //nothing hit
                    }
                }

                if (roll === 6) {
                    if (this.engines > 0) {
                        outputCard.body.push("Further Damage to the Engine Rooms is done, the Reactors are in Danger! 1 Extra Hull Pt is done");
                    } else {
                        outputCard.body.push("The Engine Room is rocked by explosions, forcing all hands to tend to the reactors. The ship may not make any turns until the damage is repaired. 1 Extra Hull Pt is done");
                    }
                    bonusDamage++;
                    this.engines++;
                    AttributeSet(this.charID,"engines",this.engines);
                }

                if (roll === 7) {
                    outputCard.body.push("Fire! If not put out in the end phase, it causes one point of Hull damage and keeps burning");
                    this.fires++;
                    AttributeSet(this.charID,"fires",this.fires);
                }

                if (roll === 8) {
                    outputCard.body.push("Thrusters Damaged! 1 Extra Hull Pt is done");
                    bonusDamage++;
                    if (this.thrusters === 0) {
                        outputCard.body.push("Speed is reduced by " + 10/gameScale + " until the damage is repaired");
                    }
                    this.thrusters++;
                    AttributeSet(this.charID,"thrusters",this.thrusters);
                }

                if (roll === 9) {
                    if (this.bridgeCrit === readyValue) {
                        this.bridgeCrit = hitValue;
                        outputCard.body.push("Bridge Smashed! The Captain and his officers are killed. The ship's Leadership is reduced by 3");
                        this.leadership -= 3;
                        this.leaderText = "Officers Killed";
                        AttributeSet(this.charID,"bridgecrit",hitValue);
                    } else {
                        roll = 10;
                    }
                }

                if (roll === 10) {
                    if (this.shieldCrit === readyValue) {
                        outputCard.body.push("The Shield Generators overload and burn out, leaving the ship virtually defenceless.");
                        this.shieldCrit = hitValue;
                        AttributeSet(this.charID,"shieldcrit",hitValue);
                    } else {
                        roll = 11;
                    }
                }

                if (roll === 11) {
                    outputCard.body.push("Hull Breach! A huge gash is torn in the ship's hull, causing carnage amongst the crew");
                    let roll = randomInteger(3);
                    outputCard.body.push(roll + " Extra Hull Damage is done");
                    bonusDamage += roll;
                }

                if (roll === 12) {
                    outputCard.body.push("Bulkhead Collapse! Internal pillars buckle and twist, whole compartments crumple with a scream of tortured metal. Just pray that some of the ship holds together!");
                    let roll = randomInteger(6);
                    outputCard.body.push(roll + " Extra Hull Damage is done");
                    bonusDamage += roll;
                }
            }






            return bonusDamage;
        }


        Hulk (hulkType) {
            let h = this.type + "H";
            let represents;
            this.type = this.type + " Hulk";
            let img = getCleanImgSrc(Factions[this.faction][h]);
            let gmnotes = decodeURIComponent(this.token.get("gmnotes")).toString();
            let armours = this.farmour + "/" + this.sarmour + "/" + this.rarmour;
            gmnotes += ";" + this.hullMax + ";" + armours + ";" + this.faction;
            if (hulkType === "Drifting") {
                this.name = "Drifting Hulk of " + this.charName;
                represents =  "-OHtcaQ80NFkng3NlHpe";
            }
            if (hulkType === "Blazing") {
                this.name = "Blazing Hulk of " + this.charName;
                represents = "-OHtcaQ80NFkng3NlHpe";
            }
            this.token.set({
                imgsrc: img,
                name: this.name,
                represents: represents,
                bar1_value: 0,
                bar1_max: 0,
                bar2_value: 0,
                tint_color: "transparent",
                gmnotes: gmnotes,
                statusmarkers: "",
            });
        }
    







    }


    class Squadron {
        constructor(faction,squadronMarker,sid) {
            if (!sid || sid === undefined) {
                this.id = stringGen();
            } else {
                this.id = sid;
            }
            this.unitIDs = [];
            this.faction = faction;
            this.marker = squadronMarker;
            SquadronArray[this.id] = this;
        }
        add(id) {
            if (this.unitIDs.includes(id) === false) {
                this.unitIDs.push(id);
            }
        }
        remove(id) {
            let index = this.unitIDs.indexOf(id);
            if (index > -1) {
                this.unitIDs.splice(index,1);
            }
        }
    }

    class Ordnance {
        constructor(id,alpha){
            if (!alpha) {alpha = false};
            let token = findObjs({_type:"graphic", id: id})[0];
            let char = getObj("character", token.get("represents"));
            let attributeArray = AttributeArray(char.id);
            let faction = attributeArray.faction;
            let player = (state.BFG.factions[0] === faction) ? 0:1;
            let type = "Ordnance";
            let subtype = attributeArray.ordrole;
            let location = new Point(token.get("left"),token.get("top"));
            let hexLabel = location.toOffset().label();

            this.token = token;
            this.name = char.get("name").replace(faction + " ","");
            if (alpha === true) {this.name = token.get("name")};
            this.type = type;
            this.subtype = subtype;
            this.id = id;
            this.charID = char.get("id");
            this.charName = char.get("name");
            this.player = player;
            this.faction = faction;
            this.location = location;
            this.hexLabel = hexLabel;
            this.lastHexLabel = hexLabel;//last turns hex

            hexMap[hexLabel].ordnanceIDs.push(this.id);

            this.speed = parseInt(attributeArray.speed);
            this.dogfight = parseInt(attributeArray.dogfight);
            this.armour = parseInt(attributeArray.armour);
            this.traits = attributeArray.ordtraits || "Nil"
            this.strength = "";

            this.carrier = "";
            this.moveList = []; //for auto movement
            this.squadronID = "";
            UnitArray[id] = this;


        }

        AutoMove () {
            let currentHexLabel = this.hexLabel
            let currentHex = hexMap[currentHexLabel];
            let index = currentHex.ordnanceIDs.indexOf(this.id);
            if (index > -1) {
                currentHex.ordnanceIDs.splice(index,1);
            }
            //path used, rotation doesnt change
            let moveList = this.moveList;
            let destroyed = false;
            for (let i=0;i<this.speed;i++) {
                currentHexLabel = moveList.shift();
                if (currentHexLabel) {
                    currentHex = hexMap[currentHexLabel];
                    this.token.set({
                        left: currentHex.centre.x,
                        top: currentHex.centre.y,
                    })
                    let stuff = false;
                    for (let j=0;j<BlastArray.length;j++) {
                        if (BlastArray[j].hexLabel === currentHex.label) {
                            stuff = "Blast";
                            break;
                        }
                    }
                    if (currentHex.terrain.includes("Dust or Gas")) {
                        stuff = "Dust and Gas";
                    }
                    if (stuff !== false) {
                        if (randomInteger(6) === 6) {
                            outputCard.body.push("The Salvo is destroyed in the " + stuff);
                            destroyed = true;
                            break; //breaks move loop
                        }
                        i++; //extra movement cost
                    }
                    if (currentHex.terrain === "Asteroids") {
                        outputCard.body.push("The Salvo is destroyed as it heads into the Asteroid Field");
                        destroyed = true;
                        Blast(currentHex);
                        break;
                    }
                    if (currentHex.terrain === "Planet") {
                        outputCard.body.push("The Salvo impacts on the Planet's Surface");
                        destroyed = true;
                        Blast(currentHex);
                        break;
                    }
                    if (currentHex.terrain === "Warp Rift") {
                        outputCard.body.push("The Salvo enters the Warp Rift and is lost...");
                        destroyed = true;
                        break;
                    }
                    //check for other ordnance first (CAP might intervene before hit ships)
                    if (currentHex.ordnanceIDs.length > 0) {
                        outputCard.body.push("[hr]");
                        destroyed = this.AutoVsOrdnance(currentHex.ordnanceIDs);
                    }
                    //check for ships
                    if (currentHex.shipIDs.length > 0) {
                        outputCard.body.push("[hr]");
                        destroyed = this.AutoVsShip(currentHex.shipIDs);
                    }
                } else {
                    //off map
                    outputCard.body.push("The Salvo leaves the map");
                    destroyed = true;
                    break;
                }
            }

            if (destroyed === true) {
                this.Destroyed();
            } else {
                if (currentHex.ordnanceIDs.includes(this.id) === false) {
                    currentHex.ordnanceIDs.push(this.id);
                }
                this.moveList = moveList;
                let newGMN = this.carrier + ";" + moveList;
                this.token.set("gmnotes",newGMN);
            }
        }

        //below are used for when automoving torpedos
        AutoVsShip(shipIDs) {
            let lastHex = hexMap[this.lastHexLabel];
            let end = false;
            //Turrets can be massed so done first before damage
            let tTip;
            let needed = 4;
            let shotDown = 0;
            for (let i=0;i<shipIDs.length;i++) {
                let target = UnitArray[shipIDs[i]];
                let turretRolls = [];
                for (let i=0;i<target.turrets;i++) {
                    let roll = randomInteger(6);
                    turretRolls.push(roll);
                    if (roll >= needed) {
                        shotDown++;
                    }
                }
                tTip = target.name + " Turrets: " + turretRolls.toString() + " vs " + needed + "+";
                tTip = '[🎲](#" class="showtip" title="' + tTip + ')';
            }
            let s = (shotDown === 1) ? "":"s"
            this.strength = Math.max(0,this.strength - shotDown);
            if (shotDown > 0 && this.strength > 0) {
                outputCard.body.push(tTip + " Turrets shoot down " + shotDown + " Torpedo" + s);
            } else if (shotDown > 0 && this.strength === 0) {
                outputCard.body.push(tTip + " Turrets shoot down all the Torpedos");
                return true;
            } else {
                outputCard.body.push(tTip + " Turrets fail to shoot down any Torpedos");
            }            

            for (let i=0;i<shipIDs.length;i++) {
                let target = UnitArray[shipIDs[i]];
                let needed,tip;
                let currentHex = hexMap[target.hexLabel];
                let angleTS = currentHex.cube.angle(lastHex.cube);
                let phi = Angle(angleTS - target.token.get("rotation"));
                if (phi > 300 || phi < 60) {needed = target.farmour};
                if (phi >= 60 && phi <= 120) {needed = target.sarmour};
                if (phi > 120 && phi < 240) {needed = target.rarmour};
                if (phi >= 240 && phi <= 300) {needed = target.sarmour};

                if (end === false) {
                    let hits = 0;
                    let rolls = [];
                    for (let j=0;j<this.strength;j++) {
                        let roll = randomInteger(6);
                        rolls.push(roll);
                        if (roll >= needed) {
                            hits++;
                        }
                    }
                    let s = (hits === 1) ? "":"s";
                    tip = "Strength " + this.strength;
                    tip += "<br>Rolls: " + rolls.toString() + " vs. " + needed + "+";


                    tip = '[🎲](#" class="showtip" title="' + tip + ')';
//any special torpedo stuff likely goes in here
                    if (hits > 0) {
                        outputCard.body.push(tip + " " + target.name + " is hit by " + hits + " Torpedo" + s);
                        outputCard.body.push("It takes " + hits + " Damage");
                    } else {
                        outputCard.body.push(tip + " " + target.name + " is missed.");
                    }

                    this.strength -= hits;
                    this.token.set("bar3_value",this.strength);

                    if (hits > 0) {
                        target.Damage(hits)
                    }
                    if (shipIDs.length > 1 && this.strength > 0) {
                        outputCard.body.push("[hr]");
                    }

                    if (this.strength === 0) {
                        end = true;
                    }
                
                }
            }            
            return end;
        }


        AutoVsOrdnance(ordIDs) { 
            //create an array of ordnance organized by subtype
            //as is triggered by auto move the ordnance in hex should only be enemy
            let OrdArray = {};
            _.each(ordIDs,ordID => {
                let ord = UnitArray[ordID];
                if (ord.faction !== this.faction) {
                    if (OrdArray[ord.subtype]) {
                        OrdArray[ord.subtype].push(ord);
                    } else {
                        OrdArray[ord.subtype] = [ord];
                    }
                }
            })
            if (Object.keys(OrdArray).length === 0) {
                //all friendly ordnance
                return false;
            }

            let end = false;

            if (this.subtype === "Torpedo") {
                let opponentTypes = ["Fighter","Thunderhawk","Fighter-Bomber"];
                let torpDogFight = Math.abs(this.dogfight);
                let torpsHit = 0;
                let oppText = [];
                let torpText = [];
                let subArray;
                _.each(opponentTypes,opponentType => {
                    subArray = OrdArray[opponentType];
                    if (subArray !== undefined) {
                        if (subArray.length > 0) {
                            //fighter etc get their attacks
                            for (let i=0;i<subArray.length;i++) {
                                let hits = 0;
                                let opponent = subArray[i];
                                if (opponent.token.get(SM.damaged) === true) {
                                    continue;
                                }
                                let tip = "Rolls: ";
                                let rolls = [];
                                for (let j=0;j<opponent.dogfight;j++) {
                                    let roll = randomInteger(6);
                                    rolls.push(roll);
                                    if (roll === 4) {
                                        hits += 1;
                                    } else if (roll > 4) {
                                        hits += 2;
                                    }
                                }
                                tip += rolls.toString();
                                tip = '[🎲](#" class="showtip" title="' + tip + ')';
                                let s = (hits === 1) ? "":"s";
                                oppText.push(tip + " " + opponent.name + " gets " + hits + " Hit" + s);
                                torpsHit += hits;
                            }
                            //torpedoes 'attack back'
                            let turretRolls = [];
                            let tip = "Rolls: ";
                            let hits = 0;
                            for (let i=0;i<torpDogFight;i++) {
                                let roll = randomInteger(6);
                                turretRolls.push(roll);
                                if (roll >= subArray[0].armour) {
                                    hits++;
                                }
                            }
                            tip += turretRolls.toString();
                            tip = '[🎲](#" class="showtip" title="' + tip + ')';
                            let s = (hits === 1) ? "":"s";
                            torpText.push(tip + " " + opponentType + "s takes " + hits + " Hit" + s + " during the attack");
                            for (let i=0;i<hits;i++) {
                                let c = i;
                                if (c > (subArray.length - 1)) {c = 0};
                                if (subArray[c].token.get(SM.damaged) === true) {
                                    c++;
                                    if (c > (subArray.length - 1)) {c = 0};
                                }
                                let hitRoll = randomInteger(6);
                                if (hitRoll > 3) {
                                    torpText.push("Damaging " + subArray[c].name);
                                    subArray[c].token.set(SM.damaged,true);
                                } else {
                                    torpText.push("Destroying " + subArray[c].name);
                                    subArray[c].token.set("status_dead",true);
                                }
                            }
                        }
                        for (let i=0;i<subArray.length;i++) {
                            let unit = subArray[i];
                            if (unit.token.get("status_dead") === true) {
                                let carrier = UnitArray[unit.carrier];
                                let index = carrier.ordnanceIDs.indexOf(unit.id);
                                if (index > -1) {
                                    carrier.ordnanceIDs.splice(index,1);
                                }
                                delete (UnitArray[unit.id]);
                                unit.token.remove();
                            }
                        }
                    }
                })
                
                outputCard.body.push("The Torpedo Salvo was engaged by Craft");
                let s = (torpsHit === 1) ? "":"s";
                let verb = (torpsHit === 1) ? " was ":" were ";
                this.strength = Math.max(0,this.strength - torpsHit);
                this.token.set("bar3_value",this.strength);
                if (this.strength === 0) {
                    outputCard.body.push("All Torpedos were Destroyed");
                    end = true;
                } else if (torpsHit > 0) {
                    outputCard.body.push(torpsHit + " Torpedo" + s + verb + "Destroyed");
                } else {
                    outputCard.body.push("No Torpedoes were destroyed");
                }
                if (oppText.length > 0) {
                    outputCard.body.push("[hr]");
                    for (let i=0;i<oppText.length;i++) {
                        outputCard.body.push(oppText[i]);
                    }
                    for (let i=0;i<torpText.length;i++) {
                        outputCard.body.push(torpText[i]);
                    }
                }
            }

            return end;
        }

        Destroyed() {
            this.token.remove();
            PlaySound("Explosion");
            let squadron = SquadronArray[this.squadronID];
            squadron.remove(this.id);

            let carrier = UnitArray[this.carrier];
            if (carrier) {
                let index = carrier.ordnanceIDs.indexOf(this.id);
                if (index > -1) {
                    carrier.ordnanceIDs.splice(index,1);
                }
            }

            delete UnitArray[this.id];
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

    const FX = (fxname,unit1,unit2)=> {
        // unit1 is shooter, unit2 = target
        let fxType =  findObjs({type: "custfx", name: fxname})[0];
        spawnFxBetweenPoints(unit1.location, unit2.location, fxType.id);
    }


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

    //Turn Order Stuff from Aaron

  /* eslint-disable no-unused-vars */
  const getTurnArray = () => ( '' === Campaign().get('turnorder') ? [] : JSON.parse(Campaign().get('turnorder')));
  const getTurnArrayFromPrev = (prev) => ( '' === prev.turnorder ? [] : JSON.parse(prev.turnorder));
  const setTurnArray = (ta) => Campaign().set({turnorder: JSON.stringify(ta)});
  const addTokenTurn = (id,pr) => {
    let ta = getTurnArray();
log(ta)
    ta.push({ id: id, pr: pr, _pageid: Campaign().get("playerpageid")})
    setTurnArray(ta);
  }

  const addCustomTurn = (custom, pr) => setTurnArray([...getTurnArray(), {id:"-1",custom,pr}]);
  const removeTokenTurn = (tid) => setTurnArray(getTurnArray().filter( (to) => to.id !== tid));
  const removeCustomTurn = (custom) => setTurnArray(getTurnArray().filter( (to) => to.custom !== custom));
  const clearTurnOrder = () => Campaign().set({turnorder:'[]'});
  const sorter_asc = (a, b) => a.pr - b.pr;
  const sorter_desc = (a, b) => b.pr - a.pr;
  const sortTurnOrder = (sortBy = sorter_desc) => Campaign().set({turnorder: JSON.stringify(getTurnArray().sort(sortBy))});
  /* eslint-enable no-unused-vars */




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
        MapEdge = edges[0].get("x");
        if (edges.length > 1) {
            sendChat("","More than one Edge");
        } 

        turnOrder = getTurnArray();



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


        //add tokens on map
        let mta = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "map",});
        
        let l = 0;
        _.each(mta,token => {
            let name = token.get("name");
            let centre = new Point(token.get("left"),token.get("top"));
            let cube = centre.toCube();
            let label = cube.label();
            if (name === "Moon") {
                l++;
                hexMap[label].terrain = "Moon";
                hexMap[label].terrainID = token.get('id');
                if (token.get("width") === 140) {
                    let neighbours = cube.neighbours;
                    _.each(neighbours,b => {
                        hexMap[b.label()].terrain = "Moon";
                        hexMap[b.label()].terrainID = token.get('id');
                    })
                }
            }

            if (name.includes("Planet")) {
                l++;
                let tC = hexMap[label].cube;
                hexMap[label].terrain = "Planet";
                hexMap[label].terrainID = token.get("id");
                let rad = token.get("width")/140; //radius in hexes
                let gravityWell;
                if (name.includes("Small")) {
                    gravityWell = 10/gameScale;
                } else if (name.includes("Medium")) {
                    gravityWell = 15/gameScale;
                } else if (name.includes("Large")) {
                    gravityWell = 30/gameScale;
                }
            
                let cubes = tC.radius(Math.ceil(rad + gravityWell + .5));
                _.each(cubes,indCube => {
                    if (hexMap[indCube.label()]) {
                        let dist = indCube.distance(tC);
                        if (dist <= rad) {
                            hexMap[indCube.label()].terrain = "Planet";
                            hexMap[indCube.label()].terrainID = token.get("id");
                        } else if (dist > rad && dist <= (rad + gravityWell)) {
                            let points = XHEX(hexMap[indCube.label()].centre);
                            let flag = false;
                            for (let i=0;i<points.length;i++) {
                                let pDist = points[i].distance(hexMap[label].centre);
                                if (pDist <= (rad * 70)) {
                                    hexMap[indCube.label()].terrain = "Planet";
                                    hexMap[indCube.label()].terrainID = token.get("id");
                                    flag = true;
                                    break;
                                }
                            }
                            if (flag === false) {
                                hexMap[indCube.label()].gravityWell = label;
                            }
                        } else {
                            let points = XHEX(hexMap[indCube.label()].centre);
                            for (let i=0;i<points.length;i++) {
                                let pDist = points[i].distance(hexMap[label].centre);
                                if (pDist <= ((rad + gravityWell) * 70)) {
                                    hexMap[indCube.label()].gravityWell = label;
                                    break;
                                }
                            }
                        }
                    }
                })
            }

            if (name === "Dust or Gas" || name === "Asteroids" || name === "Warp Rift") {
                hexMap[label].terrain = name;
                hexMap[label].terrainID = token.get("id");
            }

            //Blast Markers
            if (name === "Blast") {
                let ba = {
                    hexLabel: label,
                    id: token.get("id"),
                }
                BlastArray.push(ba);
            }


        });

        let elapsed = Date.now()-startTime;
        log("Hex Map Built in " + elapsed/1000 + " seconds");
        log(l + " Elements added to Map");
        TA();
    };




     
    const TA = () => {
        //add tokens on token layer
        UnitArray = {};
        SquadronArray = {};
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
            if (token.get("name") === "Target") {
                token.remove();
                return;
            } 
            let character = getObj("character", token.get("represents"));           
            if (character === null || character === undefined) {
                if (token.get("name") === "Blast Marker") {
                    let pt = new Point(token.get("left",token.get("top")));
                    let hexLabel = pt.toOffset().label();
                    BlastArray.push({
                        id: token.id,
                        hexLabel: hexLabel,
                    })
                }
                return;
            };
            let unitInfo = decodeURIComponent(token.get("gmnotes")).toString();
            if (!unitInfo) {return}; //not added to unit array
            let faction = Attribute(character,"faction") || "Neutral";
            let type = Attribute(character,"type") || "Neutral";
            unitInfo = unitInfo.split(";");
            if (type === "Ordnance") {
                let ordnance = new Ordnance(token.id,true);
                ordnance.carrier = unitInfo[0];
                ordnance.moveList = unitInfo[1] || "";
                if (ordnance.moveList !== "") {
                    ordnance.moveList = ordnance.moveList.split(",");
                }
            } else {
                let squadronID = unitInfo[0];
                let symbolNum = unitInfo[1];
                let symbol = "";
                if (symbolNum > -1) {
                    symbol = SquadronMarkers[symbolNum];
                }
                let squadron = SquadronArray[squadronID];
                if (!squadron) {
                    squadron = new Squadron(faction,symbol,squadronID);
                }
                let unit = new Ship(token.id,true);
                squadron.add(token.id);
                unit.squadronID = squadronID;
                if (unit.name.includes("Hulk")) {
                    unit.hullMax = unitInfo[2];
                    let armours = unitInfo[3].split("/");
                    unit.farmour = armours[0];
                    unit.sarmour = armours[1];
                    unit.rarmour = armours[2];
                    unit.faction = unitInfo[4];
                    unit.shieldsMax = 0;
                    unit.token.set({
                        bar1_value: 0,
                        bar1_max: unit.hullMax,
                        bar2_value: 0,
                        bar2_max: 0,
    
                    })                
                }
    
    
    
            }
        });



        let elapsed = Date.now()-start;
        log(`${c} token${s} checked in ${elapsed/1000} seconds - ` + Object.keys(UnitArray).length + " placed in Unit Array");



    }






    const Captain = (faction) => {    
        let player = (state.BFG.factions[0] === faction) ? 0:1;
        let nameNumber = state.BFG.captains[player].length;
        if (nameNumber < 0 || !nameNumber) {
            nameNumber = 0;
        } else {
            nameNumber = randomInteger(nameNumber) - 1;
            state.BFG.captains[player].splice(nameNumber,1);
        }
        let name = Factions[faction].captains[nameNumber];
        return name;
    }


    const OrbitHexes = (point,radius) => {
        //for a given point - return hexLabels of hexes at that radius
        let orbitHexes = [];
        let iterations = radius * 6;
        let deg = 360/iterations;
        let startDeg = 0;
        for (let i = 0;i<iterations;i++) {
            let theta = startDeg * (Math.PI/180);
            let newPoint = new Point(point.x  + (radius * 70 * Math.cos(theta)), point.y + (radius * 70 * Math.sin(theta)));
            let newHexLabel = newPoint.toOffset().label();
            if (orbitHexes.includes(newHexLabel) === false && hexMap[newHexLabel]) {
                if (hexMap[newHexLabel].terrain === "Empty Space") {
                    orbitHexes.push(newHexLabel);
                }
            }
            startDeg += deg;
        }
        return orbitHexes;
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
        UnitArray = {};
        //clear token info
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "objects",
        })
        let player = (getObj('player',msg.playerid)||{get: ()=>true});
        let pid = player.get('_lastpage');
        if(!pid){
            pid = Campaign().get('playerpageid');
        }
        Campaign().set({
            initiativepage: false,
        });

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
    
        state.BFG = {
            factions: ["",""],
            players: {},
            playerInfo: [[],[]],
            turn: 0,
            phase: "",
            endTurn: 8,
            scenario: "",
            sunward: "",
            zone: "",
            squadronMarkers: [[],[]],
            captains: [[],[]],
            orders: [true,true],
            ordnNames: {},
        }
        for (let i=0;i<SquadronMarkers.length;i++) {
            state.BFG.squadronMarkers[0].push(i);
            state.BFG.squadronMarkers[1].push(i);
        }
        
        CleanMap("All");
        BuildMap();
        sendChat("","Cleared State/Arrays");
    }


    const CleanMap = (type) => {
        let list = ["Asteroids","Moon","Dust or Gas","Large Planet","Medium Planet","Small Planet","Warp Rift","Gravity Well","Blast","Nova"];
        if (type !== "All") {
            list = [type];
        } else {
            let sunwards =  findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "map",});
            _.each(sunwards,path => {
                    if (path.get("stroke") === '#FDFD96') {
                        path.remove();
                    }
            })
        }

        let mta = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "map",});
        _.each(mta,token => {
            let name = token.get("name")
            if (list.includes(name)) {
                token.remove();
            }
        })
    }


    const Leadership = (unit,modifier) => {
        let needed = Math.min(unit.leadership + modifier,10);
        let roll1 = randomInteger(6);
        let roll2 = randomInteger(6);
        let total = roll1 + roll2;
        let diceFace = Factions[unit.faction].dice;
        outputCard.body.push(DisplayDice(roll1,diceFace,24) + " + " + DisplayDice(roll2,diceFace,24) + " vs. " + needed);

        if (total > needed) {
            return false;
        } else {
            return true;
        }
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
                    if (!state.BFG.players[playerID] || state.BFG.players[playerID] === undefined) {
                        state.BFG.players[playerID] = faction;
                    }
                }
            } else if (!state.BFG.players[playerID] || state.BFG.players[playerID] === undefined) {
                sendChat("","Click on one of your Units then select Roll again");
                return;
            }
            let res = "/direct " + DisplayDice(roll,Factions[faction].dice,40);
            sendChat("player|" + playerID,res);
        } else {
            let type = Tag[1];
            //type being used for times where fed back by another function
        }
    }

    const AddUnits = (msg) => {
        if (!msg.selected) {return};
        let Tag = msg.content.split(";");
        let tokenIDs = [];
        for (let i=0;i<msg.selected.length;i++) {
            tokenIDs.push(msg.selected[i]._id);
        }
        let faction, player;
        let tok = findObjs({_type:"graphic", id: tokenIDs[0]})[0];
        let char = getObj("character", tok.get("represents")); 
        let carrier = (Attribute(char,"carrierstatus") === "On") ? true:false;
        faction = Attribute(char,"faction");

        if (!state.BFG.factions[0] || state.BFG.factions[0] === "") {
            state.BFG.factions[0] = faction;
            player = 0;
            for (let i=0;i<Factions[faction].captains.length;i++) {
                state.BFG.captains[0].push(i);
            }
        } else if (state.BFG.factions[0] === faction) {
            player = 0;
        } else if (!state.BFG.factions[1] || state.BFG.factions[1] === "") {
            state.BFG.factions[1] = faction;
            player = 1;
            for (let i=0;i<Factions[faction].captains.length;i++) {
                state.BFG.captains[1].push(i);
            }
        } else if (state.BFG.factions[1] === faction) {
            player = 1;
        }

        SetupCard("Add Units","",faction);

        //create a Squadron for unit(s)
        let symbol = "";
        let markerNumber = -1;
        if (tokenIDs.length > 1 || carrier === true) {
            markerNumber = state.BFG.squadronMarkers[player].length;
            if (!markerNumber || markerNumber === 0) {
                markerNumber = 0;   
            } else {
                markerNumber = randomInteger(markerNumber) - 1;
                state.BFG.squadronMarkers[player].splice(markerNumber,1);
            }
            symbol = SquadronMarkers[markerNumber];
        }
    
        let squadron = new Squadron(faction,symbol);
        let gmnotes = squadron.id + ";" + markerNumber;

        for (let i=0;i<tokenIDs.length;i++) {
            let tokenID = tokenIDs[i];
            let token = findObjs({_type:"graphic", id: tokenID})[0];
            let char = getObj("character", token.get("represents"));           
            //reset character sheet before new Unit
            AttributeSet(char.id,"engines",0);
            AttributeSet(char.id,"enginestatus","Normal");
            AttributeSet(char.id,"thrusters",0);
            AttributeSet(char.id,"thrusterstatus","Normal");
            AttributeSet(char.id,"fires",0);
            AttributeSet(char.id,"firestatus","Normal");
            AttributeSet(char.id,"bridgecrit",readyValue);
            AttributeSet(char.id,"bridgestatus","Normal");
            AttributeSet(char.id,"shieldcrit",readyValue);
            AttributeSet(char.id,"shieldstatus","Normal");
            AttributeSet(char.id,"damagestatus"," ");
            AttributeSet(char.id,"hanger","");

            let unit = new Ship(tokenID);  
            unit.squadronID = squadron.id;
            for (let i=0;i<unit.weaponArray.length;i++) {
                let weapon = unit.weaponArray[i];
                weapon.fired = readyValue;
                weapon.fp = weapon.fpMax;
                AttributeSet(char.id,"weapon" + i + "fired",readyValue);
                AttributeSet(char.id,"weapon" + i + "status","On");
                AttributeSet(char.id,"weapon" + i + "fp",weapon.fpMax);
                AttributeSet(char.id,"weapon" + i + "range",weapon.rangeText);
            }           
            for (let i=0;i<unit.bays.length;i++) {
                let bay = unit.bays[i];
                bay.launched = readyValue;
                AttributeSet(char.id,"bay" + i + "launched",readyValue);
            }           

            let speed = unit.speedMax;
            let full;
            if (unit.type !== "Ordnance") {
                full = " / " + Math.round(speed * 1.5);
            }
            let speedText = speed + full;
            AttributeSet(char.id,"speed",speed);
            AttributeSet(char.id,"speedtext",speedText); 

            AttributeSet(char.id,"hull",unit.hullMax);
            let radius = 0;
            if (unit.type.includes("Battleship")) {radius = 3};
            if (unit.type.includes("Cruiser")) {radius = 2};
            AttributeSet(char.id,"radius",radius);

            AttributeSet(char.id,"shields",unit.shieldsMax);
            
            AttributeSet(char.id,"turrets",unit.turretsMax);


            let leadership,leaderText;
            let roll = randomInteger(6);
            if (roll === 1) {
                leadership = 6;
                leaderText = "Untried";
            } else if (roll === 2 || roll === 3) {
                leadership = 7;
                leaderText = "Experienced";
            } else if (roll === 4 || roll === 5) {
                leadership = 8;
                leaderText = "Veteran";
            } else if (roll === 6) {
                leadership = 9;
                leaderText = "Crack";
            }
            unit.leadership = leadership;
            unit.leaderText = leaderText + " (" + leadership + ")";
            unit.captain = Captain(faction);

            let name = char.get("name");
            squadron.add(tokenID);
            
            outputCard.body.push(name + " added");
            outputCard.body.push("Captain " + unit.captain);
            outputCard.body.push(unit.leaderText);
            AttributeSet(unit.charID,"captain",unit.captain);
            AttributeSet(unit.charID,"leaderText",unit.leaderText);

            unit.token.set({
                name: name,
                tint_color: "transparent",
                showplayers_bar1: true,
                showplayers_bar2: true,
                bar_location: "above",
                compact_bar: false,
                showname: true,
                bar2_value: unit.hullMax,
                bar2_max: unit.hullMax,
                bar1_value: unit.shieldsMax,
                bar1_max: unit.shieldsMax,

                statusmarkers: "",
                aura1_color: "#00FF00",
                aura1_radius: 0.1,
                showplayers_aura1: true,
                gmnotes: gmnotes,
                rotation: 30,
            })
            if (symbol !== "") {
                unit.token.set("status_"+symbol,true);
            }
        }
        

        PrintCard();        
    }

    const EquipCarrier = (msg) => {
        let id = msg.selected[0]._id;
        if (!id) {return};
        let carrier = UnitArray[id];
        carrier.hanger = {};
        let craftTypes = carrier.craftTypes;
        let totalSquadrons = carrier.totalSquadrons;
        SetupCard(carrier.name,"Load Craft",carrier.faction);
        outputCard.body.push("Total Squadrons: " + totalSquadrons);
        outputCard.body.push("Click buttons to add Craft up to total");
        for (let i=0;i<craftTypes.length;i++) {
            ButtonInfo(craftTypes[i],"!AddCraft;" + id + ";" + craftTypes[i]);
        }
        PrintCard();
    }

    const AddCraft = (msg) => {
        let Tag= msg.content.split(";");
        let carrierID = Tag[1];
        let carrier = UnitArray[carrierID];
        let craftType = Tag[2];
        let hanger = carrier.hanger; 
        if (hanger === "Empty") {hanger = {}};   
        if (carrier.currentSquadrons >= carrier.totalSquadrons) {
            SetupCard(carrier.name,"Hanger",carrier.faction);
            outputCard.body.push("[U]Carrier Hanger[/u]");
            SetHanger(carrierID);
            let keys = Object.keys(carrier.hanger);
            for (let i=0;i<keys.length;i++) {
                let text = keys[i] + "s: " + carrier.hanger[keys[i]];
                outputCard.body.push(text);
            }
            outputCard.body.push("Total: " + carrier.currentSquadrons);
            PrintCard();
            
        } else {
            if (hanger[craftType]) {
                hanger[craftType]++;
            } else {
                hanger[craftType] = 1;
            }
            carrier.currentSquadrons += 1;
            carrier.hanger = hanger;
        }
    }

    const SetHanger = (id) => {
        let carrier = UnitArray[id];
        let displayText = "";
        let keys = Object.keys(carrier.hanger);
        for (let i=0;i<keys.length;i++) {
            if (i>0) {displayText += ", "};
            let text = keys[i] + "s: " + carrier.hanger[keys[i]];
            displayText += text
        }
        AttributeSet(carrier.charID,"hanger",displayText);
    }



   

    const LaunchCraft = (msg) => {
        let carrierID = msg.selected[0]._id;
        let carrier = UnitArray[carrierID];
        let craftTypes = carrier.craftTypes;
        let hanger = carrier.hanger;
        launchArray = [];
        let total = 0;
        _.each(carrier.bays,bay => {
            if (bay.launched === readyValue) {
                //should catch out hit or 'unloaded' bays
                total += bay.squadrons;
            }
        })
        let currentSquadrons = carrier.currentSquadrons;
        SetupCard(carrier.name,"Launch Craft",carrier.faction);
        if (currentSquadrons === 0) {
            outputCard.body.push("No Craft Onboard to Launch!");
        } else if (currentSquadrons > total) {
            //more craft than launch capacity, need to find out mix
            let differentTypes = [];
            for (let i=0;i<craftTypes.length;i++) {
                let type = craftTypes[i];
                if (hanger[type] > 0) {
                    differentTypes.push(type);
                }
            }
            if (differentTypes.length === 1) {
                //only one type, launch all from this type
                let info = {
                    type: differentTypes[0],
                    number: total, //this type has more craft than launch capacity otherwise caught out in launch all
                }
                launchArray = [info]
                LaunchCraft3(carrierID);
            } else {
                outputCard.body.push("Launch Capacity is " + total);

                outputCard.body.push("[hr]");
                outputCard.body.push("Click buttons to add Craft up to Launch Capacity");
                for (let i=0;i<differentTypes.length;i++) {
                    let type = differentTypes[i];
                    let max = Math.min(total,hanger[type]);
                    outputCard.body.push(type + "s: " + hanger[type] + " in Hanger")
                    ButtonInfo(type + "s","!LaunchCraft2;" + carrierID + ";" + total + ";" + type + ";" + "?{Number: [max " + max + "]|0}");
                }
            }
        } else {
            //launch all -> part3
            let keys = Object.keys(hanger);
            _.each(keys,type => {
                let number = hanger[type];
                if (number > 0) {
                    info = {
                        type: type,
                        number: number,
                    }
                    launchArray.push(info);
                }
            })
            outputCard.body.push("All Remaining Craft Launched!");
            LaunchCraft3(carrierID);
        }
        PrintCard();

    }

    const LaunchCraft2 = (msg) => {
        //adds input
        let Tag = msg.content.split(";");
        let carrierID = Tag[1];
        let total = Tag[2];
        let type = Tag[3];
        let number = Tag[4];
        let capacity = total;
        let used = false;
        for (let i=0;i<launchArray.length;i++) {
            let info = launchArray[i];
            if (info.type === type) {
                used = true;//replace
                info.number = number;
                launchArray[i].number = number;
            } 
            capacity -= info.number;
        }
        if (used === false) {
            number = Math.min(number,capacity);
            capacity -= number;
            let info = {
                type: type,
                number: number,
            }
            launchArray.push(info);
        }
        if (capacity <= 0) {
            LaunchCraft3(carrierID);
        }
    }

    const LaunchCraft3 = (carrierID) => {
        //creates objects of craft, adjusts hanger and currentSquadrons
        let carrier = UnitArray[carrierID];
        SetupCard(carrier.name,"Launch Craft",carrier.faction);
        _.each(launchArray,info => {
            let type = info.type;
            let number = info.number;
            let s = (number === 1) ? " ":"s "
            outputCard.body.push(number + " " + type + s +  "launched")
            carrier.hanger[type] -= number;
            carrier.currentSquadrons -= number;
            let craftCharID = Factions[carrier.faction][type]["character"];
            let craftChar = getObj("character",craftCharID);
            let name = Attribute(craftChar,"name");
            name = name.replace(carrier.faction + " ","");
            if (state.BFG.ordNames[type]) {
                state.BFG.ordNames[type]++;
            } else {
                state.BFG.ordNames[type] = 1;
            }
            name += " " + state.BFG.ordNames[type];
            let img = getCleanImgSrc(Factions[carrier.faction][type]["img"]);
            let squadron = SquadronArray[carrier.squadronID];
            let symbol = squadron.marker;

            for (let i=0;i<number;i++) {
                let obj = createObj("graphic", {   
                    left: carrier.location.x,
                    top: carrier.location.y,
                    width: 70, 
                    height: 70,   
                    name: name,
                    showname: true,
                    pageid: Campaign().get("playerpageid"),
                    imgsrc: img,
                    layer: "objects",
                    represents: craftCharID,
                    gmnotes: carrierID,
                });
                toFront(obj);
                carrier.ordnanceIDs.push(obj.id);
                let craft = new Ordnance(obj.id);
                craft.carrier = carrierID;            
                craft.token.set("status_"+symbol,true);
                squadron.add(craft.id);
                craft.squadronID = squadron.id;
            }
        })
        outputCard.body.push("[hr]");
        outputCard.body.push("Craft may activate in Ordnance Phase");
        PrintCard();
        SetHanger(carrierID);
        for (let i=0;i<carrier.bays.length;i++) {
            carrier.bays[i].launched = firedValue;
            AttributeSet(carrier.charID,"bay" + i + "launched",firedValue);
        }
    }



    const CraftAttack = (msg) => {
        //identify hex
        let initialID = msg.selected[0]._id;
        let uni = UnitArray[initialID];
        let hex = hexMap[uni.hexLabel];
        let combatants = {};
        let shipAttackers = {};
        for (let i=0;i<OrdTypes.length;i++) {
            combatants[OrdTypes[i]] = [[],[]];
            shipAttackers[OrdTypes[i]] = [];
        }
        let shipAttacker = -1;
        if (hex.shipIDs.length > 0) {
            shipAttacker = (UnitArray[hex.shipIDs[0]].player === 0) ? 1:0;
        };

        let numbers = [0,0];
        let onlyFighters = true;
        for (let i=0;i<hex.ordnanceIDs.length;i++) {
            let id = hex.ordnanceIDs[i];
            let ord = UnitArray[id];
            combatants[ord.subtype][ord.player].push(id);
            numbers[ord.player]++;
            if (ord.player === shipAttacker) {
                shipAttackers[ord.subtype].push(id);
                if (ord.subtype !== "Fighter") {
                    onlyFighters = false;
                }
            }
        }

        if (numbers[0] > 0 && numbers[1] > 0) {
            //all craft in hex  dogfight
            shipAttackers = DogFight(combatants,shipAttackers,shipAttacker,numbers); //returns the survivors
        } 

        //attack on any ships last if there are enemy craft surviving 
        if (shipAttacker > -1 && onlyFighters === false) {
            SetupCard(UnitArray[hex.shipIDs[0]].name,"Ship Defense",UnitArray[hex.shipIDs[0]].faction);
            //check if any attackers remain
            let att = 0; //skip 0 = fighters as need bombers etc to attack a ship
            for (let i=1;i<OrdTypes.length;i++) {
                att += shipAttackers[OrdTypes[i]].length;
            }
            if (att === 0) {
                outputCard.body.push("The Attack was broken up by defending Attack Craft");
                PrintCard();
            } else {
                ShipAttack(shipAttackers,hex.shipIDs);
            }
        }

    }


    const DogFight = (combatants,shipAttackers,shipAttacker,numbers) => {
        SetupCard("Dogfight","","Neutral");
        let lesser = (numbers[0] > numbers[1]) ? 1:0; //equal will default to 0
        let greater = (lesser === 0) ? 1:0;
        let pairs = [];        

        //create pairs based on lesser
        for (let i=0;i<OrdTypes.length;i++) {
            let group = combatants[OrdTypes[i]][lesser];
            for (let j=0;j<group.length;j++) {
                let ordID = group[j];
                let pair = [[],[]];
                pair[lesser] = [ordID];
                pairs.push(pair);
            }
        }
        if (lesser === shipAttacker) {
            shipAttackers["Fighter"] = []; //all involved in dogfights
        }
        //assign the more numerous side, if defending their own ship, assign extra fighter types to any enemy bombers
        let currentPair = -1;
        let extraPair = pairs.length; //work from back
        for (let t=0;t<OrdTypes.length;t++) {
            let type = OrdTypes[t];
            let group = combatants[type][greater];
            if (!group || group === undefined) {continue};
            for (let i=0;i<group.length;i++) {
                currentPair++;
                let ordID = group[i];
                let ord = UnitArray[ordID];
                if (currentPair < pairs.length) {
                    pairs[currentPair][greater].push(ordID);
                    if (greater === shipAttacker && type.includes( "Fighter")) {
                        //fighters or fighter bombers cant dogfight and then attack ship
                        let index = shipAttackers[type].indexOf(ordID);
                        if (index > -1) {
                            shipAttackers[type].splice(index,1);
                        }
                    }
                } else if (ord.dogfight > 0 && greater !== shipAttacker) {
                    //greater is defending or there is no ship to attack, so will assign extra fighters
                    extraPair--;
                    if (extraPair < 0) {extraPair = pairs.length};
                    pairs[extraPair][greater].push(ordID);
                } 
            }
        }
        let destroyedIDs = [];
        let p = 0;
        //remove pairs where all have neg. dogfight
        let finalPairs = [];
        _.each(pairs,pair => {
            let flag = false;
            pairLoop:
            for (let i=0;i<2;i++) {
                let group = pair[i];
                for (let j=0;j<group.length;j++) {
                    if (UnitArray[group[j]].dogfight > 0) {
                        flag = true;
                        break pairLoop;
                    }
                }
            }
            if (flag === true) {
                finalPairs.push(pair);
            }
        })



        _.each(finalPairs,pair => {
            p++;
            let tip = "";
            let attNames = [[],[]];
            let kill = [false,false];
            for (let i=0;i<2;i++) {
                let j = (i===0) ? 1:0;
                let sideAtt = pair[i]; //could be multiple craft
                let defID = pair[j][0]; //target is first craft
                let def = UnitArray[defID];
                _.each(sideAtt, id => {
                    let att = UnitArray[id];
                    if (att.token.get(SM.damaged) === true) {return};
                    let rolls = [];
                    for (let r=0;r<Math.abs(att.dogfight);r++) {
                        let roll = randomInteger(6);
                        rolls.push(roll);
                        if (roll >= def.armour) {
                            if (destroyedIDs.includes(defID) === false) {
                                destroyedIDs.push(defID);
                            }
                            kill[j] = true;
                        }
                    }
                    tip += att.name + ": " + rolls.toString() + " vs. " + def.armour + "+<br>";
                    attNames[i].push(att.name);
                    if (kill[j] === true && def.player === shipAttacker) {
                        //remove from shipAttacker array
                        let index = shipAttackers[def.subtype].indexOf(def.id);
                        if (index > -1) {
                            shipAttackers[def.subtype].splice(index,1);
                        }
                    }
                })
            }
            _.each(attNames,names => {
                names = names.toString().replace(",",' & ');
            })
            tip = '[🎲](#" class="showtip" title="' + tip + ')';
            outputCard.body.push(tip + " Pair " + p + ": " + attNames[0] + " vs. " + attNames[1]);
            if (attNames[0].length === attNames[1].length && kill[0] === true && kill[1] === true) {
                outputCard.body.push("Both squadrons destroyed");
            } else if (attNames[0].length !== attNames[1].length && kill[0] === true && kill[1] === true) {
                outputCard.body.push("Both sides lose a squadron");
            } else if (kill[0] === false && kill[1] === true) {
                outputCard.body.push(state.BFG.factions[1] + " loses this dogfight");
            } else if (kill[0] === true && kill[1] === false) {
                outputCard.body.push(state.BFG.factions[0] + " loses this dogfight");
            } else if (kill[0] === false && kill[1] === false) {
                outputCard.body.push("Neither Squadron was able to score a kill");
            } else  {
                outputCard.body.push("Error here")
            }
        })

        let out = [{},{}];
        //remove destroyed craft
        for (let i=0;i<destroyedIDs.length;i++) {
            let ord = UnitArray[destroyedIDs[i]];
            if (out[ord.player][ord.subtype]) {
                out[ord.player][ord.subtype]++;
            } else {
                out[ord.player][ord.subtype] = 1;
            }
            //ord.Destroyed();
        }
       
        outputCard.body.push("[hr]");
        outputCard.body.push("[B]Net Results[/b]");
        for (let i=0;i<2;i++) {
            let keys = Object.keys(out[i]);
            if (keys.length === 0) {continue};
            outputCard.body.push("[U]" + state.BFG.factions[i] + "[/u]");
            for (let j=0;j<keys.length;j++) {
                let s = (out[i][keys[j]] === 1) ? "":"s";
                outputCard.body.push(out[i][keys[j]] + " " + keys[j] + s +  " Destroyed");
            }
        }
        PrintCard();

        return shipAttackers;
    }

    const ShipAttack = (shipAttackers,shipIDs) => {
        let attackStrength = 0;
        let targetShip = UnitArray[shipIDs[0]];
        for (let i=0;i<OrdTypes.length;i++) {
            attackStrength += shipAttackers[OrdTypes[i]].length;
        }

        //Turret Defense from any ships in hex
        let tTip;
        let needed = 4;
        let shotDown = 0;
        for (let i=0;i<shipIDs.length;i++) {
            let target = UnitArray[shipIDs[i]];
            let turretRolls = [];
            for (let i=0;i<target.turrets;i++) {
                let roll = randomInteger(6);
                turretRolls.push(roll);
                if (roll >= needed) {
                    shotDown++;
                }
            }
            tTip = target.name + " Turrets: " + turretRolls.toString() + " vs " + needed + "+";
            tTip = '[🎲](#" class="showtip" title="' + tTip + ')';
        }
        let s = (shotDown === 1) ? "":"s"
        shotDown = Math.min(attackStrength,shotDown);
        attackStrength -= shotDown;
        alldead = false;
        if (shotDown > 0 && attackStrength > 0) {
            outputCard.body.push(tTip + " Turrets shoot down " + shotDown + " Attack Craft");
        } else if (attackStrength === 0) {
            outputCard.body.push(tTip + " Turrets shoot down all the Attack Craft");
            alldead = true;
        } else if (shotDown === 0) {
            outputCard.body.push(tTip + " Turrets fail to shoot down any Attack Craft");
        }            
        //apply kills - starting with fighters and progressing through
        destroyedIDs = [];
        remainingAttackers = {};
        loop1:
        for (let i=0;i<OrdTypes.length;i++) {
            let group = shipAttackers[OrdTypes[i]];
            if (group) {
                for (let j=0;j<group.length;j++) {
                    let id = group[j];
                    if (destroyedIDs.length >= shotDown) {
                        if (remainingAttackers[OrdTypes[i]]) {
                            remainingAttackers[OrdTypes[i]].push(id);
                        } else {
                            remainingAttackers[OrdTypes[i]] = [id];
                        }
                    } else {
                        destroyedIDs.push(id);
                    }
                }
            }
        }
        //remove destroyed craft
        _.each(destroyedIDs,id => {
            let ord = UnitArray[id];
            //ord.Destroyed();
        })

        if (alldead === false) {
            outputCard.body.push("[hr]");
            //how many fighters left for suppressing turrets
            //Attacks by Fighter-Bombers, Bombers
            //mark bombers 'damaged' as used - have to reload at a carrier

//tips and work on presentation, also add in fighter-bombers ?
            log(remainingAttackers)
            let fighterBonus = 0;
            if (remainingAttackers["Fighter"]) {
                _.each(remainingAttackers["Fighter"],id => {
                    let ord = UnitArray[id];
                    if (ord.token.get(SM.damaged) === true) {
                        return;
                    } else {
                        fighterBonus++;
                    }
                })
            }
            let numberBombers = 0;
            if (remainingAttackers["Bomber"]){
                _.each(remainingAttackers["Bomber"],id => {
                    let ord = UnitArray[id];
                    if (ord.token.get(SM.damaged) === true) {
                        return;
                    } else {
                        numberBombers++;
                        ord.token.set(SM.damaged,true);
                    }
                })
            }
            fighterBonus = Math.min(fighterBonus,numberBombers);
            let attacks = 0;
            let t = targetShip.turrets;
            let tip = "";
            if (t > 0) {
                tip += "Turrets reduce attacks by " + t + "<br>"
            }
            for (let i=0;i<numberBombers;i++) {
                let roll = randomInteger(6);
                let a = Math.max(0,roll - t);
                tip += "Bomber " + (i+1) + ": " + roll + "-" + t + "= " + a + "<br>";
                attacks += a;
            }
            if (fighterBonus > 0) {
                let s = (fighterBonus > 1) ? "s are ":" is ";
                outputCard.body.push(fighterBonus + " Fighter" + s + "able to help suppress the Ship's Turrets");
                attacks += fighterBonus;
                tip += "Fighters add " + fighterBonus;
            }
            if (numberBombers > 0) {
                tip = '[🎲](#" class="showtip" title="' + tip + ')';
                let s = (numberBombers > 1) ? "s":""

                if (attacks > 0) {
                    let s2 = (attacks === 1) ? "":"s";
                    let s3 = (numberBombers === 1) ? "s":"";
                    outputCard.body.push(tip + " " + numberBombers + " Bomber" + s + " attack" + s3 +" the Ship, getting " + attacks + " attack" + s2);
                    let needed = Math.min(targetShip.farmour,targetShip.sarmour,targetShip.rarmour);
                    tip = "Lowest Armour: " + needed + "+";
                    let rolls = [];
                    let hits = 0;
                    for (let i=0;i<attacks;i++) {
                        let roll = randomInteger(6);
                        if (roll >= needed) {
                            hits++;
                        }
                        rolls.push(roll);
                    }
                    tip += "<br>Rolls: " + rolls.toString();
                    tip = '[🎲](#" class="showtip" title="' + tip + ')';
                    if (hits === 0) {
                        outputCard.body.push(tip + " No Damage was done");
                    } else {
                        outputCard.body.push(tip + " " + hits + " Damage was inflicted");
                        targetShip.Damage(hits);
                    }

                } else {
                    let s4 = (numberBombers === 1) ? " was ":" were "
                    outputCard.body.push(tip + " Unfortunately the remaining " + numberBombers + " Bomber" + s + s4 + "not able to land any attacks on the Ship");
                }
            }
      



            //Hit And Run Attacks by Assault Craft, Thunderhawks & Boarding Torpedoes
            //mark them all 'damaged' - ie. they've used their assault troops
            tip = "";
            attacks = 0;
            let assaultCraft = ["Assault Boat","Thunderhawk","Boarding Torpedo"];
            for (let i=0;i<assaultCraft.length;i++) {
                if (remainingAttackers[assaultCraft[i]]) {
                    att = 0;
                    _.each(remainingAttackers[assaultCraft[i]],id => {
                        let ord = UnitArray[id];
                        if (ord.token.get(SM.damaged) === true) {
                            return;
                        } else {
                            att++;
                            ord.token.set(SM.damaged,true);
                        }
                    })
                    tip += assaultCraft[i] + "s: " + att + "<br>";
                    attacks += att;
                }
            }
            tip = '[🎲](#" class="showtip" title="' + tip + ')';
            

            if (attacks > 0) {
                let text = attacks;
                if (attacks === 1) {text = "A"};
                let s = (attacks === 1) ? "":"s";
                let s2 = (attacks === 1) ? " is ":" are ";
                outputCard.body.push(tip + " " + text + " Hit and Run Attack" + s + s2 + "conducted against the Ship");
                outputCard.body.push("[hr]");
                let modifier = 0; //for races etc - add in later
                let bonusDamage = 0;

                for (let i=0;i<attacks;i++) {
                    let roll = randomInteger(6);
                    let result = Math.max((roll + modifier),0);
                    let tip = "Roll: " + roll;
            //likely need to change modifier tips once adding in the races
                    if (modifier > 0) {tip += " + " + modifier + " = " + result}
                    if (modifier < 0) {tip += " - " + modifier + " = " + result}
                    tip = '[🎲](#" class="showtip" title="' + tip + ')';

                    if (result < 2 || (result < 4 && (targetShip.type === "Escort" || targetShip.type === "Defence") && parseInt(targetShip.token.get("bar2_max") < 3))) {
                        outputCard.body.push(tip + " Attack " + (i+1) + ": was defeated");
                    } else {
                        if ((targetShip.type === "Escort" || targetShip.type === "Defence") && parseInt(targetShip.token.get("bar2_max") < 3))  {
                            bonusDamage += 1;
                            outputCard.body.push(tip + " Attack " + (i+1) + ": Inflicts a point of Damage");
                        } else {
                            outputCard.body.push(tip + " Attack " + (i+1) + ": Damages a Critical System")
                            bonusDamage += targetShip.Critical(result);
                        }
                    }
                }
                if (bonusDamage > 0) {
                    outputCard.body.push(bonusDamage + " Additional Damage is done by the Hit and Run Attack");
                    targetShip.Damage(bonusDamage);
                }
            }



            



        }


        PrintCard();
    }





    const DiceNum = (info) => {
        //given something of format DX+Y or just X return # with 'D' or 'd' generating a roll 
        info = info.toLowerCase();
        let split = info.split("+");
        let a = split[0];
        let b = split[1];
        if (a.includes("d")) {
            a = parseInt(a.replace("d",""));
            a = randomInteger(a);
        } else {
            a = parseInt(a);
        }
        if (b) {a += parseInt(b)};
        return a;
    }

    const Planet = (hexLabel,type) => {
        type = type.replace(" Planet","");
        let d,img,images,gravityWell;
        let moons = 0;
        let planetHex = hexMap[hexLabel];
        if (type === "Small") {
            d = 15/gameScale;
            gravityWell = 10/gameScale;
            images = ["https://s3.amazonaws.com/files.d20.io/images/424770793/hts1NibJX147rOXaxNisVw/thumb.png?1736904288","https://s3.amazonaws.com/files.d20.io/images/426540800/PhfjYMM1Acxd0SR8qIKxjw/thumb.png?1738009893","https://s3.amazonaws.com/files.d20.io/images/426542271/wZHnoQ_PIG1w0TOB61aceA/thumb.png?1738010434","https://s3.amazonaws.com/files.d20.io/images/426542730/EBSmT7arsDqO3LdDZA_4Fw/thumb.webp?1738010680","https://s3.amazonaws.com/files.d20.io/images/426542729/xedNfr8je-NRjQn5w6dccw/thumb.png?1738010681","https://s3.amazonaws.com/files.d20.io/images/426542728/BCDeBYQhkEGANQcmmM5OTA/thumb.png?1738010682"];
        } else if (type === "Medium") {
            d = ((randomInteger(3) + 2)*5)/gameScale;
            gravityWell = 15/gameScale;
            images = ["https://s3.amazonaws.com/files.d20.io/images/424770794/iOFhSQAJ6HHzvN0tYz_PMQ/thumb.png?1736904292","https://s3.amazonaws.com/files.d20.io/images/426546165/uXLs-6VrNQKB2FZvWR1T-w/thumb.png?1738012372","https://s3.amazonaws.com/files.d20.io/images/426546166/Yq7B_fU-EpjpsC4RrKXnOQ/thumb.png?1738012380","https://s3.amazonaws.com/files.d20.io/images/426546161/OGx4Cii-e2FswptoXQXftQ/thumb.png?1738012371","https://s3.amazonaws.com/files.d20.io/images/426546159/RXGNYosgPK-XzVEwmCXnRg/thumb.png?1738012371","https://s3.amazonaws.com/files.d20.io/images/426546163/QSqykxZSTf94m4O0WT86Mg/thumb.png?1738012371","https://s3.amazonaws.com/files.d20.io/images/426546167/RKxKu6ODxp6da0Of88XrFg/thumb.png?1738012370","https://s3.amazonaws.com/files.d20.io/images/426546160/po4sX3uaUxRFvW_ZHQz1zg/thumb.png?1738012370","https://s3.amazonaws.com/files.d20.io/images/426546162/QXIbY_ESpPoUNMm16B8TIw/thumb.png?1738012370","https://s3.amazonaws.com/files.d20.io/images/426546158/b8GGwXm3wvEHcAQzmGvh0g/thumb.png?1738012370","https://s3.amazonaws.com/files.d20.io/images/426546168/a-8Io8qCyn_j7ba6uUYkbw/thumb.webp?1738012369","https://s3.amazonaws.com/files.d20.io/images/426546164/19ItPiEXMCGvIWCnvBcABw/thumb.webp?1738012369"];
            moons = randomInteger(3) - 1;
        } else if (type === "Large") {
            d = ((4 + randomInteger(6)) * 5)/gameScale;
            gravityWell = 30/gameScale;
            images = ["https://s3.amazonaws.com/files.d20.io/images/426540797/JRdjP6CF-mlevWeNfiMK8Q/thumb.png?1738009894","https://s3.amazonaws.com/files.d20.io/images/424771032/HNSA7VuQsdw_i0FxO69oLQ/thumb.png?1736904413","https://s3.amazonaws.com/files.d20.io/images/426540796/8UVKibMhbJVKHY2XPfE3pg/thumb.png?1738009891","https://s3.amazonaws.com/files.d20.io/images/426541661/zycjw7bJM1UdRBwMXrj2rQ/thumb.png?1738010208","https://s3.amazonaws.com/files.d20.io/images/426541872/9nl3wAKPX0I0SCiPeJQryA/thumb.png?1738010261","https://s3.amazonaws.com/files.d20.io/images/426542050/85Uf5ioGqIx-9a4KPaLfuQ/thumb.png?1738010306"];
            if (randomInteger(3) === 3) {
                rings = randomInteger(3);
            }
            moons = Math.max(0,randomInteger(6) - 2);
        }
        let rad = d/2;
        img = images[randomInteger(images.length) - 1];
        //Place Planet
        let well = createObj("graphic", {   
            left: planetHex.centre.x,
            top: planetHex.centre.y,
            width: (d + (gravityWell*2)) * 70, 
            height: (d + (gravityWell*2)) * 70,   
            name: "Gravity Well",
            isdrawing: true,
            pageid: Campaign().get("playerpageid"),
            imgsrc: "https://s3.amazonaws.com/files.d20.io/images/426586729/QW9OfUG51xK7jZV4F2FevQ/thumb.png?1738034025",
            layer: "map",
        });
        toFront(well);

        let planet = createObj("graphic", {   
            left: planetHex.centre.x,
            top: planetHex.centre.y,
            width: d * 70, 
            height: d * 70,  
            name: type + " Planet",
            isdrawing: true,
            pageid: Campaign().get("playerpageid"),
            imgsrc: img,
            layer: "map",
        });
        toFront(planet);

        planetHex.terrain = "Planet";
        planetHex.terrainID = planet.get("id");

      
        let cube = planetHex.cube;
        let cubes = cube.radius(Math.ceil(rad + gravityWell + .5));
        _.each(cubes,indCube => {
            if (hexMap[indCube.label()]) {
                let dist = indCube.distance(cube);
                if (dist <= rad) {
                    hexMap[indCube.label()].terrain = "Planet";
                    hexMap[indCube.label()].terrainID = planet.get("id");
                } else if (dist > rad && dist <= (rad + gravityWell)) {
                    let points = XHEX(hexMap[indCube.label()].centre);
                    let flag = false;
                    for (let i=0;i<points.length;i++) {
                        let pDist = points[i].distance(planetHex.centre);
                        if (pDist <= (rad * 70)) {
                            hexMap[indCube.label()].terrain = "Planet";
                            hexMap[indCube.label()].terrainID = planet.get("id");
                            flag = true;
                            break;
                        }
                    }
                    if (flag === false) {
                        hexMap[indCube.label()].gravityWell = planetHex.label;
                    }
                } else {
                    let points = XHEX(hexMap[indCube.label()].centre);
                    for (let i=0;i<points.length;i++) {
                        let pDist = points[i].distance(planetHex.centre);
                        if (pDist <= ((rad + gravityWell) * 70)) {
                            hexMap[indCube.label()].gravityWell = planetHex.label;
                            break;
                        }
                    }
                }
            }
        })


        //Moons
        let keys = [];
        _.each(hexMap,a => {
            if (a.terrain.includes("Off Map") === false) {
                keys.push(a.label);
            }
        })
        let moonImages = ["https://s3.amazonaws.com/files.d20.io/images/424769992/hd87vL9dPrNrcoXt4GiDpg/thumb.png?1736903900","https://s3.amazonaws.com/files.d20.io/images/426540801/JZa9WB-JxGVmR1fqM6mwMQ/thumb.png?1738009891","https://s3.amazonaws.com/files.d20.io/images/426540799/crg25YIqJ9NtVtlLm0IzHA/thumb.png?1738009891","https://s3.amazonaws.com/files.d20.io/images/426540798/xcZAkgZSkwesO3_c1ViZ6w/thumb.png?1738009892","https://s3.amazonaws.com/files.d20.io/images/426544081/IWZsDXwhpQN5pQawnLh5tw/thumb.png?1738011309","https://s3.amazonaws.com/files.d20.io/images/426544082/82x6reMNpzg7tjaeChdEJg/thumb.png?1738011318","https://s3.amazonaws.com/files.d20.io/images/426544079/SLUNOxqF0kBFCPFz89JFog/thumb.png?1738011312","https://s3.amazonaws.com/files.d20.io/images/426544080/v5CxjVc8nvzbeBL7uWxHtw/thumb.png?1738011311"];

        for (let i=0;i<moons;i++) {
            //create an array of hexes at radius = orbit that are on map
            let orbit = Math.round(((randomInteger(6) + randomInteger(6)) * 10/gameScale) + d/2);
            let orbitHexes = OrbitHexes(hexMap[hexLabel].centre,orbit);
            if (orbitHexes.length === 0) {continue}; //orbit takes it off map
            //randomly pick a hex at that radius, thats on the map
            let moonLabel = orbitHexes[randomInteger(orbitHexes.length - 1)];
            hexMap[moonLabel].terrain = "Moon";



            let well = createObj("graphic", {   
                left: hexMap[moonLabel].centre.x,
                top: hexMap[moonLabel].centre.y,
                width: 210, 
                height: 210,
                name: "Gravity Well",
                isdrawing: true,
                pageid: Campaign().get("playerpageid"),
                imgsrc: "https://s3.amazonaws.com/files.d20.io/images/426586729/QW9OfUG51xK7jZV4F2FevQ/thumb.png?1738034025",
                layer: "map",
            });
            toFront(well);

            let neighbours = hexMap[moonLabel].cube.neighbours();
            _.each(neighbours,neighbour => {
                if (hexMap[neighbour.label()]) {
                    hexMap[neighbour.label()].gravityWell = moonLabel;
                }
            })


            let moonImg = moonImages[randomInteger(moonImages.length) - 1];
            let moon = createObj("graphic", {   
                left: hexMap[moonLabel].centre.x,
                top: hexMap[moonLabel].centre.y,
                width: 70, 
                height: 70,  
                name: "Moon",
                isdrawing: true,
                pageid: Campaign().get("playerpageid"),
                imgsrc: moonImg,
                layer: "map",
            });
            toFront(moon);
            hexMap[moonLabel].terrainID = moon.get("id");
        };


        //Rings
        if (type === "Large") {
            let roll = randomInteger(6);
            if (roll > 4) {
                let radius = Math.round(d/2 + 1 + (randomInteger(6) * 5/gameScale));
                let orbitHexes = OrbitHexes(hexMap[hexLabel].centre,radius);
                let tint = gasColours[randomInteger(gasColours.length - 1)]
                for (let i=0;i<orbitHexes.length;i++) {
                    let label = orbitHexes[i];
                    if (randomInteger(6) === 6) {
                        CreateCloud("Asteroids",label,"transparent");
                    } else {
                        CreateCloud("Dust or Gas",label,tint);
                    }
                }
            }
        }
    }

    const Clouds = (type,label) => {
        let d1,d2,dx,dy,tint;
        let originalCube = hexMap[label].cube;
        if (type === "Dust or Gas") {
            d1 = randomInteger(6) * 5 / gameScale;
            d2 = randomInteger(6) * 2 / gameScale;
            tint = gasColours[randomInteger(gasColours.length - 1)];
        } else if (type === "Asteroids") {
            d1 = randomInteger(3) * 5 / gameScale;
            d2 = randomInteger(3) * 5 / gameScale;
            tint = "transparent";
        }


        d1 = Math.round(d1);
        d2 = Math.round(d2);
        if (d2 > d1) {
            //ensure longer measurement is aligned parallel to sunward
            let temp = d2;
            d2 = d1;
            d1 = temp;
        }     

        if (state.BFG.sunward === "Top" || state.BFG.sunward === "Bottom") {
            dx = d1;
            dy = d2;
        } else {
            dx = d2;
            dy = d1;
        }

        for (let i=0;i<dy;i++) {
            let cube = originalCube;
            for (let j=0;j<dx;j++) {
                currentLabel = cube.label();
                if (hexMap[currentLabel]) {
                    if (hexMap[currentLabel].terrain === "Empty Space") {
                        CreateCloud(type,currentLabel,tint)
                    }
                }
                cube = cube.neighbour("East");
            }
            originalCube = originalCube.neighbour("Southeast");
        }
    }

    const CreateCloud = (type,label,tint) => {
        let image;
        if (type === "Dust or Gas") {
            image = "https://s3.amazonaws.com/files.d20.io/images/425861636/318q72zx-ZycDlIrGQfiyg/thumb.png?1737601652";
        } else {
            image = "https://files.d20.io/images/425860451/2JYXNqM5657n6rTiZe52WQ/thumb.png?1737600929";
        }
        hexMap[label].terrain = type;
        let gas = createObj("graphic", {   
            left: hexMap[label].centre.x,
            top: hexMap[label].centre.y,
            width: 80, 
            height: 80,  
            name: type,
            isdrawing: true,
            rotation: randomInteger(6) * 60,
            pageid: Campaign().get("playerpageid"),
            imgsrc: image,
            layer: "map",
            tint_color: tint,
        });
        toFront(gas);
        hexMap[label].terrainID = gas.get("id");

    }

    const WarpRift = (label) => {
        let length = randomInteger(3) * 10/gameScale;
        let endHexes = OrbitHexes(hexMap[label].centre,length);
        if (endHexes.length === 0) {return};
        let endLabel = endHexes[randomInteger(endHexes.length - 1)];
        length = hexMap[label].cube.distance(hexMap[endLabel].cube);

        let intCubes = hexMap[label].cube.linedraw(hexMap[endLabel].cube);
        _.each(intCubes,cube => {
            let intLabel = cube.label();
            if (hexMap[intLabel].terrain === "Planet") {
                return;
            } else if (hexMap[intLabel].terrain !== "Empty Space") {
                let id = hexMap[intLabel].terrainID;
                let ter = findObjs({_type:"graphic", id: id})[0];
                if (ter) {
                    ter.remove();
                }
            }
            hexMap[intLabel].terrain = "Warp Rift";
            let rift = createObj("graphic", {   
                left: hexMap[intLabel].centre.x,
                top: hexMap[intLabel].centre.y,
                width: 70, 
                height: 70,  
                name: "Warp Rift",
                isdrawing: true,
                pageid: Campaign().get("playerpageid"),
                imgsrc: "https://s3.amazonaws.com/files.d20.io/images/425865158/0MZ_zAKQP30Nn88hqERyXQ/thumb.png?1737604124",
                layer: "map",
            });
            toFront(rift);
            hexMap[intLabel].terrainID = rift.get("id");


            



        })





    }


    const Orders = (msg) => {
        if (!msg.selected) {return};
        let Tag = msg.content.split(";");
        let id = msg.selected[0]._id;
        let unit = UnitArray[id];
        let order = Tag[1];
        SetupCard(unit.name,order,unit.faction);

        //?!Orders;?{Order|All Ahead Full|Come to New Heading|Burn Retros|Lock On Target|Reload Ordnance}
        // or Brace for Impact
        let errorMsg = ""

        //check if already has an order
        let statuses = ["allahead","newheading","retros","lockon","reload","brace"];
        for (let i=0;i<statuses.length;i++) {
            if (unit.token.get(SM[statuses[i]]) === true) {
                errorMsg = "Already has an Order";
            }
        }
        if (state.BFG.orders[unit.player] === false && order !== "Brace for Impact") {
            errorMsg = "No further Orders may be given this turn";
        }
       
        if (errorMsg !== "") {
            outputCard.body.push(errorMsg);
            PrintCard();
            return;
        }






        //leadership test
        let modifier = 1; //almost always there is someone with orders in last turn...
        let blasts = false;
        for (let i=0;i<BlastArray.length;i++) {
            if (BlastArray[i].hexLabel === unit.hexLabel) {
                blasts = true;
                break;
            }
        }
        if (blasts === true) {
            modifier -= 1;
        }
        let ldTest = Leadership(unit,modifier);
        let cruising = unit.speed;
        let min = Math.floor(unit.speed/2);
        let full = Math.round(unit.speed * 1.5);

        if (blasts === true) {
            min = Math.floor((unit.speed - 5/gameScale)/2);
            cruising -= 5/gameScale;
            full = cruising -= 5/gameScale;
        }

        if (ldTest === false) {
            outputCard.body.push("[B]Failure to follow Orders[/b]");
            outputCard.body.push("[B]No Further Orders may be given[/b]");
            if (order !== "Brace for Impact") {
                state.BFG.orders[unit.player] = false;
            }
        } else {
            outputCard.body.push("[B]Success[/b]");
            switch (order) {
                case 'All Ahead Full':
                    outputCard.body.push("The Ship directs more power to its engines.");
                    outputCard.body.push("The Ship must move its higher speed of " + full + ", with no Turns allowed, and Armament is Halved");
                    unit.token.set(SM.allahead,true);
                    break;
                case 'Come to New Heading':
                    outputCard.body.push("The Ship sacrifices opportunities to fire its weapons in order to turn more sharply.");
                    outputCard.body.push("The Ship must move half to full cruising speed (" + min + '-' + cruising + "), and may make an extra turn. Armament is Halved");
                    unit.token.set(SM.newheading,true);
                    break;
                case 'Burn Retros':
                    outputCard.body.push("The Ship directs additional energy to its retro thrusters in order to kill some of its forward momentum and hold position.");
                    outputCard.body.push("The Ship moves zero to half cruising speed (" + min + "-" + cruising + "), and may make a single turn without having to move. Armament is Halved");
                    unit.token.set(SM.retros,true);
                    break;
                case 'Lock On Target':
                    outputCard.body.push("The Ship maintains a steady course and draws additional energy from its engines to fire its armament in multiple salvoes.");
                    outputCard.body.push("The Ship must move half to full cruising speed (" + min + "-" + cruising + "), but no turns. Weapons Fire (Lances, Batteries) Reroll misses");
                    unit.token.set(SM.lockon,true);
                    break;
                case 'Reload Ordnance':
                    outputCard.body.push("The Ship reloads any Ordnance");
                    outputCard.body.push("The Ship must move half to full cruising speed (" + min + "-" + cruising +  "), and may make up to one turn.");
                    unit.token.set(SM.reload,true);
                    break;
                case 'Brace for Impact':   
                    outputCard.body.push("The captain of the vessel orders his crew to brace for impact; power is redirected to the shields, blast doors are slammed shut and the crew hang onto something secure.")
                    outputCard.body.push("While Braced, the Ship must move half to full cruising speed (" + min + "-" + cruising + ") and may make up to one turn. Armament is Halved");
                    let statuses = ["allahead","newheading","retros","lockon","reload"];
                    _.each(UnitArray,unit => {
                        _.each(statuses,status => {
                            unit.token.set(SM[status],false);
                        })
                    })
                    unit.token.set(SM.brace,true);
                    break;





            }




        }
        PrintCard();
    }
















    
    const SetupGame = (msg) => {
        let Tag = msg.content.split(";");
        SetupCard("Game Conditions","","Neutral");
        CleanMap("All");

        //scenarios - default is Cruiser Clash
        state.BFG.sunward = Sunward();//Determine which edge is Sunward

        outputCard.body.push("Sunward is to the screen's " + state.BFG.sunward);
        state.BFG.zone = Zone();//Determine which zone battle is in, randomize terrain and update map
        outputCard.body.push("The Battle takes place in the " + state.BFG.zone + " Zone");







        PrintCard();
    }


    const Turn = (msg) => {
        let Tag = msg.content.split(";");
        let id = msg.selected[0]._id;
        let unit = UnitArray[id];
        let dir = Tag[1];

//check if already made turns or can

        let rot = unit.token.get("rotation");

        if (dir === "Left") {
            rot = Angle(rot - 60);
        } else if (dir === "Right") {
            rot = Angle(rot + 60);
        }

        unit.token.set("rotation",rot);

    }






    const NewTurn = (msg) => {
        //Clear Markers
        if (state.BFG.turn === 0) {
            let player = (getObj('player',msg.playerid)||{get: ()=>true});
            let pid = player.get('_lastpage');
            if(!pid) {pid = Campaign().get('playerpageid')}
            Campaign().set({
                initiativepage: pid
            });
        }
        state.BFG.orders = [true,true];
        state.BFG.turn++;
        let statuses = ["allahead","newheading","retros","lockon","reload"];
        _.each(UnitArray,unit => {
            if (unit.type !== "Ordnance") {
                _.each(statuses,status => {
                    unit.token.set(SM[status],false);
                })
                unit.lastHexLabel = unit.hexLabel;
                for (let w=0;w<unit.weaponArray.length;w++) {
                    if (unit.weaponArray[w].fired === firedValue) {
                        unit.weaponArray[w].fired = readyValue;
                    }
                }
            }
        })

        SetupCard("Turn " + state.BFG.turn,"","Neutral");
        ButtonInfo("Start Turn","!StartPhase");
        PrintCard();


    }

    const StartPhase = () => {
        state.BFG.phase = "Start";
        clearTurnOrder();            
        let tokenArray = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "objects"});
        _.each(tokenArray,token => {
            let unit = UnitArray[token.get("id")];
            if (unit) {
                let initiative = 0;
                if (unit.type.includes("Ordnance")) {
                    initiative = 1 + randomInteger(10)/10;
                    //modify for racials
                } else {
                    initiative = unit.leadership + 10 - unit.hullMax + Factions[unit.faction].initiativeBonus + unit.leadership/10 + randomInteger(3);
//adjust for squadrons also

                }

                addTokenTurn(token.get("id"),initiative);
            }
        });
        sortTurnOrder(sorter_desc); //sorted lowest initiative first for movement
        turnOrder = getTurnArray();
        NextUnit();
    }



    const NextUnit = () => {
        setTurnArray(turnOrder);
        let to = turnOrder.shift();
        if (to) {
            //for each token, allow it to move/special orders and then delete from turn order once click 'done'
            let unit = UnitArray[to.id];  
            unit.lastHexLabel = unit.hexLabel;
            sendPing(unit.token.get("left"),unit.token.get("top"),Campaign().get("playerpageid"),null,true);
            //check if ordnance and automatic
            SetupCard(unit.name,"Movement",unit.faction);
            if (unit.type.includes("Hulk")) {
                HulkMove(unit);
            } else if (unit.type === "Ordnance") {
                //automove for some, others player can move
                if (unit.traits.includes("Unguided")) {
                    unit.AutoMove();
                }





            } else {
                if (state.BFG.orders === true) {
                    outputCard.body.push("Orders may be Given");
                } else {
                    outputCard.body.push("No Orders may be Given");
                }
                if (unit.faction === "Imperial Navy" || unit.faction === "Chaos") {
                    outputCard.body.push("Units Move then Shoot");
                }
            }
            
            PrintCard();
        }
    }


    const Repairs = () => {
return;
        let id = criticalArray.shift();
        if (id) {
            let unit = UnitArray[id];
            let wr = [];
            for (let i=0;i<unit.weaponArray.length;i++) {
                if (unit.weaponArray[i].damaged === hitValue) {
                    wr.push(i);
                }
            }
            if (unit.engines > 0 || unit.thrusters > 0 || unit.fires > 0 || wr.length > 0) {
                //needs repair
                let needed = unit.engines + unit.thrusters + unit.fires + wr.length;
                let systems = [];
                if (unit.engines > 0) {systems.push("Engines")};
                if (unit.thrusters > 0) {systems.push("Thrusters")};
                if (unit.fires > 0) {systems.push("Fires")};
                if (wr.length > 0) {systems.push("Weapons")};

                sendPing(unit.token.get("left"),unit.token.get("top"),Campaign().get("playerpageid"),null,true);

                SetupCard(unit.name,"Repairs",unit.faction);
                let blast = false;
                for (let i=0;i<BlastArray.length;i++) {
                    if (BlastArray.hexLabel === unit.hexLabel) {
                        blast = true;
                        break;
                    }
                }
                let dice = parseInt(unit.token.get("bar2_value"));
                if (blast === true) {
                    dice = Math.round(dice/2);
                }
                let repairs = 0;
                for (let i=0;i<dice;i++) {
                    let roll = randomInteger(6);
                    if (roll === 6) {repairs ++};
                }
                if (repairs === 0) {
                    outputCard.body.push("Repair Crews were unable to complete any repairs this turn");
                    ButtonInfo("Next Ship","!Repairs");
                } else {
                    if (repairs >= needed) {
                        outputCard.body.push("Repair Crews have fixed all that is fixable: " + systems.toString());
                        unit.engines = 0;
                        unit.thrusters = 0;
                        unit.fires = 0;
                        for (let j=0;j<wr.length;j++) {
                            weaponArray[wr[j]].damaged = normalValue;
                            //attributeSet() fix char sheet also
                        }


                    } else {
                        //prioritize fires then choice of engines/thrusters/weapons variable





                    }







                }






            }

        } else {

        }
    }

    AimTorpedos = (msg) => {
        //initially should target reticule on ship, which is then moved by player to be final target of torpedo, with a button to launch once set
        let shooterID = msg.selected[0]._id;
        let Tag = msg.content.split(";");
        let weaponNum = Tag[1];
        let shooter = UnitArray[shooterID];
        let launchHex = hexMap[shooter.hexLabel];

        SetupCard(shooter.name,"Aim Torpedos",shooter.faction);
        let weapon = shooter.weaponArray[weaponNum];
        let errorMsg = [];
        //arc checked in launch as needs placement of reticule
        if (weapon.fired === hitValue) {
            errorMsg.push("Weapon is damaged and unable to fire")
        }
        if (weapon.fired === firedValue) {
            errorMsg.push("Weapon has already fired this turn");
        }
        if (errorMsg.length > 0) {
            _.each(errorMsg,error => {
                outputCard.body.push(error);
            })
            PrintCard();
            return;
        }
        let img = "https://files.d20.io/images/105823565/P035DS5yk74ij8TxLPU8BQ/thumb.png?1582679991";
        let notes = shooter.id + ";" + weaponNum + ";" + launchHex.label;

        let targetReticule = createObj("graphic",{
            left: launchHex.centre.x,
            top: launchHex.centre.y,
            width: 70,
            height: 70,
            name: "Target",
            pageid: Campaign().get("playerpageid"),
            imgsrc: img,
            layer: "objects",
            gmnotes: notes,
        });

        toFront(targetReticule);
        outputCard.body.push("Place At Aiming Point");
        outputCard.body.push("Launch Torpedos when Done");
        ButtonInfo("Launch!","!LaunchTorpedos;" + targetReticule.get("id"));
        PrintCard();
    }

    const LaunchTorpedos = (msg) => {
        let Tag = msg.content.split(";");
        let reticuleID = Tag[1];
        let reticule = findObjs({_type:"graphic", id: reticuleID})[0];
        let gmnotes = decodeURIComponent(reticule.get("gmnotes")).toString().split(';')
        let shooterID = gmnotes[0];
        let shooter = UnitArray[shooterID];
        let weaponNum = gmnotes[1];
        let weapon = shooter.weaponArray[weaponNum];
        let launchHexLabel = gmnotes[2];
        let launchHex = hexMap[launchHexLabel];
        let targetPoint = new Point(reticule.get("left"),reticule.get("top"));
        let targetHexLabel =  targetPoint.toOffset().label();
        let targetHex = hexMap[targetHexLabel];

        let angleST = launchHex.cube.angle(targetHex.cube); 
        let theta = Angle(angleST - shooter.token.get("rotation")); //angle from shooter to target taking into account shooters rotation now
        let arc;
        let errorMsg = "";
        SetupCard(shooter.name,"Launch Torpedos",shooter.faction);

        if (theta > 300 || theta < 60) {arc = "Front"};
        if (theta >= 60 && theta <= 120) {arc = "Right"};
        if (theta > 120 && theta < 240) {arc = "Rear"};
        if (theta >= 240 && theta <= 300) {arc = "Left"};

        if (weapon.arc.includes(arc) === false) {
            errorMsg = "Target is not in this weapon's firing arc. Move Target and Try again";
        }

        if (errorMsg !== "") {
            outputCard.body.push(errorMsg);
            PrintCard();
            return;
        } else {
            outputCard.body.push("Torpedos Launched!")
        }

        let p1 = launchHex.centre;
        let p2 = targetHex.centre;
    
        // y = mx + b
        // x = (y-b)/m
        let m = (p2.y - p1.y)/(p2.x - p1.x);
        let b = p1.y - (m * p1.x);

        //check where line might intersect 4 outside lines
        //extend to top - y=0, right x = MapEdge, bottom - y = pageHeight, left = x=0
        let intercepts = [];

        let top = new Point(-b/m,HexInfo.pixelStart.y);
        let topLabel = top.toCube().label();
        let topHex = hexMap[topLabel];
        if (topHex) {intercepts.push(topHex)};

        let right = new Point(MapEdge,(m * MapEdge) + b);
        let rightLabel = right.toCube().label();
        let rightHex = hexMap[rightLabel];
        if (rightHex) {intercepts.push(rightHex)}

        let bottom = new Point((pageInfo.height - b)/m,pageInfo.height - (HexInfo.ySpacing/2));
        let bottomLabel = bottom.toCube().label();
        let bottomHex = hexMap[bottomLabel];
        if (bottomHex) {intercepts.push(bottomHex)}

        let left = new Point(HexInfo.pixelStart.x,b);
        let leftCube = left.toCube();
        let leftLabel = leftCube.label();
        let leftHex = hexMap[leftLabel];
        if (leftHex) {
            intercepts.push(leftHex);
        } else {
            //halfhexes possibility
            leftCube = leftCube.neighbour("East");
            leftLabel = leftCube.label();
            leftHex = hexMap[leftLabel];
            if (leftHex) {
                intercepts.push(leftHex);
            }
        }

        let targetToEdge0 = targetHex.cube.distance(intercepts[0].cube);
        let targetToEdge1 = targetHex.cube.distance(intercepts[1].cube);
        let shooterToEdge0 = launchHex.cube.distance(intercepts[0].cube);
        let shooterToEdge1 = launchHex.cube.distance(intercepts[1].cube);

        let edgeHex;
        if (targetToEdge0 < shooterToEdge0 || targetToEdge1 > shooterToEdge1) {
            edgeHex = intercepts[0];
        } else {
            edgeHex = intercepts[1];
        }

        let finalTargetHex = edgeHex;

        let moveCubes = launchHex.cube.linedraw(finalTargetHex.cube);
        moveCubes.shift();
        moveCubes.push(finalTargetHex.cube);

        //check moveCubes has target hex, if not adjust moveCubes
        let flag = false;
        for (let i=0;i<moveCubes.length;i++) {
            let label = moveCubes[i].label();
            if (label === targetHex.label) {
                flag = true;
                break;
            }
        }
        if (flag === false) {
            let neighs = targetHex.cube.neighbours();
            let array = [];
            _.each(neighs,n => {
                let d = n.distance(launchHex.cube);
                let e = {
                    cube: n,
                    dist: d,
                }
            })
            //find equal distant neighbour to targethex in movecubes and swap in targetHex for it
            let d2 = targetHex.cube.distance(launchHex.cube);
            loop1:
            for (let i=0;i<moveCubes.length;i++) {
                for (let j=0;j<array.length;j++) {
                    if (moveCubes[i].label() === array[j].cube.label() && array[j].dist === d2) {
log("Target Hex wasnt in Path, sub'd in for: ")
log(array[j].cube)
                        moveCubes[i] = array[j].cube;
                        break loop1;
                    }
                }
            }
        }

        let moveList = [];
        _.each(moveCubes,cube => {
            let label = cube.label();
            moveList.push(label);
        })

        //create torpedo, add to shooter.ordnance 
        //can later alter this for different torpedo types
        let torpToken = createObj("graphic", {   
            left: launchHex.centre.x,
            top: launchHex.centre.y,
            width: 70, 
            height: 70,  
            name: "",
            showname: true,
            isdrawing: false,
            pageid: Campaign().get("playerpageid"),
            imgsrc: getCleanImgSrc(Factions[shooter.faction]["Torpedo"]["img"]),
            layer: "objects",
            represents: Factions[shooter.faction]["Torpedo"]["character"],
            rotation: angleST,
        }); 
        toFront(torpToken);
        if (shooter.ordnanceIDs.includes(torpToken.id) === false) {
            shooter.ordnanceIDs.push(torpToken.id);
        }
        let torpedo = new Ordnance(torpToken.id);
        if (shooter.type === "Ordnance") {
            moveList.length = torpedo.speed + 1;
            fp = 2;
        } else {      
            let fp = parseInt(weapon.fp);
            if (shooter.token.get(SM.allahead) === true || shooter.token.get(SM.newheading) === true || shooter.token.get(SM.retros) === true || shooter.token.get(SM.brace) === true) {
                fp = Math.round(fp/2);
            }        
        }
        let gmn = shooter.id + ";" + moveList.toString();
        torpedo.strength = fp;
        
        //mark weapon fired
        torpedo.token.set({
            name: torpedo.name,
            tint_color: "transparent",
            showplayers_bar1: false,
            showplayers_bar2: false,
            showplayers_bar3: false,
            showname: true,
            bar1_value: torpedo.armour,
            bar2_value: torpedo.speed,
            bar3_value: torpedo.strength,
            showplayers_aura1: false,
            statusmarkers: "",
        })
        torpedo.carrier = shooter.id;
        torpedo.moveList = moveList;
        //initial move on launch, remove reticule
        reticule.remove();
        //move to Ordnance Phase equivalent
        torpedo.AutoMove();
        PrintCard();

    }

   








    const HulkMove = (unit) => {
        let move = randomInteger(4) * 5/gameScale;
        let currentHex = hexMap[unit.hexLabel];
        let index = currentHex.shipIDs.indexOf(unit.id);
        if (index > -1) {
            currentHex.shipIDs.splice(index,1);
        }
        let currentRotation = Angle(unit.token.get("rotation"));
        //check initial turn for gravity well, note that if planet is at 0 or 180 degrees then ship doesnt turn
        let gwLabel = currentHex.gravityWell;
        let gwHex = hexMap[gwLabel];
        if (gwLabel !== "") {
            let angle = currentHex.cube.angle(gwHex.cube);
            angle = Angle(angle - unit.token.get("rotation"));
            if (angle > 0 && angle < 180) {
                //turn right
                currentRotation = Angle(currentRotation + 60);
            } else if (angle > 180 && angle < 360) {
                //turn left
                currentRotation = Angle(currentRotation - 60);
            }
            unit.token.set('rotation',currentRotation)
        }
        let dir = DIRECTIONS[(currentRotation - 30)/60]; //Northeast etc

        //move hex by hex, checking for ordnance, asteroids, blasts, planets, warp rifts
        let destroyed = false;
        for (let i=0;i<move;i++) {
            let c = currentHex.cube.neighbour(dir);

            currentHex = hexMap[c.label()];

            if (currentHex) {

                unit.token.set({
                    left: currentHex.centre.x,
                    top: currentHex.centre.y,
                })

//blast markers cost an extra move
//as does gas/dust
//revise to look more like torpedo move, maybe move into class
                let blast = false;
                for (let j=0;j<BlastArray.length;j++) {
                    if (BlastArray[j].hexLabel === currentHex.label) {
                        if (randomInteger(6) === 6) {
                            blast = true;
                            break;
                        }
                    }
                }
                if (blast === true) {
                    outputCard.body.push("The Hulk takes further damage from a Blast");
                    destroyed = unit.Destroyed(); //damage done via destroyed
                    if (destroyed === true) {break};
                }
                if (currentHex.terrain === "Asteroids") {
                    outputCard.body.push("The Hulk drifts into Asteroids and is Destroyed");
                    destroyed = true;
                    break;
                }
                if (currentHex.terrain === "Planet") {
                    outputCard.body.push("The Hulk is drawn into the Planet and impacts, creating a giant crater...");
                    destroyed = true;
                    break;
                }
                if (currentHex.terrain === "Warp Rift") {
                    outputCard.body.push("The Hulk enters the Warp Rift and is never seen again...");
                    destroyed = true;
                    break;
                }
                //ordnance


            } else {
                outputCard.body.push("The Hulk leaves the area, never to be seen again...");
                destroyed = true;
                break;
            }
        }
        //at end of move, place blast
        Blast(currentHex);
        if (unit.name.includes("Blazing") && destroyed === false) {
            destroyed = unit.Destroyed();
        }

        if (destroyed === true) {
            unit.token.remove();
            delete UnitArray(unit.id);
        } else {
             //check final turn for gravity well, note that if planet is at 0 or 180 degrees then ship doesnt turn
            currentHex.shipIDs.push(unit.id);
            unit.hexLabel = currentHex.label;
            unit.location = currentHex.centre;
            if (move === 1) {
                unit.token.set(SM.slow,true);
            } else {
                unit.token.set(SM.slow,false);
            }
//stacking check
            let gwLabel = currentHex.gravityWell;
            let gwHex = hexMap[gwLabel];
            if (gwLabel !== "") {
                let angle = currentHex.cube.angle(gwHex.cube);
                angle = Angle(angle - unit.token.get("rotation"));
                if (angle > 0 && angle < 180) {
                    //turn right
                    currentRotation = Angle(currentRotation + 60);
                } else if (angle > 180 && angle < 360) {
                    //turn left
                    currentRotation = Angle(currentRotation - 60);
                }
                unit.token.set('rotation',currentRotation)
            }
        }

    }










    const EndPhase = () => {
        state.BFG.phase = "End";
        //Boarding Actions
        //Hit and Run. Teleport ?
        //Blast Markers - remove up to d6, that arent in contact with ships
        let eligible = [];
        _.each(BlastArray,blast => {
            let ids = hexMap[blast.hexLabel].shipIDs;
            if (ids.length > 0) {
                let possible = true;
                for (let i=0;i<ids.length;i++) {
                    let id = ids[i];
                    let unit = UnitArray[id];
                    if (unit.type.includes("Battleship") || unit.type.includes("Cruiser") || unit.type === "Escort") {
                        possible = false;
                    }
                }
                if (possible === true) {
                    eligible.push(blast);
                }
            } else {
                eligible.push(blast);
            }
        });
        let number = Math.min(randomInteger(6),eligible.length);
        for (let i=0;i<number;i++) {
            let num = randomInteger(eligible.length) - 1;
            let blast = eligible[num];
            let index = BlastArray.indexOf(blast);
            let index2 = eligible.indexOf(blast);
            BlastArray.splice(index,1);
            eligible.splice(index2,1);
            let token = findObjs({_type:"graphic", id: blast.id})[0];
            token.remove();
        }
        //Critical Damage
        criticalArray = Object.keys(UnitArray);
        Repairs();




    }


    const ClearMarkers = (stage) => {
       
    }


    const Fire = (msg) => {
        let Tag = msg.content.split(";");
        let shooterID = Tag[1];
        let targetID = Tag[2];
        let weaponNum = Tag[3];

        let shooter = UnitArray[shooterID];
        let target = UnitArray[targetID];

        let weapon = shooter.weaponArray[weaponNum];

        let losResult = LOS(shooter,target);
        SetupCard(shooter.name,weapon.type,shooter.faction);

        //check los, range, arc, weapon
        let errorMsg = [];
        if (losResult.los === false) {
            errorMsg.push(losResult.reason);
        }
        if (losResult.range > weapon.maxRange) {
            errorMsg.push("Target is out of range");
        }
        if (losResult.range < weapon.minRange) {
            errorMsg.push("Target is too close");
        }
        if (weapon.arc.includes(losResult.arc) === false) {
            errorMsg.push("Target is not in this weapon's firing arc");
        }
        if (weapon.fired === hitValue) {
            errorMsg.push("Weapon is damaged and unable to fire")
        }
        if (weapon.fired === firedValue) {
            errorMsg.push("Weapon has already fired this turn");
        }


        if (weapon.type === "Nova Cannon" && (shooter.token.get(SM.allahead) === true || shooter.token.get(SM.newheading) === true || shooter.token.get(SM.retros) === true || shooter.token.get(SM.brace) === true)) {
            errorMsg.push("Unable to Fire Nova Cannon due to Order");
        }

        if (errorMsg.length > 0) {
            _.each(errorMsg,error => {
                outputCard.body.push(error);
            })
            PrintCard();
            return;
        }

        //check closest target
        let closestTarget = target;
        
        let closestLOS = losResult;
        _.each(UnitArray,possTarget => {
            if (possTarget.type.includes("Hulk") === false && possTarget.faction !== shooter.faction && ((possTarget.type === "Ordnance" && target.type === "Ordnance") || (possTarget.type !== "Ordnance" && target.type !== "Ordnance")) ) {
                let losResult2 = LOS(shooter,possTarget);
                if (losResult2.los === true && losResult2.range <= weapon.maxRange && losResult2.range >= weapon.minRange && weapon.arc.includes(losResult2.arc) && losResult2.range < closestLOS.range) {
                    closestTarget = possTarget;
                    closestLOS = losResult2;
                }
            }
        })
        if (closestTarget !== target) {
            let ldTest = Leadership(shooter,0);
            if (ldTest === false) {
                outputCard.body.push("The Ship is forced to target the closest Target of that type - " + closestTarget.name);
                target = closestTarget;
                losResult = closestLOS;
            } else {
                outputCard.body.push("The farther Target is Prioritized");
            }
        }

        let groupA = ["Lance Battery","Weapons Battery"];
        if (groupA.includes(weapon.type)) {
            let fp = weapon.fp;
            if (shooter.token.get(SM.allahead) === true || shooter.token.get(SM.newheading) === true || shooter.token.get(SM.retros) === true || shooter.token.get(SM.brace) === true) {
                fp = Math.round(fp/2);
            }

            let dice,needed;
            let modtips = [];

            if (weapon.type === "Lance Battery") {
                dice = fp;
                if (target.type === "Ordnance") {
                    needed = 6;
                    modtips.push("Ordnance needs 6");
                } else {
                    needed = 4;
                }
                modtips.push("Lance Battery")
            } else if (weapon.type === "Weapons Battery") {
                let column = 5;
                if (target.type.includes("Battleship") || target.type.includes("Cruiser")) {
                    column = 3;
                }
                if (target.type === "Escort") {
                    column = 4;
                }
                if (target.type === "Defence" || target.token.get(SM.slow) === true ) {
                    column = 1;
                }
                if (target.type === "Ordnance") {
                    modtips.push("Ordnance needs 6");
                    column = 5;
                    needed = 6;
                }
                if (losResult.range < 15/gameScale) {
                    column--
                    modtips.push("Close Range Shift Up");
                };
                if (losResult.range > 30/gameScale) {
                    column++
                    modtips.push("Long Range Shift Down");
                };

                if (losResult.blast === true) {
                    column++
                    modtips.push("Interference Shift Down");
                };
                if (losResult.facing === "Closing" && target.type !== "Ordnance") {
                    column--;
                    modtips.push("Target Closing Shift Up");
                    needed = target.farmour;
                };
                if (losResult.facing === "Abeam" && target.type !== "Ordnance") {
                    column++
                    modtips.push("Target Abeam Shift Down")
                    needed = target.sarmour;
                };
                if (losResult.facing === "Moving Away" && target.type !== "Ordnance") {
                    needed = target.rarmour;
                };
                
                column = Math.max(1,Math.min(5,column)) - 1; //zero ref 

                if (fp > 20) {
                    dice = Gunnery[column][19] + Gunnery[column][fp-21];
                } else {
                    dice = Gunnery[column][fp - 1];
                }
            } 

            let results = HitRolling(dice,shooter.token.get(SM.lockon),needed);
            tip = dice + " Dice Rolled";
            tip += "<br>Rolls: " + results.rolls.toString() + " vs. " + needed + "+";
            tip += "<br>---------------------"
            tip += "<br>Firepower: " + fp;
            _.each(modtips,mod => {
                tip += "<br>" + mod;
            })
            tip = '[🎲](#" class="showtip" title="' + tip + ')';

            let s = (results.hits > 1) ? "s":"";
            if (results.hits === 0) {
                outputCard.body.push(tip + " [#FF0000]" + weapon.name + " Fire and Miss[/#]");
            } else {
                outputCard.body.push(tip + " " + weapon.name + " Fire and scores " + results.hits + " Hit" + s);
            }

            if (results.hits > 0 && target.type !== "Ordnance") {
                target.Damage(results.hits,weapon);
            } else if (results.hits > 0 && target.type === "Ordnance") {
                let killed = [target.id];
                let possibles = hexMap[target.hexLabel].ordnanceIDs;
                if (possibles.length > 1 && hits > 1) {
                    outputCard.body.push("The Target and " + (hits - 1) + " other Ordnance Destroyed");
                    for (let i=0;i<possibles.length;i++) {
                        let id2 = possibles[i];
                        if (id2 = target.id) {continue};
                        killed.push(id2);
                        if (killed.length >= results.hits) {break};
                    }
                } else {
                    "The Target Ordnance is Destroyed";
                }
                for (let i=0;i<killed.length;i++) {
                    let ord = UnitArray[killed[i]];
                    ord.Destroyed();
                }
            }



            //mark weapon fired
            //weapon.fired = firedValue;
            //AttributeSet(shooter.charID,"weapon" + weaponNum + "fired",firedValue);
        }

        if (weapon.type === "Nova Cannon") {
            //to hit is 5+ on d6
            //miss is scatter - if < 45/gamescale then 0-1 scatter
            //if > 45 < 60 then 0-2 scatter, if > 60 then scatter 0-3
            let hitRoll = randomInteger(6);
            let scatter = 0
            let scatterRoll;
            let targetHex = hexMap[target.hexLabel];
            let directHit = true;
            if (hitRoll < 5) {
                scatter = 2; //0 - 1;
                directHit = false;
                if (losResult.range > 45/gameScale) {
                    scatter += 1; // 0 - 2
                }
                if (losResult.range > 60/gameScale) {
                    scatter += 1; // 0 - 3
                }
                scatterRoll = randomInteger(scatter) - 1; // to give the 0-x result
                if (scatterRoll > 0) {
                    let possibles = targetHex.cube.ring(scatterRoll); //hexes of radius X
                    let final = possibles[randomInteger(possibles.length) - 1].label();
                    targetHex = hexMap[final];
                }
            }

            if (directHit === true) {
                let damage = randomInteger(6);
                outputCard.body.push("The Nova Cannon scores a Direct Hit");
                outputCard.body.push(target.name + " takes " + damage + " Damage");
                target.Damage(damage,weapon);
            } else {
                if (scatter === 0) {
                    outputCard.body.push("The Nova Cannon narrowly misses the Target");
                    outputCard.body.push("All units in the hex are still hit by the Blast");
                } else {
                    outputCard.body.push("The Nova Cannon scatters " + scatterRoll + " hexes away");
                }
            }

            if (targetHex) {
                let img = getCleanImgSrc("https://files.d20.io/images/373600258/Bp9NdS1zfIfZqNTdOeYnXg/thumb.png?1704167718");
                let blast = createObj("graphic", {
                    left: targetHex.centre.x,
                    top: targetHex.centre.y,
                    width: 80,
                    height: 80,
                    name: "Nova",
                    isdrawing: true,
                    pageid: Campaign().get("playerpageid"),
                    imgsrc: img,
                    layer: "map",
                })
                toFront(blast);
                if (targetHex.shipIDs.length === 0) {
                    Blast(targetHex);
                }
                for (let i=0;i<targetHex.shipIDs.length;i++) {
                    let ship = UnitArray[targetHex.shipIDs[i]];
                    if (ship.id === target.id && directHit === true) {continue}
                    outputCard.body.push(ship.name + " is caught in the Blast");
                    ship.Damage(damage,weapon);
                }
                if (targetHex.ordnanceIDs.length > 0) {
                    outputCard.body.push("All Ordnance and Attack Craft in hex destroyed");
                    for (let i=0;i<targetHex.ordnanceIDs.length;i++) {
                        let ord = UnitArray[targetHex.ordnanceIDs[i]];
                        ord.Destroyed();
                    }
                }
            } else {
                outputCard.body.push("It lands Off Map");
            }


            //mark weapon fired
            //weapon.fired = firedValue;
            //AttributeSet(shooter.charID,"weapon" + weaponNum + "fired",firedValue);


        }



        PrintCard();











    }


    const Explosion = () => {
        let info = criticalArray.shift();
        if (info) {
            let target = UnitArray[info.id];
            SetupCard(target.name,"Explosion",target.faction);
            let results = HitRolling(info.strength,false,4);
            let weapon = {
                name: "Explosion",
                type: "Lance Battery",
                fp: info.strength,
            }
            tip = info.strength + " Dice Rolled";
            tip += "<br>Rolls: " + results.rolls.toString() + " vs 4+";
            tip += "<br>---------------------"
            tip += "<br>Blast Strength: " + info.strength;
            tip = '[🎲](#" class="showtip" title="' + tip + ')';

            let s = (results.hits > 1) ? "s":"";
            if (results.hits === 0) {
                outputCard.body.push(tip + " [#FF0000] The Ship somehow manages to evade the Explosion![/#]");
            } else {
                outputCard.body.push(tip + " The Ship is caught in the explosion and takes " + results.hits + " Hit" + s);
            }

            if (results.hits > 0) {
                target.Damage(results.hits,weapon);
            }

            if (criticalArray.length > 0) {
                ButtonInfo("Next Ship Caught in Explosion","!Explosion");
            } else {
                outputCard.body.push("[hr]");
                outputCard.body.push("Proceed to next Ship/Phase");
            }
            PrintCard;
        }
    }

    const HitRolling = (dice,lockon,needed) => {
        let hitRolls = [];
        let hits = 0;
        for (let i=0;i<dice;i++) {
            let roll1 = randomInteger(6);
            let roll2 = randomInteger(6);
            if (lockon === true) {
                if (roll1 >= needed) {
                    hitRolls.push(roll1);
                    hits++;
                } else if (roll1 < 4 && roll2 > 3) {
                    hitRolls.push(roll1 + "/" + roll2);
                    hits++;
                } else {
                    hitRolls.push(roll1 + "/" + roll2);
                }
            } else {
                hitRolls.push(roll1)
                if (roll1 >= needed) {
                    hits++
                }
            }
        }
        let info = {
            rolls: hitRolls,
            hits: hits,
        }
        return info
    }
















//change below for ordnance
    const TokenInfo = (msg) => {
        if (!msg.selected) {
            sendChat("","No Token Selected");
            return;
        };
        let id = msg.selected[0]._id;
        let unit = UnitArray[id];
        if (!unit) {
            sendChat("","Not in Array Yet");
            return
        }
        let h = hexMap[unit.hexLabel];
        let faction = unit.faction;
        if (!faction) {faction = "Neutral"};
        SetupCard(unit.name,unit.hexLabel,unit.faction);
        if (h.terrain !== "") {
            outputCard.body.push(h.terrain);
        }
        let shields = parseInt(unit.token.get("bar1_value"));
        if (shields > 0) {
            outputCard.body.push("Shields are up at " + shields);
        } else {
            outputCard.body.push("No Active Shields");
        }
        let hull = parseInt(unit.token.get("bar2_value"));
        outputCard.body.push("Hull is at " + hull);

        let cruising = unit.speed;
        let full = Math.round(unit.speed * 1.5);
        let blast = false;
        for (let i=0;i<BlastArray.length;i++) {
            if (BlastArray[i].hexLabel === h.hexLabel) {
                blast = true;
                break;
            }
        }



        if (blast === true) {
            cruising -= 5/gameScale;
            full = cruising -= 5/gameScale;
        }


        outputCard.body.push("Cruising Speed: " + cruising);
        outputCard.body.push("All Ahead Full Speed: " + full);
        outputCard.body.push("Ship may make " + unit.turns + " turn normally");
        outputCard.body.push("After a minimum " + unit.radius + " Hex Move");
        
        PrintCard();
        
    }

    const CheckLOS = (msg) => {
        let Tag = msg.content.split(";");
        let shooterID = Tag[1];
        let targetID = Tag[2];
        
        let shooter = UnitArray[shooterID];
        let target = UnitArray[targetID];

        SetupCard("LOS","",shooter.faction);
        
        let losResult = LOS(shooter,target);
        if (losResult.los === false) {
            outputCard.body.push("No LOS to Target");
            outputCard.body.push(losResult.reason);
        } else {
            outputCard.body.push("Target is in LOS");
            outputCard.body.push("Range is " + losResult.range);
            outputCard.body.push("Target is in the " + losResult.arc + " Arc");
            outputCard.body.push("Target is " + losResult.facing);
log(losResult)
            let flag = false;
            for (let i=0;i<shooter.weaponArray.length;i++) {
                let weapon = shooter.weaponArray[i];
log(weapon)
                if (weapon.arc.includes(losResult.arc) && weapon.maxRange >= losResult.range && weapon.minRange <= losResult.range && weapon.fired === readyValue) {
                    if (flag === false) {
                        outputCard.body.push("[U]Weapons with Solution[/u]")
                    }


                    outputCard.body.push(weapon.name + ": " + weapon.fp + " Firepower")
                    flag = true;
                }
//adjust for orders
//drawline
                if (losResult.blast === true && weapon.type.includes("Battery")) {
                    outputCard.body.push("Fire less effective")
                }

            }
            if (flag === false) {
                outputCard.body.push("[U]No Weapons with Solution[/u]")
            }

        }




        PrintCard();


    }

    const Distance = (unit1,unit2) => {
        let hex1 = hexMap[unit1.hexLabel];
        let hex2 = hexMap[unit2.hexLabel];
        let dist = hex1.cube.distance(hex2.cube);
        return dist;
    }



    const LOS = (shooter,target) => {
        let shooterHex = hexMap[shooter.hexLabel];
        let targetHex = hexMap[target.hexLabel];
        let los = true;
        let reason = "";
        let range = shooterHex.cube.distance(targetHex.cube);
        let interCubes = shooterHex.cube.linedraw(targetHex.cube);
        let angleST = shooterHex.cube.angle(targetHex.cube); 
        let angleTS = targetHex.cube.angle(shooterHex.cube); 

        let theta = Angle(angleST - shooter.token.get("rotation")); //angle from shooter to target taking into account shooters rotation now
        let phi = Angle(angleTS - target.token.get("rotation"));//determine targets facing
log(theta)
log(phi)
        let arc,facing;
        let blast = false;

        if (theta > 300 || theta < 60) {arc = "Front"};
        if (theta >= 60 && theta <= 120) {arc = "Right"};
        if (theta > 120 && theta < 240) {arc = "Rear"};
        if (theta >= 240 && theta <= 300) {arc = "Left"};

        if (phi > 300 || phi < 60) {facing = "Closing"};
        if (phi >= 60 && phi <= 120) {facing = "Abeam"};
        if (phi > 120 && phi < 240) {facing = "Moving Away"};
        if (phi >= 240 && phi <= 300) {facing = "Abeam"};


        for (let i=0;i<interCubes.length;i++) {
            let interHex = hexMap[interCubes[i].label()];

            if (interHex.terrain === "Planet" && (shooterHex.terrain !== "Planet" && targetHex.terrain !== "Planet")) {
                los = false;
                reason = "Target is on opposite side of Planet";
                break;
            }

            if (interHex.terrain === "Moon") {
                los = false;
                reason = "A Moon obstructs the LOS";
                break;
            }

            if (interHex.terrain === "Asteroids") {
                los = false;
                reason = "Asteroids obstructs the LOS";
                break;
            }

            if (interHex.shipIDs.length > 0) {
                for (let j=0;j<interHex.shipIDs.length;j++) {
                    let intUnit = UnitArray[interHex.shipIDs[j]];
                    if (intUnit.type.includes("Hulk")) {
                        los = false;
                        reason = intUnit.name + " Blocks LOS";
                    }
                }
                if (los === false) {
                    break;
                }
            }

            if (interHex.terrain === "Warp Rift") {
                los = false;
                reason = "Warp Rift obstructs the LOS";
                break;
            }

            if (interHex.terrain === "Dust or Gas") {
                blast = true;
            }
            for (let i=0;i<BlastArray.length;i++) {
                if (BlastArray[i].hexLabel === interHex.hexLabel) {
                    blast = true;
                    break;
                }
            }


        }

        let result = {
            los: los,
            reason: reason,
            range: range,
            arc: arc,
            facing: facing,
            blast: blast,
        }

        return result;


    }



    const ChangeHex = (unit,oldHexLabel,newHexLabel) => {
        let label = "shipIDs";
        if (unit.type === "Ordnance") {
            label = "ordnanceIDs"
        }



        let index = hexMap[oldHexLabel][label].indexOf(unit.id);
        if (index > -1) {
            hexMap[oldHexLabel][label].splice(index,1);
        }
        if (newHexLabel) {
            hexMap[newHexLabel][label].push(unit.id);
            unit.hexLabel = newHexLabel;
            unit.location = hexMap[newHexLabel].centre;
            if (unit.hexLabel !== unit.lastHexLabel && unit.type !== "Ordnance" && unit.type !== "Defence") {
                let h1 = hexMap[unit.hexLabel];
                let h2 = hexMap[unit.lastHexLabel];
                let d = h1.cube.distance(h2.cube);
                if (d <= 1 && unit.type !== "Ordnance" && unit.type !== "Defence") {
                    unit.token.set(SM.slow,true);
                } else {
                    unit.token.set(SM.slow,false);
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
            let unit = UnitArray[id];
            if (!unit) {return};
            let abilityName,action;
            let abilArray = findObjs({_type: "ability", _characterid: unit.charID});
            //clear old abilities
            for(let a=0;a<abilArray.length;a++) {
                abilArray[a].remove();
            } 

       
        })

        sendChat("","Abilities Added to " + tokenIDs.length + " Units")


    }


    const Sunward = () => {
        let roll = randomInteger(6);
        let side,p1,p2;
        if (roll === 1) {
            side = "Left";
            p1 = [0,0];
            p2 = [10,pageInfo.height];
        } else if (roll === 2 || roll === 3) {
            side = "Top";
            p1 = [0,0];
            p2 = [pageInfo.width,10];
        } else if (roll === 4 || roll === 5) {
            side = "Bottom";
            p1 = [0,pageInfo.height - 10];
            p2 = [pageInfo.width,pageInfo.height];
        } else if (roll === 6) {
            side = "Right";
            p1 = [MapEdge - 10,0];
            p2 = [MapEdge,pageInfo.height];
        }
        let c = [(p2[0] - p1[0])/2 + p1[0],(p2[1] - p1[1])/2 + p1[1]];


        let points = JSON.stringify([p1,p2])
        let sunward = createObj('pathv2',{
            layer: "map",
            pageid: Campaign().get('playerpageid'),
            shape: "rec",
            stroke: '#FDFD96',
            stroke_width: 3,
            fill: '#FDFD96',
            x: c[0],
            y: c[1],
            points: points,
        });
        
        return side;
    }



    const Zone = () => {
        let roll = randomInteger(2);
        let zone,list,altLength;

        //can add in other zones later
        if (roll === 1) {
            zone = "Outer Reaches";
            list = ["D3+1/Asteroids","D3/Asteroids","D3/Dust or Gas","1/Dust or Gas","1/Planets2","1/Planets2"];
            altLength = 4; 
        } else if (roll === 2) {
            zone = "Deep Space";
            list = ["D3+1/Asteroids","D3/Asteroids","D3/Dust or Gas","1/Dust or Gas","1/Warp Rift","1/Planets3"];
            altLength = 5;
        }

        let numX = Math.round(pageInfo.hexesW/12);
        let numY = Math.round(pageInfo.hexesH/12);
        let numTotal = numX * numY;
        let phenomenon = [];
        let planet = false;
        for (let i=0;i<numTotal;i++) {
            let qRoll = randomInteger(6);
            if (qRoll > 4) {
                let r = 6;
                if (planet === true) {r = altLength};
                let pRoll = randomInteger(r) - 1;
                let listResult = list[pRoll].split("/");
                a = DiceNum(listResult[0]);
                phenom = listResult[1];
                if (phenom.includes("Planet")) {
                    let u = randomInteger(6);
                    if (phenom === "Planets1") {
                        if (u === 6) {
                            phenom = "Small Planet";
                        } else {
                            phenom = "Medium Planet";
                        }
                    } else if (phenom === "Planets2") {
                        if (u<4) {
                            phenom = "Small Planet";
                        } else {
                            phenom = "Large Planet";
                        }
                    } else if (phenom === "Planets3") {
                        phenom = "Small Planet";
                    }
                    planet = true;
                }
                phenomenon.push({
                    num: a,
                    phenom: phenom,
                    zone: -1,
                })
            } 
        }

        //now need to assign phenomenon to a zone and place on map
        let used = [];
        let zoneRoll;
        for (let i=0;i<phenomenon.length;i++) {
            do {
                let xRoll = (randomInteger(numX) - 1).toString();
                let yRoll = (randomInteger(numY) - 1).toString();
                zoneRoll = xRoll + "/" + yRoll;
            } while (
                used.includes(zoneRoll) === true
            )
            used.push(zoneRoll);
            phenomenon[i].zone = zoneRoll;
            Phenomenon(phenomenon[i]);
        }


        log(zone)
        log(phenomenon)
        return zone;
    }


    const Phenomenon = (phenom) => {
        let num = phenom.num;
        let type = phenom.phenom;
        let zone = phenom.zone.split("/");
 
        for (let i=0;i<num;i++) {
            //central position of phenomenon in zone
            let row = rowLabels[(randomInteger(12) - 1) + (zone[1]*12)];
            let column = randomInteger(12) + (zone[0]*12);
            let label = row+column;

            if (type === "Dust or Gas" || type === "Asteroids") {
                Clouds(type,label);
            } else if (type.includes("Planet")) {
                Planet(label,type);
            } else if (type === "Warp Rift") {
                WarpRift(label);
            }
        }
    }

    const ClearEdge = () => {
        let edges = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "map",stroke: "#000000"});
        _.each(edges,edge => {
            edge.remove();
        })


    }
   

    const Blast = (hex) => {
        let img = getCleanImgSrc("https://s3.amazonaws.com/files.d20.io/images/426746945/FH9YN_ELapuFzBsRM8S6nQ/thumb.png?1738170975");

        let pos = [[-15,-15],[0,-15],[15,-15],[15,0],[15,15],[0,15],[-15,15],[-15,0],[0,0]];

        let x = hex.centre.x + pos[randomInteger(pos.length) - 1][0];
        let y = hex.centre.y + pos[randomInteger(pos.length) - 1][1];

        let blast = createObj("graphic", {
            left: x,
            top: y,
            width: 50,
            height: 50,
            name: "Blast",
            isdrawing: true,
            pageid: Campaign().get("playerpageid"),
            imgsrc: img,
            layer: "map",
        })
        toFront(blast);
        let ba = {
            hexLabel: hex.hexLabel,
            id: blast.id,
        }
        BlastArray.push(ba);
    }





    const changeGraphic = (tok,prev) => {
        if (tok.get('subtype') === "token") {
            log(tok.get("name") + " moving in changeGraphic");
            if ((tok.get("left") !== prev.left) || (tok.get("top") !== prev.top) || (tok.get("rotation") !== prev.rotation)) {
                let unit = UnitArray[tok.id];
                if (!unit) {return};

                let newLocation = new Point(tok.get("left"),tok.get("top"));
                let newHex = hexMap[newLocation.toOffset().label()];
                let oldHexLabel = unit.hexLabel;
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

                if (unit.type !== "Ordnance" && unit.type.includes("Hulk") === false) {
                    unit.AdjustShields();
                }

                ChangeHex(unit,oldHexLabel,newHex.label);

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
                log()
                log("STATE");
                log(state.BFG);
                log("Squadron Array");
                log(SquadronArray);
                log("Unit Array");
                log(UnitArray);
                log("Blast Array");
                log(BlastArray);
                break;
            case '!ClearState':
                ClearState(msg);
                break;
            case '!Roll':
                RollD6(msg);
                break;
            case '!AddUnits':
                AddUnits(msg);
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
            case '!SetupGame':
                SetupGame(msg);
                break;
            case '!NewTurn':
                NewTurn(msg);
                break;
            case '!ClearEdge':
                ClearEdge();
                break;
            case '!Orders':
                Orders(msg);
                break;
            case '!Movement2':
                Movement2();
                break;
            case '!Shooting2':
                Shooting2();
                break;
            case '!MovementPhase':
                MovementPhase();
                break;
            case '!ShootingPhase':
                ShootingPhase();
                break;
            case '!EndPhase':
                EndPhase();
                break;
            case '!Turn':
                Turn(msg);
                break;
            case '!Fire':
                Fire(msg);
                break;
            case '!Explosion':
                Explosion();
                break;
            case '!StartPhase':
                StartPhase();
                break;
            case '!AimTorpedos':
                AimTorpedos(msg);
                break;
            case '!LaunchTorpedos':
                LaunchTorpedos(msg);
                break;   
            case '!NextUnit':
                NextUnit();
                break;   
            case '!EquipCarrier':
                EquipCarrier(msg);
                break;
            case '!AddCraft':
                AddCraft(msg);
                break;
            case '!LaunchCraft':
                LaunchCraft(msg);
                break;
            case '!LaunchCraft2':
                LaunchCraft2(msg);
                break;
            case '!CraftAttack':
                CraftAttack(msg);
                break;
        }
    };



    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('change:graphic',changeGraphic);
        //on('destroy:graphic',destroyGraphic);
    };
    on('ready', () => {
        log("===> Battlefleet Gothic Version: " + version + " <===");
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