function genTerrain(start, world, world_width, world_height) {
    world[start] = 1;
    let open = [];
    let closed = new Set();
    open.push(start);

    const dirs = [
        {x: -1, y: 0},
        {x: 1, y: 0},
        {x: 0, y: 1},
        {x: 0, y: -1},
    ];
    let steps = 0;
    while(open.length > 0) {
        steps ++;
        open.sort((a, b) => a - b);
        let current = open.shift();
        for(let d of dirs) {
            const r = Math.random().toFixed(3);
            const g = getDist(start, current, world_width);
            if(r < 0 + g/3) {continue}
            let n = getNeighbor(current, d.x, d.y, world, world_width, world_height);
            if(n!==false && !closed.has(n) && !open.includes(n)) {
                open.push(n);
                world[n] = 1;
            }
        }
        closed.add(current);
    }
}

// For now, single chunk, no crossing into other chunks
function getNeighbor(start, dx, dy, world, world_width, world_height) {
    const p = getPos(start, world_width);       //Position of the origin
    const pn = {x: p.x+dx, y: p.y+dy};          //Position of the neighbor
    if(pn.x < 0 || pn.y < 0 ||pn.x >= world_width || pn.y >= world_height) {return false}  //If on a border, return false
    console.log(pn);
    return getIndex(pn, world_width, world_height);
}

function getPos(index, world_width) {
    return {x: index % world_width, y: (index - index % world_width)/world_width}
}

function getIndex(pos, world_width, world_height) {
    if(pos.x < 0 || pos.y < 0 || pos.x >= world_width || pos.y >= world_height) {return false}
    else {return pos.x + pos.y * world_width}
}

//Taking indexes, returning num
function getDist(a, b, world_width) {
    const pa = getPos(a, world_width);
    const pb = getPos(b, world_width);
    const dx = pb.x - pa.x;
    const dy = pb.y - pa.y;
    return Math.hypot(dx, dy);
}

export { genTerrain };