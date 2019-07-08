

var volume = null;
var segmentation = null;

function handleFile(files, label, input, mode) {
    
  f = files[0];
  if (!f) {
    console.log("we need to pay respects");
  }

  var reader = new FileReader();
  label.innerHTML = "Loading ..."
  

  // Closure to capture the file information.
  reader.onloadstart = function function_name(argument) {
    input.style.background = "linear-gradient(90deg, #722040 0%, #d3394c 0%)"
  }

  reader.onprogress = function(data) {
    if (data.lengthComputable) {                                            
        var progress = parseInt( ((data.loaded / data.total) * 100), 10 );
        input.style.background = "linear-gradient(90deg, #722040 " + progress + "%, #d3394c " + progress + "%)"
    }
  }

  reader.onerror = function(evt) {
    label.innerHTML = "Error"
    input.style.background = "#d3394c"
    if (mode == "vol") {
      volume = null
    }
    if (mode == "seg") {
      segmentation = null
    }
  };

  reader.onload = function(data){
    if (mode == "vol") {
      volume = data.target.result
    }
    if (mode == "seg") {
      segmentation = data.target.result
    }
    input.style.background = "linear-gradient(90deg, #722040 100%, #d3394c 100%)"
    label.innerHTML = f.name;
  }

  reader.readAsArrayBuffer(f);
  
};


var inn = document.getElementById('file-1');
inn.addEventListener('change', function (evt) {
  var label = document.getElementById("label");
  var input = document.getElementById("input");
  handleFile(evt.target.files, label, input, "vol")
}, false);


var drop = document.getElementById('drop_zone');
drop.addEventListener('dragover', function (evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}, false);
drop.addEventListener('drop', function (evt) {
  evt.stopPropagation();
  evt.preventDefault();
  document.getElementById("drop_zone").style.outlineColor = "#f1e5e6";
  volInout = 0;

  var label = document.getElementById("label");
  var input = document.getElementById("input");

  handleFile(evt.dataTransfer.files, label, input, "vol"); // FileList object.
}, false);
var volInout = 0
drop.addEventListener('dragenter', function (evt) {
  volInout ++;
  document.getElementById("drop_zone").style.outlineColor = "#d3394c";
}, false);
drop.addEventListener('dragleave', function (evt) {
  volInout --;
  if (volInout === 0) {
    document.getElementById("drop_zone").style.outlineColor = "#f1e5e6";
  }
}, false);



var inn2 = document.getElementById('file-2');
inn2.addEventListener('change', function (evt) {
  var label = document.getElementById("label2");
  var input = document.getElementById("input2");
  handleFile(evt.target.files, label, input, "seg")
}, false);


var drop2 = document.getElementById('drop_zone2');
drop2.addEventListener('dragover', function (evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}, false);
drop2.addEventListener('drop', function (evt) {
  evt.stopPropagation();
  evt.preventDefault();
  document.getElementById("drop_zone2").style.outlineColor = "#f1e5e6";
  segInout = 0;

  var label = document.getElementById("label2");
  var input = document.getElementById("input2");

  handleFile(evt.dataTransfer.files, label, input, "seg"); // FileList object.
}, false);
var segInout = 0
drop2.addEventListener('dragenter', function (evt) {
  segInout ++;
  document.getElementById("drop_zone2").style.outlineColor = "#d3394c";
}, false);
drop2.addEventListener('dragleave', function (evt) {
  segInout --;
  if (segInout === 0) {
    document.getElementById("drop_zone2").style.outlineColor = "#f1e5e6";
  }
}, false);



function reset() {
  var input = document.getElementById("input");
  var label = document.getElementById("label")
  label.innerHTML = "Choose a file&hellip;"
  input.style.background = "#d3394c"
  var input2 = document.getElementById("input2");
  var label2 = document.getElementById("label2")
  label2.innerHTML = "Add segmentation"
  input2.style.background = "#d3394c"
  volume = null
  segmentation = null
}
