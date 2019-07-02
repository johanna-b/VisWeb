

var drawSlices = null
var gls = null;

function initSlice(){

	var shader = null;

	var texFormat = null;
	var texStorageFormat = null;
	var filter = null;
	var texType = null;

	var canvas = document.getElementById("slcanvas");
	gls = canvas.getContext("webgl2");
	if (!gls) {
		alert("Unable to initialize WebGL2. Your browser may not support it");
		return;
	}


	// Setup VAO and VBO to render the cube to run the raymarching shader
	var vao = gls.createVertexArray();
	gls.bindVertexArray(vao);

	var vbo = gls.createBuffer();
	gls.bindBuffer(gls.ARRAY_BUFFER, vbo);
	var cubeStrip = [
  	-1.0, -1.0,
  	-1.0, 1.0,
  	1.0, -1.0,
  	1.0, 1.0
	]


	gls.enable(gls.BLEND);
	// gls.blendFunc(gls.ONE, gls.ONE_MINUS_SRC_ALPHA); // use for white background
	gls.blendFunc(gls.SRC_ALPHA, gls.ONE); // new for black background

	gls.bufferData(gls.ARRAY_BUFFER, new Float32Array(cubeStrip), gls.STATIC_DRAW);

	gls.enableVertexAttribArray(0);
	gls.vertexAttribPointer(0, 2, gls.FLOAT, false, 0, 0);

	if (type == "8bit") {
		texType = gls.UNSIGNED_BYTE
		texStorageFormat = gls.R8
		texFormat = gls.RED
		filter = gls.LINEAR
		shader = new Shader(boxVertShader, boxFragShader, gls);
	}
	if (type == "16bit") {
		texType = gls.UNSIGNED_SHORT
		texStorageFormat = gls.R16UI
		texFormat = gls.RED_INTEGER;
		filter = gls.NEAREST
		shader = new Shader(boxVertShader, boxFragShaderInt, gls);
	}

	shader.use();
	gls.uniform1i(shader.uniforms["volume"], 0);
	gls.uniform1i(shader.uniforms["colormap"], 1);

	var tex = gls.createTexture();
	gls.activeTexture(gls.TEXTURE0);
	gls.bindTexture(gls.TEXTURE_3D, tex);
	gls.texStorage3D(gls.TEXTURE_3D, 1, texStorageFormat, volDims[0], volDims[1], volDims[2]);
	gls.texParameteri(gls.TEXTURE_3D, gls.TEXTURE_MIN_FILTER, filter);
	gls.texParameteri(gls.TEXTURE_3D, gls.TEXTURE_MAG_FILTER, filter); //just in case
	gls.texParameteri(gls.TEXTURE_3D, gls.TEXTURE_WRAP_R, gls.CLAMP_TO_EDGE);
	gls.texParameteri(gls.TEXTURE_3D, gls.TEXTURE_WRAP_S, gls.CLAMP_TO_EDGE);
	gls.texParameteri(gls.TEXTURE_3D, gls.TEXTURE_WRAP_T, gls.CLAMP_TO_EDGE);
	gls.texSubImage3D(gls.TEXTURE_3D, 0, 0, 0, 0,
		volDims[0], volDims[1], volDims[2],
		texFormat, texType, volume);

	var longestAxis = Math.max(volDims[0], Math.max(volDims[1], volDims[2]));
	var volScale = [longestAxis / volDims[0], longestAxis / volDims[1],
		longestAxis / volDims[2]];
	gls.uniform3fv(shader.uniforms["volume_scale"], volScale);
	
	var xBox = document.getElementById("x_box");
	var yBox = document.getElementById("y_box");
	var zBox = document.getElementById("z_box");
	var s = document.getElementById("slices")

	drawSlices = function() {


		if (state.layout == "Horizontal") {
			s.style.width = 1200 * state.scale + "px"
			s.style.height = 400 * state.scale + "px"
		}
		if (state.layout == "Vertical") {
			s.style.width =  400 * state.scale  + "px"
			s.style.height = 1200 * state.scale + "px"
		}
		if (state.layout == "Corner") {
			s.style.width = 800 * state.scale + "px"
			s.style.height = 800 * state.scale + "px"
		}

		resize(gls);

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


		gls.uniform3fv(shader.uniforms["slices"] , [state.xslice, state.yslice, state.zslice])


		//draw the x slice
		gls.enable(gls.SCISSOR_TEST)
		gls.clearColor(0.0, 0.0, 0.0, 1.0);
		gls.scissor(toGLPixels(xBox.offsetLeft), toGLPixels(h - xBox.offsetTop - xBox.offsetHeight),
				toGLPixels(xBox.offsetWidth), toGLPixels(xBox.offsetHeight));
		gls.uniform2iv(shader.uniforms["comp"], 
			[toGLPixels(xBox.offsetLeft + xBox.offsetWidth * state.yslice), 
			 toGLPixels(h - xBox.offsetTop - xBox.offsetHeight + xBox.offsetHeight * state.zslice)]);
		gls.clear(gls.COLOR_BUFFER_BIT);
		gls.uniformMatrix4fv(shader.uniforms["scaletrans"], false, mx)
		gls.uniform1i(shader.uniforms["axis"], 1)
		gls.drawArrays(gls.TRIANGLE_STRIP, 0, cubeStrip.length / 2);
		// Wait for rendering to actually finish
		gls.finish();

		

		// draw the y slice
		gls.scissor(toGLPixels(yBox.offsetLeft), toGLPixels(h - yBox.offsetTop - yBox.offsetHeight),
				toGLPixels(yBox.offsetWidth), toGLPixels(yBox.offsetHeight));
		gls.uniform2iv(shader.uniforms["comp"], 
			[toGLPixels(yBox.offsetLeft + yBox.offsetWidth * state.xslice),
			 toGLPixels(h - yBox.offsetTop - yBox.offsetHeight + yBox.offsetHeight * state.zslice)]);
		gls.clear(gls.COLOR_BUFFER_BIT);
		gls.uniformMatrix4fv(shader.uniforms["scaletrans"], false, my)
		gls.uniform1i(shader.uniforms["axis"], 2)
		gls.drawArrays(gls.TRIANGLE_STRIP, 0, cubeStrip.length / 2);
		// Wait for rendering to actually finish
		gls.finish();

		// draw the z slice
		gls.scissor(toGLPixels(zBox.offsetLeft), toGLPixels(h - zBox.offsetTop - zBox.offsetHeight),
				toGLPixels(zBox.offsetWidth), toGLPixels(zBox.offsetHeight));
		gls.uniform2iv(shader.uniforms["comp"], 
			[toGLPixels(zBox.offsetLeft + zBox.offsetWidth * state.xslice),
			 toGLPixels(h - zBox.offsetTop - zBox.offsetHeight + zBox.offsetHeight * state.yslice)]);
		gls.clear(gls.COLOR_BUFFER_BIT);
		gls.uniformMatrix4fv(shader.uniforms["scaletrans"], false, mz)
		gls.uniform1i(shader.uniforms["axis"], 3)
		gls.drawArrays(gls.TRIANGLE_STRIP, 0, cubeStrip.length / 2);
		// Wait for rendering to actually finish
		gls.finish();

		gls.disable(gls.SCISSOR_TEST)
	}

	var colormap = gls.createTexture();
	gls.activeTexture(gls.TEXTURE1);
	gls.bindTexture(gls.TEXTURE_2D, colormap);
	gls.texStorage2D(gls.TEXTURE_2D, 1, gls.RGBA8, 180, 1);
	gls.texParameteri(gls.TEXTURE_2D, gls.TEXTURE_MIN_FILTER, gls.LINEAR);
	gls.texParameteri(gls.TEXTURE_2D, gls.TEXTURE_WRAP_R, gls.CLAMP_TO_EDGE);
	gls.texParameteri(gls.TEXTURE_2D, gls.TEXTURE_WRAP_S, gls.CLAMP_TO_EDGE);
	gls.texSubImage2D(gls.TEXTURE_2D, 0, 0, 0, 180, 1,
		gls.RGBA, gls.UNSIGNED_BYTE, colormapImage);

	drawSlices();
}