import { React, useState, useEffect } from 'react'
import { generateGrid, generateMaze } from '../modules/MazeGenerator'
import { aStar } from '../modules/PathFinder';

const randomColor = () => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return '#' + randomColor;
}

const getMousePos = (canvas, e) => {
  let rect = canvas.getBoundingClientRect();
  let xPos = e.clientX - rect.left;
  let yPos = e.clientY - rect.top;
  xPos = xPos < canvas.width && xPos >= 0 ? xPos : undefined;
  yPos = yPos < canvas.height && yPos >= 0 ? yPos : undefined;
  return{
    x: xPos,
    y: yPos
  };
}

const clearAllIntervals = () => {
  const interval_id = window.setInterval(function () { }, Number.MAX_SAFE_INTEGER);

  for (let i = 1; i < interval_id; i++) {
    window.clearInterval(i);
  }
}

const pixelRatios = [10, 20,32, 40, 50, 80];

export default function MazeArea() {
  const [mazeArray, setMazeArray] = useState([]);
  const [canvasData, setCanvasData] = useState({ width: 800, height: 800, pixelRatio: 32 });
  const [matrixDimensions, setMatrixDimensions] = useState({ rows: canvasData.height / canvasData.pixelRatio, cols: canvasData.width / canvasData.pixelRatio });
  const [optionsData, setOptionsData] = useState({ intervalLength: 30, wallWidth: 2, colors: { head: '#FF00CD', visited: '#B900FF', popped: 'white', default: 'lightgrey', start: '#00FF2A', end: '#FF0000', path: '#00E0FF', openSet: '#FF0074' } });
  const [specialCells, setSpecialCells] = useState({startCell: {row: 0, col: 0},endCell: {row: matrixDimensions.rows - 1, col: matrixDimensions.cols - 1}});
  const [path, setPath] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPathFinding, setIsPathFinding] = useState(false);

  const getCellColor = (cell) => {
    let color = optionsData.colors.default;

    if (cell.mazeGeneratorData.head) {
      color = optionsData.colors.head;
    } else if (cell.mazeGeneratorData.popped) {
      color = optionsData.colors.popped;
    } else if (cell.mazeGeneratorData.visited) {
      color = optionsData.colors.visited;
    }

    if(cell.pathFinderData.inOpenSet){
      color = optionsData.colors.openSet;
    }
    if(cell.pathFinderData.inPath){
      color = optionsData.colors.path;
    }
    if(cell.row == specialCells.startCell.row && cell.col == specialCells.startCell.col){
      color = optionsData.colors.start;
    }else if(cell.row == specialCells.endCell.row && cell.col == specialCells.endCell.col){
      color = optionsData.colors.end;
    }

    return color;
    
  }

  const draw = () => {
    const canvas = document.getElementById("maze-canvas");
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasData.height, canvasData.width);
    ctx.beginPath();
    for (let i = 0; i < mazeArray.length; i++) {
      for (let j = 0; j < mazeArray[0].length; j++) {
        const current = mazeArray[i][j];
        const y = current.row * canvasData.pixelRatio;
        const x = current.col * canvasData.pixelRatio;

        /*if (current.visited) {
          ctx.fillStyle = current.head === true ? optionsData.colors.head : optionsData.colors.visited;
          ctx.fillRect(x, y, canvasData.pixelRatio, canvasData.pixelRatio);
        }*/
        ctx.fillStyle = getCellColor(current);
        ctx.fillRect(x, y, canvasData.pixelRatio, canvasData.pixelRatio);
        ctx.fillStyle = 'black';
        if (current.walls[0] === true) {
          ctx.fillRect(x, y, canvasData.pixelRatio, optionsData.wallWidth);
        }
        if (current.walls[1] === true) {
          ctx.fillRect(x + canvasData.pixelRatio - optionsData.wallWidth, y, optionsData.wallWidth, canvasData.pixelRatio);
        }
        if (current.walls[2] === true) {
          ctx.fillRect(x, y + canvasData.pixelRatio - optionsData.wallWidth, canvasData.pixelRatio, optionsData.wallWidth);
        }
        if (current.walls[3] === true) {
          ctx.fillRect(x, y, optionsData.wallWidth, canvasData.pixelRatio);
        }
      }
    }
  }
  
  const getNewGrid = () => {
    let grid = generateGrid(matrixDimensions.rows, matrixDimensions.cols);
    setMazeArray(grid);
    document.removeEventListener('mouseup',onMouseClick);
    document.addEventListener('mouseup',onMouseClick);
  }

  const mousePosToCellPos = (vector2) => {
    const x = Math.floor((vector2.x / canvasData.width) * matrixDimensions.cols);
    const y = Math.floor((vector2.y / canvasData.height) * matrixDimensions.rows);

    return{
      x: x,
      y: y
    }
  }

  const onMouseClick = (e) => {
    e.preventDefault();
    if(mazeArray.length === 0) return;
    const canvas = document.getElementById("maze-canvas");
    const mp = getMousePos(canvas,e);
    if(!mp.x || !mp.y) return;
    const cellPos = mousePosToCellPos(mp);
    console.log(mazeArray[cellPos.y][cellPos.x]);
    /*let temp = [...mazeArray];
    temp[cellPos.y][cellPos.x].visited = true;
    setMazeArray(temp);*/
  }

  useEffect(() => {
    getNewGrid();
  }, []);
  
  useEffect(() => {
    let temp = [...mazeArray];
    for(let i = 0; i < path.length; i++){
      temp[path[i].row][path[i].col].pathFinderData.inPath = true;
    }
  },[path])

  useEffect(() => {
    //if (mazeArray.length === 0) return;
    draw();
    
  }, [mazeArray]);
  
  useEffect(() => {
    setSpecialCells({startCell: {row: 0, col: 0},endCell: {row: matrixDimensions.rows - 1, col: matrixDimensions.cols - 1}});
    getNewGrid();
  }, [matrixDimensions])
  
  useEffect(() => {
    clearAllIntervals();
    setMatrixDimensions({ rows: canvasData.height / canvasData.pixelRatio, cols: canvasData.width / canvasData.pixelRatio });
    

  }, [canvasData]);

  const startGenerate = () => {
    let temp = [...mazeArray];
    let gen = generateMaze(temp);
    let next = gen.next();
    setIsGenerating(true);
    if (optionsData.intervalLength > 0) {
      setInterval(() => {
        next = gen.next();
        if (next.done || !next.value) {
          setIsGenerating(false);
          clearAllIntervals();
        } else {
          setMazeArray([...next.value]);
        }
        //console.log(next.value);

      }, optionsData.intervalLength);
    }else{
      while(true){
        next = gen.next();
        if(next.done || !next.value){
          setIsGenerating(false);
          break;
        }else{
          setMazeArray([...next.value]);
          
        }
      }
    }

  }

  const startPathFind = () => {
    let gen = aStar([...mazeArray],specialCells.startCell, specialCells.endCell);
    
    let next = gen.next();
    if(optionsData.intervalLength > 0){
      setInterval(() => {
        next = gen.next();
        if (next.done || !next.value) {
          setIsPathFinding(false);
          clearAllIntervals();
        } else {
          setMazeArray([...next.value.grid]);
          setPath([...next.value.path]);
        }
        //console.log(next.value);
  
      }, optionsData.intervalLength);
    }else{
      while(true){
        next = gen.next();
        if(next.done || !next.value){
          setIsPathFinding(false);
          break;
        }else{
          setMazeArray([...next.value.grid]);
          setPath([...next.value.path]);
        }
      }
    }
    
  }

  const onResetClick = (e) => {
    e.preventDefault();
    setIsGenerating(false);
    setIsPathFinding(false);
    clearAllIntervals();
    getNewGrid();
  }

  const onGenerateClick = (e) => {
    e.preventDefault();
    if (isGenerating || isPathFinding) {
      return;
    }

    startGenerate();
  }

  const onPathFindClick = (e) => {
    e.preventDefault();
    if(isPathFinding || isGenerating){
      return;
    }

    startPathFind();
  }

  return (
    <div className="maze-area">
      <div className="canvas-area">
        <canvas id="maze-canvas" height={canvasData.height} width={canvasData.width}></canvas>
      </div>
      <div className="settings-area">
        <span className='setting-label-default'>Interval Length</span><input type="range" min="0" max="1000"
          value={optionsData.intervalLength}
          onChange={(e) => { setOptionsData({ ...optionsData, intervalLength: e.target.value }) }}
        />
        <span className='setting-label-default'>Pixel Ratio</span><input type="range" min="0" max={pixelRatios.length - 1}
          value={pixelRatios.indexOf(canvasData.pixelRatio)}
          onChange={(e) => { setCanvasData({ ...canvasData, pixelRatio: pixelRatios[e.target.value] }) }} />
      </div>
      <button className="btn-default" onClick={onGenerateClick}>Generate</button>
      <button className="btn-default" style={{backgroundColor: "red"}} onClick={onResetClick}>Reset</button>
      <button className="btn-default" onClick={onPathFindClick}>Find Path</button>
    </div>
  )
}
