const screen = {
  width: window.innerWidth,
  height: window.innerHeight,
  hWidth: null,
  hHeight: null,
  scale: 1,
};
const player = {
  fov: 60,
  angle: 90,
  x: 2,
  y: 2,
  hFov: null,
  speed: 0.1,
  rotation: 5,
  radius: 5,
};
screen.hWidth = screen.width / 2;
screen.hHeight = screen.height / 2;
player.hFov = player.fov / 2;
const projection = {
  width: screen.width / screen.scale,
  height: screen.height / screen.scale,
  hWidth: screen.hWidth / screen.scale,
  hHeight: screen.hHeight / screen.scale,
};
const rayCastConfig = {
  incAngle: player.fov / projection.width,
  precision: 64,
  delay: 30,
};
const keys = {
  up: {
    code: "KeyW",
    active: false,
  },
  down: {
    code: "KeyS",
    active: false,
  },
  left: {
    code: "KeyA",
    active: false,
  },
  right: {
    code: "KeyD",
    active: false,
  },
  rotLeft: {
    code: "KeyQ",
    active: false,
  },
  rotRight: {
    code: "KeyE",
    active: false,
  },
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
const canvas = document.createElement("canvas");
canvas.width = screen.width;
canvas.height = screen.height;
document.body.appendChild(canvas);
const g = canvas.getContext("2d");
g.scale(screen.scale, screen.scale);
g.translate(0.5, 0.5);
const { cos, sin, sqrt, PI, floor } = Math;
const rToD = (d) => (d * PI) / 180;
const drawLine = (x1, y1, x2, y2, color) => {
  g.strokeStyle = color;
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();
};
const clearScreen = () =>
  g.clearRect(0, 0, projection.width, projection.height);
const movePlayer = (angle, add) => {
  const playerCos = cos(rToD(angle)) * player.speed;
  const playerSin = sin(rToD(angle)) * player.speed;
  const dx = add ? playerCos : -playerCos;
  const dy = add ? playerSin : -playerSin;
  const newX = player.x + dx;
  const newY = player.y + dy;
  const checkX = floor(newX + dx * player.radius);
  const checkY = floor(newY + dy * player.radius);
  if (checkX >= 0 && checkX < map.length && !map[floor(player.y)][checkX])
    player.x = newX;
  if (checkY >= 0 && checkY < map.length && !map[checkY][floor(player.x)])
    player.y = newY;
};
const playerInput = () => {
  if (keys.up.active) movePlayer(player.angle, true);
  if (keys.down.active) movePlayer(player.angle, false);
  if (keys.left.active) movePlayer(player.angle - 90, true);
  if (keys.right.active) movePlayer(player.angle + 90, true);
  if (keys.rotLeft.active)
    player.angle = (player.angle - player.rotation + 360) % 360;
  if (keys.rotRight.active)
    player.angle = (player.angle + player.rotation) % 360;
};
const setKey = ({ code }, set) => {
  for (const keyName in keys) {
    if (keys[keyName].code === code) {
      keys[keyName].active = set;
      break;
    }
  }
};
const rayCasting = () => {
  let rayAngle = player.angle - player.hFov;
  for (let i = 0; i < projection.width; i++) {
    const ray = { x: player.x, y: player.y };
    const rayRad = rToD(rayAngle);
    while (!map[floor(ray.y)][floor(ray.x)]) {
      ray.x += cos(rayRad) / rayCastConfig.precision;
      ray.y += sin(rayRad) / rayCastConfig.precision;
    }
    const wallDist =
      sqrt((player.x - ray.x) ** 2 + (player.y - ray.y) ** 2) *
      cos(rToD(player.angle - rayAngle));
    const wallHeight = floor(projection.hHeight / wallDist);
    drawLine(i, 0, i, projection.hHeight - wallHeight, "cyan");
    drawLine(
      i,
      projection.hHeight - wallHeight,
      i,
      projection.hHeight + wallHeight,
      "red"
    );
    drawLine(i, projection.hHeight + wallHeight, i, projection.height, "green");
    rayAngle += rayCastConfig.incAngle;
  }
};
const rayCastingDDA = () => {};
const renderPauseScreen = () => {
  g.fillStyle = "black";
  g.fillRect(0, 0, projection.width, projection.height);
  g.fillStyle = "white";
  const msg = "PAUSED, click anywhere to continue";
  g.fillText(msg, projection.hWidth - msg.length * 2, projection.hHeight);
};
const start = () => {
  let mainLoop = setInterval(() => {
    clearScreen();
    playerInput();
    rayCasting();
  }, rayCastConfig.delay);
  document.addEventListener("keydown", (e) => setKey(e, true));
  document.addEventListener("keyup", (e) => setKey(e, false));
  window.addEventListener("blur", () => {
    if (mainLoop) {
      clearInterval(mainLoop);
      mainLoop = null;
      clearScreen();
      renderPauseScreen();
    }
  });
  canvas.addEventListener("click", () => {
    if (!mainLoop) {
      mainLoop = setInterval(() => {
        playerInput();
        clearScreen();
        rayCasting();
      }, rayCastConfig.delay);
    }
  });
};

start();
