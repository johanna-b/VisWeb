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

Math.seedrandom('any string you like');
function randColor() {
	return '#'+('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6);
}


function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return [parseInt(result[1], 16) / 255,  parseInt(result[2], 16) / 255, parseInt(result[3], 16)/ 255];
}

function listColors(obj, ids) {
	var cl = []
	ids.forEach(function (id) {
		cl = cl.concat(hexToRgb(obj[id]["color"]))
	})
	return cl;
}