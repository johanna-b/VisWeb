

var takeScreenShot = false;
var canvas = null;

var gl = null;
var shader = null;
// var volumeTexture = null;
var colormapTex = null;
// var fileRegex = /.*\/(\w+)_(\d+)x(\d+)x(\d+)_(\w+)\.*/;
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

var volDims = null
var gui = null


function makeCubeStrip(xmin, xmax, ymin, ymax, zmin, zmax) {
	return [
	xmax, ymax, zmin,
	xmin, ymax, zmin,
	xmax, ymax, zmax,
	xmin, ymax, zmax,
	xmin, ymin, zmax,
	xmin, ymax, zmin,
	xmin, ymin, zmin,
	xmax, ymax, zmin,
	xmax, ymin, zmin,
	xmax, ymax, zmax,
	xmax, ymin, zmax,
	xmin, ymin, zmax,
	xmax, ymin, zmin,
	xmin, ymin, zmin
	];
}

var cubeStrip = null

const defaultEye = vec3.set(vec3.create(), 0.5, 0.5, 2.0); //0.5 0.5 1.5
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

var state = {
	transfer : "Cool Warm",
	screenshot : function () {
		takeScreenShot = true;
	},
	reload : function () {
		document.getElementById("first").style.display = "initial";
		document.getElementById("glcanvas").style.display = "none"
		// gui.__controllers.forEach(controller => controller.setValue(controller.initialValue));
		// gui.__folders.forEach(controller => console.log(controller))
		// console.log(gui)
		gui.destroy()
		reset()
		state = initialState
		initialState = Object.assign({},state)
	},
	xmin : 0,
	xmax : 1,
	ymin : 0,
	ymax : 1,
	zmin : 0,
	zmax : 1
}


var initialState = Object.assign({},state)


var draw = function() {

	gui = new dat.GUI();
	gui.add(state, "transfer", ["Cool Warm", "Matplotlib Plasma", "Matplotlib Virdis", "Rainbow", "Samsel Linear Green", "Samsel Linear YGB 1211G"])
	.onChange(function (newValue) {
		var colormapImage = new Image();
		colormapImage.onload = function() {
			gl.activeTexture(gl.TEXTURE1);
			gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 180, 1,
				gl.RGBA, gl.UNSIGNED_BYTE, colormapImage);
		};
		colormapImage.src = colormaps[newValue];
	})
	.name("Transfer function")
	gui.add(state, "screenshot")
	.name("Take Screenshot")
	gui.add(state, "reload")
	.name("Load Volume")

	var clipFolder = gui.addFolder("Clipping Planes")
	clipFolder.add(state, 'xmin').min(0).max(1).step(0.01)
	.onChange(function () {
		gl.uniform3fv(shader.uniforms["box_min"], [state.xmin, state.ymin, state.zmin]);
		allowSlow = true;
	})
	clipFolder.add(state, 'xmax').min(0).max(1).step(0.01)
	.onChange(function () {
		gl.uniform3fv(shader.uniforms["box_max"], [state.xmax, state.ymax, state.zmax]);
		allowSlow = true;
	})
	clipFolder.add(state, 'ymin').min(0).max(1).step(0.01)
	.onChange(function () {
		gl.uniform3fv(shader.uniforms["box_min"], [state.xmin, state.ymin, state.zmin]);
		allowSlow = true;
	})
	clipFolder.add(state, 'ymax').min(0).max(1).step(0.01)
	.onChange(function () {
		gl.uniform3fv(shader.uniforms["box_max"], [state.xmax, state.ymax, state.zmax]);
		allowSlow = true;
	})
	clipFolder.add(state, 'zmin').min(0).max(1).step(0.01)
	.onChange(function () {
		gl.uniform3fv(shader.uniforms["box_min"], [state.xmin, state.ymin, state.zmin]);
		allowSlow = true;
	})
	clipFolder.add(state, 'zmax').min(0).max(1).step(0.01)
	.onChange(function () {
		gl.uniform3fv(shader.uniforms["box_max"], [state.xmax, state.ymax, state.zmax]);
		allowSlow = true;
	})
	clipFolder.open()


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

	allowSlow = true;

	setInterval(function() {
		// shader.use()
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

		// gl.enable(gl.SCISSOR_TEST)

		// gl.scissor(0,0,500,500)
		// gl.clearColor(1.0, 1.0, 1.0, 1.0);
		// gl.clear(gl.COLOR_BUFFER_BIT);

		// gl.disable(gl.SCISSOR_TEST);


		allowSlow = false;
		startTime = endTime;
		}, targetFrameTime);
} 


function resize(gl) {
  var realToCSSPixels = window.devicePixelRatio;

  // Lookup the size the browser is displaying the canvas in CSS pixels
  // and compute a size needed to make our drawingbuffer match it in
  // device pixels.
  var displayWidth  = Math.floor(gl.canvas.offsetWidth  * realToCSSPixels);
  var displayHeight = Math.floor(gl.canvas.offsetHeight * realToCSSPixels);

  // Check if the canvas is not the same size.
  if (gl.canvas.width  !== displayWidth ||
      gl.canvas.height !== displayHeight) {

    // Make the canvas the same size
    gl.canvas.width  = displayWidth;
    gl.canvas.height = displayHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }
}

window.onresize = function () {
	resize(gl)
	WIDTH = canvas.offsetWidth;
	HEIGHT = canvas.offsetHeight;	
	proj = mat4.perspective(mat4.create(), 60 * Math.PI / 180.0, WIDTH / HEIGHT, 0.1, 100);
	allowSlow = true
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
	document.getElementById("glcanvas").style.display = "block"


	canvas = document.getElementById("glcanvas");
	gl = canvas.getContext("webgl2");
	if (!gl) {
		alert("Unable to initialize WebGL2. Your browser may not support it");
		return;
	}
	// gl.getExtension('OES_texture_float');        // just in case
 //    gl.getExtension('OES_texture_float_linear');


	WIDTH = canvas.offsetWidth;
	HEIGHT = canvas.offsetHeight;
	resize(gl)
	// TODO : make adaptive resizing on window changes


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

	shader = new Shader(vertShader, fragShader);
	shader.use();

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

		draw();
	};
	colormapImage.src = colormaps[state.transfer];
}

document.getElementById("submit").addEventListener('click', initVis, false)


