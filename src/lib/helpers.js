const getMousePosOnCanvas = (canvas, e) => {
  let rect = canvas.getBoundingClientRect();
  let xPos = e.clientX - rect.left;
  let yPos = e.clientY - rect.top;
  xPos = xPos < canvas.width && xPos >= 0 ? xPos : undefined;
  yPos = yPos < canvas.height && yPos >= 0 ? yPos : undefined;
  return {
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

module.exports = {getMousePosOnCanvas, clearAllIntervals}