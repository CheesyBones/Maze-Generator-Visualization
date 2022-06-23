function updateNeighborsInGrid(grid){
  for(let i = 0; i < grid.length; i++){
    for(let j = 0; j < grid.length; j++){
      grid[i][j].updateReachableNeighbors(grid);
    }
  }
  //console.log(grid[0][0]);
}

function dist(x1,x2,y1,y2){
  return Math.sqrt(Math.pow((x2 - x1),2) + Math.pow((y2 - y1),2));
}

function heuristic(a,b){
  let d = dist(a.col,b.col,a.row,b.row); 
  return d;
}

export function* aStar(grid,startPos,endPos){
  updateNeighborsInGrid(grid);

  let path = [];

  let start = grid[startPos.row][startPos.col];
  let end = grid[endPos.row][endPos.col];

  let openSet = [];
  let closedSet = [];

  openSet.push(start);

  //No solution if less than 1
  while(openSet.length > 0){
    let lowestIndex = 0;
    for(let i = 0; i < openSet.length; i++){
      if(openSet[i].pathFinderData.f < openSet[lowestIndex].pathFinderData.f){
        lowestIndex = i;
      }
    }
    let current = openSet[lowestIndex];

    if(current === end){
      path = [];
      let temp = current;
      path.push(temp);
      while(temp.pathFinderData.previous){
        
        path.push(temp.pathFinderData.previous);
        temp = temp.pathFinderData.previous;
        yield {grid: grid, path: path};
        //temp.pathFinderData.inPath = true;
      }
      break;
    }
    
    openSet.splice(openSet.indexOf(current),1);
    closedSet.push(current);

    const neighbors = current.pathFinderData.reachableNeighbors;

    for(let i = 0; i < neighbors.length; i++){
      const neighbor = neighbors[i];

      if(closedSet.includes(neighbor)) continue;

      const tempG = current.pathFinderData.g + 1;

      if(openSet.includes(neighbor)){
        if(tempG < neighbor.pathFinderData.g){
          neighbor.pathFinderData.g = tempG;
        }
      }else{
        neighbor.pathFinderData.g = tempG;
        neighbor.pathFinderData.inOpenSet = true;
        openSet.push(neighbor);
      }

      neighbor.pathFinderData.h = heuristic(neighbor,end);
      neighbor.pathFinderData.f = neighbor.pathFinderData.g + neighbor.pathFinderData.h;
      neighbor.pathFinderData.previous = current;
    }
    yield {grid: grid, path: path};
  }
  yield {grid: grid, path: path};
}