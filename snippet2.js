

    const SpellTarget = (caster,spellName,level,img,dim) => {
        let abilArray = findObjs({_type: "ability", _characterid: '-Oe8qdnMHHQEe4fSqqhm'});
        //clear old abilities
        for(let a=0;a<abilArray.length;a++) {
            abilArray[a].remove();
        } 
        let action = "!AreaSpell2;" + spellName + ";" + caster.id + ";" + level;
        AddAbility("Cast " + spellName,action,charID);
        if (isNaN(dim)) {
            if (dim.includes("Level")) {
                if (dim.includes("*")) {
                    dim = level * parseInt(dim);
                }
            }
        }
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
