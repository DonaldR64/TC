const ShowSpells = (msg) => {
    if (!msg.selected) {return};
    let model = ModelArray[msg.selected[0]._id];
    SetupCard(model.name,"Spells",model.displayScheme);
    //cantrips
    _.each(model.spells.cantrips,cantrip => {
        outputCard.body.push(cantrip.name);
    })



    for (let i=1;i<6;i++) {
        if (SpellSlots(model,i)){
            //show prepared spells for that level with a button





        }
    }



    PrintCard(); //? maybe make this a whisper to player +/- GM ?
}