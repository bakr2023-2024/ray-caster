package com.example;

class Result {
    double rayX, rayY;
    double euclidean;
    boolean hitVert;

    public Result(double rayX, double rayY, double euclidean, boolean hitVert) {
        this.rayX = rayX;
        this.rayY = rayY;
        this.euclidean = euclidean;
        this.hitVert = hitVert;
    }

}
