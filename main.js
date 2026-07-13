import { 
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
    getPos ,
    getGlobalIndexFromCode , 
    getCodeFromGlobalIndex
} from "./terrain/utils.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let mouse = {
    x: 0,
    y: 0
}
let hover = {
    x: 20,
    y: 20,
    z: 100
};

let panx = 0;
let pany = 0;
//let zoom = 1;

let panleft = false;
let panright = false;
let panup = false;
let pandown = false;

let zoom = 5;

const tile_width = 30*zoom;
const tile_height = 15*zoom;

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("keypress", keyPressHandler);
document.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});
document.addEventListener("mousedown", () => {
    let gIndex = getGlobalIndex({x:Math.floor(hover.x), y:Math.floor(hover.y)}, world);
    updateTile(hover.z + 30, gIndex.i, world.chunks[gIndex.c], world);
});

const chunk_width = 2;
const chunk_height = 2;

const world_width = 2;
const world_height = 2;

//Initialize chunk
let world = {
    chunks: [],
    width: world_width,
    height: world_height,
    chunk_width: chunk_width,
    chunk_height: chunk_height
};
for(let i = 0; i < world_width*world_height; i++) {
    let w = chunk_width;
    let h = chunk_height;
    if(i % world_width-1 == 0) {w += 1}
    if(i > (world_height-1)*2) {h += 1}
    let chunk = {
        width: w,
        height: h,
        x: i % world_width,
        y: (i - i % world_width) /world_height,
        h1: new Uint8Array(w*h),
        h2: new Uint8Array(w*h),
        v0: new Uint16Array(w*h),
        v2: new Uint16Array(w*h),
        v3: new Uint16Array(w*h),
        v4: new Uint16Array(w*h)
    }
    world.chunks.push(chunk);
    genHeights(i, chunk, world);
}
genCorners(world);

//last time
let lt = window.performance.now();

function step(timestamp) {
    //delta time
    let dt = (timestamp - lt) / 1000;
    dt = Math.min(dt, 0.1);
    lt = timestamp;
    draw(dt);
    requestAnimationFrame(step);
}

function draw(dt) {
    renderTerrain();
    update();
}

function update() {
    let nx = (mouse.x - panx*2 - canvas.clientWidth/2)/tile_width;
    let ny = (mouse.y - pany*2 +20)/tile_height;
    hover.x = nx + ny;
    hover.y = ny - nx;
    if(hover.x < 0) {hover.x = 0}
    if(hover.y < 0) {hover.y = 0}
    if(hover.x > (world.width)*world.chunk_width-1) {hover.x = (world.width)*world.chunk_width-1}
    if(hover.y > (world.height)*world.chunk_height-1) {hover.y = (world.height)*world.chunk_height-1}
    const gIndex = getGlobalIndex({x:Math.floor(hover.x),y:Math.floor(hover.y)}, world);
    if(gIndex !== undefined){hover.z = world.chunks[gIndex.c].h1[gIndex.i]};

    if(panleft) {panx -= 2}
    if(panright) {panx += 2}
    if(panup) {pany -= 1}
    if(pandown) {pany += 1}
    // for(let c = 0; c < world.length; c++) {
    //     for(let t = 0; t < chunk_width*chunk_height; t++) {
    //         let p = getGlobalPos(c, i, world);
    //         let dx = p.x - hover.x;
    //         let dy = p.y - hover.y;
    //         let dz = 0;
            
    //         let dist = Math.hypot(Math.hypot(dx*3, dy*3),dz) * 5;
    //         if(dist <= 0) {dist = 1}
    //         if(dist > 200) {dist = 200}
    //         let old = world[c].h1[t];
    //         world[c].h1[t] = old + ((201 - dist) - old)*0.04;
            
    //     }
    // }
    // world = genCorners(world, world_width, world_height, chunk_width, chunk_height);
}

function renderTerrain() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    for(let c = 0; c < world.chunks.length; c++) {
        let origin = convertTilePos({x: world.chunks[c].x, y: world.chunks[c].y}, panx, pany, canvas, world.chunk_width*tile_width, world.chunk_width*tile_height, {x: 0, y: 0});
        for(let i = 0; i < world.chunk_width*world.chunk_height; i++) {
            const gPos = getGlobalPos(c, i, world);
            const p = getPos(i, world.chunk_width, world.chunk_height);
            
            const data = getData(i, c, world);
            let v2 = getGlobalIndexFromCode(data.v2, world);
            let v3 = getGlobalIndexFromCode(data.v3, world);
            let v4 = getGlobalIndexFromCode(data.v4, world);
            console.log(c, i, p, v2, v3, v4);
            v2 = world.chunks[v2.c].h1[v2.i];
            v3 = world.chunks[v3.c].h1[v3.i];
            v4 = world.chunks[v4.c].h1[v4.i];
            let v0 = (data.h1+v2+v3+v4)/3;
            const t = convertTilePos(p, panx, pany, canvas, tile_width, tile_height, origin, data.h1);
            const t2 = convertTilePos({x:p.x+1,y:p.y}, panx, pany, canvas, tile_width, tile_height, origin, v2);
            const t3 = convertTilePos({x:p.x+1,y:p.y+1}, panx, pany, canvas, tile_width, tile_height, origin, v3);
            const t4 = convertTilePos({x:p.x,y:p.y+1}, panx, pany, canvas, tile_width, tile_height, origin, v4);
            const t0 = convertTilePos({x:p.x+0.5,y:p.y+0.5}, panx, pany, canvas, tile_width, tile_height, origin, v0);
            
            let tiles = [t0,t,t2,t3,t4,0,0,0];
            let vals = [v0,data.h1,v2,v3,v4,0,0,0,250,250,250,250];
            let faces = [[1,0,2],[2,0,3],[3,0,4],[4,0,1]];
            const onEdge1 = world.chunks[c].x*world.chunk_width + p.x >= world.width*world.chunk_width-1;
            const onEdge2 = world.chunks[c].y*world.chunk_height + p.y >= world.height*world.chunk_height-1;
            if(onEdge1 || onEdge2) {
                tiles[6] = convertTilePos({x:p.x+1,y:p.y+1}, panx, pany, canvas, tile_width, tile_height, origin, 0);
            }
            if(onEdge1) {
                tiles[5] = convertTilePos({x:p.x+1,y:p.y}, panx, pany, canvas, tile_width, tile_height, origin, 0);
                faces.push([2,5,6,3]);
            }
            if(onEdge2) {
                tiles[7] = convertTilePos({x:p.x,y:p.y+1}, panx, pany, canvas, tile_width, tile_height, origin, 0);;
                faces.push([3,6,7,4]);
            }
            //console.log(gPos)
            if(Math.floor(hover.x) == gPos.x && Math.floor(hover.y) == gPos.y) {
                let s = convertTilePos(p, panx, pany, canvas, tile_width, tile_height, origin, 250); 
                let s2 = convertTilePos({x:p.x+1,y:p.y}, panx, pany, canvas, tile_width, tile_height, origin, 250);
                let s3 = convertTilePos({x:p.x+1,y:p.y+1}, panx, pany, canvas, tile_width, tile_height, origin, 250);
                let s4 = convertTilePos({x:p.x,y:p.y+1}, panx, pany, canvas, tile_width, tile_height, origin, 250);
                tiles.push(s,s2,s3,s4);
                faces.push([8,9,10,11],[8,9,2,1],[9,10,3,2],[10,11,4,3],[11,8,1,4]);
            }
            for(let f = 0; f < faces.length; f++) {
                ctx.beginPath();
                ctx.moveTo(tiles[faces[f][0]].x, tiles[faces[f][0]].y);
                for(let n = 1; n < faces[f].length; n++) {
                    ctx.lineTo(tiles[faces[f][n]].x, tiles[faces[f][n]].y);
                }
                ctx.closePath();
                let avg = (vals[faces[f][0]]+vals[faces[f][1]]+vals[faces[f][2]])/3;
                ctx.fillStyle = `rgb(${avg},${avg},${avg})`;
                if(Math.floor(hover.x) == gPos.x && Math.floor(hover.y) == gPos.y) {ctx.fillStyle = "rgba(146, 36, 36, 1)"}
                if(f > (onEdge1 && onEdge2 ? 5 : (onEdge1 || onEdge2 ? 4 : 3))) {ctx.fillStyle = "rgba(146, 36, 36, 0.2)"}
                ctx.fill();
            }
            
            //console.log(v, v2, v3, v4, t2, t3, t4)
            // ctx.beginPath();
            // ctx.moveTo(t.x, t.y);                          // top point
            // ctx.lineTo(t.x + tile_width/2, t.y + tile_height/2);    // right point
            // ctx.lineTo(t.x + tile_width/2, t.y + tile_height*2);
            // ctx.lineTo(t.x, t.y + tile_height*2.5);                     // bottom point
            // ctx.lineTo(t.x - tile_width/2, t.y + tile_height*2);
            // ctx.lineTo(t.x - tile_width/2, t.y + tile_height/2);    // left point

            // ctx.lineTo(t2.x, t2.y);
            // ctx.lineTo(t3.x, t3.y);
            // ctx.lineTo(t4.x, t4.y);
            // ctx.closePath();
            
            
        }
    }
}

function keyDownHandler(e) {
    switch(e.key.toLowerCase()) {
        case "a":
            panleft = true;
            break;
        case "d":
            panright = true;
            break;
        case "w":
            panup = true;
            break;
        case "s":
            pandown = true;
            break;
    }
}
function keyUpHandler(e) {
    switch(e.key.toLowerCase()) {
        case "a":
            panleft = false;
            break;
        case "d":
            panright = false;
            break;
        case "w":
            panup = false;
            break;
        case "s":
            pandown = false;
            break;
    }
}
function keyPressHandler(e) {
    switch(e.key.toLowerCase()) {
        case "c":
            break;
    }
}

//genTerrain();
requestAnimationFrame(step);