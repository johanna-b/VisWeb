

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
  	0, 0,
  	0, 1,
  	1, 1,
  	0, 0,
  	1, 1,
  	1, 0
	]


	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeStrip), gl.STATIC_DRAW);

	gl.enableVertexAttribArray(0);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

	shader = new Shader(boxVertShader, boxFragShader, gl);
	shader.use();
	gl.uniform1i(shader.uniforms["volume"], 1);

	var tex = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_3D, tex);
	gl.texStorage3D(gl.TEXTURE_3D, 1, gl.R8, volDims[0], volDims[1], volDims[2]);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texSubImage3D(gl.TEXTURE_3D, 0, 0, 0, 0,
		volDims[0], volDims[1], volDims[2],
		gl.RED, gl.UNSIGNED_BYTE, volume);

	var longestAxis = Math.max(volDims[0], Math.max(volDims[1], volDims[2]));
	var volScale = [volDims[0] / longestAxis, volDims[1] / longestAxis,
		volDims[2] / longestAxis];

	// gl.uniform3iv(shader.uniforms["volume_dims"], volDims);
	// gl.uniform3fv(shader.uniforms["volume_scale"], volScale);

	allowSlow = true;

	setInterval(function() {
		// Save them some battery if they're not viewing the tab
		if (document.hidden) {
			return;
		}
		var startTime = new Date();
		gl.clearColor(1.0, 1.0, 1.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);


		gl.drawArrays(gl.TRIANGLE_STRIP, 0, cubeStrip.length / 2);
		// Wait for rendering to actually finish
		gl.finish();
		var endTime = new Date();
		var renderTime = endTime - startTime;
		var targetSamplingRate = renderTime / targetFrameTime;

		if (takeScreenShot) {
			takeScreenShot = false;
			canvas.toBlob(function(b) { saveAs(b, "screen.png"); }, "image/png");
		}

		// If we're dropping frames, decrease the sampling rate
		if (!allowSlow && targetSamplingRate > samplingRate) {
			samplingRate = 0.8 * samplingRate + 0.2 * targetSamplingRate;
			gl.uniform1f(shader.uniforms["dt_scale"], samplingRate);
		}

		allowSlow = false;
		startTime = endTime;
		}, targetFrameTime);

}