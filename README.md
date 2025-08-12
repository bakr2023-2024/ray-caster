# **Raycasting Engine with DDA Algorithm**

_A JavaScript implementation of a raycasting engine inspired by Wolfenstein 3D, using the Digital Differential Analyzer (DDA) algorithm._

---

## **📌 Overview**

This project implements a simple 3D raycasting engine using the **DDA (Digital Differential Analyzer)** algorithm for efficient wall detection. The engine renders a pseudo-3D environment from a 2D grid map, simulating the way classic games like _Wolfenstein 3D_ worked.

Key features:  
✅ **Player movement** (forward, backward, rotation)  
✅ **Raycasting** using DDA for wall collision detection  
✅ **Optimized rendering** with direct pixel buffer manipulation  
✅ **FPS counter** for performance monitoring

---

## **🔧 Key Components**

### **1. Player Mechanics**

The player has:

- **Position (`x`, `y`)** – Current location in the world.
- **Direction (`dir.x`, `dir.y`)** – A normalized vector indicating where the player is facing.
- **Camera Plane (`plane.x`, `plane.y`)** – A perpendicular vector to `dir`, defining the FOV.
- **Move Speed (`moveSpeed`)** – How fast the player moves forward/backward.
- **Rotation Speed (`rotSpeed`)** – How fast the player turns left/right.

#### **Movement (`move` method)**

- Moves forward/backward based on `dir` and `moveSpeed`.
- Checks collision with walls (1s in the map).

#### **Rotation (`rotate` method)**

- Rotates `dir` and `plane` vectors using trigonometry (`cos`, `sin`).
- Adjusts turning speed with `rotSpeed`.

---

### **2. Raycasting with DDA Algorithm**

The core of the engine is the **DDA algorithm**, which efficiently traces rays from the player to walls.

#### **Key Variables in `rayCastingDDA()`**

| Variable                 | Purpose                                                              |
| ------------------------ | -------------------------------------------------------------------- |
| `rayX`, `rayY`           | Direction of the current ray being cast.                             |
| `cameraX`                | Screen-space X-coordinate (converted to camera plane offset).        |
| `mapX`, `mapY`           | Current grid cell being checked for walls.                           |
| `sideDistX`, `sideDistY` | Distance to next X/Y grid line.                                      |
| `stepX`, `stepY`         | Direction of ray stepping (+1 or -1).                                |
| `dx`, `dy`               | Distance between X/Y grid lines (delta).                             |
| `side`                   | Whether the ray hit a **North/South (0)** or **East/West (1)** wall. |
| `perpWallDist`           | Perpendicular distance to the wall (used for wall height).           |
| `lineHeight`             | Height of the wall slice to draw.                                    |
| `drawStart`, `drawEnd`   | Vertical start/end of the wall on screen.                            |

#### **How DDA Works**

1. **Ray Setup**

   - For each screen column (`x`), compute `rayX` and `rayY` (direction of the ray).
   - `cameraX` converts screen `x` into a camera plane offset.

2. **DDA Algorithm**

   - Calculate `dx` and `dy` (distance to next X/Y grid line).
   - Determine `stepX` and `stepY` (ray stepping direction).
   - Incrementally step (`mapX`, `mapY`) until a wall is hit.

3. **Wall Distance & Rendering**
   - Compute `perpWallDist` (avoid fisheye effect).
   - Calculate `lineHeight` (how tall the wall appears).
   - Draw ceiling, wall, and floor pixels for the column.

---

### **3. Screen Rendering (`Screen` Class)**

- **`drawLine(x, y1, y2, color)`** – Draws a vertical line (wall slice).
- **`renderBuffer()`** – Updates the canvas with the pixel buffer.

---

## **📚 Resources & References**

This implementation was guided by:

- [Lodev’s Raycasting Tutorial](https://lodev.org/cgtutor/raycasting.html)
- [RayCasting Tutorial Wiki](https://github.com/vinibiavatti1/RayCastingTutorial/wiki/)
- [javidx9’s YouTube Tutorial](https://www.youtube.com/watch?v=NbSee-XM7WA)

---

## **🚀 How to Run**

1. Clone the repository.
2. Open `index.html` in a browser.
3. Use **WASD** to move and turn.

---

## **🔍 Future Improvements**

- **Textured walls** (instead of flat colors).
- **Sprite rendering** (enemies, objects).
- **Optimizations** (faster DDA, better collision).
- **Features** (Mini-map)

---

**🎮 Happy Coding!** 🎮
