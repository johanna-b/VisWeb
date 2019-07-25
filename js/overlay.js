

function drawPolygon() {
	controlPoints.sort( (a, b) => a.translation.x - b.translation.x)
	background.remove(controlPath)
	controlPointsWithEnds = [new Two.Anchor(controlPoints[0].translation.x, div.offsetHeight)]
	.concat(controlPoints.map(p => p.translation.clone()))
	.concat([new Two.Anchor(controlPoints[controlPoints.length - 1].translation.x, div.offsetHeight)])
	controlPath = two.makePath(controlPointsWithEnds, true)
	controlPath.stroke = "#C4C0BB"
	controlPath.linewidth = 3
	var stops = []
	var polyWidth = controlPoints[controlPoints.length - 1].translation.x - controlPoints[0].translation.x
	for (var i = 0; i < controlPoints.length; i++) {
		var pt = controlPoints[i]
		stops.push(new Two.Stop((pt.translation.x - controlPoints[0].translation.x) / polyWidth, pt.fill, 0.8)) //0.8
	}
	var linearGradient = two.makeLinearGradient(
          -polyWidth / 2, two.height / 2,
          polyWidth / 2, two.height / 2, ... stops
        );
	controlPath.fill = linearGradient;
	background.add(controlPath)
	two.update()
}

function addInteractivity(shape) {

    var offset = shape.parent.translation;

    var drag = function(e) {
	   	e.preventDefault();
	    var x = e.clientX - div.offsetLeft - offset.x - over.offsetLeft;
	    x = x < 0 ? 0 : x;
	    x = x > div.offsetWidth ? div.offsetWidth : x;
	    var y = e.clientY - div.offsetTop - offset.y - over.offsetTop;
	    y = y < 0 ? 0 : y;
	    y = y > div.offsetHeight ? div.offsetHeight : y;
	    shape.translation.set(x, y);
	    drawPolygon();
    };
    var touchDrag = function(e) {
	    e.preventDefault();
	    var touch = e.originalEvent.changedTouches[0];
	    drag({
	        preventDefault: _.identity,
	        clientX: touch.pageX,
	        clientY: touch.pageY
	    });
	    return false;
	};
    var dragEnd = function(e) {
	    e.preventDefault();
	    over.addEventListener("mousedown", onMouseDown, false)
	    $(window)
	        .unbind('mousemove', drag)
	        .unbind('mouseup', dragEnd);
    };
    var touchEnd = function(e) {
	    e.preventDefault();
	    over.addEventListener("mousedown", onMouseDown, false)
	    $(window)
	        .unbind('touchmove', touchDrag)
	        .unbind('touchend', touchEnd);
	    return false;
    };

    $(shape._renderer.elem)
        .css({
        	cursor: 'pointer'
        })
        .bind('mousedown', function(e) {
	        e.preventDefault();
	        if (e.button == 0) {
		        over.removeEventListener("mousedown", onMouseDown)
		        $(window)
		            .bind('mousemove', drag)
		            .bind('mouseup', dragEnd);
	        }
        })
        .bind('touchstart', function(e) {
	        e.preventDefault();
	        over.removeEventListener("mousedown", onMouseDown)
	        $(window)
	            .bind('touchmove', touchDrag)
	            .bind('touchend', touchEnd);
	        return false;
        });
}

var over = document.getElementById('overlay');
var div = document.getElementById("hist")
var xPos, yPos, xPosOld, yPosOld;
var transInit = false;
var controlPoints = [];
var numControlPoints = 5;
var initControlColors = ["#742B69", "#C1524A", "#E78739", "#F1C24E", "#FCFFAD"]
var controlPath = null;
var two = null;
var background = null;
var forground = null;

div.addEventListener("dblclick", function (e) {
	var pt = two.makeCircle(e.clientX - div.offsetLeft - over.offsetLeft, e.clientY - div.offsetTop - over.offsetTop, 7)
	pt.stroke = "#C4C0BB";
	pt.linewidth = 2
	pt.fill = getColor(e.clientX - div.offsetLeft - over.offsetLeft, controlPoints)
	controlPoints.push(pt)
	forground.add(pt)
	two.update()
	addInteractivity(pt)
	drawPolygon()
}, false)

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
		// log scale
		histLog = hist.map(x => x + 1)
		histLog = histLog.map(Math.log)

		var border = {top : 5, left : 0, right : 0}
		var w = div.offsetWidth;
		var h = div.offsetHeight;
		two = new Two({width : w, height : h}).appendTo(div)


		var histLogAnchors = [new Two.Anchor(border.left, h)];
		var xStep = (w- (border.left + border.right)) / bins;
		var yStep = (h - border.top) / Math.max(... histLog);
		for (var i = 0; i < bins; i++) {
			histLogAnchors.push(new Two.Anchor(border.left + i * xStep, h - histLog[i] * yStep))
		}
		histLogAnchors.push(new Two.Anchor(w - border.right, h))
		var histLogCurve = two.makePath(histLogAnchors, true)
		histLogCurve.linewidth = 2;
		histLogCurve.fill = "#212121";;
		histLogCurve.stroke = "#3b3b3b";


		var histAnchors = [new Two.Anchor(border.left, h)];
		var xStep = (w- (border.left + border.right)) / bins;
		var yStep = (h - border.top) / Math.max(... hist);
		for (var i = 0; i < bins; i++) {
			histAnchors.push(new Two.Anchor(border.left + i * xStep, h - hist[i] * yStep))
		}
		histAnchors.push(new Two.Anchor(w - border.right, h))
		var histCurve = two.makePath(histAnchors, true)
		histCurve.linewidth = 2;
		histCurve.fill = "#4E4E4E";;
		histCurve.stroke = "#5c5c5c";

		background = two.makeGroup()
		forground = two.makeGroup()

		var step = w / (numControlPoints - 1)
		for (var i = 0; i < numControlPoints; i++) {
			var pt = two.makeCircle(i * step, h/2, 7)
			pt.stroke = "#C4C0BB";
			pt.linewidth = 2
			pt.fill = initControlColors[i]
			controlPoints.push(pt)
			forground.add(pt)
			two.update()
			var picker = Pickr.create({
				el : "#" + pt.id,
				theme : 'nano',
				useAsButton : true,
				defaultRepresentation : 'HEX',
				default : pt.fill,
				disabled : true,
    			components: {
			        preview: true,
			        opacity: false,
			        hue: true,
			        interaction: {
			            input: true,
			            save: true
			        }
			    }
			})
			picker.pt = pt
			picker.on('save', function (c, p) {
				p.pt.fill = c.toHEXA().toString();
				drawPolygon();
			})
			picker.enable();
		}
		two.update();
		controlPoints.map(addInteractivity)

		transInit = true;

		drawPolygon();
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

function onMouseDown(e) {
	e.preventDefault();

 	xPosOld = e.clientX;
 	yPosOld = e.clientY;
 	window.addEventListener('mousemove', onMouseMove, false)
}

over.addEventListener('mousedown', onMouseDown, false)
window.addEventListener('mouseup', function () {
	window.removeEventListener('mousemove', onMouseMove)
})



var close = document.getElementById("close")
close.addEventListener('click', function () {
	over.style.display = "none";
})

var info = document.getElementById("info")
var infoBox = new Tooltip(info, {placement: "right", title: "Click and drag on the anchor points to move them. Double click to add another anchor point.", offset: "0, 10"})
