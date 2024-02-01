'use strict';
let grid_target, grid_active;
let canvas_target, canvas_active;
let mouseX, mouseY = -1;
let tile_width;
let grid_size = 5;
let inversion_size = 1;
let key_locations = {};

paper.install(window);


function setUpBoard(grid_size) 
{
    let act_cvs = setUpCanvas("gridCanvas_active", grid_size);
    let tgt_cvs = setUpCanvas("gridCanvas_target", grid_size);

    return [act_cvs[0], tgt_cvs[1], act_cvs[1], act_cvs[2], tgt_cvs[2]];
};


function setUpCanvas(canvasName, grid_size) {
    let tilemap = Array(grid_size).fill().map(() => Array(grid_size).fill([]));
    let canvas = document.getElementById(canvasName);

    let grid_width = canvas.width;
    let tile_width = grid_width / grid_size;
    paper.setup(canvas);

    for (var i = 0; i < grid_size; i++) {
        for (var j = 0; j < grid_size; j++) {
            let rect = new Rectangle(i * tile_width, j * tile_width , tile_width, tile_width);
            tilemap[i][j] = new Path.Rectangle(rect);
            tilemap[i][j].fillColor = 'red';
            tilemap[i][j].strokeColor = 'black';
        }
    }

    return [tilemap, tile_width, canvas];
};


function invertTile(x, y, inversion_size)
{
    for (var i = -inversion_size; i <= inversion_size; i++) {
        for (var j = -inversion_size; j <= inversion_size; j++) {
            let invertedTile_x = x + i;
            let invertedTile_y = y + j;
            if (invertedTile_x < 0 || invertedTile_x >= grid_size) continue;
            if (invertedTile_y < 0 || invertedTile_y >= grid_size) continue;

            let tile = grid[invertedTile_x][invertedTile_y];
            if (tile.fillColor.green > 0) {
                tile.fillColor = 'red';
            }
            else {
                tile.fillColor = 'green';
            }
        }
    }
};


function handleKeyDown(event)
{
    if ((event.key < '1' || event.key > '9') && event.key != ' ') return;
    
    let canvas = document.getElementById('gridCanvas');
    let rect = canvas.getBoundingClientRect();
    let position_on_canvas = [mouseX - rect.left, mouseY - rect.top];
    let tile_on_canvas = [Math.floor(position_on_canvas[0]/tile_width), 
                          Math.floor(position_on_canvas[1]/tile_width)];
    
    if (tile_on_canvas[0] < 0 || tile_on_canvas[0] >= grid_size) return;
    if (tile_on_canvas[1] < 0 || tile_on_canvas[1] >= grid_size) return;

    if (event.key == ' ') {
        invertTile(tile_on_canvas[0], tile_on_canvas[1], 0);
    }
    else {
        key_locations[event.key] == [tile_on_canvas[0], tile_on_canvas[1]];
        invertTile(tile_on_canvas[0], tile_on_canvas[1], inversion_size);
    }
    

};
document.addEventListener('keydown', handleKeyDown);


function handleMouseMove(event)
{
    event = event || window.event;  
    mouseX = event.clientX;
    mouseY = event.clientY;
};
document.onmousemove = handleMouseMove;


window.onload = function()
{
	let cfg = setUpBoard(grid_size);
    grid_active = cfg[0];
    grid_target = cfg[1]
    tile_width = cfg[2];
    canvas_active = cfg[3];
    canvas_target = cfg[4];
};
