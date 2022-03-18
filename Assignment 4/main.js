
"use strict";

var gl;
var moon;
var earth;
var sun;
var ms;

function init() {
    var canvas = document.getElementById("webgl-canvas");
    gl = canvas.getContext("webgl2");

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    var near = 1.5
    var far = 4.46
    // Add your sphere creation and configuration code here

    ms = new MatrixStack();
    ms.load(lookAt([0.0,0.0,(far-near)],[0.0,0.0,-1.0],[0.0,1.0,0.0]));

    var P = perspective(59.5564712, canvas.clientWidth/canvas.clientHeight, near, far)

    var pointMode = false

    sun = Object.assign(new Sphere(), {
        "radius" : .4,
        "color" : [1.0, 149.0/255.0, 0, 1.0],
        "P" : P,
        "PointMode" : pointMode
    })
    earth = Object.assign(new Sphere(), {
        "radius" : .1,
        "color" : [37.0/255.0, 91.0/255.0, 184.0/255.0,1.0],
        "P" : P,
        "orbit" : 1.20,
        "PointMode" : pointMode
    })
    moon = Object.assign(new Sphere(), {
        "radius" : .03,
        "color" : [0.5,0.5,0.5,1.0],
        "P" : P,
        "orbit" : .25,
        "PointMode" : pointMode
    })

    
    requestAnimationFrame(render);
}

function render(milliseconds) {

    let seconds = milliseconds/1000.0
    let earthYears = seconds/5.0*Math.PI //In this sim, the Earth rotates around the sun every 10 seconds
    // Update your motion variables here

    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    
    // Rendering the sun:
    ms.push();
    ms.scale(sun.radius);
    sun.MV = ms.current();
    sun.render();
    ms.pop();

    // Rendering the Earth:
    ms.push();
    ms.rotate(earthYears,[0,0,1,0]); //Earth rotates around the sun every 200 seconds
    ms.translate(earth.orbit,0,0); //Push out the Earth from the sun
    ms.push(); //Duplicate this math for later
    ms.rotate(earthYears*364.25,[0,0,1,0]); //Undo rotation done for positional reasons, and add rotation for day
    ms.scale(earth.radius);
    earth.MV = ms.current();
    earth.render();
    ms.pop();

    // Rendering the moon:
    ms.rotate(earthYears*365.25/27.32,[0,0,1,0]); //The moon's orbital period around the earth is ~27.32 days
    ms.translate(moon.orbit,0,0);
    ms.scale(moon.radius);
    moon.MV = ms.current();
    moon.render();
    ms.pop();
    requestAnimationFrame(render);
}

window.onload = init;