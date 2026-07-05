import { genTerrain , genHeights } from "./terrain/utils.js";
import { Tile } from "./Tile.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let mousex = 0;
let mousey = 0;
let hover = 0;

const tile_width = 50;
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
    && mousex < world_width*tile_width && mousey < world_height*(tile_width+tile_gap)          //Not too far down and right
    && mousex < hx + tile_width && mousey < hy + tile_width)                        //Not in the gaps
        {hover = getIndex([hx/full_tile, hy/full_tile])}
    else {hover = -1}
});
document.addEventListener("mousedown", () => {
    if(hover >= 0) {genTerrain(hover, world, world_width, world_height);}
});

const world_width = 8;
const world_height = 8;

//Initialize chunk
let world = {
    h1: new Uint8Array(world_width * world_height)
}
genHeights(world, world_width, world_height);
console.log(world);

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
}

function getPos(i) {
    return [i % world_width,(i - i % world_width)/world_height];
}

function getIndex([x, y]) {
    return x + y * world_width;
}
function renderTerrain() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    for(let i = 0; i < world_width*world_height; i++) {
        
        let v = world.h1[i] *1.5;
        let p = getPos(i);
        let x = p[0]*full_tile;
        let y = p[1]*full_tile;
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        if(hover == i) {ctx.fillStyle = "rgba(146, 36, 36, 0.5)"}
        ctx.fillRect(x, y, tile_width, tile_width);
    }
}
function keyDownHandler(e) {
    switch(e.key.toLowerCase()) {
        
    }
}
function keyUpHandler(e) {
    switch(e.key.toLowerCase()) {
        
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