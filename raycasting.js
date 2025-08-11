const screen = {
  width: window.innerWidth,
  height: window.innerHeight,
  hWidth: null,
  hHeight: null,
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
const rayCastConfig = {
  incAngle: player.fov / screen.width,
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
screen.imageData = g.createImageData(screen.width, screen.height);
screen.buffer = screen.imageData.data;
const { cos, sin, sqrt, PI, floor } = Math;
const rToD = (d) => (d * PI) / 180;
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
const drawLine = (x, y1, y2, color) => {
  for (let y = y1 | 0; y < (y2 | 0); y++) {
    const idx = 4 * (x + y * screen.width);
    screen.buffer[idx] = color[0];
    screen.buffer[idx + 1] = color[1];
    screen.buffer[idx + 2] = color[2];
    screen.buffer[idx + 3] = color[3];
  }
};
const rayCasting = () => {
  let rayAngle = player.angle - player.hFov;
  for (let i = 0; i < screen.width; i++) {
    let ray = { x: player.x, y: player.y };
    const rayRad = rToD(rayAngle);
    while (!map[floor(ray.y)][floor(ray.x)]) {
      ray.x += cos(rayRad) / rayCastConfig.precision;
      ray.y += sin(rayRad) / rayCastConfig.precision;
    }
    const wallDist =
      sqrt((player.x - ray.x) ** 2 + (player.y - ray.y) ** 2) *
      cos(rToD(player.angle - rayAngle));
    const wallHeight = floor(screen.hHeight / wallDist);
    drawLine(i, 0, screen.hHeight - wallHeight, [0, 0, 255, 255]);
    drawLine(
      i,
      screen.hHeight - wallHeight,
      screen.hHeight + wallHeight,
      [255, 0, 0, 255]
    );
    drawLine(i, screen.hHeight + wallHeight, screen.height, [0, 255, 0, 255]);
    rayAngle += rayCastConfig.incAngle;
  }

  g.putImageData(screen.imageData, 0, 0);
};
const renderPauseScreen = () => {
  g.fillStyle = "rgba(0, 0, 0, 0.5)";
  g.fillRect(0, 0, screen.width, screen.height);
  g.fillStyle = "#fff";
  g.font = "bold 32px sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(
    "PAUSED, click anywhere to continue",
    screen.width / 2,
    screen.height / 2
  );
};
const start = () => {
  document.addEventListener("keydown", (e) => setKey(e, true));
  document.addEventListener("keyup", (e) => setKey(e, false));
  let mainLoop = setInterval(() => {
    playerInput();
    rayCasting();
  }, rayCastConfig.delay);
  window.addEventListener("blur", () => {
    if (mainLoop) {
      clearInterval(mainLoop);
      mainLoop = null;
      renderPauseScreen();
    }
  });
  canvas.addEventListener("click", () => {
    if (!mainLoop) {
      mainLoop = setInterval(() => {
        playerInput();
        rayCasting();
      }, rayCastConfig.delay);
    }
  });
};

start();
