

var volume = null;

function handleFile(files) {
    
    f = files[0];
    if (!f) {
      console.log("we need to pay respects");
    }

    var reader = new FileReader();
    var label = document.getElementById("label");
    var input = document.getElementById("input");
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
      input.style.background = "initial"
    };

    reader.onload = function(data){
      volume = new Uint8Array(data.target.result)
      input.style.background = "linear-gradient(90deg, #722040 100%, #d3394c 100%)"
      label.innerHTML = f.name;
    }

    reader.readAsArrayBuffer(f);
  
  };

  function handleFileSelect(evt) {
    handleFile(evt.target.files)
  };

   function handleFileDrop(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    handleFile(evt.dataTransfer.files); // FileList object.
  };

  function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  };


  var inout = 0
  function handelDragEnter(evt) {
    inout ++;
    document.getElementById("drop_zone").style.outlineColor = "#d3394c";
  }

  function handelDragLeave(evt) {
    inout --;
    if (inout === 0) {
      document.getElementById("drop_zone").style.outlineColor = "#f1e5e6";
    }
  }

  var inn = document.getElementById('file-1');
  inn.addEventListener('change', handleFileSelect, false);
  var drop = document.getElementById('drop_zone');
  drop.addEventListener('dragover', handleDragOver, false);
  drop.addEventListener('drop', handleFileDrop, false);
  drop.addEventListener('dragleave', handelDragLeave, false);
  drop.addEventListener('dragenter', handelDragEnter, false);
