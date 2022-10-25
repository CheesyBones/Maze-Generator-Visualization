import {React, useState} from 'react'

export default function SettingsArea(props) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = (e) => {
    e.preventDefault();
    setIsCollapsed(!isCollapsed);
  }

  return (
    <>
    <button className="btn-collapse" onClick={toggleCollapse} unselectable="on">{`Settings ${isCollapsed ? "+" : "-"}`}</button>
    <div className={`settings-area ${isCollapsed ? "hide" : ""}`}>
        <span className='setting-label-default'>Speed</span><input type="range" min="0" max="125"
          value={props.speedValue}
          onChange={props.onSpeedChange}
        />
        <span className='setting-label-default'>Pixel Ratio</span><input type="range" min="0" max={props.prLength}
          value={props.prValue}
          onChange={props.onPRChange} />
        <span className='setting-label-default'>
          Build Mode
          <input type="checkbox" onChange={props.onBuildModeClick} value={props.buildModeValue} />
        </span>
      </div>
      </>
  )
}
