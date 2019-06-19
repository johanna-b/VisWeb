
function handleFile(files) {
    
    f = files[0];
    if (!f) {
      console.log("we need to pay respects");
    }

    var reader = new FileReader();
    var label = document.getElementById("label");
    var input = document.getElementById("input");
    label.innerHTML = f.name;

    // Closure to capture the file information.
    reader.onloadstart = function function_name(argument) {
      input.style.background = "linear-gradient(90deg, #722040 50%, #d3394c 50%);"
      console.log(input)
    }

    reader.onprogress = function(data) {
      if (data.lengthComputable) {                                            
          var progress = parseInt( ((data.loaded / data.total) * 100), 10 );
          console.log(progress);
          // bar TODO
      }
    }

    reader.onerror = function(evt) {
      // todo
    };

    reader.onload = function(data){
      console.log(new Uint8Array(data.target.result))
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

  var inn = document.getElementById('file-1');
  inn.addEventListener('change', handleFileSelect, false);
  var drop = document.getElementById('drop_zone');
  drop.addEventListener('dragover', handleDragOver, false);
  drop.addEventListener('drop', handleFileDrop, false);
