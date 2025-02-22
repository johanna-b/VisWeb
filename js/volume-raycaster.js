

var takeScreenShot = false;
var gl = null;
var shader = null;
var cl = null;
var dl = null;
var clp = null;


var proj = null;
var camera = null;
var projView = null;

function initVol(){

	const defaultEye = vec3.set(vec3.create(), 0.5, 0.5, 2.0); 
	const center = vec3.set(vec3.create(), 0.5, 0.5, 0.5);
	const up = vec3.set(vec3.create(), 0.0, 1.0, 0.0);

	var tabFocused = true;
	var allowSlow = true;
	var targetFrameTime = 32;
	var initSamplingRate = 1.0
	var samplingRate = 1.0;
	var WIDTH = null;
	var HEIGHT = null;

	var texFormat = null;
	var texStorageFormat = null;
	var filter = null;
	var texType = null;

	var cubeStrip = null;


	var canvas = document.getElementById("glcanvas");
	gl = canvas.getContext("webgl2");
	if (!gl) {
		alert("Unable to initialize WebGL2. Your browser may not support it");
		return;
	}

	WIDTH = canvas.offsetWidth;
	HEIGHT = canvas.offsetHeight;
	resize(gl)


	proj = mat4.perspective(mat4.create(), 60 * Math.PI / 180.0,
		WIDTH / HEIGHT, 0.1, 100);

	camera = new ArcballCamera(defaultEye, center, up, 2, [WIDTH, HEIGHT]);
	projView = mat4.create();

	// Register mouse and touch listeners
	var controller = new Controller();
	controller.mousemove = function(prev, cur, evt) {
		if (evt.buttons == 1) {
			camera.rotate(prev, cur);

		} else if (evt.buttons == 2) {
			camera.pan([cur[0] - prev[0], prev[1] - cur[1]]);
		}
	};
	controller.wheel = function(amt) { camera.zoom(amt); };
	controller.pinch = controller.wheel;
	controller.twoFingerDrag = function(drag) { camera.pan(drag); };

	document.addEventListener("keydown", function(evt) {
		if (evt.key == "p") {
			takeScreenShot = true;
		}
	});

	controller.registerForCanvas(canvas);

	// Setup VAO and VBO to render the cube to run the raymarching shader
	var vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	var vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	cubeStrip = makeCubeStrip(state.xmin, state.xmax, state.ymin, state.ymax, state.zmin, state.zmax)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeStrip), gl.STATIC_DRAW);

	gl.enableVertexAttribArray(0);
	gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

	if (type == "8bit") {
		texType = gl.UNSIGNED_BYTE
		texStorageFormat = gl.R8
		texFormat = gl.RED
		filter = gl.LINEAR
	}
	else if (type == "16bit") {
		texType = gl.UNSIGNED_SHORT
		texStorageFormat = gl.R16UI
		texFormat = gl.RED_INTEGER;
		filter = gl.NEAREST
		shader = new Shader(vertShader, fragShaderInt, gl);
		shader.use();
	}
	else if (type == "float") {
		gl.getExtension('OES_texture_float');
		gl.getExtension('OES_texture_float_linear');
		texType = gl.FLOAT
		texStorageFormat = gl.R32F
		texFormat = gl.RED;
		filter = gl.LINEAR
	}

	if ((type == "8bit" || type == "float") && !segmentation) {
		shader = new Shader(vertShader, fragShader, gl);
		shader.use();
	}
	if (segmentation) {
		if (type == "8bit" || type == "float") {
			shader = new Shader(vertShader, fragShaderSeg, gl);
		}
		if (type == "16bit") {
			shader = new Shader(vertShader, fragShaderSegInt, gl)
		}
		shader.use();
		gl.uniform1i(shader.uniforms["use_seg"], state.useSegmentation)

		cl = gl.getUniformLocation(shader.program, "colors")
		var colors = listColors(state, ids)
		colors = colors.concat(new Array(25 * 3 - colors.length).fill(0))
		gl.uniform3fv(cl, colors)

		dl = gl.getUniformLocation(shader.program, "displays")
		var displays = listDisplays(state, ids)
		displays = displays.concat(new Array(25 * 3 - displays.length).fill(false))
		gl.uniform1iv(dl, displays)


		clp = gl.getUniformLocation(shader.program, "clips")
		var clips = listClips(state, ids)
		clips = clips.concat(new Array(25 * 3 - clips.length).fill(false))
		gl.uniform1iv(clp, clips)

		var seg = gl.createTexture();
		gl.activeTexture(gl.TEXTURE2);
		gl.bindTexture(gl.TEXTURE_3D, seg);
		gl.texStorage3D(gl.TEXTURE_3D, 1, gl.R8, volDims[0], volDims[1], volDims[2]);
		gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); //just in case
		gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texSubImage3D(gl.TEXTURE_3D, 0, 0, 0, 0,
			volDims[0], volDims[1], volDims[2],
			gl.RED, gl.UNSIGNED_BYTE, segmentation);
		gl.uniform1i(shader.uniforms["segmentation"], 2);
	}
	

	gl.uniform1i(shader.uniforms["volume"], 0);
	gl.uniform1i(shader.uniforms["colormap"], 1);
	gl.uniform1f(shader.uniforms["dt_scale"], 1.0);

	gl.uniform3fv(shader.uniforms["box_min"], [state.xmin, state.ymin, state.zmin]);
	gl.uniform3fv(shader.uniforms["box_max"], [state.xmax, state.ymax, state.zmax])

	// Setup required OpenGL state for drawing the back faces and
	// composting with the background color
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.FRONT);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);



	var colormap = gl.createTexture();
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, colormap);
	gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, 180, 1);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 180, 1,
		gl.RGBA, gl.UNSIGNED_BYTE, colormapImage);

	var tex = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_3D, tex);
	gl.texStorage3D(gl.TEXTURE_3D, 1, texStorageFormat, volDims[0], volDims[1], volDims[2]);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, filter);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, filter);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texSubImage3D(gl.TEXTURE_3D, 0, 0, 0, 0,
		volDims[0], volDims[1], volDims[2],
		texFormat, texType, volume);

	var longestAxis = Math.max(volDims[0], Math.max(volDims[1], volDims[2]));
	var volScale = [volDims[0] / longestAxis, volDims[1] / longestAxis,
		volDims[2] / longestAxis];

	gl.uniform3iv(shader.uniforms["volume_dims"], volDims);
	gl.uniform3fv(shader.uniforms["volume_scale"], volScale);

	allowSlow = true;

	setInterval(function() {
		// Save them some battery if they're not viewing the tab
		if (document.hidden) {
			return;
		}
		var startTime = new Date();
		gl.clearColor(1.0, 1.0, 1.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		
		projView = mat4.mul(projView, proj, camera.camera);
		gl.uniformMatrix4fv(shader.uniforms["proj_view"], false, projView);

		var eye = [camera.invCamera[12], camera.invCamera[13], camera.invCamera[14]];
		gl.uniform3fv(shader.uniforms["eye_pos"], eye);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, cubeStrip.length / 3);
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

	window.onresize = function () {
		resize(gl)
		WIDTH = canvas.offsetWidth;
		HEIGHT = canvas.offsetHeight;	
		proj = mat4.perspective(mat4.create(), 60 * Math.PI / 180.0, WIDTH / HEIGHT, 0.1, 100);
		allowSlow = true
	}
}


