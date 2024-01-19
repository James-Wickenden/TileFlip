'use strict';
let grid;
let canvas;
let mouseX, mouseY = -1;
let tile_width;
let grid_size = 5;

paper.install(window);

function setUpBoard(grid_size) 
{
    let tilemap = Array(grid_size).fill().map(() => Array(grid_size).fill([]));
    let canvas = document.getElementById('gridCanvas');

    let grid_width = canvas.width;
    let tile_width = grid_width / grid_size
    paper.setup(canvas);

    for (var i = 0; i < grid_size; i++) {
        for (var j = 0; j < grid_size; j++) {
            let rect = new Rectangle(i * tile_width, j * tile_width , tile_width, tile_width);
            tilemap[i][j] = new Path.Rectangle(rect);
            tilemap[i][j].fillColor = 'red';
            tilemap[i][j].strokeColor = 'black';
        }
    }

    console.log(tilemap);

    return [tilemap, tile_width, canvas];
};

window.onload = function() {
	let cfg = setUpBoard(grid_size);
    grid = cfg[0];
    tile_width = cfg[1];
    canvas = cfg[2];
};

function handleKeyDown(event) {
    //console.log(event);
    //console.log(mouseX);
    //console.log(mouseY);
    console.log(grid);
    let canvas = document.getElementById('gridCanvas');
    let rect = canvas.getBoundingClientRect();
    let position_on_canvas = [mouseX - rect.left, mouseY - rect.top];
    let tile_on_canvas = [Math.floor(position_on_canvas[0]/tile_width), 
                          Math.floor(position_on_canvas[1]/tile_width)];

    
    if (tile_on_canvas[0] < grid_size && tile_on_canvas[1] < grid_size) {
        console.log(tile_on_canvas);
        console.log(grid);
        grid[tile_on_canvas[0]][tile_on_canvas[1]].fillColor = 'green';
    }
};

document.addEventListener('keydown', handleKeyDown);

function handleMouseMove(event) {
    event = event || window.event;  
    mouseX = event.clientX;
    mouseY = event.clientY;
};

document.onmousemove = handleMouseMove;