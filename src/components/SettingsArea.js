import React from 'react'

export default function SettingsArea(props) {
  return (
    <>
    <a className="btn-collapse">+</a>
    <div className="settings-area">
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
