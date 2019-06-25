
var gui = null

var state = {
	transfer : "Cool Warm",
	screenshot : function () {
		takeScreenShot = true;
	},
	reload : function () {
		document.getElementById("first").style.display = "initial";
		document.getElementById("second").style.display = "none"
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

function initVis() {

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
	document.getElementById("second").style.display = "block"


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

	initVol()
}


document.getElementById("submit").addEventListener('click', initVis, false)