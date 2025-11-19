    const ModelSquares = (model) => {
        let indexes = [];
        let c = new Point(model.token.get("left"),model.token.get("top"));
        let w = model.token.get("width");
        let h = model.token.get("height");
        //define corners, pull in to be centres
        let tL = new Point(c.x - w/2 + 35,c.y - h/2 + 35);
        let bR = new Point(c.x + w/2 - 35,c.y + h/2 - 35);
        for (let i = tL.x;i<= bR.x;i += 70) {
            for (let j = tL.y;y <= bR.y; j += 70) {
                let index = (new Point(i,j)).toIndex();
                indexes.push(index);
            }
        }
        return indexes;
    }