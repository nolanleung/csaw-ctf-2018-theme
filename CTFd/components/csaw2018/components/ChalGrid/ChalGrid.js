import React from 'react'

import './ChalGrid.scss'

export default props => {
  const range = props.challenges.reduce(
    (obj, chal) => {
      if (!obj.min) obj.min = chal.value
      if (!obj.max) obj.max = chal.value
      if (chal.value > obj.max) obj.max = chal.value
      if (chal.value < obj.min) obj.min = chal.value
      return obj
    },
    { min: null, max: null },
  )

  const solves = props.solves.map(solve => solve.chalid)

  return (
    <div className="chal-grid">
      {props.challenges.map((chal, i) => {
        return (
          <div
            className={'chal-item-container' + (solves.includes(chal.id) ? ' solved' : '')}
            onClick={() => props.showChallenge(chal)}
            key={chal.id}
          >
            <div className="chal-item">
              <div className="chal-title">{chal.name}</div>
              <div className="chal-name">{chal.category}</div>
              <div
                className="chal-points"
                style={{
                  color: getColorFromValue(chal.value, range),
                  backgroundColor: getBackgroundColorFromValue(chal.value, range),
                }}
              >
                {chal.value}
              </div>
              <div
                className="chal-overlay"
                style={{
                  backgroundColor: getBackgroundColorFromValue(chal.value, range),
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function getColorFromValue(value, range) {
  const h = 240 * (1 - (value - range.min) / (range.max - range.min))
  return 'hsl(' + Math.floor(h) + ', 91%, 43.5%)'
}

function getBackgroundColorFromValue(value, range) {
  const h = 240 * (1 - (value - range.min) / (range.max - range.min))
  return 'hsla(' + Math.floor(h) + ', 91%, 85%, 0.25)'
}
