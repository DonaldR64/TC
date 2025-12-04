//on change turnorder check with this routine
//start this routine when macro fired also

const StartCombat = () => {
    //api macro feeds in here and starts combat
    //add in all NPCs, sort turn order, then go to the combat routine
    if (Campaign().get("turnorder") == "") {
        turnorder = [];
    } else {
        turnorder = JSON.parse(Campaign().get("turnorder"));
    }
    _.each(ModelArray,model => {
        let item = turnorder.filter(item => item.id === model.id);
        if (!item) {
            let total = D20(0) + model.initBonus;
            turnorder.push({
                _pageid:    model.token.get("_pageid"),
                id:         model.id,
                pr:         total,
            })
        }
    })
    turnorder.sort((a,b) => b.pr - a.pr);
    Campaign().set("turnorder", JSON.stringify(turnorder));
    state.DnD.combatOn = true;
    Combat();
}


const Combat = () => {
    if (state.DnD.combatOn === false) {return};
    turnorder = JSON.parse(Campaign().get("turnorder"));
    let currentTurnItem = turnorder[0];
    let id = currentTurnItem.id;
    let model = ModelArray[id];
    //ping model's token
    







}