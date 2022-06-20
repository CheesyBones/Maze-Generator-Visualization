export default class Cell {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.walls = [true, true, true, true];

    this.mazeGeneratorData = {
      visited: false,
      head: false,
      popped: false
    }

    this.pathFinderData = {
      previous: undefined,
      reachableNeighbors: [],
      g: 0,
      h: 0,
      f: 0,
      inOpenSet: false,
      inPath: false
    }
  }

  //Will return undefined for cell that produces error upon getting
  getAtIndex(grid, i, j) {
    if(i < 0 || i > grid.length - 1 || j < 0 || j > grid[0].length - 1){
      return undefined;
    }else{
      return grid[i][j];
    }
  }


  //Returns in the following order: Top, Right, Left, Bottom
  getNeighbors(grid) {
    let neighbors = [];
    neighbors.push(this.getAtIndex(grid, this.row - 1, this.col));
    neighbors.push(this.getAtIndex(grid, this.row, this.col + 1));
    neighbors.push(this.getAtIndex(grid, this.row + 1, this.col));
    neighbors.push(this.getAtIndex(grid, this.row, this.col - 1));

    return neighbors;
  }

  updateReachableNeighbors(grid) {
    let neighbors = this.getNeighbors(grid);
    let reachableNeighbors = [];
    
    for (let i = 0; i < neighbors.length; i++) {
      if (!neighbors[i]) continue;
      const current = neighbors[i];
      switch (i) {
        case 0:
          if (!current.walls[2] && !this.walls[0]) {
            reachableNeighbors.push(current);
          }
          break;
        case 1:
          if (!current.walls[3] && !this.walls[1]) {
            reachableNeighbors.push(current);
          }
          break;
        case 2:
          if (!current.walls[0] && !this.walls[2]) {
            reachableNeighbors.push(current);
          }
          break;
        case 3:
          if (!current.walls[1] && !this.walls[3]) {
            reachableNeighbors.push(current);
          }
          break;
      }
    }

    this.pathFinderData.reachableNeighbors = reachableNeighbors;
  }

  //Returns random neighbor that has not been visited
  getUnvisitedNeighbor(grid) {
    let temp = this.getNeighbors(grid);

    let neighbors = [];
    temp.forEach((element) => {
      if (element && !element.mazeGeneratorData.visited) {
        neighbors.push(element);
      }
    });

    if (neighbors.length > 0) {
      let r = Math.floor(Math.random() * neighbors.length);
      return neighbors[r];
    } else {
      return undefined;
    }
  }
}