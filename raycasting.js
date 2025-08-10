const screen = { width: window.innerWidth / 2, height: window.innerHeight / 2 };
const player = { fov: 60, angle: 90, x: 2, y: 2 };
const rayCastConfig = {
  incAngle: player.fov / screen.width,
  precision: 64,
  delay: 30,
};
screen.hWidth = screen.width / 2;
screen.hHeight = screen.height / 2;
player.hFov = player.fov / 2;
const canvas = document.createElement("canvas");
canvas.width = screen.width;
canvas.height = screen.height;
document.body.appendChild(canvas);
const g = canvas.getContext("2d");
const rToD = (d) => (d * Math.PI) / 180;
const drawLine = (x1, y1, x2, y2, color) => {
  g.strokeStyle = color;
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();
};
const clearScreen = () => g.clearRect(0, 0, screen.width, screen.height);
const rayCasting = () => {};
const start = () =>
  setInterval(() => {
    clearScreen();
    rayCasting();
  }, rayCastConfig.delay);
