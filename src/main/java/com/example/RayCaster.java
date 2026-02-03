package com.example;

import java.util.stream.IntStream;

import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;

public class RayCaster {
    private final int startX, startY;
    private final int endX, endY;
    private double posX, posY;
    private double dirX, dirY;
    private double planeX, planeY;
    private final int width, height;
    private final int mapWidth, mapHeight;
    private final double cellWidth, cellHeight;
    private final GraphicsContext g;
    private final boolean[][] map;
    private final Result[] results;
    private final double movSpeed, rotSpeed, radius;

    public RayCaster(int startX, int startY, int endX, int endY, GraphicsContext g, int[][] maze) {
        this.g = g;
        this.width = (int) g.getCanvas().getWidth();
        this.height = (int) g.getCanvas().getHeight();
        this.mapWidth = 2 * maze[0].length + 1;
        this.mapHeight = 2 * maze.length + 1;
        this.cellWidth = g.getCanvas().getWidth() / mapWidth;
        this.cellHeight = g.getCanvas().getHeight() / mapHeight;
        map = new boolean[mapHeight][mapWidth];
        setMap(maze);
        this.startX = startX * 2 + 1;
        this.startY = startY * 2 + 1;
        this.endX = endX * 2 + 1;
        this.endY = endY * 2 + 1;
        reset();
        this.movSpeed = 5;
        this.rotSpeed = 3;
        this.radius = 0.15;
        this.results = new Result[width];
    }

    public void setMap(int[][] maze) {
        for (int i = 0; i < mapHeight; i++)
            for (int j = 0; j < mapWidth; j++)
                map[i][j] = true;
        for (int y = 0; y < maze.length; y++) {
            for (int x = 0; x < maze[0].length; x++) {
                int nx = 2 * x + 1;
                int ny = 2 * y + 1;
                map[ny][nx] = false;
                int val = maze[y][x];
                if ((val & 8) == 0 && ny > 0)
                    map[ny - 1][nx] = false;
                if ((val & 4) == 0 && nx < mapWidth - 1)
                    map[ny][nx + 1] = false;
                if ((val & 2) == 0 && ny < mapHeight - 1)
                    map[ny + 1][nx] = false;
                if ((val & 1) == 0 && nx > 0)
                    map[ny][nx - 1] = false;
            }
        }
    }

    public void clear() {
        g.clearRect(0, 0, width, height);
    }

    public void renderMap() {
        for (int y = 0; y < mapHeight; y++) {
            for (int x = 0; x < mapWidth; x++) {
                if (x == startX && y == startY)
                    g.setFill(Color.BLUE);
                else if (x == endX && y == endY)
                    g.setFill(Color.FUCHSIA);
                else
                    g.setFill(!map[y][x] ? Color.BLACK : Color.WHITE);
                g.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
            }
        }
        g.setFill(Color.RED);
        g.fillOval(posX * cellWidth, posY * cellHeight, cellWidth / 2, cellHeight / 2);
    }

    private Result dda(int w) {
        double cameraX = 2.0 * w / width - 1;
        double rayX = dirX + planeX * cameraX;
        double rayY = dirY + planeY * cameraX;
        int mapX = (int) posX;
        int mapY = (int) posY;
        int side = 0;
        double dx = rayX == 0 ? 1e10 : Math.abs(1.0 / rayX);
        double dy = rayY == 0 ? 1e10 : Math.abs(1.0 / rayY);
        double tdx, tdy;
        int stepX, stepY;
        if (rayX < 0) {
            stepX = -1;
            tdx = (posX - mapX) * dx;
        } else {
            stepX = 1;
            tdx = (mapX + 1.0 - posX) * dx;
        }

        if (rayY < 0) {
            stepY = -1;
            tdy = (posY - mapY) * dy;
        } else {
            stepY = 1;
            tdy = (mapY + 1.0 - posY) * dy;
        }
        while (mapX >= 0 && mapX < mapWidth && mapY >= 0 && mapY < mapHeight && !map[mapY][mapX]) {
            if (tdx < tdy) {
                tdx += dx;
                mapX += stepX;
                side = 0;
            } else {
                tdy += dy;
                mapY += stepY;
                side = 1;
            }
        }
        double wallDist = Math.max(side == 0 ? tdx - dx : tdy - dy, 0.001);
        return new Result(rayX, rayY, wallDist, side == 0);
    }

    public void castRays() {
        IntStream.range(0, width).parallel().forEach(w -> results[w] = dda(w));
        for (int w = 0; w < width; w++) {
            Result result = results[w];
            int wallHeight = (int) (height / result.euclidean);
            int wallStart = -wallHeight / 2 + height / 2;
            int wallEnd = wallHeight / 2 + height / 2;
            g.setStroke(Color.BLUE);
            g.strokeLine(w, 0, w, wallStart);
            g.setStroke(result.hitVert ? Color.RED : Color.DARKRED);
            g.strokeLine(w, wallStart, w, wallEnd);
            g.setStroke(Color.GREEN);
            g.strokeLine(w, wallEnd, w, height - 1);
        }
    }

    public void emitRays() {
        IntStream.range(0, width).parallel().forEach(w -> results[w] = dda(w));
        for (int w = 0; w < width; w++) {
            Result result = results[w];
            double wallX = posX + result.rayX * result.euclidean;
            double wallY = posY + result.rayY * result.euclidean;
            g.setStroke(Color.GREEN);
            g.strokeLine(posX * cellWidth, posY * cellHeight, wallX * cellWidth, wallY * cellHeight);
        }
    }

    public void rotate(boolean left, double dt) {
        double theta = (left ? -rotSpeed : rotSpeed) * dt;
        double oldDirX = dirX;
        dirX = dirX * Math.cos(theta) - dirY * Math.sin(theta);
        dirY = oldDirX * Math.sin(theta) + dirY * Math.cos(theta);
        double oldPlaneX = planeX;
        planeX = planeX * Math.cos(theta) - planeY * Math.sin(theta);
        planeY = oldPlaneX * Math.sin(theta) + planeY * Math.cos(theta);
    }

    public void move(boolean forward, double dt) {
        double delta = (forward ? movSpeed : -movSpeed) * dt;
        double dx = dirX * delta;
        double dy = dirY * delta;
        int mapX = (int) (posX + dx + Math.signum(dx) * radius);
        int mapY = (int) (posY + dy + Math.signum(dy) * radius);
        if (mapX >= 0 && mapX < mapWidth && !map[(int) posY][mapX]) {
            posX += dx;
        }
        if (mapY >= 0 && mapY < mapHeight && !map[mapY][(int) posX]) {
            posY += dy;
        }
    }

    public void reset() {
        clear();
        this.posX = startX;
        this.posY = startY;
        this.dirX = 1;
        this.dirY = 0;
        this.planeX = 0;
        this.planeY = 0.66;
    }

    public boolean isAtEnd() {
        return (int) posX == endX && (int) posY == endY;
    }
}
