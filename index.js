'use strict';
let grid_target, grid_active;
let canvas_target, canvas_active;
let tile_width;
let grid_size = 4;
let inversion_size = 1;
let move_stack = [];

paper.install(window);


function setUpBoard(grid_size) 
{
    let active_cfg = setUpCanvas("gridCanvas_active", grid_size);
    let target_cfg = setUpCanvas("gridCanvas_target", grid_size);

    return { 'active' : active_cfg, 'target' : target_cfg };
};


function setUpCanvas(canvasName, grid_size)
{
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
    for (var i = 0; i < grid_size; i++) {
        for (var j = 0; j < grid_size; j++) {
            if (grid_active[i][j].fillColor.red !== grid_target[i][j].fillColor.red) {
                return false;
            }
        }
    }
    return true;
};


function updateEquationLabel()
{
    let equality_flag = document.getElementById('equatedBoards');
    let equalBoards = testForEquatedBoards();
    if (equalBoards) {
        equality_flag.style.backgroundColor = 'green';
        equality_flag.innerHTML = 'Equal Boards!';
    }
    else {
        equality_flag.style.backgroundColor = 'red';
        equality_flag.innerHTML = 'Unequal Boards!';
    };
};


function resetActive(shouldUpdateLabel)
{
    console.log('resetting...');
    for (var i = 0; i < grid_size; i++) {
        for (var j = 0; j < grid_size; j++) {
            if (grid_active[i][j].fillColor.red == 0) {
                grid_active[i][j].fillColor = 'red';
            }
        }
    }

    if (shouldUpdateLabel) updateEquationLabel();
    return;
};


function recurseEquator(blacklistedTiles, depth, maxdepth)
{
    if (depth == maxdepth) {
        resetActive(false);
        return;
    };

    for (var i = 0; i < grid_size; i++) {
        for (var j = 0; j < grid_size; j++) {
            let tileIndex = (i * grid_size) + j;
            if (!blacklistedTiles.includes(tileIndex)) {
                invertTile('gridCanvas_active', i, j, 1, true);
                console.log('inverting ' + i + ', ' + j + ', depth ' + depth);
                recurseEquator(blacklistedTiles + tileIndex, depth + 1, maxdepth);
            }
        }
    }
};


function recurseEquator2(blacklistedTiles, depth, maxdepth)
{
    if (depth == maxdepth) {
        resetActive(false);
        return;
    };

    recursor:

        // first, test for a correct solution and escape if we have one
        console.log(i,j);
        let equalBoards = testForEquatedBoards();
        if (equalBoards) {
            // escape
            console.log('found solution!'); 
            return;
        };

        // if no correct solution yet:
        // we try the first available square and recurse
        for (var i = 0; i < grid_size; i++) {
            for (var j = 0; j < grid_size; j++) {
                let tileIndex = (i * grid_size) + j;

                if (!blacklistedTiles.includes(tileIndex)) {
                    invertTile('gridCanvas_active', i, j, 1, true);
                    recurseEquator(blacklistedTiles + tileIndex, depth + 1, maxdepth);
                }
            }
        }

};


function undoMove()
{
    console.log('undoing...');
    console.log(move_stack);
    if (move_stack.length == 0) {
        console.log('no moves left on move stack');
        return;
    };

    let last_move = move_stack.pop();
    invertTile(last_move[0], last_move[1], last_move[2], last_move[3], false);
};


function equateBoards()
{
    console.log('equating...');
    recurseEquator([], 0, 2);
    updateEquationLabel();
};


function invertTile(canvasName, x, y, inversionSize, addToMoveStack)
{
    let cur_grid;
    if (canvasName == 'gridCanvas_active') {
        cur_grid = grid_active;
    }
    else {
        cur_grid = grid_target;
    }

    for (var i = -inversionSize; i <= inversionSize; i++) {
        for (var j = -inversionSize; j <= inversionSize; j++) {
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
        }
    }

    if (addToMoveStack) move_stack.push([canvasName, x, y, inversionSize]);
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
    invertTile(canvasName, tile_on_canvas[0], tile_on_canvas[1], invSize, true);
    testForEquatedBoards();
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
