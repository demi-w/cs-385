const DefaultNumSides = 8;

function idxFromPositive(isX,isY,isZ){
    return isX*4 + isY*2 + isZ
}
function dumbRandom(seed){
    return Math.abs((Math.sin(seed*10.12+1) * 1000) % 1)
}

function Cube( gl, numSides, vertexShaderId, fragmentShaderId ) {

    // Initialize the shader pipeline for this object using either shader ids
    //   declared in the application's HTML header, or use the default names.
    //
    var vertShdr = vertexShaderId || "Cube-vertex-shader";
    var fragShdr = fragmentShaderId || "Cube-fragment-shader";

    this.program = initShaders(gl, vertShdr, fragShdr);

    if ( this.program < 0 ) {
        alert( "Error: Cube shader pipeline failed to compile.\n\n" +
            "\tvertex shader id:  \t" + vertShdr + "\n" +
            "\tfragment shader id:\t" + fragShdr + "\n" );
        return; 
    }
    
    // Record the number of components for each vertex's position in the Cube object's 
    //   positions property. (that's why there's a "this" preceding the positions here).
    //   Here, we both create the positions object, as well as initialize its
    //   numComponents field.
    //
    this.positions = { numComponents : 3 };

    // Build out position data in a way that doesn't make me cry
    var positions = [];
    var colors = [];
    var scale = 0.5;
    for(var x = -1.0; x <= 1; x+=2){
        for(var y = -1.0; y <= 1; y+=2){
            for(var z = -1.0; z <= 1; z+=2){
                positions.push(x*scale,y*scale,z*scale);
            }
        }
    }

    var indices = []
    //manually:
    //positions:
    //                 z      y         y z   x         x    z   x y      x y z
    //-1 -1 -1 | -1 -1 1 | -1 1 -1 | -1 1 1 | 1 -1 -1 | 1 -1 1 | 1 1 -1 | 1 1 1

    //initially writing indices:
    // 0 1 2 | 0 


    //so there's a golden rule for making a triangle in this case: all points in a tri must only have a different coord in at most 1 axis
    // and must all be the same on 1 axis
    // so each triangle 
    // so for each face, there's two tris

    for(var faceIdx = 0; faceIdx < 6; faceIdx++){
        //We go through each face, which is further subdivided as:
        var isPositive = faceIdx % 2 == 0 //Are we dealing with the part of the cube that in the negative/positive part of our axis
        var dimensionIdx = Math.floor(faceIdx / 2) //Which axis is constant for the points we want to build tris for

        //So for example, we start with dealing with the face that is negative + in the x axis
        //Then we'd move onto positive + x axis, then negative + y axis, etc.

        var options = []
        for(var i = 0; i < 4; i++){
            options.push(isPositive,isPositive,isPositive) //We add three points to the array of available points on the face
            //Then change the dimensions that aren't the one we care about so that we get each possible combo
            options[i*3+(dimensionIdx+1)%3] = i % 2 == 0 
            options[i*3+(dimensionIdx+2)%3] = Math.floor(i/2) % 2 == 0
        }
        //console.log(isPositive,dimensionIdx,options)
        
        //options[dimensionIdx] = 1 if isPositive else -1
        if(!isPositive){
            console.log(dimensionIdx)
            console.log(idxFromPositive(...options.slice(6,9)),idxFromPositive(...options.slice(9,12)),idxFromPositive(...options.slice(3,6)))
        }
        
        //The ordering of the individual vertices is not my strongest point...derived from knowing
        // 1) there should be two per face
        // 2) the two tris should share two vertices and the third one should be distinct, the +,+ and -,- parts of the face
        // 3) Making the two common vertices share the same winding order will not work
        // 4) Just "brute forcing" the two possible options from there
        indices.push(idxFromPositive(...options.slice(0,3)),idxFromPositive(...options.slice(6,9)),idxFromPositive(...options.slice(3,6)))
        indices.push(idxFromPositive(...options.slice(6,9)),idxFromPositive(...options.slice(9,12)),idxFromPositive(...options.slice(3,6)))
    }

    // Record the number of indices in one of our two disks that we're using to make the
    //   Cube.  At this point, the indices array contains the correct number of indices for a
    //   single disk, and as we render the Cube as two disks of the same size, this value is
    //   precisely what we need.
    //
    this.indices = { count : indices.length };

    this.uniforms = {
        R : gl.getUniformLocation(this.program, "R"),
        MV : gl.getUniformLocation(this.program, "MV"), 
        P : gl.getUniformLocation(this.program, "P"),
        time : gl.getUniformLocation(this.program, "time")
    }

    this.P = perspective(90.0,1.0,0.5,5.0)
    this.MV = lookAt([0.0,0.0,-2.0],[0.0,0.0,-1.0],[0.0,1.0,0.0])

    this.positions.buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.positions.buffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW );


    this.indices.buffer = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW );

    this.positions.attributeLoc = gl.getAttribLocation( this.program, "aPosition" );
    gl.enableVertexAttribArray( this.positions.attributeLoc );

    this.render = function (time) {

        time = time/1000. + 1
        gl.useProgram( this.program );

        gl.bindBuffer( gl.ARRAY_BUFFER, this.positions.buffer );
        gl.vertexAttribPointer( this.positions.attributeLoc, this.positions.numComponents,
            gl.FLOAT, gl.FALSE, 0, 0 );

        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer );

        var R = rotate(time*time/8.,[Math.sin(time*1.4),Math.sin(time*2.),Math.sin(time/1.2)])

        gl.uniformMatrix4fv(this.uniforms.R, false, 
            flatten(R)); 
        gl.uniformMatrix4fv(this.uniforms.MV, false, 
            flatten(this.MV)); 
        gl.uniformMatrix4fv(this.uniforms.P, false, 
            flatten(this.P)); 
        gl.uniform1f(this.uniforms.time,time);

        gl.drawElements( gl.TRIANGLES, this.indices.count, gl.UNSIGNED_SHORT, 0 );
    }
};
