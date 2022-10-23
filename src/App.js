/*
Have different components or objects that indicate the cell type (sides open or closed)
Move based on cells and check current object that you are standing on to see if you can move in desired 
direction
*/

import './css/App.css';
import MazeArea from './components/MazeArea';

function App() {
  return (
    <div className="App">
      <header className="App-header">
      </header>
        <MazeArea />
        <a href="https://github.com/CheesyBones/Maze-Generator-Visualization">
        <img id="github-icon" src={process.env.PUBLIC_URL + '/images/github.png'}></img>

        </a>
    </div>
  );
}

export default App;
