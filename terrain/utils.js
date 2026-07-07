function genTerrain(start, chunk, chunk_width, chunk_height) {
    // chunk[start] = 1;
    // let open = [];
    // let closed = new Set();
    // open.push(start);

    // const dirs = [
    //     {x: -1, y: 0},
    //     {x: 1, y: 0},
    //     {x: 0, y: 1},
    //     {x: 0, y: -1},
    // ];
    // let steps = 0;
    // while(open.length > 0) {
    //     steps ++;
    //     open.sort((a, b) => a - b);
    //     let current = open.shift();
    //     for(let d of dirs) {
    //         const r = Math.random().toFixed(3);
    //         const g = getDist(start, current, chunk_width);
    //         if(r < 0 + g/3) {continue}
    //         let n = getNeighbor(current, d.x, d.y, chunk_width, chunk_height);
    //         if(n!==false && !closed.has(n) && !open.includes(n)) {
    //             open.push(n);
    //             chunk[n] = 1;
    //         }
    //     }
    //     closed.add(current);
    // }
}

//Returns the value at the tile, not the index in order for cross chunk neighbors
function getNeighbor(start, dx, dy, index, world, world_width, world_height, chunk_width, chunk_height) {
    const p = getPos(start, chunk_width);  
    const pn = {x: p.x+dx, y: p.y+dy}; //Position of the neighbor  
    const c = getPos(index, world_width) //Position of this chunk
    let nx = 0;
    let ny = 0;
    //{5, 1}, 1, 0, 9
    if(pn.x < 0 && c.x > 0) {pn.x = chunk_width-1; nx = -1} else if(pn.x < 0) {return false}
    if(pn.y < 0 && c.y > 0) {pn.y = chunk_height-1; ny = -1} else if(pn.y < 0) {return false}
    if(pn.x >= chunk_width && c.x < world_width-1) {pn.x = 0; nx = 1} else if(pn.x >= chunk_width) {return false}
    if(pn.y >= chunk_height && c.y < world_height-1) {pn.y = 0; ny = 1} else if(pn.y >= chunk_height) {return false}
    let chunk = getChunk(c, nx, ny, world, world_width, world_height);
    let index2 = getIndex(pn, chunk_width, chunk_height);
    return chunk.h1[index2];
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

function genHeights(chunk, index, world, world_width, world_height, chunk_width, chunk_height) {
    let start = Math.floor(Math.random() * 200);
    for(let i = 0; i < chunk_width * chunk_height; i++) {
        const p1 = getNeighbor(i, -1, 0, index, world, world_width, world_height, chunk_width, chunk_height); //Neighbor to the left
        const p2 = getNeighbor(i, 0, -1, index, world, world_width, world_height, chunk_width, chunk_height);  //Neighbor to the top
        let parent = (p1!== false && p2!== false ? (p1+p2)/2 : (p1==false&&p2!==false? p2 : (p2==false&&p1!==false ? p1 : start)));
        let dif = 40;
        let r = parent - (Math.random() * dif) + (dif/2);
        if(r <= 0) {r = 1}
        if(r >= 200) {r = 200;}
        chunk.h1[i] = r;
    }
}

function getChunk(start, dx, dy, world, world_width, world_height) {
    let p = start;
    let pn = {x: p.x + dx,y: p.y + dy};
    if(pn.x < 0 || pn.y < 0 || pn.x >= world_width || pn.y >= world_height) {return 3}
   
    return world[getIndex(pn, world_width, world_height)];
}

export { genTerrain , genHeights , getNeighbor };