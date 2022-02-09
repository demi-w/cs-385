function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    cone.render();
}
function init(){
    var canvas = document.getElementById("webgl-canvas");
    gl = canvas.getContext("webgl2");
    gl.clearColor(0,255,0,255);
    cone = new Cone(gl, 21);
    render();
}
window.onload = init;