summonToken = function(character,left,top,size) {
    if (!size) {size = 70};
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
                size: 1,
            },
            "Brown Bear": {
                cID: "-Odyv5HzmAOpBiY_xqLO",
                size: 2,
            },
            "Dire Wolf": {
                cID: "-OdyaMtaDE-mfvTYRU-r",
                size: 2,     
            }
        },

    }

    SetupCard(model.name,"Wild Shape",model.displayScheme);

    if (model.race.includes(shape.toLowerCase())) {
        outputCard.body.push("Already in that Form");
        PrintCard();
        return;
    }

    let cID = shapes[cName][shape].cID;
    let newChar = getObj("character", cID);
    let size = shapes[cName][shape].size;

    let newTokenID = summonToken(newChar,model.token.get("left") - 35,model.token.get("top") - 35,size);

log(ModelArray[newTokenID])

    if (shape !== "Human") {
        //set hp to max


        PlaySound("Growl");
    }

//initiatives

    outputCard.body.push("Wild Shape to " + shape);
    PrintCard();



}