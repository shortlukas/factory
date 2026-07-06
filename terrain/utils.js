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
function getNeighbor(start, dx, dy, chunk, chunkn1, chunkn2, chunk_width, chunk_height) {
    let ochunk = 0;     // Origin Chunk, 0 meaning the regular chunk, 1 is chunkn1, 2 is chunkn2
    const p = getPos(start, chunk_width);  
    const pn = {x: p.x+dx, y: p.y+dy};          //Position of the neighbor
    if(pn.x < 0 && chunkn1) {
        pn.x = chunk_width-1;
        ochunk = 1;
    } else if (pn.x < 0) {return false}
    if(pn.y < 0 && chunkn2) {
        pn.y = chunk_height-1;
        ochunk = 2;
    } else if (pn.y < 0) {return false}  //If on a border, return false
    let index = getIndex(pn, chunk_width, chunk_height);
    
    return {i: index, o: ochunk};
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

function genHeights(chunk, chunkn1, chunkn2, chunk_width, chunk_height) {
    let start = 100 + Math.floor(Math.random() * 10);
    for(let i = 0; i < chunk_width * chunk_height; i++) {
        const p1 = getNeighbor(i, -1, 0, chunk, chunkn1, chunkn2, chunk_width, chunk_height); //Neighbor to the left
        const p2 = getNeighbor(i, 0, -1, chunk, chunkn1, chunkn2, chunk_width, chunk_height);  //Neighbor to the top
        let v1 = 0;
        let v2 = 0;
        switch(p1.o) {
            case 0: v1 = chunk.h1[p1.i]; break;
            case 1: v1 = chunkn1.h1[p1.i]; break;
            case 2: v1 = chunkn2.h1[p1.i]; break;
        }
        switch(p2.o) {
            case 0: v2 = chunk.h1[p2.i]; break;
            case 1: v2 = chunkn1.h1[p2.i]; break;
            case 2: v2 = chunkn2.h1[p2.i]; break;
        }
        // if(p1== false || p2 == false) {console.log(p1, p2)}
        let parent = (p1!== false && p2!== false ? (v1+v2)/2 : (p1==false&&p2!==false? v2 : (p2==false&&p1!==false ? v1 : start)));
        let dif = 40;
        let r = parent - (Math.random() * dif) + (dif/2);
        if(r <= 0) {r = 1}
        if(r >= 200) {r = 200;}
        chunk.h1[i] = r;
    }
}

export { genTerrain , genHeights , getNeighbor };