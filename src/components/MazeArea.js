import { React, useState, useEffect } from 'react'
import { generateGrid, generateMaze } from '../lib/mazeGenerator'
import SettingsArea from "./SettingsArea";
import { aStar } from '../lib/pathFinder';
import { getMousePosOnCanvas, clearAllIntervals } from '../lib/helpers';

//TODO:
//add build mode, lets you add walls

const pixelRatios = [10, 20, 32, 40, 50, 80];

export default function MazeArea() {
  const [mazeArray, setMazeArray] = useState([]);
  const [canvasData, setCanvasData] = useState({ width: 800, height: 800, pixelRatio: 32 });
  const [matrixDimensions, setMatrixDimensions] = useState({ rows: canvasData.height / canvasData.pixelRatio, cols: canvasData.width / canvasData.pixelRatio });
  const [optionsData, setOptionsData] = useState({ deleteMode: true, intervalLength: 20, intervalMax: 125, wallWidth: 2, colors: { head: '#FF00CD', visited: '#B900FF', popped: 'white', default: 'lightgrey', start: '#00FF2A', end: '#FF0000', path: '#00E0FF', openSet: '#FF0074' } });
  const [specialCells, setSpecialCells] = useState({ startCell: { row: 0, col: 0 }, endCell: { row: matrixDimensions.rows - 1, col: matrixDimensions.cols - 1 } });
  const [path, setPath] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPathFinding, setIsPathFinding] = useState(false);

  var mouseDownOnCanvas = false;
  var carryingStartCell = false;
  var carryingEndCell = false;
  var prevCellPos;
  var updatedMazeArray = [];

  useEffect(() => {
    getNewGrid();
  }, []);

  useEffect(() => {
    if (path.length !== 0) {
      startPathFind(0);
    }
  }, [specialCells])

  useEffect(() => {
    if (mazeArray.length === 0) return;
    draw(mazeArray);

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
    }
  }, [mazeArray, optionsData]);

  useEffect(() => {
    setSpecialCells({ startCell: { row: 0, col: 0 }, endCell: { row: matrixDimensions.rows - 1, col: matrixDimensions.cols - 1 } });
    getNewGrid();
  }, [matrixDimensions])

  useEffect(() => {
    clearAllIntervals();
    setMatrixDimensions({ rows: canvasData.height / canvasData.pixelRatio, cols: canvasData.width / canvasData.pixelRatio });


  }, [canvasData]);

  const onMouseMove = (e) => {
    const temp = [...mazeArray];
    if (temp.length === 0) return;

    const canvas = document.getElementById("maze-canvas");
    const mousePos = getMousePosOnCanvas(canvas, e);
    const cellPos = mousePosToCellPos(mousePos);

    const current = temp[cellPos.row][cellPos.col];

    if (mouseDownOnCanvas) {
      if (!carryingEndCell && !carryingStartCell) {
        if (optionsData.buildMode) {
          current.walls = [true, true, true, true]
        } else {

          if (prevCellPos) {
            const prevCell = temp[prevCellPos.row][prevCellPos.col];
            if (!(current.row === prevCellPos.row && current.col === prevCellPos.col)) {
              const yDiff = current.row - prevCell.row;
              const xDiff = current.col - prevCell.col;
              if (yDiff <= 1 && yDiff >= -1 && xDiff <= 1 && xDiff >= -1) {
                if (!(yDiff !== 0 && xDiff !== 0)) {


                  if (current.row > prevCellPos.row) {
                    current.walls[0] = false;
                    prevCell.walls[2] = false;
                  } else if (current.row < prevCellPos.row) {
                    current.walls[2] = false;
                    prevCell.walls[0] = false;
                  }

                  if (current.col > prevCellPos.col) {
                    current.walls[3] = false;
                    prevCell.walls[1] = false;
                  } else if (current.col < prevCellPos.col) {
                    current.walls[1] = false;
                    prevCell.walls[3] = false;
                  }
                }
              }
            }
          }
        }
      }


      prevCellPos = { row: current.row, col: current.col };

    } 

    updatedMazeArray = temp;
    draw(updatedMazeArray);
  };

  const onMouseDown = (e) => {
    const canvas = document.getElementById("maze-canvas");
    const mousePos = getMousePosOnCanvas(canvas, e);
    if (!mousePos.x || !mousePos.y) return;
    mouseDownOnCanvas = true;
    const cellPos = mousePosToCellPos(mousePos);
    prevCellPos = cellPos;
    if (cellPos.row === specialCells.startCell.row && cellPos.col === specialCells.startCell.col) {
      carryingStartCell = true;
    } else if (cellPos.row === specialCells.endCell.row && cellPos.col === specialCells.endCell.col) {
      carryingEndCell = true;
    }
  };

  const onMouseUp = (e) => {
    if (mouseDownOnCanvas && updatedMazeArray.length > 0) {
      if (path.length !== 0) {
        startPathFind(0);
      }
      setMazeArray(updatedMazeArray);
    }
    const canvas = document.getElementById("maze-canvas");
    const mousePos = getMousePosOnCanvas(canvas, e);
    const cellPos = mousePosToCellPos(mousePos);

    if (carryingStartCell) {
      setSpecialCells({ ...specialCells, startCell: { row: cellPos.row, col: cellPos.col } });
    } else if (carryingEndCell) {
      setSpecialCells({ ...specialCells, endCell: { row: cellPos.row, col: cellPos.col } });
    }

    carryingEndCell = false;
    carryingStartCell = false;
    mouseDownOnCanvas = false;
  };

  const getCellColor = (cell) => {
    let color = optionsData.colors.default;

    if (cell.mazeGeneratorData.head) {
      color = optionsData.colors.head;
    } else if (cell.mazeGeneratorData.popped) {
      color = optionsData.colors.popped;
    } else if (cell.mazeGeneratorData.visited) {
      color = optionsData.colors.visited;
    }

    if (cell.pathFinderData.inOpenSet) {
      color = optionsData.colors.openSet;
    }
    if (cell.pathFinderData.inPath) {
      color = optionsData.colors.path;
    }
    if (cell.row === specialCells.startCell.row && cell.col === specialCells.startCell.col) {
      color = optionsData.colors.start;
    } else if (cell.row === specialCells.endCell.row && cell.col === specialCells.endCell.col) {
      color = optionsData.colors.end;
    }

    return color;

  }

  const draw = (grid) => {
    const canvas = document.getElementById("maze-canvas");
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasData.height, canvasData.width);
    ctx.beginPath();
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[0].length; j++) {
        const current = grid[i][j];
        const y = current.row * canvasData.pixelRatio;
        const x = current.col * canvasData.pixelRatio;

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
  }

  const mousePosToCellPos = (vector2) => {
    let x = Math.floor((vector2.x / canvasData.width) * matrixDimensions.cols);
    let y = Math.floor((vector2.y / canvasData.height) * matrixDimensions.rows);

    if (isNaN(x)) {
      x = 0;
    }
    if (isNaN(y)) {
      y = 0;
    }

    return {
      col: x,
      row: y
    }
  }

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

      }, optionsData.intervalLength);
    } else {
      while (true) {
        next = gen.next();
        if (next.done || !next.value) {
          setIsGenerating(false);
          break;
        } else {
          setMazeArray([...next.value]);

        }
      }
    }

  }

  const startPathFind = (intervalLength) => {

    setIsPathFinding(true);

    let gen = aStar([...mazeArray], specialCells.startCell, specialCells.endCell);

    let next = gen.next();
    if (intervalLength > 0) {
      setInterval(() => {
        next = gen.next();
        if (next.done || !next.value) {
          setIsPathFinding(false);
          clearAllIntervals();
        } else {
          setMazeArray([...next.value.grid]);
          setPath([...next.value.path]);
        }

      }, intervalLength);
    } else {
      while (true) {
        next = gen.next();
        if (next.done || !next.value) {
          setIsPathFinding(false);
          break;
        } else {
          setMazeArray([...next.value.grid]);
          setPath([...next.value.path]);
        }
      }
    }

  }

  const clearGrid = (e) => {
    let temp = [...mazeArray];
    for (let i = 0; i < temp.length; i++) {
      for (let j = 0; j < temp[0].length; j++) {
        temp[i][j].walls = [false, false, false, false];
        temp[i][j].mazeGeneratorData.popped = true;
      }
    }
    setMazeArray(temp);
  }

  const onResetClick = (e) => {
    e.preventDefault();
    setIsGenerating(false);
    setIsPathFinding(false);
    setSpecialCells({ startCell: { row: 0, col: 0 }, endCell: { row: matrixDimensions.rows - 1, col: matrixDimensions.cols - 1 } });
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
    if (isPathFinding || isGenerating) {
      return;
    }

    startPathFind(optionsData.intervalLength);
  }

  const onClearClick = (e) => {
    e.preventDefault();
    if (isPathFinding || isGenerating) {
      return;
    }
    clearGrid();
  }

  const onPRChange = (e) => {
    setCanvasData({ ...canvasData, pixelRatio: pixelRatios[e.target.value] })
  }

  const onIntervalChange = (e) => {
    setOptionsData({ ...optionsData, intervalLength: optionsData.intervalMax - e.target.value });
  }

  const onBuildModeClick = (e) => {
    setOptionsData({ ...optionsData, buildMode: e.target.checked });
  }

  return (
    <div className="maze-area">
      <div className="canvas-area">
        <canvas id="maze-canvas" height={canvasData.height} width={canvasData.width}></canvas>
      </div>
      <div>
        <button className="btn-default" onClick={onGenerateClick} disabled={isGenerating}>Generate</button>
        <button className="btn-default" onClick={onPathFindClick} disabled={isPathFinding}>Find Path</button>
        <button className="btn-reset" onClick={onResetClick}>Reset</button>
        <button className="btn-reset" onClick={onClearClick}>Clear</button>
      </div>
      <SettingsArea onSpeedChange={onIntervalChange} onPRChange={onPRChange} onBuildModeClick={onBuildModeClick} speedValue={optionsData.intervalMax - optionsData.intervalLength} prValue={pixelRatios.indexOf(canvasData.pixelRatio)} prLength={pixelRatios.length - 1} intervalMax={optionsData.intervalMax} buildModeValue={optionsData.buildMode} />
    </div>
  )
}
