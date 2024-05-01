'use strict';
let grid_target, grid_active;
let canvas_target, canvas_active;
let tile_width;
let grid_size = 4;
let inversion_size = 1;
let move_stack = [], state_move_stack = [];
let max_depth = 2;
let solved = false;

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


function updateEquationLabel()
{
    let equality_flag = document.getElementById('equatedBoards');
    let equalBoards = isSolved(reduceBoardsToSolveMap()); 
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
            grid_active[i][j].fillColor = 'red';
            grid_target[i][j].fillColor = 'red';
        }
    }

    move_stack = [];
};


function recurseEquator_old(depth, tested_tiles)
{
    if (depth == max_depth) return;
    if (solved) return;

    for (var i = 0; i < grid_size; i++) {
        for (var j = 0; j < grid_size; j++) {
            let tile_index = (i * grid_size) + j;

            if (tested_tiles.split(',').includes(String(tile_index))) {
                console.log('already tried ' + tile_index);
                continue;
            }
            invertTile('gridCanvas_active', i, j, 1, true);
            recurseEquator(depth + 1, tested_tiles + ',' + tile_index);
            let equalBoards = testForEquatedBoards();
            if (equalBoards) {
                console.log('found solution!'); 
                console.log(move_stack);
                for (let i = 0; i < move_stack.length; i++) {
                    if (move_stack[i][0] == 'gridCanvas_active') {
                        grid_active[move_stack[i][1]][move_stack[i][2]].fillColor.blue = 1;
                    }
                }
                solved = true;
                return;
            };
            
            if (!solved) undoMove();
        }
    }
};


function isSolved(state_diff) 
{
    const isAllZero = (currentValue) => currentValue == 0;
    return state_diff.every(isAllZero);
};


function recurseEquator(depth)
{
    let state_diff = reduceBoardsToSolveMap();
    // goal: reduce this to all 0s.
    // first: test if this is the case!
    if(isSolved(state_diff)) {
        console.log('solved!');
        return;
    }

    // if not, we try every 1-move solution, then every 2-move solution, and so on

    for (var iteration = 0; iteration <= depth; iteration++) {
        for (var x = 0; x < grid_size; x++) {
            for (var y = 0; y < grid_size; y++) {
                invertStateTile(state_diff, x, y, true);

                if(isSolved(state_diff)) {
                    console.log('solved!');
                    return;
                }

                undoStateMove(state_diff);
            }
        }
    }

    recurseEquator(depth + 1);
};


function undoStateMove(state_diff)
{
    if (state_move_stack.length == 0) {
        console.log('no moves left on move stack');
        return;
    };

    let last_move = state_move_stack.pop() || [];
    invertStateTile(state_diff, last_move[0], last_move[1], false);
};


function undoMove()
{
    if (move_stack.length == 0) {
        console.log('no moves left on move stack');
        return;
    };

    let last_move = move_stack.pop() || [];
    invertTile(last_move[0], last_move[1], last_move[2], last_move[3], false);
};


function equateBoards()
{
    console.log('solving...');
    solved = false;
    //resetActive();
    recurseEquator(0, '');
    //invertStateTile(reduceBoardsToSolveMap(), 0, 3);

    updateEquationLabel();
};


function invertTile(canvasName, x, y, inversionSize, addToMoveStack)
{
    let cur_grid = (canvasName == 'gridCanvas_active') ? grid_active : grid_target;

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
    updateEquationLabel();
};


function invertStateTile(state_diff, x, y, addToMoveStack)
{
    console.log('before: ' + x + ', ' + y);
    console.log(state_diff);
    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            let invertedTile_index = ((y + i) * grid_size) + x + j;
            console.log(invertedTile_index);

            if (invertedTile_index < 0 || invertedTile_index >= (grid_size * grid_size)) continue;

            if ((j == -1) && (invertedTile_index % grid_size == grid_size - 1)) continue;
            if ((j == 1) && (invertedTile_index % grid_size == 0)) continue;

            state_diff[invertedTile_index] = 1 - state_diff[invertedTile_index];
        }
    }

    if (addToMoveStack) state_move_stack.push([x, y]);
    console.log('after:');
    console.log(state_diff);
};


function reduceBoardsToSolveMap()
{
    let state_diff = [];
    
    for (let i = 0; i < grid_size; i++) {
        for (let j = 0; j < grid_size; j++) {
            if (grid_active[j][i].fillColor.green == grid_target[j][i].fillColor.green) {
                state_diff.push(0);
            }
            else {
                state_diff.push(1);
            }
        }
    }

    return state_diff;
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
