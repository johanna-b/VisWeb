


var over = document.getElementById('overlay');
var xPos, yPos, xPosOld, yPosOld;
var transInit = false;

function startOverlay() {
	over.style.display = "block";
	over.style.top = "";
	over.style.left = "";

	xPos = 0, yPos = 0, xPosOld = 0, yPosOld = 0;

	if (!transInit) {
		var hist;
		var bins = 200;
		if (type == "8bit") {
			hist = binHist(volume, bins, 256)
		}
		else if (type == "16bit") {
			hist = binHist(volume, bins, 65536)
		}
		else if (type == "float") {
			hist = binHist(volume, bins, 1)
		}

		var border = {top : 5, left : 5, right : 5}
		var div = document.getElementById("hist")
		var w = div.offsetWidth;
		var h = div.offsetHeight;
		var two = new Two({width : w, height : h}).appendTo(div)
		var anchors = [new Two.Anchor(border.left, h)];
		var xStep = (w- (border.left + border.right)) / bins;
		// log scale
		hist = hist.map(Math.log)
		var yStep = (h - border.top) / Math.max(... hist);
		for (var i = 0; i < bins; i++) {
			anchors.push(new Two.Anchor(border.left + i * xStep, h - hist[i] * yStep))
		}
		anchors.push(new Two.Anchor(w - border.right, h))
		var curve = two.makePath(anchors, true)
		curve.linewidth = 2;
		curve.fill = "#535353";;
		curve.stroke = "#ececec";

		two.update();
		transInit = true;
	}
}

function onMouseMove(e) {
 	e.preventDefault();

 	xPos = xPosOld - e.clientX;
 	yPos = yPosOld - e.clientY;
 	xPosOld = e.clientX;
 	yPosOld = e.clientY;

 	over.style.top = over.offsetTop - yPos + "px";
 	over.style.left = over.offsetLeft - xPos + "px";
 }


over.addEventListener('mousedown', function (e) {
	e.preventDefault();

 	xPosOld = e.clientX;
 	yPosOld = e.clientY;
 	window.addEventListener('mousemove', onMouseMove, false)
}, false)
window.addEventListener('mouseup', function () {
	window.removeEventListener('mousemove', onMouseMove)
})



var close = document.getElementById("close")
close.addEventListener('click', function () {
	over.style.display = "none";
})

var info = document.getElementById("info")
var infoBox = new Tooltip(info, {placement: "right", title: "this is a very very long and random test string", offset: "0, 10"})
