const { cos, sin, sqrt, floor, abs, min, max } = Math;
class Screen {
  constructor(width, height) {
    this.w = width;
    this.h = height;
    this.hw = width / 2;
    this.hh = height / 2;
  }
  initCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = this.w;
    canvas.height = this.h;
    document.body.appendChild(canvas);
    const g = canvas.getContext("2d");
    this.imageData = g.createImageData(this.w, this.h);
    this.buffer = new Uint32Array(this.imageData.data.buffer);
    this.canvas = canvas;
    this.g = g;
  }
  drawLine(x, y1, y2, color) {
    for (let y = y1 | 0; y < (y2 | 0); y++) this.buffer[x + y * this.w] = color;
  }
  renderBuffer() {
    this.g.putImageData(this.imageData, 0, 0);
  }
}
class Player {
  constructor({
    position,
    direction = { x: -1, y: 0 },
    plane = { x: 0, y: 0.66 },
    moveSpeed = 5,
    rotSpeed = 3,
  } = {}) {
    this.x = position.x;
    this.y = position.y;
    this.dir = direction;
    this.plane = plane;
    this.moveSpeed = moveSpeed;
    this.rotSpeed = rotSpeed;
  }
  move(map, dt, forward) {
    const dx = this.dir.x * this.moveSpeed * dt;
    const dy = this.dir.y * this.moveSpeed * dt;
    const newX = this.x + (forward ? dx : -dx);
    const newY = this.y + (forward ? dy : -dy);
    const checkX = floor(newX);
    const checkY = floor(newY);
    if (checkX >= 0 && checkX < map.length && !map[floor(this.y)][checkX])
      this.x = newX;
    if (checkY >= 0 && checkY < map.length && !map[checkY][floor(this.x)])
      this.y = newY;
  }
  rotate(dt, left) {
    const theta = (left ? this.rotSpeed : -this.rotSpeed) * dt;
    const cosT = cos(theta);
    const sinT = sin(theta);
    const oldDirX = this.dir.x;
    this.dir.x = oldDirX * cosT - this.dir.y * sinT;
    this.dir.y = oldDirX * sinT + this.dir.y * cosT;
    const oldPlaneX = this.plane.x;
    this.plane.x = oldPlaneX * cosT - this.plane.y * sinT;
    this.plane.y = oldPlaneX * sinT + this.plane.y * cosT;
  }
}
class InputManager {
  constructor() {
    this.keys = {
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
  }
  playerInput(map, player, delta) {
    if (this.keys.up.active) player.move(map, delta, true);
    if (this.keys.down.active) player.move(map, delta, false);
    if (this.keys.left.active) player.rotate(delta, true);
    if (this.keys.right.active) player.rotate(delta, false);
  }
  setKey(code, set) {
    for (const keyName in this.keys) {
      if (this.keys[keyName].code === code) {
        this.keys[keyName].active = set;
        break;
      }
    }
  }
}
class RayCaster {
  constructor(
    screen,
    player,
    map,
    {
      ceilingColor = 0xff000000,
      wallColor = 0xffffffff,
      darkWallColor = 0xff888888,
      floorColor = 0xff000000,
    } = {}
  ) {
    this.screen = screen;
    this.player = player;
    this.map = map;
    this.ceilingColor = ceilingColor;
    this.wallColor = wallColor;
    this.darkWallColor = darkWallColor;
    this.floorColor = floorColor;
  }
  rayCastingDDA() {
    let rayX, rayY;
    for (let x = 0; x < this.screen.w; x++) {
      const cameraX = (2 * x) / this.screen.w - 1;
      rayX = this.player.dir.x + this.player.plane.x * cameraX;
      rayY = this.player.dir.y + this.player.plane.y * cameraX;
      let mapX = floor(this.player.x);
      let mapY = floor(this.player.y);
      let side;
      let dx = rayX == 0 ? 1e10 : abs(1 / rayX);
      let dy = rayY == 0 ? 1e10 : abs(1 / rayY);
      let stepX, stepY;
      let sideDistX, sideDistY;
      if (rayX < 0) {
        stepX = -1;
        sideDistX = (this.player.x - mapX) * dx;
      } else {
        stepX = 1;
        sideDistX = (mapX + 1.0 - this.player.x) * dx;
      }
      if (rayY < 0) {
        stepY = -1;
        sideDistY = (this.player.y - mapY) * dy;
      } else {
        stepY = 1;
        sideDistY = (mapY + 1 - this.player.y) * dy;
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
      } while (!this.map[mapY][mapX]);
      const perpWallDist = side == 0 ? sideDistX - dx : sideDistY - dy;
      const lineHeight = floor(this.screen.hh / perpWallDist);
      let drawStart = -lineHeight + this.screen.hh;
      if (drawStart < 0) drawStart = 0;
      let drawEnd = lineHeight + this.screen.hh;
      if (drawEnd >= this.screen.h) drawEnd = this.screen.h - 1;
      this.screen.drawLine(x, 0, drawStart, this.ceilingColor);
      this.screen.drawLine(
        x,
        drawStart,
        drawEnd,
        side == 0 ? this.darkWallColor : this.wallColor
      );
      this.screen.drawLine(x, drawEnd, this.screen.h, this.floorColor);
    }
    this.screen.renderBuffer();
  }
}
class Game {
  constructor({ screenConfig, playerConfig, map, colors = {} } = {}) {
    this.map = map;
    this.screen = new Screen(screenConfig.width, screenConfig.height);
    this.player = new Player(playerConfig);
    this.inputM = new InputManager();
    this.rayCaster = new RayCaster(this.screen, this.player, map, colors);
    this.running = true;
    this.lastTime = performance.now();
    this.fps = 0;
    this.loop = this.loop.bind(this);
  }
  init() {
    this.screen.initCanvas();
    this.bindEvents();
  }
  bindEvents() {
    document.addEventListener("keydown", (e) =>
      this.inputM.setKey(e.code, true)
    );
    document.addEventListener("keyup", (e) =>
      this.inputM.setKey(e.code, false)
    );
    window.addEventListener("blur", () => {
      this.running = false;
      this.renderPauseScreen();
    });
    this.screen.canvas.addEventListener("click", () => {
      if (!this.running) {
        this.running = true;
        requestAnimationFrame(this.loop);
      }
    });
  }
  drawFPS() {
    this.screen.g.fillStyle = "#fff";
    this.screen.g.font = "16px monospace";
    this.screen.g.textAlign = "right";
    this.screen.g.fillText(
      this.fps.toFixed(1) + " FPS",
      this.screen.w - 10,
      20
    );
  }
  renderPauseScreen() {
    this.screen.g.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.screen.g.fillRect(0, 0, this.screen.w, this.screen.h);
    this.screen.g.fillStyle = "#fff";
    this.screen.g.font = "bold 32px sans-serif";
    this.screen.g.textAlign = "center";
    this.screen.g.textBaseline = "middle";
    this.screen.g.fillText(
      "PAUSED, click anywhere to continue",
      this.screen.hw,
      this.screen.hh
    );
  }
  loop() {
    if (!this.running) return;
    const now = performance.now();
    const delta = (now - this.lastTime) / 1000;
    this.fps = 1 / delta;
    this.lastTime = now;
    this.inputM.playerInput(this.map, this.player, delta);
    this.rayCaster.rayCastingDDA();
    this.drawFPS();
    requestAnimationFrame(this.loop);
  }
  start() {
    this.init();
    requestAnimationFrame(this.loop);
  }
}
export { Game };
