

var drawSlices = null

function initSlice(){


	var takeScreenShot = false;
	var canvas = null;

	var gl = null;
	var shader = null;
	var colormapTex = null;
	var proj = null;
	var camera = null;
	var projView = null;
	var tabFocused = true;
	var allowSlow = true;
	var targetFrameTime = 32;
	var initSamplingRate = 1.0
	var samplingRate = 1.0; //1.0
	var WIDTH = null;
	var HEIGHT = null;

	canvas = document.getElementById("slcanvas");
	gl = canvas.getContext("webgl2");
	if (!gl) {
		alert("Unable to initialize WebGL2. Your browser may not support it");
		return;
	}

	resize(gl)

	// Setup VAO and VBO to render the cube to run the raymarching shader
	var vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	var vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	var cubeStrip = [
  	-1.0, -1.0,
  	-1.0, 1.0,
  	1.0, -1.0,
  	1.0, 1.0
	]


	gl.enable(gl.BLEND);
	// gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // use for white background
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // new for black background

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeStrip), gl.STATIC_DRAW);

	gl.enableVertexAttribArray(0);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

	shader = new Shader(boxVertShader, boxFragShader, gl);
	shader.use();
	gl.uniform1i(shader.uniforms["volume"], 0);

	var tex = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_3D, tex);
	gl.texStorage3D(gl.TEXTURE_3D, 1, gl.R8, volDims[0], volDims[1], volDims[2]);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); //just in case
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texSubImage3D(gl.TEXTURE_3D, 0, 0, 0, 0,
		volDims[0], volDims[1], volDims[2],
		gl.RED, gl.UNSIGNED_BYTE, volume);

	var longestAxis = Math.max(volDims[0], Math.max(volDims[1], volDims[2]));
	var volScale = [longestAxis / volDims[0], longestAxis / volDims[1],
		longestAxis / volDims[2]];
	gl.uniform3fv(shader.uniforms["volume_scale"], volScale);
	console.log(volScale)

	drawSlices = function() {

		// TODO: scaling for none sqaure volumes

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.uniform3fv(shader.uniforms["slices"] , [state.xslice, state.yslice, state.zslice])


		//draw the x slice
		var m = mat4.translate(mat4.create(), mat4.fromScaling(mat4.create(), vec3.fromValues(1/3,1,1)), vec3.fromValues(-2,0,0))
		gl.uniformMatrix4fv(shader.uniforms["scaletrans"], false, m)
		gl.uniform1i(shader.uniforms["axis"], 1)
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, cubeStrip.length / 2);
		// Wait for rendering to actually finish
		gl.finish();

		// draw the y slice
		var m = mat4.translate(mat4.create(), mat4.fromScaling(mat4.create(), vec3.fromValues(1/3,1,1)), vec3.fromValues(0,0,0))
		gl.uniformMatrix4fv(shader.uniforms["scaletrans"], false, m)
		gl.uniform1i(shader.uniforms["axis"], 2)
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, cubeStrip.length / 2);
		// Wait for rendering to actually finish
		gl.finish();

		// draw the z slice
		var m = mat4.translate(mat4.create(), mat4.fromScaling(mat4.create(), vec3.fromValues(1/3,1,1)), vec3.fromValues(2,0,0))
		gl.uniformMatrix4fv(shader.uniforms["scaletrans"], false, m)
		gl.uniform1i(shader.uniforms["axis"], 3)
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, cubeStrip.length / 2);
		// Wait for rendering to actually finish
		gl.finish();
		}

	drawSlices();

}