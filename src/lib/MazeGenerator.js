import Cell from './cell';

const increment = 1;

export function generateGrid(rows,cols){
  let grid = [];

  for (let i = 0; i < rows; i+=increment) {
    let row = [];
    for(let j = 0; j < cols; j+=increment){
      let cell = new Cell(i,j);
      row.push(cell);
    }
    grid.push(row);
  }

  return grid;
}

//add parameter for cell per second, yield maze every cps
export function* generateMaze(grid){
  let stack = [];
  let current;
  const startCol = Math.floor(Math.random() * grid[0].length - 1)
  const startRow = Math.floor(Math.random() * grid.length - 1)
  current = grid[startRow][startCol];
  
  current.mazeGeneratorData.visited = true;
  current.mazeGeneratorData.head = true;
  
  while(true){
    let next = current.getUnvisitedNeighbor(grid);
    current.mazeGeneratorData.head = false;
    if(next){
      next.mazeGeneratorData.visited = true;
      
      stack.push(current);

      removeWallsBetween(current,next);
      current = next;
      current.mazeGeneratorData.head = true;
    }else if(stack.length > 0){
      current.mazeGeneratorData.popped = true;
      current = stack.pop();
      current.mazeGeneratorData.popped = true;
    }else{
      break;
    }
    yield grid;
  }
  yield grid;
}

function removeWallsBetween(a,b){
  let x = a.col - b.col;
  if(x === 1){
    a.walls[3] = false;
    b.walls[1] = false;
  }else if(x === -1){
    a.walls[1] = false;
    b.walls[3] = false;
  }
  let y = a.row - b.row;
  if(y === 1){
    a.walls[0] = false;
    b.walls[2] = false;
  }else if(y === -1){
    a.walls[2] = false;
    b.walls[0] = false;
  }
}

