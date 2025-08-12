const screen = {
  width: window.innerWidth,
  height: window.innerHeight,
  hWidth: null,
  hHeight: null,
};
const player = {
  x: 2,
  y: 2,
  dir: {
    x: -1,
    y: 0,
  },
  speed: 5,
  rotation: 3,
};
screen.hWidth = screen.width / 2;
screen.hHeight = screen.height / 2;
delay = 25;
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
screen.buffer = new Uint32Array(screen.imageData.data.buffer);
const { cos, sin, sqrt, floor, abs, min, max } = Math;
const playerInput = (delta) => {
  if (keys.up.active) move(player, delta, true);
  if (keys.down.active) move(player, delta, false);
  if (keys.left.active) rotate(player.rotation * delta);
  if (keys.right.active) rotate(-player.rotation * delta);
};
const setKey = ({ code }, set) => {
  for (const keyName in keys) {
    if (keys[keyName].code === code) {
      keys[keyName].active = set;
      break;
    }
  }
};
const rgba = (r, g, b, a) => (a << 24) | (b << 16) | (g << 8) | r;
const drawLine = (x, y1, y2, color) => {
  const col = rgba(color[0], color[1], color[2], color[3]);
  for (let y = y1 | 0; y < (y2 | 0); y++) {
    screen.buffer[x + y * screen.width] = col;
  }
};
const plane = {
  x: 0,
  y: 0.66,
};
const move = (obj, delta, forward = true) => {
  const dx = obj.dir.x * obj.speed * delta;
  const dy = obj.dir.y * obj.speed * delta;
  const newX = obj.x + (forward ? dx : -dx);
  const newY = obj.y + (forward ? dy : -dy);
  const checkX = floor(newX);
  const checkY = floor(newY);
  if (checkX >= 0 && checkX < map.length && !map[floor(obj.y)][checkX])
    obj.x = newX;
  if (checkY >= 0 && checkY < map.length && !map[checkY][floor(obj.x)])
    obj.y = newY;
};
const rotate = (theta) => {
  const cosT = cos(theta);
  const sinT = sin(theta);
  const oldDirX = player.dir.x;
  player.dir.x = oldDirX * cosT - player.dir.y * sinT;
  player.dir.y = oldDirX * sinT + player.dir.y * cosT;
  const oldPlaneX = plane.x;
  plane.x = oldPlaneX * cosT - plane.y * sinT;
  plane.y = oldPlaneX * sinT + plane.y * cosT;
};

const rayCastingDDA = () => {
  for (let x = 0; x < screen.width; x++) {
    const cameraX = (2 * x) / screen.width - 1;
    const ray = {
      x: player.dir.x + plane.x * cameraX,
      y: player.dir.y + plane.y * cameraX,
    };

    let mapX = floor(player.x);
    let mapY = floor(player.y);
    let side;

    let dx = ray.x == 0 ? 1e10 : abs(1 / ray.x);
    let dy = ray.y == 0 ? 1e10 : abs(1 / ray.y);

    let stepX, stepY;
    let sideDistX, sideDistY;

    if (ray.x < 0) {
      stepX = -1;
      sideDistX = (player.x - mapX) * dx;
    } else {
      stepX = 1;
      sideDistX = (mapX + 1.0 - player.x) * dx;
    }

    if (ray.y < 0) {
      stepY = -1;
      sideDistY = (player.y - mapY) * dy;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1.0 - player.y) * dy;
    }

    do {
      if (sideDistX < sideDistY) {
        sideDistX += dx;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += dy;
        mapY += stepY;
        side = 1;
      }
    } while (!map[mapY][mapX]);

    const perpWallDist = side == 0 ? sideDistX - dx : sideDistY - dy;
    const lineHeight = floor(screen.hHeight / perpWallDist);

    let drawStart = -lineHeight + screen.hHeight;
    if (drawStart < 0) drawStart = 0;
    let drawEnd = lineHeight + screen.hHeight;
    if (drawEnd >= screen.height) drawEnd = screen.height - 1;

    drawLine(x, 0, drawStart, [0, 0, 255, 255]);
    drawLine(x, drawStart, drawEnd, [side == 1 ? 127 : 255, 0, 0, 255]);
    drawLine(x, drawEnd, screen.height, [0, 255, 0, 255]);
  }

  g.putImageData(screen.imageData, 0, 0);
};

let running = true;
let lastTime = performance.now();
let fps = 0;
const drawFPS = () => {
  g.fillStyle = "#fff";
  g.font = "16px monospace";
  g.textAlign = "right";
  g.fillText(fps.toFixed(1) + " FPS", screen.width - 10, 20);
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
const loop = () => {
  if (!running) return;
  const now = performance.now();
  const delta = (now - lastTime) / 1000;
  fps = 1 / delta;
  lastTime = now;
  playerInput(delta);
  rayCastingDDA();
  drawFPS();
  requestAnimationFrame(loop);
};

const start = () => {
  document.addEventListener("keydown", (e) => setKey(e, true));
  document.addEventListener("keyup", (e) => setKey(e, false));

  window.addEventListener("blur", () => {
    running = false;
    renderPauseScreen();
  });

  canvas.addEventListener("click", () => {
    if (!running) {
      running = true;
      requestAnimationFrame(loop);
    }
  });

  requestAnimationFrame(loop);
};

start();
