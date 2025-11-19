const Strahd = (() => {
    const version = '2025.11.14';
    if (!state.Strahd) {state.Strahd = {}};


    let outputCard = {title: "",subtitle: "",side: "",body: [],buttons: [],};

    let ModelArray = {};
    let MapArray = {};

    const pageInfo = {name: "",page: "",gridType: "",scale: 0,width: 0,height: 0};

    const LoadPage = () => {
        //build Page Info
        pageInfo.page = getObj('page', Campaign().get("playerpageid"));
        pageInfo.name = pageInfo.page.get("name");
        pageInfo.scale = pageInfo.page.get("snapping_increment");
        pageInfo.width = pageInfo.page.get("width");
        pageInfo.height = pageInfo.page.get("height");
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

    const ModelInSquare = (model,corners) => {
        //check centre points of squares covered by token
        //start with centre of token, add in others if size > 1
        let c = new Point(model.token.get("left"),model.token.get("top"))
        let centrePts = [c];
        if (model.size === 2 || model.size === 4) {
            centrePts.push(new Point(c.x - 35,c.y - 35));
            centrePts.push(new Point(c.x + 35,c.y - 35));
            centrePts.push(new Point(c.x - 35,c.y + 35));
            centrePts.push(new Point(c.x + 35,c.y + 35));
        }
        if (model.size === 3) {
            centrePts.push(new Point(c.x - 70,c.y - 70));
            centrePts.push(new Point(c.x,c.y - 70));
            centrePts.push(new Point(c.x + 70,c.y - 70));
            centrePts.push(new Point(c.x - 70,c.y));
            centrePts.push(new Point(c.x,c.y));
            centrePts.push(new Point(c.x + 70,c.y));
            centrePts.push(new Point(c.x - 70,c.y + 70));
            centrePts.push(new Point(c.x,c.y + 70));
            centrePts.push(new Point(c.x + 70,c.y + 70));
        }
        if (model.size === 4) {
            centrePts.push(new Point(c.x - 105,c.y - 105));
            centrePts.push(new Point(c.x - 35,c.y - 105));
            centrePts.push(new Point(c.x + 35,c.y - 105));
            centrePts.push(new Point(c.x + 105,c.y - 105));
            centrePts.push(new Point(c.x - 105,c.y - 35));
            centrePts.push(new Point(c.x + 105,c.y - 35));
            centrePts.push(new Point(c.x - 105,c.y + 35));
            centrePts.push(new Point(c.x + 105,c.y + 35));
            centrePts.push(new Point(c.x - 105,c.y + 105));
            centrePts.push(new Point(c.x - 35,c.y + 105));
            centrePts.push(new Point(c.x + 35,c.y + 105));
            centrePts.push(new Point(c.x + 105,c.y + 105));
        }

        for (let i=0;i<centrePts.length;i++) {
            let c = centrePts[i];
            if (c.x >= corners[0].x && c.x <= corners[1].x && c.y >= corners[0].y && c.y <= corners[1].y) {
                return true;
            }
        }
        return false;
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


const Line = (index1,index2) => {
    //return points between map indexes 1 and 2, incl 1 and 2
    let p0 = MapArray[index1].centre;
    let p1 = MapArray[index2].centre;
    let points = [];
    let N = diagonal_distance(p0,p1);
    for (let step = 0; step <= N; step++) {
        let t = (N=== 0) ? 0.0 : (step/N);
        points.push(round_point(lerp_point(p0,p1,t)));
    }

    //translate pts to square indexes
    let indexes = [];
    _.each(points,p => {
        let index = p.toIndex();
        indexes.push(index);
    })
    indexes = [...new Set(indexes)];
    return indexes;
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


const EndLine = (start,end,length) => {
    //produces a line representing end of Cone of length x, using a start point (caster) and end pt (target)
    let sqL = Math.round(((length/pageInfo.scaleNum) - 1)/2);
    let distance = sqL * 70;
    let p0 = MapArray[start].centre;
    let p1 = MapArray[end].centre;
    let index2,index3;
    let w = end.split("/");
    w = w.map((e) => parseInt(e));
    if ((p1.x - p0.x) === 0) {  
        //line 2 is horizontal
        index2 = (w[0] - sqL) + "/" + w[1];
        index3 = (w[0] + sqL) + "/" + w[1];
    } else if ((p1.y - p0.y) === 0) {
        //line2 is vertical
        index2 = w[0] + "/" + (w[1] - sqL);
        index3 = w[0] + "/" +(w[1] + sqL);
    } else {
        let m0 = (p1.y - p0.y)/(p1.x - p0.x);
        let m1 = -1/m0;
        let b1 = p1.y - (m1 * p1.x);
        p2 = findPointOnLine(p1,m1,b1,distance,1);
        p3 = findPointOnLine(p1,m1,b1,distance,-1);
        index2 = p2.toIndex();
        index3 = p3.toIndex();
    }



    let line = Line(index2,index3);

    return line;
}

const findPointOnLine = (point,m,b,distance,direction) => {
    let magnitude = Math.sqrt(1+m*m);
    let deltaX = direction * (distance / magnitude);
    let deltaY = direction * (m * distance / magnitude);
    let pt = new Point(point.x + deltaX,point.y + deltaY);
    return pt;
}

const Cone = (start,end,length) => {
    //length is in feet
    let sqL = length / pageInfo.scaleNum;
    let endLine = EndLine(start,end,length);
    let AI = [];
    for (let i=0;i<endLine.length;i++) {
        let line = Line(start,endLine[i]);
        for (j=0;j<line.length;j++) {
            let index = line[j];
            if (index !== start) {AI.push(index)};
        }
    }
    AI = [...new Set(AI)]; //elim duplicates
    let array = [];
    _.each(AI,index => {
        let dist = MapArray[start].distance(MapArray[index]);
        if (dist <= sqL) {
            array.push({
                index: index,
                dist: dist,
            })
        }
    })

    array = array.sort((a,b) => a.dist - b.dist);

    //thin to 1 at d 1, 2 at d2 etc
//in practice, when thinning, give preference to squares with creatures
//so skip if no creature, 

    thinnedArray = [];
    loop1:
    for (let i=1;i<= sqL; i++) {
        let counter = 0;
        for (let j=0;j<array.length;j++) {
            let e = array[j];
            if (e.dist === i) {
                thinnedArray.push(e.index);
                counter++;
                if (counter >= i) {continue loop1};
            };
        }
    }

    return thinnedArray;
}

const TestCone = (msg) => {
    let Tag = msg.content.split(";");
    let id1 = Tag[1];
    let id2 = Tag[2];
    let model1 = ModelArray[id1];
    let model2 = ModelArray[id2];
    let index1 = model1.squares[0];
    let index2 = model2.squares[0];
    let cone = Cone(index1,index2,15);

    SetupCard("Test Cone","","NPC");
    _.each(cone,index => {
        let pt = MapArray[index].centre;
        spawnFx(pt.x,pt.y, "burn-fire",model1.token.get("_pageid"));
    })
    PrintCard();
}

    class Point {
        constructor(x,y) {
            this.x = x;
            this.y = y;
        };
        distance(b) {
            return Math.sqrt(((this.x - b.x) * (this.x - b.x)) + ((this.y - b.y) * (this.y - b.y)));
        }
        toIndex() {
            let s = this.toSq();
            return (s.x + "/" + s.y);
        }
        toSq() {
            let x = Math.round((this.x - 35)/70);
            let y = Math.round((this.y - 35)/70);        
            return {x:x, y:y};
        }
    }

    class Square {
        constructor(x,y) {
            this.x = x;
            this.y = y;
            this.centre = new Point(x*70 + 35, y*70 + 35);
            this.index = x + "/" + y;
            this.tokenIDs = [];
        };
        toPoint() {
            let x = this.x * 70 + 35;
            let y = this.y * 70 + 35;
            return new Point(x,y);
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

log(this.name)
            this.type = (aa.npc_type || " ").toLowerCase();

            this.immunities = (aa.npc_immunities || " ").toLowerCase();
            this.conditionImmunities = (aa.npc_condition_immunities || " ").toLowerCase();
            this.resistances = (aa.npc_resistances || " ").toLowerCase();
            this.vulnerabilities = (aa.npc_vulnerabilities || " ").toLowerCase();

            this.npc = (aa.charactersheet_type === "npc") ? true:false;
            this.displayScheme = "NPC";

            this.ac = (this.npc === false) ? (parseInt(aa.ac) || 10):(parseInt(aa.npc_ac) || 10); //here as wildshapes are coming up as NPCs

            this.class = (aa.class || " ").toLowerCase();



            let control = char.get("controlledby");
            let playerName;
            if (control) {
                playerName = playerCodes[control.split(",")[0]];
                this.displayScheme = playerName;
                this.npc = false;
            }
if (this.name === "Eivirin" || this.name.includes("Ratatoskr")) {
    this.displayScheme = "Vic";
}


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

            this.squares = ModelSquares(this);

            _.each(this.squares,square => {
                MapArray[square].tokenIDs.push(this.id);
            })


            ModelArray[token.id] = this;

        }

        Distance (model2) {
            let dist = Infinity;
            _.each(this.squares,square => {
                _.each(model2.squares, square2 => {
                    dist = Math.min(MapArray[square].distance(MapArray[square2]),dist);
                })
            })
            return dist;
        }

        Destroy () {
            let token = this.token;
            _.each(this.squares, square => {
                let index = MapArray[square].tokenIDs.indexOf(this.id);
                if (index > -1) {
                    MapArray[square].tokenIDs.splice(index,1);
                }
            })
            if (token) {
                token.remove();
            }
            delete ModelArray[this.id];
        }


    }


    const ModelSquares = (model) => {
        let indexes = [];
        let c = new Point(model.token.get("left"),model.token.get("top"));
        let w = model.token.get("width");
        let h = model.token.get("height");
        //define corners, pull in to be centres
        let tL = new Point(c.x - w/2 + 35,c.y - h/2 + 35);
        let bR = new Point(c.x + w/2 - 35,c.y + h/2 - 35);
        for (let x = tL.x;x<= bR.x;x += 70) {
            for (let y = tL.y;y <= bR.y; y += 70) {
                let index = (new Point(x,y)).toIndex();
                indexes.push(index);
            }
        }
        return indexes;
    }


    const ModelSquares2 = (model) => {
        let c = new Point(model.token.get("left"),model.token.get("top"));
        let centrePts = [];
        let squares = [];


        if (model.size === 1 || model.size === 3) {
            centrePts.push(c);
        }
        if (model.size === 2 || model.size === 4) {
            centrePts.push(new Point(c.x - 35,c.y - 35));
            centrePts.push(new Point(c.x + 35,c.y - 35));
            centrePts.push(new Point(c.x - 35,c.y + 35));
            centrePts.push(new Point(c.x + 35,c.y + 35));
        }
        if (model.size === 3) {
            centrePts.push(new Point(c.x - 70,c.y - 70));
            centrePts.push(new Point(c.x,c.y - 70));
            centrePts.push(new Point(c.x + 70,c.y - 70));
            centrePts.push(new Point(c.x - 70,c.y));
            centrePts.push(new Point(c.x,c.y));
            centrePts.push(new Point(c.x + 70,c.y));
            centrePts.push(new Point(c.x - 70,c.y + 70));
            centrePts.push(new Point(c.x,c.y + 70));
            centrePts.push(new Point(c.x + 70,c.y + 70));
        }
        if (model.size === 4) {
            centrePts.push(new Point(c.x - 105,c.y - 105));
            centrePts.push(new Point(c.x - 35,c.y - 105));
            centrePts.push(new Point(c.x + 35,c.y - 105));
            centrePts.push(new Point(c.x + 105,c.y - 105));
            centrePts.push(new Point(c.x - 105,c.y - 35));
            centrePts.push(new Point(c.x + 105,c.y - 35));
            centrePts.push(new Point(c.x - 105,c.y + 35));
            centrePts.push(new Point(c.x + 105,c.y + 35));
            centrePts.push(new Point(c.x - 105,c.y + 105));
            centrePts.push(new Point(c.x - 35,c.y + 105));
            centrePts.push(new Point(c.x + 35,c.y + 105));
            centrePts.push(new Point(c.x + 105,c.y + 105));
        }
        _.each(centrePts,c => {
            let index = c.toIndex();
            squares.push(index);
        })
        return squares;
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

    const BuildMap = () => {
        MapArray = {};
        for (let x=0;x<= pageInfo.width;x++) {
            for (let y=0;y<= pageInfo.height;y++) {
                let index = x +"/" + y;
                MapArray[index] = new Square(x,y);
            }
        }
    }


    const Smite = (msg) => {
        let Tag = msg.content.split(";");
        let attID = Tag[1];
        let defID = Tag[2];
        let critical = parseInt(Tag[3]) === 1 ? true:false;
        let level = parseInt(Tag[4]);
        let sub = (critical === "Yes") ? "Divine Smite Critical": "Divine Smite";

        let attacker = ModelArray[attID];
        let defender = ModelArray[defID]; 

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
        PlaySound("Smite");
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
            savingThrow: "No",
            saveEffect: "",
            toHit: "Direct Auto",
            note: "",
            sound: "Splinter2",
            fx: "missile-magic",
        },
        "Sleep": {
            level: 1,
            range: 90,
        },
        "Entangle": {
            level: 1,
            range: 90,
        },
        "Faerie Fire": {
            level: 1,
            range: 60,
        },
        "Thunderwave": {
            level: 1,
            range: 5,
        },
        "Fog Cloud": {
            level: 1,
            range: 120,
        },
        "Burning Hands": {
            level: 1,
            range: 15,
        },



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

        if (distance > weapon.range[1] && weapon.type.includes("Ranged")) {
            errorMsg.push("Target is Out of Max Range");
        }

        //damage bonuses, move into weapon for Damage routine
        //stat
        if (weapon.type.includes("Melee") || weapon.properties.includes("Thrown")) {
            weapon.base += "+" + statBonus;
        }
        //abilities
        if (attacker.name === "Wirsten" && inReach === true) {
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
        if (inReach === true && weapon.type.includes("Melee")) {
            outputCard.body.push(attacker.name + " strikes at " + defender.name + " with his " + weaponName);
        }
        if (inReach === false && weapon.properties.includes("Thrown")) {
            outputCard.body.push(attacker.name + " throws his " + weaponName + " at " + defender.name);
            weapon.sound = "Shuriken"
        }
        if (inReach === false && weapon.properties.includes("Thrown") === false) {
            outputCard.body.push(attacker.name + ' fires his ' + weaponName + " at " + defender.name);
        }

        //Advantage/Disadvantage checking

        let attPos = ["Invisible","Advantage"];
        let attNeg = ["Blind","Frightened","Poison","Restrained","Disadvantage"];
        let ignore = ["Incapacitated","Paralyzed","Restrained","Stunned","Unconscious"];
        let attMarkers = Markers(attacker.token.get("statusmarkers"));
        let attAdvantage = 0;

        //check if next to an enemy token if ranged attack, if so, disadvantage unless is Incapacitated, paralyzed, restrained,stunned,unconsciou
        if (inReach === true && weapon.type.includes("Melee") === false) {
            let ids = Object.keys(ModelArray);
            idLoop1:
            for (let i=0;i<ids.length;i++) {
                let model2 = ModelArray[ids[i]];
                if (model2.displayScheme !== "NPC") {continue};
                let sm = model2.token.get("statusmarkers");
                for (let j=0;j<ignore.length;j++) {
                    if (sm.includes(ignore[j])) {continue idLoop1};
                }
                let squares = attacker.Distance(model2);                
                if (squares > 1) {
                    continue;
                }
                attAdvantage = -1;
            }
        }    
        //prone if inReach
        if (inReach === true && attMarkers.includes("Prone")) {
            attAdvantage = -1;
        }
        //ranged weapons
        if (inReach === false && distance > weapon.range[0]) {
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

        let fFire = (defender.token.get("aura1_color") === "#ff00ff" && defender.token.get("aura1_radius") === 1) ? true:false;

        let defAdvantage = (fFire === true) ? 1:0;
        let defMarkers = Markers(defender.token.get("statusmarkers"));
        let defPos = ["Blind","Paralyzed","Restrained","Stunned","Unconscious","Disadvantage"];
        let defNeg = ["Invisible","Dodge","Advantage"];
        if (defMarkers.includes("Prone")) {
            if (inReach === true) {
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
                if (defNeg[i] === "Invisible" && fFire === true) {continue};
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
        if ((defMarkers.includes("Paralyzed") || defMarkers.includes("Unconscious")) && inReach === true) {
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
            if (crit === true) {
                spawnFx(defender.token.get("left"),defender.token.get("top"), "burn-blood",defender.token.get("_pageid"));
            } else {
                spawnFx(defender.token.get("left"),defender.token.get("top"), "pooling-blood",defender.token.get("_pageid"));
            }

            if (attacker.class.includes("paladin") && inReach === true) {
                //add option of smite if has spell slots
                let c = (crit === true) ? 1:0
                let line = "!Smite;" + attacker.id + ";" + defender.id + ";" + c + ";";
                let levels = [];
                for (let level = 1;level < 6;level++) {
                    if (SpellSlots(attacker,level) === true) {
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
                text.push(dice + "d" + info.type);
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
        "Disadvantage": "Minus::2006420",
        "Advantage": "Plus::2006398",
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

    const Spell = (msg) => {
        let id = msg.selected[0]._id;
        let caster = ModelArray[id];
        let Tag = msg.content.split(";");
        let spellName = Tag[1];
        let level = Tag[2]; //later can cahnge to be 'Cast at X Level'
        
        SetupCard(caster.name,spellName,caster.displayScheme);
        if (SpellSlots(caster,level) === false) {
            outputCard.body.push("No Available Spell Slots of level " + level);
            PrintCard();
            return;
        }

        if (spellName === "Sleep") {
            //create the sleep token, place on caster, with instructions
            let charID = "-OeJRVLCc-tJuxhw911C";
            let img = getCleanImgSrc("https://files.d20.io/images/464585187/odP4Dv5gqpOgxA4GtmGIMA/thumb.webp?1763427066");
            let target = SpellTarget(caster,"Sleep",level,charID,img,40);
            outputCard.body.push("Place Target and then Use Macro to Cast");
            PrintCard();
        }

        if (spellName === "Entangle") {
            let charID = "-OeJFbyJkH36zRywNsEm";
            let img = getCleanImgSrc("https://files.d20.io/images/464592489/MlFXxUdwYnkx-S5mHam-KQ/thumb.png?1763430837");
            let target = SpellTarget(caster,"Entangle",level,charID,img,20);
            outputCard.body.push("Place Target and then Use Macro to Cast");
            PrintCard();
        }
        
        if (spellName === "Faerie Fire") {
            let charID = "-OeJf7QNTBO0lqtOd6Ac";
            let img = getCleanImgSrc("https://files.d20.io/images/464592488/Ol6oEZ2kLqqfV-fEBHrq5Q/thumb.png");
            let target = SpellTarget(caster,"Faerie Fire",level,charID,img,20);
            outputCard.body.push("Place Target and then Use Macro to Cast");
            PrintCard();
        }

        if (spellName === "Thunderwave") {
            let charID = "-OeJrE-MQDPwPo0KDLtq";
            let img = getCleanImgSrc("https://files.d20.io/images/464597646/OEF2m9OvLSy6J_WrL4Mh7Q/thumb.png?1763433964");
            let target = SpellTarget(caster,"Thunderwave",level,charID,img,15);
            outputCard.body.push("Place Target and then Use Macro to Cast");
            PrintCard();
        }

        if (spellName === "Fog Cloud") {
            let charID = "-OeJzgHWtgd8SummEE5T";
            let img = getCleanImgSrc("https://files.d20.io/images/464601122/Z_72GfzK6nldIvjjv9Kusw/thumb.png?1763436289");
            let dim = 40 + ((level - 1) * 40); //radius is 20 ft so diameter is 40
            let target = SpellTarget(caster,"Fog Cloud",level,charID,img,dim);
            outputCard.body.push("Place Target and then Use Macro to Cast");
            PrintCard();
        }

        if (spellName === "Cure Wounds") {
            let rolls = [];
            let bonus = Math.max(0,(caster.spellDC - 10));
            let total = bonus;
            for (i=0;i<level;i++) {
                let roll = randomInteger(8);
                rolls.push(roll);
                total += roll;
            }
            let tip = level + "d8 + " + bonus + " = [" + rolls.toString() + "] + " + bonus;
            tip = '[' + total + '](#" class="showtip" title="' + tip + ')';
            outputCard.body.push("Cure Wounds Heals for " + tip + " HP");
            PlaySound("Angels");
            UseSlot(caster,level);
            PrintCard();
        }
        
        if (spellName === "Burning Hands") {
            let charID = '-Oe8qdnMHHQEe4fSqqhm';
            let img = getCleanImgSrc("https://files.d20.io/images/105823565/P035DS5yk74ij8TxLPU8BQ/thumb.png?1582679991");
            let target = SpellTarget(caster,"Burning Hands",1,charID,img,5);
            outputCard.body.push("Move Target and then Use Macro to Cast");
            PrintCard();
        }





    }


    const CastSpell = (msg) => {
        let targetID = msg.selected[0]._id;
        let target = ModelArray[targetID];
        let Tag = msg.content.split(";");
        let spellName = Tag[1];
        let casterID = Tag[2];
        let level = parseInt(Tag[3]);
        let caster = ModelArray[casterID];
        SetupCard(caster.name,spellName,caster.displayScheme);
        let spellInfo = SpellInfo[spellName];
        let squares = caster.Distance(target);
        let spellDist = squares * pageInfo.scaleNum;

        if (spellDist > spellInfo.range) {
            outputCard.body.push("Out of Range of Spell");
            PrintCard();
            return;
        }

        if (spellName === "Sleep") {
            //models within 20 ft of centre
            let possibles = AOETargets(target);
            possibles.sort((a,b) => parseInt(a.token.get("bar1_value")) - parseInt(b.token.get("bar1_value"))); // b - a for reverse sort
            let dice = 5 + ((level -1) * 2);
            //5d8 hp. +2d8 for spell level > 1
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
            target.Destroy();
            PlaySound("Sleep");
        }

        if (spellName === "Entangle") {
            let possibles = AOETargets(target);
            _.each(possibles,model => {
                let dc = caster.spellDC;
                let tip;
                let result = Save(model,dc,"strength");
                if (result.save === false) {
                    model.token.set({
                        "status_Restrained-or-Webbed::2006494": true,
                    })
                    tip = '[fails](#" class="showtip" title="' + result.tip + ')';
                    outputCard.body.push(model.name + " " + tip + " and is restrained");
                } else if (result.save === true) {
                    tip = '[saves](#" class="showtip" title="' + result.tip + ')';
                    outputCard.body.push(model.name + " " + tip + " and is free to act");                
                }
            })
            target.token.set("layer","map");
            delete ModelArray[targetID]; //leave target token as marks the ground
            outputCard.body.push("[hr]");
            outputCard.body.push("The Area remains Difficult Ground for 1 min or until Concentration ends");
            PlaySound("Entangle");
        }

        if (spellName === "Faerie Fire") {
            let possibles = AOETargets(target);
            _.each(possibles,model => {
                let dc = caster.spellDC;
                let tip;
                let result = Save(model,dc,"dexterity");
                if (result.save === false) {
                    model.token.set({
                        aura1_radius: 1,
                        aura1_color: "#ff00ff",
                        showplayers_aura1: true,
                    })
                    tip = '[fails](#" class="showtip" title="' + result.tip + ')';
                    outputCard.body.push(model.name + " " + tip + " and is outlined by Faerie Fire");
                } else if (result.save === true) {
                    tip = '[passes](#" class="showtip" title="' + result.tip + ')';
                    outputCard.body.push(model.name + " " + tip);                
                }
            })
            target.Destroy();
            outputCard.body.push("[hr]");
            outputCard.body.push("The Faerie Fire's effect remain for 1 minute or until Concentration Ends");
            PlaySound("Scan");
        }

        if (spellName === "Thunderwave") {
            let possibles = AOETargets(target);
            let dice = 2 + (level -1);
            let total = 0;
            let rolls = [];
            for (let i=0;i<dice;i++) {
                let roll = randomInteger(8);
                rolls.push(roll);
                total += roll;
            }
            let line = dice + "d8 = [" + rolls.toString() + "]";
            tip = '[' + total + '](#" class="showtip" title="' + line + ')';

            outputCard.body.push("Spell Damage: " + tip);
            outputCard.body.push("[hr]");
            _.each(possibles,model => {
                let dc = caster.spellDC;
                let tip;
                let result = Save(model,dc,"constitution");
                if (result.save === false) {
                    tip = '[fails](#" class="showtip" title="' + result.tip + ')';
                    outputCard.body.push(model.name + " " + tip + " - takes " + total + " Damage and is pushed 10ft back");
//move token back 10ft, and stop if wall

                } else if (result.save === true) {
                    tip = '[passes](#" class="showtip" title="' + result.tip + ')';
                    outputCard.body.push(model.name + " " + tip + " - takes " + Math.round(total/2) + " Damage");                
                }
            })
            target.Destroy();
            PlaySound("Thunder");
        }

        if (spellName === "Fog Cloud") {
            target.token.set("layer","map");
            delete ModelArray[targetID]; //leave token
            outputCard.body.push("The Area in the Fog Cloud is Heavily Obscured and Blocks Vision");
            outputCard.body.push("It lasts for 1 hour or until Concentration ends, or a stronger wind blows it apart");
            PlaySound("Scan");
        }

        if (spellName === "Burning Hands") {





        }










        UseSlot(caster,level);
        PrintCard();
    }

    const SpellSlots = (caster,level) => {
        if (level === 0) {return true};
        let slots = parseInt(Attribute(caster.charID,"lvl" + level + "_slots_expended")) || 0;
        if (slots === 0) {return false};
        return true;
    }

    const UseSlot = (caster,level) => {
        if (level === 0) {return};
        let slots = parseInt(Attribute(caster.charID,"lvl" + level + "_slots_expended")) || 0;
        slots = Math.max(0,slots - 1);
        AttributeSet(caster.charID,"lvl" + level + "_slots_expended",slots);
        outputCard.body.push("[hr]")
        outputCard.body.push("Level " + level + " Spell Slot Used");
        if (slots === 0) {
            outputCard.body.push("No More of that Level");
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
        let level = parseInt(Tag[3]);

        let caster = ModelArray[attID];

        SetupCard(caster.name,spellName,caster.displayScheme);
        if (SpellSlots(caster,level) === false) {
            outputCard.body.push("No Available Spell Slots of level " + level);
            PrintCard();
            return;
        }


        if (spellInfo.cLevel[caster.casterLevel]) {
            spellInfo.base = spellInfo.cLevel[caster.casterLevel];
        }
        if (level > spellInfo.level) {
            let delta = level - spellInfo.level - 1;
            spellInfo.base = spellInfo.sLevel[delta];
        }

        let attAdvantage = 0;


        let attPos = ["Invisible","Advantage"];
        let attNeg = ["Blind","Frightened","Poison","Restrained","Disadvantage"];
        let ignore = ["Incapacitated","Paralyzed","Restrained","Stunned","Unconscious"];
        let attMarkers = Markers(caster.token.get("statusmarkers"));

        //check if next to an enemy token, if so, disadvantage unless is Incapacitated, paralyzed, restrained,stunned,unconsciou
        let ids = Object.keys(ModelArray);
        for (let i=0;i<ids.length;i++) {
            let model2 = ModelArray[ids[i]];
            if (model2.displayScheme !== "NPC") {continue};
            let sm = model2.token.get("statusmarkers");
            for (let j=0;j<ignore.length;j++) {
                if (sm.includes(ignore[j])) {continue};
            }
            let squares = caster.Distance(model2);
            if (squares === 1) {
                attAdvantage = Math.max(-1,attAdvantage -1);
                break;
            }
        }
        for (let i=0;i<attPos.length;i++) {
            if (attMarkers.includes(attPos[i])) {
                attAdvantage = Math.min(1,attAdvantage + 1);
                break;
            }
        }
        for (let i=0;i<attNeg.length;i++) {
            if (attMarkers.includes(attNeg[i])) {
                attAdvantage = Math.max(-1,attAdvantage -1);
                break;
            }
        }

        attAdvantage = Math.min(Math.max(-1,attAdvantage),1);

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
                let distance = caster.Distance(defender) * pageInfo.scaleNum;
                if (distance > spellInfo.range) {
                    outputCard.body.push("Target is Out of Range");
                    outputCard.body.push("Distance to Target: " + distance);
                    outputCard.body.push("Spell Range: " + spellInfo.range);
                    continue;
                }

                let fFire = (defender.token.get("aura1_color") === "#ff00ff" && defender.token.get("aura1_radius") === 1) ? true:false;

                let defAdvantage = (fFire === true) ? 1:0;
                let defMarkers = Markers(defender.token.get("statusmarkers"));
                let defPos = ["Blind","Paralyzed","Restrained","Stunned","Unconscious","Disadvantage"];
                let defNeg = ["Invisible","Dodge","Advantage"];
                for (let i=0;i<defPos.length;i++) {
                    if (defMarkers.includes(defPos[i])) {
                        defAdvantage = Math.min(defAdvantage +1, 1);
                        break;
                    }
                }
                for (let i=0;i<defNeg.length;i++) {
                    if (defMarkers.includes(defNeg[i])) {
                        if (defNeg[i] === "Invisible" && fFire === true) {continue};
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
                if (defMarkers.includes("Protection") && creatTypes.includes(caster.type)) {
                    defAdvantage = Math.max(defAdvantage -1,-1);
                }

                defAdvantage = Math.min(Math.max(-1,defAdvantage),1);
log("Def Adv: " + defAdvantage)

                let advantage = attAdvantage + defAdvantage;
                advantage = Math.min(Math.max(-1,advantage),1);
log("Final Adv: " + advantage)

                let result = ToHit(advantage);
                let total = result.roll + caster.spellAttack;
                let tip;
                let crit = false;
                if ((defMarkers.includes("Paralyzed") || defMarkers.includes("Unconscious")) && distance <= 5) {
                    crit = true;
                }
                if (spellInfo.toHit.includes("Auto")) {
                    result.roll = 21;
                } else {
                    tip = "1d20 + " + caster.spellAttack + " = " + result.rollText + " + " + caster.spellAttack;
                    tip = '[' + total + '](#" class="showtip" title="' + tip + ')';
                    line = "Attack: " + tip + " vs. AC " + defender.ac;
                    if (result.roll === 20) {
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
                        let result = Save(defender,caster.spellDC,spellInfo.savingThrow);
                        if (result.save === true) {
                            saved = true;
                            tip = tip = '[Saves](#" class="showtip" title="' + result.tip + ')';
                            if (spellInfo.saveEffect === "No Damage") {
                                tip += " and takes No Damage";
                            }
                            if (spellInfo.saveEffect === "Half Damage") {
                                tip += " and takes 1/2 Damage";
                            }
                        } else {
                            tip = tip = '[Fails](#" class="showtip" title="' + result.tip + ')';
                            tip += " the Save"
                        }
                        outputCard.body.push(defender.name + " " + tip);
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
                    if (saved === true) {
                        if (spellInfo.saveEffect === "No Damage") {
                            totalDamage = 0;
                        }
                        if (spellInfo.saveEffect === "Half Damage") {
                            totalDamage = Math.round(totalDamage/2);
                        }
                    }
                    tip = '[' + totalDamage + '](#" class="showtip" title="' + tip + ')';

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
                    PlaySound(spellInfo.sound);
                }

        

            }

            UseSlot(caster,level);
            PrintCard();







        }





    }


    const TokenInfo = (msg) => {
        let id = msg.selected[0]._id;
        let model = ModelArray[id];
        let token = model.token;
        SetupCard(model.name,"","NPC");
        let s = model.squares.length === 1 ? "":"s";
        log(model.squares)
        outputCard.body.push("Square" + s + ": " + model.squares.toString());
        outputCard.body.push("Size: " + model.size)
        PrintCard();

    }




    const AddAbility = (abilityName,action,charID) => {
        createObj("ability", {
            name: abilityName,
            characterid: charID,
            action: action,
            istokenaction: true,
        })
    }    

    const AOETargets = (target) => {
        let temp = [];
        _.each(target.squares,square => {
            let ids = MapArray[square].tokenIDs;
            _.each(ids,id => {
                if (id !== target.id) {
                    temp.push(id);
                }
            })
        })
        temp = [...new Set(temp)];
        let array = [];
        _.each(temp,id => {
            let model = ModelArray[id];
log(model.name)
            array.push(model);
        })
        return array;
    }





















    const AOEArray = (target,shape,radius) => {
        //create an array of tokens under the token's area
        let possibles = [];
        let w = target.token.get("width");
        let h = target.token.get("height");
        let c = new Point(target.token.get("left"),target.token.get("top"));
        if (shape === "Square") {
            tL = new Point(c.x - w/2,c.y - h/2);
            bR = new Point(c.x + w/2,c.y + h/2);
            let corners = [tL,bR];
            _.each(ModelArray,model => {
                if (model.id === target.id) {return}
                let isInside = ModelInSquare(model,corners);
                if (isInside === true) {
                    possibles.push(model);
                }
            })
        }

        return possibles;
    }
        


    const SpellTarget = (caster,spellName,level,charID,img,dim) => {
        let abilArray = findObjs({_type: "ability", _characterid: charID});
        //clear old abilities
        for(let a=0;a<abilArray.length;a++) {
            abilArray[a].remove();
        } 
        let action = "!CastSpell;" + spellName + ";" + caster.id + ";" + level;
        AddAbility("Cast " + spellName,action,charID);

        dim = (dim * 70) / pageInfo.scaleNum;

        let newToken = createObj("graphic", {
            left: caster.token.get("left"),
            top: caster.token.get("top"),
            disableTokenMenu: true,
            width: dim, 
            height: dim,  
            name: spellName,
            pageid: caster.token.get("_pageid"),
            imgsrc: img,
            layer: "objects",
            represents: charID,
        })
        toFront(newToken);
        if (newToken) {
            let target = new Model(newToken);
            return target;
        } else {
            sendChat("","Error in CreateObj")
        }
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


    const Save = (model,dc,stat,adv) => {
        let saved = false;
        if (!adv) {adv = 0;}
        let fail = false;
        let advReasons = [];
        let disAdvReasons = [];
        let failReason = "";
        let bonus = model.saveBonus[stat];
        let saveRoll1 = randomInteger(20);
        let saveRoll2 = randomInteger(20);
        let sm = Markers(model.token.get("statusmarkers"));
        let inc = ["Paralyzed","Stunned","Unconscious"];
        if (stat === "strength" || stat === "dexterity") {
            _.each(inc,c => {
                if (sm.includes(c)) {
                    fail = true;
                    failReason = c;
                }
            })
        }

        if (sm.includes("Advantage")) {
            adv = Math.min(adv + 1,1);
            advReasons.push("Advantage");
        }
        if (sm.includes("Disadvantage")) {
            adv = Math.max(adv - 1, -1);
            advReasons.push("Disadvantage");
        }

        if (sm.includes("Dodge") && stat === "dexterity") {
            adv = Math.min(adv + 1,1);
            advReasons.push("Dodge");
        }

        if (sm.includes("Restrained") && stat === "dexterity") {
            adv = Math.max(adv - 1, -1);
            disAdvReasons.push("Restrained");
        }

        saveRoll = saveRoll1;
        if (adv === 1) {
            saveRoll = Math.max(saveRoll1,saveRoll2);
        }
        if (adv === -1) {
            saveRoll = Math.min(saveRoll1,saveRoll2);
        }
        let saveTotal = Math.max(saveRoll + bonus,1);

        if ((saveTotal >= dc || saveRoll === 20) && saveRoll !== 1) {
            saved = true;
        } 

        let saveTip = "Save: " + saveTotal + " vs. DC " + dc;
        saveTip += "<br>Roll: " + saveRoll + " + " + bonus;

        if (adv === 1) {
            saveTip += "<br>Advantage: " + saveRoll1 + "/" + saveRoll2;
        }
        if (adv === -1) {
            saveTip += "<br>Disadvantage: " + saveRoll1 + "/" + saveRoll2;
        }
        if (advReasons.length > 0) {
            saveTip += "<br>" + advReasons.toString();
        }
        if (disAdvReasons.length > 0) {
            saveTip += "<br>" + disAdvReasons.toString();
        }

        if (fail === true) {
            save = false,
            saveTip = "Automatically Failed Save due to " + failReason;
        }

        let result = {
            save: saved,
            tip: saveTip,
        }
        return result;
    }


    const changeGraphic = (tok,prev) => {
        let model = ModelArray[tok.id];
        if (model) {
            _.each(model.squares,square => {
                let index = MapArray[square].tokenIDs.indexOf(tok.id);
                if (index > -1) {
                    MapArray[square].tokenIDs.splice(index,1);
                }
            })
            model.squares = ModelSquares(model);
            log(model.name + ' is moving');
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
        let model = ModelArray[obj.get("id")];
        if (model) {
            model.Destroy();
        }
    }

    const changePage = () => {
        LoadPage();
        BuildMap();
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
            case '!Spell':
                Spell(msg);
                break;
            case '!CastSpell':
                CastSpell(msg);
                break;
            case '!Attack':
                Attack(msg);
                break;
            case '!TokenInfo':
                TokenInfo(msg);
                break;
            case '!TestCone':
                TestCone(msg);
                break;

//Saves

//Skill Tests






        }
    };




    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('destroy:graphic',destroyGraphic);
        on('add:graphic',addGraphic);
        on('change:graphic',changeGraphic);
        on('change:campaign:playerpageid',changePage);


    };
    on('ready', () => {
        log("===> CoS <===");
        log("===> Software Version: " + version + " <===");
        LoadPage();
        BuildMap();
        BuildArrays();
        registerEventHandlers();
        sendChat("","API Ready")
        log("On Ready Done")
    });
    return {
        // Public interface here
    };






})();


