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
        <span className='setting-label-default'>Interval Length</span><input type="range" min="0" max="125"
          value={props.intervalValue}
          onChange={props.onIntervalChange}
        />
        <span className='setting-label-default'>Pixel Ratio</span><input type="range" min="0" max={props.prLength}
          value={props.prValue}
          onChange={props.onPRChange} />
      </div>
      </>
  )
}
