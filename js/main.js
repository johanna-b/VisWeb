
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
		document.getElementById("body").classList.remove("bound")
		reset()
		state = initialState
		initialState = Object.assign({},state)
	},
	// clipping planes
	xmin : 0,
	xmax : 1,
	ymin : 0,
	ymax : 1,
	zmin : 0,
	zmax : 1,
	// slices
	display : true,
	scale : 0.5,
	layout : "Corner",
	xslice : 0.5,
	yslice : 0.5,
	zslice : 0.5,
	segLoad : function () {
		document.getElementById("first").style.display = "initial";
		document.getElementById("second").style.display = "none"
		gui.destroy()
		document.getElementById("body").classList.remove("bound")
		reset()
		state = initialState
		initialState = Object.assign({},state)
	}
}


var initialState = Object.assign({},state)

var colormapImage = null;
var colormaps = {
	"Cool Warm": "colormaps/cool-warm-paraview.png",
	"Matplotlib Plasma": "colormaps/matplotlib-plasma.png",
	"Matplotlib Virdis": "colormaps/matplotlib-virdis.png",
	"Rainbow": "colormaps/rainbow.png",
	"Samsel Linear Green": "colormaps/samsel-linear-green.png",
	"Samsel Linear YGB 1211G": "colormaps/samsel-linear-ygb-1211g.png",
};

var type = null;
var volDims = null;
var ids = null;

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
	type = document.getElementById("type").value;

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
	if (!type) {
		alert("missing datatype")
		bad = true
	}
	if (bad) {
		return
	}

	if (type == "8bit") {
		volume = new Uint8Array(volume)
	}
	else if (type == "16bit") {
		volume = new Uint16Array(volume)
	}
	else if (type == "16bitf") {
		volume = new Uint16Array(volume)
		volume = Float32Array.from(volume, x => x / 65536.0)
		type = "float"
	}
	else if (type == "float") {
		volume = new Float32Array(volume)
	}

	volDims = [x,y,z]

	document.getElementById("first").style.display = "none";
	document.getElementById("second").style.display = "block";
	document.getElementById("body").classList.add("bound");


	gui = new dat.GUI();
	gui.add(state, "transfer", ["Cool Warm", "Matplotlib Plasma", "Matplotlib Virdis", "Rainbow", "Samsel Linear Green", "Samsel Linear YGB 1211G"])
	.onChange(function (newValue) {
		var colormapImage = new Image();
		colormapImage.onload = function() {
			gl.activeTexture(gl.TEXTURE1);
			gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 180, 1,
				gl.RGBA, gl.UNSIGNED_BYTE, colormapImage);
			gls.activeTexture(gls.TEXTURE1);
			gls.texSubImage2D(gls.TEXTURE_2D, 0, 0, 0, 180, 1,
				gls.RGBA, gls.UNSIGNED_BYTE, colormapImage);
			drawSlices();
		};
		colormapImage.src = colormaps[newValue];
	})
	.name("Transfer function")
	gui.add(state, "screenshot")
	.name("Take Screenshot")
	gui.add(state, "reload")
	.name("Load Volume")

	var clipFolder = gui.addFolder("Clipping Planes")
	clipFolder.add(state, 'xmin').min(0).max(1).step(0.01).name("X min")
	.onChange(function () {
		gl.uniform3fv(shader.uniforms["box_min"], [state.xmin, state.ymin, state.zmin]);
		allowSlow = true;
	})
	clipFolder.add(state, 'xmax').min(0).max(1).step(0.01).name("X max")
	.onChange(function () {
		gl.uniform3fv(shader.uniforms["box_max"], [state.xmax, state.ymax, state.zmax]);
		allowSlow = true;
	})
	clipFolder.add(state, 'ymin').min(0).max(1).step(0.01).name("Y min")
	.onChange(function () {
		gl.uniform3fv(shader.uniforms["box_min"], [state.xmin, state.ymin, state.zmin]);
		allowSlow = true;
	})
	clipFolder.add(state, 'ymax').min(0).max(1).step(0.01).name("Y max")
	.onChange(function () {
		gl.uniform3fv(shader.uniforms["box_max"], [state.xmax, state.ymax, state.zmax]);
		allowSlow = true;
	})
	clipFolder.add(state, 'zmin').min(0).max(1).step(0.01).name("Z min")
	.onChange(function () {
		gl.uniform3fv(shader.uniforms["box_min"], [state.xmin, state.ymin, state.zmin]);
		allowSlow = true;
	})
	clipFolder.add(state, 'zmax').min(0).max(1).step(0.01).name("Z max")
	.onChange(function () {
		gl.uniform3fv(shader.uniforms["box_max"], [state.xmax, state.ymax, state.zmax]);
		allowSlow = true;
	})
	// clipFolder.open()

	var sliceFolder = gui.addFolder("Slices")
	sliceFolder.add(state, 'display').name("Display")
	.onChange(function (b) {
		var s = document.getElementById("slices")
		if (b) {
			s.style.display = "initial"
		}
		else {
			s.style.display = "none"
		}
	})
	state.useColor = segmentation ? "Segmentation" : "Grayscale"
	sliceFolder.add(state, 'useColor', segmentation ? ["Grayscale", "Transfer function", "Segmentation"] : ["Grayscale", "Transfer function"]).name("Format")
	.onChange(function () {
		drawSlices();
	})
	sliceFolder.add(state, 'scale').min(0).max(1).step(0.01).name("Scale")
	.onChange(function () {
		drawSlices();
	})
	sliceFolder.add(state, 'layout', ["Horizontal", "Vertical", "Corner"]).name("Layout")
	.onChange(function (l) {
		var s = document.getElementById("slices")
		if (l == "Horizontal") {
			s.style.width = 1200 * state.scale + "px"
			s.style.height = 400 * state.scale + "px"
		}
		if (l == "Vertical") {
			s.style.width =  400 * state.scale  + "px"
			s.style.height = 1200 * state.scal + "px"
		}
		if (l == "Corner") {
			s.style.width = 800 * state.scale + "px"
			s.style.height = 800 * state.scale + "px"
		}
		drawSlices();
	})
	.listen()
	sliceFolder.add(state, 'xslice').min(0).max(1).step(0.01).name("X slice")
	.onChange(function () {
		drawSlices();
	})
	sliceFolder.add(state, 'yslice').min(0).max(1).step(0.01).name("Y slice")
	.onChange(function () {
		drawSlices();
	})
	sliceFolder.add(state, 'zslice').min(0).max(1).step(0.01).name("Z slice")
	.onChange(function () {
		drawSlices();
	})
	// sliceFolder.open()
	gui.add(state, "segLoad").name("Load Mask")


	if (segmentation) {
		// This is for a max of 25 id's
		// TODO make random for without controls for larger numbers
		// TODO we can try nested folder once google fixes the DAT.gui bug
		segmentation = new Uint8Array(segmentation)
		ids = unique(segmentation)
		state.useSegmentation = true;
		gui.add(state, "useSegmentation").name("Use Segmentation")
		.onChange(function () {
			gl.uniform1i(shader.uniforms["use_seg"], state.useSegmentation)
		})
		ids.forEach(function (id) {
			state[id] = {
				display : true,
				color : randColor()
			}
			var idFolder = gui.addFolder(""+id)
			idFolder.add(state[id], "display").name("Display")
			idFolder.addColor(state[id], "color").name("Color")
			.onChange(function (newValue) {
				var colors = listColors(state, ids)
				colors = colors.concat(new Array(25 * 3 - colors.length).fill(0))
				gl.uniform3fv(cl, colors)
				drawSlices()
			})
		})
	}

	colormapImage = new Image();
	colormapImage.onload = function() {
		initVol()
		initSlice()
	};
	colormapImage.src = colormaps[state.transfer];

}


document.getElementById("submit").addEventListener('click', initVis, false)