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
	return "#"+Math.floor(Math.random()*16777215).toString(16);
}
console.log(randColor())