'use strict';
let grid= [,];

function setUpBoard(grid_size) 
{
    let canvas = document.getElementById('gridCanvas');
    let grid_width = canvas.width;
    let tile_width = grid_width / grid_size
    paper.setup(canvas);

    for (var i = 0; i < grid_size; i++) {
        for (var j = 0; j < grid_size; j++) {
            grid[i,j] = new paper.Rectangle(i * tile_width, j * tile_width , tile_width, tile_width);
            console.log(grid[i,j]);
        }
    }
}


setUpBoard(5);