

var drawSlices = null

function initSlice(){


	var takeScreenShot = false;
	var canvas = null;

	var gl = null;
	var shader = null;

	var texFormat = null;
	var texStorageFormat = null;
	var filter = null;
	var texType = null;

	canvas = document.getElementById("slcanvas");
	gl = canvas.getContext("webgl2");
	if (!gl) {
		alert("Unable to initialize WebGL2. Your browser may not support it");
		return;
	}

	var s = document.getElementById("slices")
	if (state.layout == "Horizontal") {
		s.style.width = 600 + "px"
		s.style.height = 200 + "px"
	}
	if (state.layout == "Vertical") {
		s.style.width = 200 + "px"
		s.style.height = 600 + "px"
	}
	if (state.layout == "Corner") {
		s.style.width = 400 + "px"
		s.style.height = 400 + "px"
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

	if (type == "8bit") {
		texType = gl.UNSIGNED_BYTE
		texStorageFormat = gl.R8
		texFormat = gl.RED
		filter = gl.LINEAR
		shader = new Shader(boxVertShader, boxFragShader, gl);
	}
	if (type == "16bit") {
		texType = gl.UNSIGNED_SHORT
		texStorageFormat = gl.R16UI
		texFormat = gl.RED_INTEGER;
		filter = gl.NEAREST
		shader = new Shader(boxVertShader, boxFragShaderInt, gl);
	}

	shader.use();
	gl.uniform1i(shader.uniforms["volume"], 0);

	var tex = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_3D, tex);
	gl.texStorage3D(gl.TEXTURE_3D, 1, texStorageFormat, volDims[0], volDims[1], volDims[2]);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, filter);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, filter); //just in case
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texSubImage3D(gl.TEXTURE_3D, 0, 0, 0, 0,
		volDims[0], volDims[1], volDims[2],
		texFormat, texType, volume);

	var longestAxis = Math.max(volDims[0], Math.max(volDims[1], volDims[2]));
	var volScale = [longestAxis / volDims[0], longestAxis / volDims[1],
		longestAxis / volDims[2]];
	gl.uniform3fv(shader.uniforms["volume_scale"], volScale);
	
	var xBox = document.getElementById("x_box");
	var yBox = document.getElementById("y_box");
	var zBox = document.getElementById("z_box");

	drawSlices = function() {

		resize(gl);

		var h = canvas.clientHeight;
		var w = canvas.clientWidth

		if (state.layout == "Horizontal") {

			var bw = w / 3 - 5

			xBox.style.width = bw + "px"
			yBox.style.width = bw + "px"
			zBox.style.width = bw + "px"
			xBox.style.height = h - 5 + "px"
			yBox.style.height = h - 5 + "px"
			zBox.style.height = h - 5 + "px"
			yBox.style.left = bw + 5 + "px"
			zBox.style.left = 2 * bw + 10 + "px"
			yBox.style.top = 0 + "px"
			zBox.style.top = 0 + "px"

			var mx = mat4.translate(mat4.create(), mat4.fromScaling(mat4.create(), vec3.fromValues(1/3,1,1)), vec3.fromValues(-2,0,0))
			var my = mat4.translate(mat4.create(), mat4.fromScaling(mat4.create(), vec3.fromValues(1/3,1,1)), vec3.fromValues(0,0,0))
			var mz = mat4.translate(mat4.create(), mat4.fromScaling(mat4.create(), vec3.fromValues(1/3,1,1)), vec3.fromValues(2,0,0))

		}

		if (state.layout == "Vertical") {

			var bh = h / 3 - 5

			xBox.style.width = w - 5 + "px"
			yBox.style.width = w - 5+ "px"
			zBox.style.width = w - 5 + "px"
			xBox.style.height = bh + "px"
			yBox.style.height = bh + "px"
			zBox.style.height = bh + "px"
			yBox.style.left = 0 + "px"
			zBox.style.left = 0 + "px"
			yBox.style.top = bh + 5 + "px"
			zBox.style.top = 2 * bh + 10 + "px"

			var mx = mat4.translate(mat4.create(), mat4.fromScaling(mat4.create(), vec3.fromValues(1,1/3,1)), vec3.fromValues(0,2,0))
			var my = mat4.translate(mat4.create(), mat4.fromScaling(mat4.create(), vec3.fromValues(1,1/3,1)), vec3.fromValues(0,0,0))
			var mz = mat4.translate(mat4.create(), mat4.fromScaling(mat4.create(), vec3.fromValues(1,1/3,1)), vec3.fromValues(0,-2,0))
		}

		if (state.layout == "Corner") {

			var bh = h / 2 - 5
			var bw = w / 2 -5

			xBox.style.width = bw + "px"
			yBox.style.width = bw + "px"
			zBox.style.width = bw + "px"
			xBox.style.height = bh + "px"
			yBox.style.height = bh + "px"
			zBox.style.height = bh + "px"
			yBox.style.left = 0 + "px"
			zBox.style.left = bw + 5 + "px"
			yBox.style.top = bh + 5 + "px"
			zBox.style.top = 0 + "px"

			var mx = mat4.translate(mat4.create(), mat4.fromScaling(mat4.create(), vec3.fromValues(1/2,1/2,1)), vec3.fromValues(-1,1,0))
			var my = mat4.translate(mat4.create(), mat4.fromScaling(mat4.create(), vec3.fromValues(1/2,1/2,1)), vec3.fromValues(-1,-1,0))
			var mz = mat4.translate(mat4.create(), mat4.fromScaling(mat4.create(), vec3.fromValues(1/2,1/2,1)), vec3.fromValues(1,1,0))
		}


		gl.uniform3fv(shader.uniforms["slices"] , [state.xslice, state.yslice, state.zslice])


		//draw the x slice
		gl.enable(gl.SCISSOR_TEST)
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.scissor(toGLPixels(xBox.offsetLeft), toGLPixels(h - xBox.offsetTop - xBox.offsetHeight),
				toGLPixels(xBox.offsetWidth), toGLPixels(xBox.offsetHeight));
		gl.uniform2iv(shader.uniforms["comp"], 
			[toGLPixels(xBox.offsetLeft + xBox.offsetWidth * state.yslice), 
			 toGLPixels(h - xBox.offsetTop - xBox.offsetHeight + xBox.offsetHeight * state.zslice)]);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.uniformMatrix4fv(shader.uniforms["scaletrans"], false, mx)
		gl.uniform1i(shader.uniforms["axis"], 1)
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, cubeStrip.length / 2);
		// Wait for rendering to actually finish
		gl.finish();

		

		// draw the y slice
		gl.scissor(toGLPixels(yBox.offsetLeft), toGLPixels(h - yBox.offsetTop - yBox.offsetHeight),
				toGLPixels(yBox.offsetWidth), toGLPixels(yBox.offsetHeight));
		gl.uniform2iv(shader.uniforms["comp"], 
			[toGLPixels(yBox.offsetLeft + yBox.offsetWidth * state.xslice),
			 toGLPixels(h - yBox.offsetTop - yBox.offsetHeight + yBox.offsetHeight * state.zslice)]);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.uniformMatrix4fv(shader.uniforms["scaletrans"], false, my)
		gl.uniform1i(shader.uniforms["axis"], 2)
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, cubeStrip.length / 2);
		// Wait for rendering to actually finish
		gl.finish();

		// draw the z slice
		gl.scissor(toGLPixels(zBox.offsetLeft), toGLPixels(h - zBox.offsetTop - zBox.offsetHeight),
				toGLPixels(zBox.offsetWidth), toGLPixels(zBox.offsetHeight));
		gl.uniform2iv(shader.uniforms["comp"], 
			[toGLPixels(zBox.offsetLeft + zBox.offsetWidth * state.xslice),
			 toGLPixels(h - zBox.offsetTop - zBox.offsetHeight + zBox.offsetHeight * state.yslice)]);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.uniformMatrix4fv(shader.uniforms["scaletrans"], false, mz)
		gl.uniform1i(shader.uniforms["axis"], 3)
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, cubeStrip.length / 2);
		// Wait for rendering to actually finish
		gl.finish();

		gl.disable(gl.SCISSOR_TEST)
		}

	drawSlices();

}