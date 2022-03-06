function render(time){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    cone.render(time);
    requestAnimationFrame(render);
}
function init(){
    var canvas = document.getElementById("webgl-canvas");
    gl = canvas.getContext("webgl2");
    gl.clearColor(.9,.8,0.2,255);
    gl.enable(gl.DEPTH_TEST); 
    cone = new Cube(gl, 21);
    render(0);
}
window.onload = init;