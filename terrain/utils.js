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
function getNeighbor(start, dx, dy, chunk, world) {
    console.log(start, chunk);
    const this_chunk = world.chunks[chunk];
    console.log(this_chunk);
    const p = getPos(start, world.chunk_width);  
    const pn = {x: p.x+dx, y: p.y+dy}; //Position of the neighbor  
    const c = getPos(chunk, world.width) //Position of this chunk
    let nx = 0;
    let ny = 0;
    if(pn.x < 0 && c.x > 0) {pn.x = this_chunk.width-1; nx = -1} else if(pn.x < 0) {return false}
    if(pn.y < 0 && c.y > 0) {pn.y = this_chunk.height-1; ny = -1} else if(pn.y < 0) {return false}
    if(pn.x >= this_chunk.width && c.x < world.width-1) {pn.x = 0; nx = 1} else if(pn.x >= this_chunk.width) {return false}
    if(pn.y >= this_chunk.height && c.y < world.height-1) {pn.y = 0; ny = 1} else if(pn.y >= this_chunk.height) {return false}
    let chunkn = getIndex({x:c.x+nx,y:c.y+ny},world.width,world.height);
    const thisChunk = world.chunks[chunkn];
    let indexn = getIndex(pn, thisChunk.width, thisChunk.height);
    
    return getData(indexn, chunkn, world);
}

function getData(index, chunk, world) {
    const pos = getPos(chunk, world.width);
    const src = world.chunks[chunk];
    return {
        i: index,
        c: chunk,
        h1: src.h1[index], 
        h2: src.h2[index],
        v1: src.v1[index],
        v2: src.v2[index],
        v3: src.v3[index],
        v4: src.v4[index],
    }
}

function getPos(index, chunk_width) {
    return {x: index % chunk_width, y: (index - index % chunk_width)/chunk_width}
}

function getIndex(pos, chunk_width, chunk_height) {
    if(pos.x < 0 || pos.y < 0 || pos.x >= chunk_width || pos.y >= chunk_height) {return false}
    else {return pos.x + pos.y * chunk_width}
}

//Taking indexes, returning num
function getDist(a, b) {
    return Math.hypot(a.x-b.x, a.y-b.y);
}

function genHeights(index, chunk, world) {
    let start = Math.floor(Math.random() * 200);
    for(let i = 0; i < world.chunk_width * world.chunk_height; i++) {
        const p1 = getNeighbor(i, -1, 0, index, world); //Neighbor to the left
        const p2 = getNeighbor(i, 0, -1, index, world);  //Neighbor to the top
        let parent = (p1!== false && p2!== false ? (p1.h1+p2.h1)/2 : (p1==false&&p2!==false? p2.h1 : (p2==false&&p1!==false ? p1.h1 : start)));
        let dif = 30;
        let r = vary(parent, dif);
        chunk.h1[i] = clamp(r, 1, 200);
    }
}

function vary(parent, dif) {
    return parent - (Math.random() * dif) + (dif/2);
}

function clamp(a, min, max) {
    let b = a;
    if(a < min) {b = min}
    if(a > max) {b = max}
    return b;
}

function genCorners(world) {
    for(let c = 0; c < world.chunks.length; c++) {
        for(let t = 0; t < world.chunk_width*world.chunk_height; t++) {
            const n = world.chunks[c].h1[t];
            let n1 = getNeighbor(t, -1, -1, c, world).h1;
            let n2 = getNeighbor(t, 0, -1, c, world).h1;
            let n3 = getNeighbor(t, 1, -1, c, world).h1;
            let n4 = getNeighbor(t, -1, 0, c, world).h1;
            let n5 = getNeighbor(t, 1, 0, c, world).h1;
            let n6 = getNeighbor(t, -1, 1, c, world).h1;
            let n7 = getNeighbor(t, 0, 1, c, world).h1;
            let n8 = getNeighbor(t, 1, 1, c, world).h1;
            let values = [];
            let corners = [[n1,n2,n,n4],[n2,n3,n5,n],[n4,n,n7,n6],[n,n5,n8,n7]];
            corners.map(set => set.filter(point => point !== undefined));
            for(let set of corners) {values.push(set.reduce((a, b) => a + b, 0)/set.length)}
            world.chunks[c].v1[t] = clamp(values[0], 1, 200);
            world.chunks[c].v2[t] = clamp(values[1], 1, 200);
            world.chunks[c].v3[t] = clamp(values[2], 1, 200);
            world.chunks[c].v4[t] = clamp(values[3], 1, 200);
        }
    }
    //console.log(world);
}

function convertTilePos(p, panx, pany, canvas, w, h, o, v = 0) {
    let x = (o.x) + (panx) + (canvas.clientWidth/4) + (p.x*(w/2))+(-p.y*(w/2));
    let y = (o.y) + (pany) + (canvas.clientHeight/2 + (-250)) + (p.x*(h/2))+(p.y*(h/2)) - (v/2);
    return {x: x, y: y}
}

function updateTile(value, index, chunk, world) {
    const chunkI = getIndex({x: chunk.x, y: chunk.y}, world.width, world.height);
    chunk.h1[index] = (value > 200 ? 200 : value);
    let open = [];
    let closed = new Set();
    let openSet = new Set();
    const p = getPos(index, world.chunk_width);
    let start = {v: chunk.h1[index], c: chunkI, i:index, x: p.x, y: p.y};
    open.push(start);
    openSet.add(`${chunkI}:${p.x},${p.y}`);

    const dirs = [
        {x: -1, y: 0},
        {x: 1, y: 0},
        {x: 0, y: 1},
        {x: 0, y: -1},
    ];

    let steps = 0;
    let dif = 20;
    const MAX_STEPS = 20000; // safety net so a bad distance calc can't ever hang the tab
    while(open.length > 0 && steps < MAX_STEPS) {
        steps ++;
        let current = open.shift();
        openSet.delete(`${current.c}:${current.x},${current.y}`);
        for(let d of dirs) {
            let sPos = getGlobalPos(start.i, start.c, world);
            let cPos = getGlobalPos(current.i, current.c, world);
            const g = getDist(sPos, cPos, world.chunk_width*world.width);
            const r = Math.random().toFixed(3) * 10;
            if(r + g > 15) {continue}

            let na = getNeighbor(current.i, d.x, d.y, current.c, world);
            if(na === false) {continue}

            let pos = getPos(na.i, world.chunk_width);
            let nkey = `${na.c}:${pos.x},${pos.y}`;

            if(!closed.has(nkey) && !openSet.has(nkey)) {
                let n = {v:na.h1, i: na.i, c: na.c, x: pos.x, y: pos.y};
                
                let newv = current.v - (Math.random() * dif);
                if(newv <= 0) {newv = 1}
                if(newv >= 200) {newv = 200;}
                if(n.v > newv) {continue};

                open.push(n);
                openSet.add(nkey);
                world.chunks[n.c].h1[n.i] = newv;
                n.v = newv;
            }
        }
        closed.add(`${current.c}:${current.x},${current.y}`);
    }
    if (steps >= MAX_STEPS) {
        console.warn('updateTile: hit MAX_STEPS safety cap, propagation may be incomplete');
    }
    genCorners(world);
}

function getGlobalPos(c, i, world) {
    const cp = getPos(c, world.width);   // which chunk, in chunk-grid coords
    const tp = getPos(i, world.chunk_width);    // which tile, in local coords
    return {
        x: cp.x * world.chunk_width + tp.x,
        y: cp.y * world.chunk_height + tp.y
    };
}

function getGlobalIndex(pos, world) {
    return {
        c: (pos.x - (pos.x % world.chunk_width))/world.chunk_width + ((pos.y - (pos.y % world.chunk_height))/world.chunk_height)*world.width,
        i: pos.x % world.chunk_width + (pos.y % world.chunk_height) * world.chunk_width
    }
}

export { 
    genTerrain , 
    genHeights , 
    genCorners, 
    getNeighbor , 
    convertTilePos , 
    updateTile , 
    getGlobalPos , 
    getGlobalIndex , 
    getData ,
    getIndex ,
    getPos 
};