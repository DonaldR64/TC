
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
    if (!state.DnD.combatOn || state.DnD.combatOn === false) {return};
    //check if stuff from prev. models turn to do - if so do that before advancing
    if (state.DnD.lastTurnInfo) {
        DoEndTurnThings(state.DnD.lastTurnInfo);
        state.DnD.lastTurnInfo = {};
    }
    //advance
    turnorder = JSON.parse(Campaign().get("turnorder"));
    let currentTurnItem = turnorder[0];
    let id = currentTurnItem.id;
    let model = ModelArray[id];
    //ping model's token
    sendPing(model.token.get("left"),model.token.get("top"),Campaign().get("playerpageid"),null,true);
    SetupCard(model.name,"Turn",model.displayScheme);
    //check for stuff that happens at start of turn
    StartTurnThings(model);
    PrintCard();
    //check for stuff that happens at end of turn, place into state to come out at next inititiave
    CheckEndTurnThings(model);
}

const EndCombat = () => {
    //also can come here if cancel turn order ???
    let turnorder = [];
    Campaign().set("turnorder", JSON.stringify(turnorder));
    state.DnD.combatOn = false;
}