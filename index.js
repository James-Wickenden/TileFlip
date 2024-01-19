'use strict';
let grid;
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
            tilemap[i][j] = new Rectangle(i * tile_width, j * tile_width , tile_width, tile_width);
            
            var path = new Path.Rectangle(tilemap[i][j]);
            path.fillColor = 'red';
            path.strokeColor = 'black';
        }
    }

    console.log(tilemap);
    view.draw();

    return tilemap;
}

window.onload = function() {
	grid = setUpBoard(5);
}
