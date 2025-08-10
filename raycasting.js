const screen = {
  width: window.innerWidth / 2,
  height: window.innerHeight / 2,
  hWidth: null,
  hHeight: null,
};
const player = {
  fov: 60,
  angle: 90,
  x: 2,
  y: 2,
  hFov: null,
  speed: 0.5,
  rotation: 5,
};
const rayCastConfig = {
  incAngle: player.fov / screen.width,
  precision: 64,
  delay: 30,
};
const keys = {
  up: "KeyW",
  down: "KeyS",
  left: "KeyA",
  right: "KeyD",
};
const map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
screen.hWidth = screen.width / 2;
screen.hHeight = screen.height / 2;
player.hFov = player.fov / 2;
const canvas = document.createElement("canvas");
canvas.width = screen.width;
canvas.height = screen.height;
document.body.appendChild(canvas);
const g = canvas.getContext("2d");
const { cos, sin, sqrt, PI, floor } = Math;
const rToD = (d) => (d * PI) / 180;
const drawLine = (x1, y1, x2, y2, color) => {
  g.strokeStyle = color;
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();
};
const clearScreen = () => g.clearRect(0, 0, screen.width, screen.height);
const playerInput = ({ code }) => {
  if (code == keys.up) {
    const playerCos = cos(rToD(player.angle)) * player.speed;
    const playerSin = sin(rToD(player.angle)) * player.speed;
    const newX = player.x + playerCos;
    const newY = player.y + playerSin;
    if (
      newX >= 0 &&
      newX < map.length &&
      newY >= 0 &&
      newY < map.length &&
      !map[floor(newY)][floor(newX)]
    ) {
      player.y = newY;
      player.x = newX;
      clearScreen();
      rayCasting();
    }
  } else if (code == keys.down) {
    const playerCos = cos(rToD(player.angle)) * player.speed;
    const playerSin = sin(rToD(player.angle)) * player.speed;
    const newX = player.x - playerCos;
    const newY = player.y - playerSin;
    if (
      newX >= 0 &&
      newX < map.length &&
      newY >= 0 &&
      newY < map.length &&
      !map[floor(newY)][floor(newX)]
    ) {
      player.y = newY;
      player.x = newX;
      clearScreen();
      rayCasting();
    }
  } else if (code == keys.left) {
    if (player.angle <= 0) player.angle = 360;
    player.angle -= player.rotation;
    clearScreen();
    rayCasting();
  } else if (code == keys.right) {
    if (player.angle >= 360) player.angle = 0;
    player.angle += player.rotation;
    clearScreen();
    rayCasting();
  }
};
const rayCasting = () => {
  let rayAngle = player.angle - player.hFov;
  for (let i = 0; i < screen.width; i++) {
    const ray = { x: player.x, y: player.y };
    const rayRad = rToD(rayAngle);
    while (!map[floor(ray.y)][floor(ray.x)]) {
      ray.x += cos(rayRad) / rayCastConfig.precision;
      ray.y += sin(rayRad) / rayCastConfig.precision;
    }
    const wallDist =
      sqrt((player.x - ray.x) ** 2 + (player.y - ray.y) ** 2) *
      cos(rToD(player.angle - rayAngle));
    const wallHeight = floor(screen.hHeight / wallDist);
    drawLine(i, 0, i, screen.hHeight - wallHeight, "cyan");
    drawLine(
      i,
      screen.hHeight - wallHeight,
      i,
      screen.hHeight + wallHeight,
      "red"
    );
    drawLine(i, screen.hHeight + wallHeight, i, screen.height, "green");
    rayAngle += rayCastConfig.incAngle;
  }
};
const start = () => {
  document.addEventListener("keydown", playerInput);
  clearScreen();
  rayCasting();
};

start();
