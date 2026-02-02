package com.example;

import java.util.HashMap;

import javafx.animation.AnimationTimer;
import javafx.scene.Scene;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;

public class RayCasterView {
    private final HashMap<KeyCode, Boolean> keys;
    private final Scene scene;
    private final RayCaster rc;
    private final AnimationTimer timer;
    private final int width, height;
    private boolean running = false;

    public RayCasterView(int[][] map, int startX, int startY, int endX, int endY, int width, int height, Runnable cb) {
        this.width = width;
        this.height = height;
        keys = new HashMap<>();
        Canvas canvas = new Canvas(width, height);
        GraphicsContext g = canvas.getGraphicsContext2D();
        Pane pane = new Pane(canvas);
        scene = new Scene(pane);
        scene.setOnKeyPressed((e) -> keys.put(e.getCode(), true));
        scene.setOnKeyReleased((e) -> keys.put(e.getCode(), false));
        rc = new RayCaster(startX, startY, endX, endY, g, map);
        timer = new AnimationTimer() {
            private long lastTime = 0;

            @Override
            public void handle(long now) {
                if (lastTime > 0) {
                    double dt = (now - lastTime) / 1e9;
                    if (keys.getOrDefault(KeyCode.ESCAPE, false))
                        running = false;
                    if (keys.getOrDefault(KeyCode.A, false))
                        rc.rotate(true, dt);
                    if (keys.getOrDefault(KeyCode.D, false))
                        rc.rotate(false, dt);
                    if (keys.getOrDefault(KeyCode.W, false))
                        rc.move(true, dt);
                    if (keys.getOrDefault(KeyCode.S, false))
                        rc.move(false, dt);
                    if (keys.getOrDefault(KeyCode.TAB, false)) {
                        rc.renderMap();
                        rc.emitRays();
                    } else {
                        rc.castRays();
                    }
                    g.setFill(Color.BLACK);
                    g.fillText(String.format("FPS: %.0f", 1.0 / dt), 10, 20);
                    if (rc.isAtEnd()) {
                        stop();
                        keys.clear();
                        rc.reset();
                        cb.run();
                    }
                }
                lastTime = now;
            }
        };
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    public Scene getScene() {
        return scene;
    }

    public void start() {
        running = true;
        timer.start();
    }

    public boolean isRunning() {
        return running;
    }

    public void stop() {
        running = false;
        timer.stop();
    }

}
