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

function toGLPixels(p) {
	return window.devicePixelRatio * p;
}

function unique(a) {
	return new Uint8Array([...new Set(a)]); 
}

Math.seedrandom('the horse is');
function randColor() {
	return '#'+('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6);
}


function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return [parseInt(result[1], 16) / 255,  parseInt(result[2], 16) / 255, parseInt(result[3], 16)/ 255];
}

function hexToRgba(hex, a) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return "rgba(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + "," + a + ")";
}

function listColors(obj, ids) {
	var cl = []
	ids.forEach(function (id) {
		cl = cl.concat(hexToRgb(obj[id]["color"]))
	})
	return cl;
}

function listDisplays(obj, ids) {
	var cl = []
	ids.forEach(function (id) {
		cl = cl.concat(obj[id]["display"])
	})
	return cl;
}

function listClips(obj, ids) {
	var cl = []
	ids.forEach(function (id) {
		cl = cl.concat(obj[id]["clip"])
	})
	return cl;
}

function floatSafeRemainder(val, step){
	var valDecCount = (val.toString().split('.')[1] || '').length;
	var stepDecCount = (step.toString().split('.')[1] || '').length;
	var decCount = valDecCount > stepDecCount? valDecCount : stepDecCount;
	var valInt = parseInt(val.toFixed(decCount).replace('.',''));
	var stepInt = parseInt(step.toFixed(decCount).replace('.',''));
	return (valInt % stepInt) / Math.pow(10, decCount);
}

function binHist(arr, bins, max) {

	var step = max / bins;
	
	var hist = Array(bins).fill(0);
	for (var i = 0; i < arr.length; i++) {
	 	hist[Math.floor(arr[i] / step)] += 1;
	}
	return hist
}

function getColor(pos, anchors) {
	// var left = anchors.find(a => a.translation.x > )
}