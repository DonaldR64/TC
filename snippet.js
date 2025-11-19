const EndLine = (start,end,length) => {
    //produces a line representing end of Cone of length x, using a start point (caster) and end pt (target)
    let distance = ((length/2) / pageInfo.scaleNum) * 70;
    let p0 = MapArray[start].centre;
    let p1 = MapArray[end].centre;
    //for cones, width = length
    let m0 = (p1.y - p0.y)/(p1.x - p0.x);
    let p2,p3;


    if (m0 === 0) {
        //line is horizontal, so perp is vertical
        p2 = new Point(p0.x,p0.y + distance);
        p3 = new Point(p0.x,p0.y - distance);
    } else {
        let m1 = -1/m0;
        let b1 = p1.y - (m1 * p1.x);
        p2 = findPointOnLine(p1,m1,b1,distance,1);
        p3 = findPointOnLine(p1,m1,b1,distance,-1);
    }

    let index2 = p2.toIndex();
    let index3 = p3.toIndex();

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
    let areaIndexes = [];
    for (let i=0;i<endLine.length;i++) {
        let line = Line(start,endLine(i));
        for (j=0;j<line.length;j++) {
            let index = line[j];
            let dist = MapArray[start].distance(MapArray[index]);
            if (dist <= sqL) {
                areaIndexes.push(index);
            }
        }
    }
    areaIndexes = [...new Set(areaIndexes)];
    return areaIndexes;
}