import { genTerrain , genHeights , getNeighbor } from "./terrain/utils.js";
import { Tile } from "./Tile.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let mousex = 0;
let mousey = 0;
let hover = {
        x: 20,
        y: 20,
        z: 100
    };

let panx = 0;
let pany = 0;
let zoom = 1;

let panleft = false;
let panright = false;
let panup = false;
let pandown = false;

const tile_width = 30;
const tile_height = 15;
const tile_gap = 0;
const full_tile = tile_width + tile_gap;

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("keypress", keyPressHandler);
document.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mousex = e.clientX - rect.left;
    mousey = e.clientY - rect.top;

    let nx = (mousex - panx*2 - canvas.clientWidth/2)/tile_width;
    let ny = (mousey - pany*2 - 50)/tile_height;
    hover = {
        x: nx + ny,
        y: ny - nx,
        z: 100
    }
});
// document.addEventListener("mousedown", () => {
//     if(hover >= 0) {genTerrain(hover, chunk, chunk_width, chunk_height);}
// });

const chunk_width = 8;
const chunk_height = 8;

const world_width = 4;
const world_height = 4;

//Initialize chunk
let world = [];
for(let i = 0; i < world_width*world_height; i++) {
    let chunk = {
        x: i % world_width,
        y: (i - i % world_width) /world_height,
        h1: new Uint8Array(chunk_width * chunk_height)
    }
    world.push(chunk);
    genHeights(chunk, i, world, world_width, world_height, chunk_width, chunk_height);
    
}

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
    if(panleft) {panx -= 2}
    if(panright) {panx += 2}
    if(panup) {pany -= 1}
    if(pandown) {pany += 1}
    // for(let c = 0; c < world.length; c++) {
    //     for(let t = 0; t < chunk_width*chunk_height; t++) {
    //         let p = getPos(t, chunk_width, chunk_height);
    //         let w = getPos(c, world_width, world_height);
    //         p.x += w.x*chunk_width;
    //         p.y += w.y*chunk_height;
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
}

function getPos(i, chunk_width, chunk_height) {
    return {x: i % chunk_width, y: (i - i % chunk_width)/chunk_height};
}

function getIndex(p, chunk_width) {
    return p.x + p.y * chunk_width;
}
function renderTerrain() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    for(let c = 0; c < world.length; c++) {
        let o = convertTilePos({x: world[c].x, y: world[c].y}, chunk_width*tile_width, chunk_width*tile_height, {x: 0, y: 0});
        for(let i = 0; i < chunk_width*chunk_height; i++) {
            let v = world[c].h1[i] *1;
            let p = getPos(i, chunk_width, chunk_height);
            let t = convertTilePos(p, tile_width, tile_height, o, v);
            //console.log(p, c, world);
            let v2 = getNeighbor(i, 1, 0, c, world, world_width, world_height, chunk_width, chunk_height);
            let v3 = getNeighbor(i, 1, 1, c, world, world_width, world_height, chunk_width, chunk_height);
            let v4 = getNeighbor(i, 0, 1, c, world, world_width, world_height, chunk_width, chunk_height);
            // if(v2 === false) {v2 = v}
            // if(v3 === false) {v3 = v}
            // if(v4 === false) {v4 = v}
            let v0 = (v+v2+v3+v4)/4;
            let t2 = convertTilePos({x:p.x+1,y:p.y}, tile_width, tile_height, o, v2);
            let t3 = convertTilePos({x:p.x+1,y:p.y+1}, tile_width, tile_height, o, v3);
            let t4 = convertTilePos({x:p.x,y:p.y+1}, tile_width, tile_height, o, v4);
            let t0 = convertTilePos({x:p.x+0.5,y:p.y+0.5}, tile_width, tile_height, o, v0);
            
            //console.log(v, v2, v3, v4, t2, t3, t4)
            ctx.beginPath();
            ctx.moveTo(t.x, t.y);                          // top point
            // ctx.lineTo(t.x + tile_width/2, t.y + tile_height/2);    // right point
            // ctx.lineTo(t.x + tile_width/2, t.y + tile_height*2);
            // ctx.lineTo(t.x, t.y + tile_height*2.5);                     // bottom point
            // ctx.lineTo(t.x - tile_width/2, t.y + tile_height*2);
            // ctx.lineTo(t.x - tile_width/2, t.y + tile_height/2);    // left point

            // ctx.lineTo(t2.x, t2.y);
            // ctx.lineTo(t3.x, t3.y);
            // ctx.lineTo(t4.x, t4.y);
            ctx.lineTo(t0.x,t0.y);
            ctx.lineTo(t2.x,t2.y);
            ctx.closePath();
            let av1 = (v+v0+v2)/3;
            ctx.fillStyle = `rgb(${av1},${av1},${av1})`;
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(t2.x,t2.y);
            ctx.lineTo(t0.x,t0.y);
            ctx.lineTo(t3.x,t3.y);
            ctx.closePath();
            let av2 = (v2+v0+v3)/3;
            ctx.fillStyle = `rgb(${av2},${av2},${av2})`;
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(t3.x,t3.y);
            ctx.lineTo(t0.x,t0.y);
            ctx.lineTo(t4.x,t4.y);
            ctx.closePath();
            let av3 = (v3+v0+v4)/3;
            ctx.fillStyle = `rgb(${av3},${av3},${av3})`;
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(t4.x,t4.y);
            ctx.lineTo(t0.x,t0.y);
            ctx.lineTo(t.x,t.y);
            ctx.closePath();
            let av4 = (v3+v0+v)/3;
            ctx.fillStyle = `rgb(${av4},${av4},${av4})`;
            ctx.fill();
            
            if(hover == i) {ctx.fillStyle = "rgba(146, 36, 36, 0.5)"}
            //ctx.fillRect(x, y, tile_width, tile_width);
        }
    }
}
function convertTilePos(p, w, h, o, v = 0) {
    let x = (o.x) + (panx) + (canvas.clientWidth/4) + (p.x*(w/2))+(-p.y*(w/2));
    let y = (o.y) + (pany) + (canvas.clientHeight/2 + (-250)) + (p.x*(h/2))+(p.y*(h/2)) - (v/2);
    return {x: x, y: y}
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