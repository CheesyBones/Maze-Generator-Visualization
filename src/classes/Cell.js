export default class Cell{
  constructor(row,col){
    this.row = row;
    this.col = col;
    this.walls = [true,true,true,true];
    
    this.visited = false;
    this.head = false;
    this.popped = false;
  }

  getAtIndex(grid,i,j){
    try{
      return grid[i][j]
    }catch{
      return undefined;
    }
  }

  getUnvisitedNeighbor(grid){
    
    let neighbors = [];
    let right = this.getAtIndex(grid,this.row,this.col + 1);
    let left = this.getAtIndex(grid,this.row,this.col - 1);
    let top = this.getAtIndex(grid,this.row + 1,this.col);
    let bottom = this.getAtIndex(grid,this.row - 1,this.col);

    if(top && !top.visited){
      neighbors.push(top);
    }
    if(right && !right.visited){
      neighbors.push(right);
    }
    if(bottom && !bottom.visited){
      neighbors.push(bottom);
    }
    if(left && !left.visited){
      neighbors.push(left);
    }

    if(neighbors.length > 0){
      let r = Math.floor(Math.random() * neighbors.length);
      return neighbors[r];
    }else{
      return undefined;
    }
  }
}