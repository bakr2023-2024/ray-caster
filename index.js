import { Game } from "./raycasting.js";
const game = new Game({
  screenConfig: { width: window.innerWidth, height: window.innerHeight },
  playerConfig: {
    position: { x: 2, y: 2 },
    moveSpeed: 5,
    rotSpeed: 3,
  },
  map: [
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
  ],
  colors: {
    ceilingColor: 0xffff0000,
    wallColor: 0xff0000ff,
    darkWallColor: 0xff000088,
    floorColor: 0xff00ff00,
  },
});
game.start();
