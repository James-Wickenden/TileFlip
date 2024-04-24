'use strict';
let grid_target, grid_active;
let canvas_target, canvas_active;
let tile_width;
let grid_size = 4;
let inversion_size = 1;
let key_locations = {};

paper.install(window);


function setUpBoard(grid_size) 
{
    let active_cfg = setUpCanvas("gridCanvas_active", grid_size);
    let target_cfg = setUpCanvas("gridCanvas_target", grid_size);

    return { 'active' : active_cfg, 'target' : target_cfg };
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

    return { 'tilemap' : tilemap, 'tile_width' : tile_width, 'canvas': canvas };
};


function testForEquatedBoards()
{
    let equality_flag = document.getElementById('equatedBoards');
    for (var i = 0; i < grid_size; i++) {
        for (var j = 0; j < grid_size; j++) {
            if (grid_active[i][j].fillColor.red !== grid_target[i][j].fillColor.red) {
                equality_flag.style.backgroundColor = 'red';
                equality_flag.innerHTML = 'Unequal Boards!';
                return;
            }
        }
    }
    equality_flag.style.backgroundColor = 'green';
    equality_flag.innerHTML = 'Equal Boards!';
    return;
};


function resetActive()
{
    console.log('resetting');
    for (var i = 0; i < grid_size; i++) {
        for (var j = 0; j < grid_size; j++) {
            if (grid_active[i][j].fillColor.red == 0) {
                grid_active[i][j].fillColor = 'red';
            }
        }
    }
    testForEquatedBoards()
};


function equateBoards()
{
    invertTile('gridCanvas_target', 2, 2, 1);
};


function invertTile(canvasName, x, y, inversion_size)
{
    let cur_grid;
    if (canvasName == 'gridCanvas_active') {
        cur_grid = grid_active;
    }
    else {
        cur_grid = grid_target;
    }

    for (var i = -inversion_size; i <= inversion_size; i++) {
        for (var j = -inversion_size; j <= inversion_size; j++) {
            let invertedTile_x = x + i;
            let invertedTile_y = y + j;
            if (invertedTile_x < 0 || invertedTile_x >= grid_size) continue;
            if (invertedTile_y < 0 || invertedTile_y >= grid_size) continue;

            // console.log(cur_grid);
            let tile = cur_grid[invertedTile_x][invertedTile_y];
            if (tile.fillColor.green > 0) {
                tile.fillColor = 'red';
            }
            else {
                tile.fillColor = 'green';
            }
            testForEquatedBoards();
        }
    }
};


function detectClickOnCanvas(canvasName, mouseX, mouseY, invSize)
{
    let canvas = document.getElementById(canvasName);
    let rect = canvas.getBoundingClientRect();
    let position_on_canvas = [mouseX - rect.left, mouseY - rect.top];
    let tile_on_canvas = [Math.floor(position_on_canvas[0]/tile_width), 
                          Math.floor(position_on_canvas[1]/tile_width)];
    
    //console.log(canvas, rect, position_on_canvas, mouseX, mouseY, tile_on_canvas);
    
    if (tile_on_canvas[0] < 0 || tile_on_canvas[0] >= grid_size) return;
    if (tile_on_canvas[1] < 0 || tile_on_canvas[1] >= grid_size) return;

    console.log(canvasName, 1 + tile_on_canvas[0] + (grid_size * tile_on_canvas[1]), invSize);
    invertTile(canvasName, tile_on_canvas[0], tile_on_canvas[1], invSize);
};


function handleMouseClick(event)
{
    let mouseX = event.clientX;
    let mouseY = event.clientY;
    detectClickOnCanvas("gridCanvas_active", mouseX, mouseY, 0);
    detectClickOnCanvas("gridCanvas_target", mouseX, mouseY, 0);
};


function handleRightMouseClick(event)
{
    event.preventDefault();
    let mouseX = event.clientX;
    let mouseY = event.clientY;
    detectClickOnCanvas("gridCanvas_active", mouseX, mouseY, 1);
    detectClickOnCanvas("gridCanvas_target", mouseX, mouseY, 1);
};


document.onclick = handleMouseClick;
document.oncontextmenu = handleRightMouseClick;

window.onload = function()
{
	let cfg = setUpBoard(grid_size);

    grid_active = cfg['active']['tilemap'];
    grid_target = cfg['target']['tilemap'];
    tile_width = cfg['active']['tile_width'];
    canvas_active = cfg['active']['canvas'];
    canvas_target = cfg['target']['canvas'];
};
