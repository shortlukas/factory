function genTerrain(start, chunk, chunk_width, chunk_height) {
    chunk[start] = 1;
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
            const g = getDist(start, current, chunk_width);
            if(r < 0 + g/3) {continue}
            let n = getNeighbor(current, d.x, d.y, chunk_width, chunk_height);
            if(n!==false && !closed.has(n) && !open.includes(n)) {
                open.push(n);
                chunk[n] = 1;
            }
        }
        closed.add(current);
    }
}

// For now, single chunk, no crossing into other chunks
function getNeighbor(start, dx, dy, chunk_width, chunk_height) {
    const p = getPos(start, chunk_width);       //Position of the origin
    const pn = {x: p.x+dx, y: p.y+dy};          //Position of the neighbor
    if(pn.x < 0 || pn.y < 0 ||pn.x >= chunk_width || pn.y >= chunk_height) {return false}  //If on a border, return false
    
    return getIndex(pn, chunk_width, chunk_height);
}

function getPos(index, chunk_width) {
    return {x: index % chunk_width, y: (index - index % chunk_width)/chunk_width}
}

function getIndex(pos, chunk_width, chunk_height) {
    if(pos.x < 0 || pos.y < 0 || pos.x >= chunk_width || pos.y >= chunk_height) {return false}
    else {return pos.x + pos.y * chunk_width}
}

//Taking indexes, returning num
function getDist(a, b, chunk_width) {
    const pa = getPos(a, chunk_width);
    const pb = getPos(b, chunk_width);
    const dx = pb.x - pa.x;
    const dy = pb.y - pa.y;
    return Math.hypot(dx, dy);
}

function genHeights(chunk, chunk_width, chunk_height) {
    let start = 100 + Math.floor(Math.random() * 10);
    for(let i = 0; i < chunk_width * chunk_height; i++) {
        const p1 = getNeighbor(i, -1, 0, chunk_width, chunk_height); //Neighbor to the left
        const p2 = getNeighbor(i, 0, -1, chunk_width, chunk_height);  //Neighbor to the top
        
        let parent = (p1!== false && p2!== false ? (chunk.h1[p1]+chunk.h1[p2])/2 : (p1==false&&p2!==false? chunk.h1[p2] : (p2==false&&p1!==false ? chunk.h1[p1] : start)));
        //console.log(p1, p2, parent, i);
        
        chunk.h1[i] = parent - (Math.random() * 30) + 15;
        console.log(i, p1, p2, chunk.h1[i], parent)
    }
}

export { genTerrain , genHeights };