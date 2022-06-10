import { React, useState, useEffect } from 'react'
import { generateGrid, generateMaze } from '../classes/MazeGenerator'

const randomColor = () => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return '#' + randomColor;
}

const pixelRatios = [10, 20, 40, 50, 80]

export default function MazeArea() {
  const [mazeArray, setMazeArray] = useState([]);
  const [canvasData, setCanvasData] = useState({ width: 800, height: 800, pixelRatio: 20 });
  const [matrixDimensions, setMatrixDimensions] = useState({ rows: canvasData.height / canvasData.pixelRatio, cols: canvasData.width / canvasData.pixelRatio });
  const [optionsData, setOptionsData] = useState({ intervalLength: 50, wallWidth: 2, colors: { head: 'red', visited: 'purple', popped: 'white', default: 'lightgrey' } });
  const [isGenerating, setIsGenerating] = useState(false);

  const getCellColor = (cell) => {
    if (cell.head) {
      return optionsData.colors.head;
    } else if (cell.popped) {
      return optionsData.colors.popped;
    } else if (cell.visited) {
      return optionsData.colors.visited;
    } else {
      return optionsData.colors.default;
    }
  }

  const getNewGrid = () => {
    let grid = generateGrid(matrixDimensions.rows, matrixDimensions.cols);
    setMazeArray(grid);
  }

  useEffect(() => {
    getNewGrid();
  }, []);

  useEffect(() => {
    //if (mazeArray.length === 0) return;
    draw();

  }, [mazeArray]);

  useEffect(() => {
    getNewGrid();
  }, [matrixDimensions])

  useEffect(() => {
    clearAllIntervals();
    setMatrixDimensions({ rows: canvasData.height / canvasData.pixelRatio, cols: canvasData.width / canvasData.pixelRatio });

  }, [canvasData]);

  const start = () => {
    let temp = [...mazeArray];
    let gen = generateMaze(temp);
    let next = gen.next();
    setIsGenerating(true);
    if (optionsData.intervalLength > 0) {
      setInterval(() => {
        next = gen.next();
        if (next.done || !next.value) {
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
          break;
        }else{
          setMazeArray([...next.value]);
        }
      }
    }

  }

  const onStartClick = (e) => {
    e.preventDefault();
    if (isGenerating) {
      setIsGenerating(false);
      clearAllIntervals();
      getNewGrid();
    } else {
      start();
    }
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

  const clearAllIntervals = () => {
    const interval_id = window.setInterval(function () { }, Number.MAX_SAFE_INTEGER);

    for (let i = 1; i < interval_id; i++) {
      window.clearInterval(i);
    }
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
      <button className="btn-default" onClick={onStartClick}>{isGenerating ? "Reset" : "Start"}</button>
    </div>
  )
}
