var cubeStrip = [
	1, 1, 0,
	0, 1, 0,
	1, 1, 1,
	0, 1, 1,
	0, 0, 1,
	0, 1, 0,
	0, 0, 0,
	1, 1, 0,
	1, 0, 0,
	1, 1, 1,
	1, 0, 1,
	0, 0, 1,
	1, 0, 0,
	0, 0, 0
];

var takeScreenShot = false;
var canvas = null;

var gl = null;
var shader = null;
var volumeTexture = null;
var colormapTex = null;
var fileRegex = /.*\/(\w+)_(\d+)x(\d+)x(\d+)_(\w+)\.*/;
var proj = null;
var camera = null;
var projView = null;
var tabFocused = true;
var newVolumeUpload = true;
var targetFrameTime = 32;
var samplingRate = 1.0;
var WIDTH = null;
var HEIGHT = null;

var volDims = null

const defaultEye = vec3.set(vec3.create(), 0.5, 0.5, 1.5);
const center = vec3.set(vec3.create(), 0.5, 0.5, 0.5);
const up = vec3.set(vec3.create(), 0.0, 1.0, 0.0);

var colormaps = {
	"Cool Warm": "colormaps/cool-warm-paraview.png",
	"Matplotlib Plasma": "colormaps/matplotlib-plasma.png",
	"Matplotlib Virdis": "colormaps/matplotlib-virdis.png",
	"Rainbow": "colormaps/rainbow.png",
	"Samsel Linear Green": "colormaps/samsel-linear-green.png",
	"Samsel Linear YGB 1211G": "colormaps/samsel-linear-ygb-1211g.png",
};


var selectVolume = function() {

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

	gl.uniform3iv(shader.uniforms["volume_dims"], volDims);
	gl.uniform3fv(shader.uniforms["volume_scale"], volScale);

	newVolumeUpload = true;
	if (!volumeTexture) {
		volumeTexture = tex;
		setInterval(function() {
			// Save them some battery if they're not viewing the tab
			if (document.hidden) {
				return;
			}
			var startTime = new Date();
			gl.clearColor(1.0, 1.0, 1.0, 1.0);
			gl.clear(gl.COLOR_BUFFER_BIT);

			// Reset the sampling rate and camera for new volumes
			if (newVolumeUpload) {
				camera = new ArcballCamera(defaultEye, center, up, 2, [WIDTH, HEIGHT]);
				samplingRate = 1.0;
				gl.uniform1f(shader.uniforms["dt_scale"], samplingRate);
			}
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
			if (!newVolumeUpload && targetSamplingRate > samplingRate) {
				samplingRate = 0.8 * samplingRate + 0.2 * targetSamplingRate;
				gl.uniform1f(shader.uniforms["dt_scale"], samplingRate);
			}

			newVolumeUpload = false;
			startTime = endTime;
		}, targetFrameTime);
	} 
	else {
		gl.deleteTexture(volumeTexture);
		volumeTexture = tex;
	}
};

var selectColormap = function() {
	var selection = document.getElementById("colormapList").value;
	var colormapImage = new Image();
	colormapImage.onload = function() {
		gl.activeTexture(gl.TEXTURE1);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 180, 1,
			gl.RGBA, gl.UNSIGNED_BYTE, colormapImage);
	};
	colormapImage.src = colormaps[selection];
}

function initVis(){

	// make sure we have all the data we need
	var bad = false;
	if (!volume) {
		alert("no volume data loaded");
		bad = true
	}

	var x = document.getElementById("x").value;
	var y = document.getElementById('y').value;
	var z = document.getElementById("z").value;

	if (!x) {
		alert("missing x dimension")
		bad = true
	}
	if (!y) {
		alert("missing y dimension")
		bad = true
	}
	if (!z) {
		alert("missing z dimension")
		bad = true
	}
	if (bad) {
		return
	}

	volDims = [x,y,z]

	document.getElementById("first").style.display = "none";
	document.getElementById("second").style.display = "initial"

	fillcolormapSelector();

	canvas = document.getElementById("glcanvas");
	gl = canvas.getContext("webgl2");
	if (!gl) {
		alert("Unable to initialize WebGL2. Your browser may not support it");
		return;
	}
	gl.getExtension('OES_texture_float');        // just in case
    gl.getExtension('OES_texture_float_linear');
	WIDTH = canvas.getAttribute("width");
	HEIGHT = canvas.getAttribute("height");

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
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeStrip), gl.STATIC_DRAW);

	gl.enableVertexAttribArray(0);
	gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

	shader = new Shader(vertShader, fragShader);
	shader.use();

	gl.uniform1i(shader.uniforms["volume"], 0);
	gl.uniform1i(shader.uniforms["colormap"], 1);
	gl.uniform1f(shader.uniforms["dt_scale"], 1.0);

	// Setup required OpenGL state for drawing the back faces and
	// composting with the background color
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.FRONT);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);


	// Load the default colormap and upload it, after which we
	// load the volume.
	var colormapImage = new Image();
	colormapImage.onload = function() {
		var colormap = gl.createTexture();
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, colormap);
		gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, 180, 1);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 180, 1,
			gl.RGBA, gl.UNSIGNED_BYTE, colormapImage);

		selectVolume();
	};
	colormapImage.src = "colormaps/rainbow.png";
}


var fillcolormapSelector = function() {
	var selector = document.getElementById("colormapList");
	for (p in colormaps) {
		var opt = document.createElement("option");
		opt.value = p;
		opt.innerHTML = p;
		selector.appendChild(opt);
	}
}

document.getElementById("submit").addEventListener('click', initVis, false)


