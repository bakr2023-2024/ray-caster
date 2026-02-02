package com.example;

import java.util.stream.IntStream;

import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;

public class RayCaster {
    private double posX, posY;
    private int startX, startY;
    private int endX, endY;
    private double dirX, dirY;
    private double planeX, planeY;
    private int width, height;
    private double cellWidth, cellHeight;
    private GraphicsContext g;
    private int[][] map;
    private Result[] results;
    private double movSpeed, rotSpeed, radius;

    public RayCaster(int startX, int startY, int endX, int endY, GraphicsContext g, int[][] map) {
        this.g = g;
        this.width = (int) g.getCanvas().getWidth();
        this.height = (int) g.getCanvas().getHeight();
        this.cellWidth = g.getCanvas().getWidth() / map[0].length;
        this.cellHeight = g.getCanvas().getHeight() / map.length;
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        reset();
        this.map = map;
        this.movSpeed = 5;
        this.rotSpeed = 3;
        this.radius = 0.15;
        this.results = new Result[width];
    }

    public void clear() {
        g.clearRect(0, 0, width, height);
    }

    public void renderMap() {
        for (int y = 0; y < map.length; y++) {
            for (int x = 0; x < map[0].length; x++) {
                if (x == startX && y == startY)
                    g.setFill(Color.BLUE);
                else if (x == endX && y == endY)
                    g.setFill(Color.FUCHSIA);
                else
                    g.setFill(map[y][x] == 0 ? Color.BLACK : Color.WHITE);
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
        while (map[mapY][mapX] == 0) {
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
        if (mapX >= 0 && mapX < map[0].length && map[(int) posY][mapX] == 0) {
            posX += dx;
        }
        if (mapY >= 0 && mapY < map.length && map[mapY][(int) posX] == 0) {
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
