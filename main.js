import { genTerrain , genHeights , getNeighbor } from "./terrain/utils.js";
import { Tile } from "./Tile.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let mousex = 0;
let mousey = 0;
let hover = 0;

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
    let hx = (mousex - mousex % full_tile)
    let hy = (mousey - mousey % full_tile);
    if(mousex >= 0 && mousey >= 0                                                   //Not too far up and left
    && mousex < chunk_width*tile_width && mousey < chunk_height*(tile_width+tile_gap)          //Not too far down and right
    && mousex < hx + tile_width && mousey < hy + tile_width)                        //Not in the gaps
        {hover = getIndex({x:hx/full_tile, y:hy/full_tile}, chunk_width)}
    else {hover = -1}
});
document.addEventListener("mousedown", () => {
    if(hover >= 0) {genTerrain(hover, chunk, chunk_width, chunk_height);}
});

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
    const p = getPos(i, world_width, world_height);  
    const pn1 = {x: p.x-1, y: p.y};
    const pn2 = {x: p.x, y: p.y-1};
    let chunkn1 = world[getIndex(pn1, world_width)];
    let chunkn2 = world[getIndex(pn2, world_width)];
    genHeights(chunk, chunkn1, chunkn2, chunk_width, chunk_height);
    world.push(chunk);
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
}

function getPos(i, chunk_width, chunk_height) {
    return {x: i % chunk_width, y: (i - i % chunk_width)/chunk_height};
}

function getIndex(p, chunk_width) {
    return p.x + p.y * chunk_width;
}
function renderTerrain() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    for(let chunk of world) {
        let o = convertTilePos({x: chunk.x, y: chunk.y}, chunk_width*tile_width, chunk_width*tile_height, {x: 0, y: 0});
        for(let i = 0; i < chunk_width*chunk_height; i++) {
            let v = chunk.h1[i] *1;
            let p = getPos(i, chunk_width, chunk_height);
            let t = convertTilePos(p, tile_width, tile_height, o, v);
            // let x = panx + canvas.clientWidth/2 - tile_width/2 +(p.x*(full_tile/2))+(-p.y*(full_tile/2));
            // let y = pany + canvas.clientHeight/2 - (tile_width/2)*chunk_width + (p.x*(h/2))+(p.y*(h/2)) - v/5 + 100;
            ctx.beginPath();
            ctx.moveTo(t.x, t.y);                          // top point
            ctx.lineTo(t.x + tile_width/2, t.y + tile_height/2);    // right point
            ctx.lineTo(t.x + tile_width/2, t.y + tile_height);
            ctx.lineTo(t.x, t.y + tile_height*1.5);                     // bottom point
            ctx.lineTo(t.x - tile_width/2, t.y + tile_height);
            ctx.lineTo(t.x - tile_width/2, t.y + tile_height/2);    // left point
            ctx.closePath();
            ctx.fillStyle = `rgb(${v},${v},${v})`;
            ctx.fill();
            if(hover == i) {ctx.fillStyle = "rgba(146, 36, 36, 0.5)"}
            //ctx.fillRect(x, y, tile_width, tile_width);
        }
    }
}
function convertTilePos(p, w, h, o, v = 0) {
    let x = (o.x) + (panx) + (canvas.clientWidth/4) + (p.x*(w/2))+(-p.y*(w/2));
    let y = (o.y) + (pany) + (canvas.clientHeight/2 + (-250)) + (p.x*(h/2))+(p.y*(h/2)) - (v/5);
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