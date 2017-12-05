// Create an instance, which also creates a UI pane
//var gui = new dat.GUI();

var data_path = "app/data/processed/";

var datasets = [
    //{ name: "none", filename: "", x: 0, y: 0, z: 0 },
    { name: "hydrogen", filename: "hydrogen3D.png", x: 128, y: 128, z: 128, slicesx: 16, slicesy: 8 },
    { name: "bunny", filename: "bunny3D.png", x: 128, y: 128, z: 128, slicesx: 16, slicesy: 8 },
    { name: "sprite", filename: "sprite0.png", x: 0, y: 0, z: 0, slicesx: 0, slicesy: 0 }
];



var gui = new dat.GUI({ autoPlace: false, width: 200, height:600 });
var ui_container = document.getElementById('div_ui_menu');
ui_container.appendChild(gui.domElement);


// ui parameters
var ui_params = {
    dataset: -1,
    sample_distance: 25,
    shading: false,
    background_color: [ 0, 128, 255 ],
    slice_id: 0
};

var slice_slider;

function initUI() {

    // =========================

    var folder_VR = gui.addFolder('Volume Renderer');

    // String field
    //f1.add(ui_params, "name");
    // combobox with numbers
    // var controller = gui.add(ui_params, 'speed', {Stopped: 0, Slow: 0.1, Fast: 5});
    // var controller = gui.add(ui_params, 'speed', ['one', 'two']);

    // combobox dataset
    var dataset_combo = folder_VR.add(ui_params, 'dataset', {none: -1, hydrogen: 0, bunny:1, sprite:2});

    dataset_combo.onChange(function (value) {
        loadDataset(value);
    });

    // slider sample distance
    var sample_dist_slider = folder_VR.add(ui_params, "sample_distance").min(1).max(50).step(1);

    sample_dist_slider.onChange(function (value) {
        console.log('sample dist fire');
    });

    sample_dist_slider.onFinishChange(function (value) {
        alert("The new value is " + value);
    });

    // Checkbox field
    folder_VR.add(ui_params, "shading");

    // background color
    folder_VR.addColor(ui_params, 'background_color');

    folder_VR.open();

    // ===============================

    var folder_Slicer = gui.addFolder('Slice View');

    slice_slider = folder_Slicer.add(ui_params, "slice_id").min(0).max(64).step(1);

    slice_slider.onChange(function (value) {
        updateSlice(value);
    });

    var btn_obj = { magic:function(){
        console.log("clicked");
        renderOrtho();
    }};

    folder_Slicer.add(btn_obj,'magic');

    folder_Slicer.open();
}





var render_vars = {
    vis_width: 800,
    vis_height: 800,
}

var render_vars_2D = {
    vis_width: 400,
    vis_height: 400,
}

var scene;
var camera;
var renderer;
var cube;
var controls;

var sceneOrtho;
var cameraOrtho;
var rendererOrtho;

var sliceGeomOrtho;

var voltex;

function initVis3D() {

    var vis_container = document.getElementById('div_vis3D');

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, render_vars.vis_width / render_vars.vis_height, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(render_vars.vis_width, render_vars.vis_height); //window.innerWidth, window.innerHeight);
    renderer.setClearColor( 0xa0a0a0 );

    vis_container.appendChild(renderer.domElement);

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe:true});
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    // TrackballControls OrbitControls
    controls = new THREE.TrackballControls( camera, renderer.domElement );
    controls.addEventListener( 'change', function() {
        renderer.render(scene, camera);
    } );

    renderer.render( scene, camera );
}

function initVis2D(texture) {

    voltex = texture;

    var vis2D_container = document.getElementById('div_vis2D');

    var width = render_vars_2D.vis_width;
    var height = render_vars_2D.vis_height; //window.innerHeight;


    cameraOrtho = new THREE.OrthographicCamera(- width / 2, width / 2, height / 2, - height / 2, 1, 10 );
    cameraOrtho.position.z = 5;

    sceneOrtho = new THREE.Scene();


    sliceGeomOrtho = new THREE.PlaneGeometry(width, height);
    var material = new THREE.MeshBasicMaterial( {map: voltex, color: 0xffff00, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh( sliceGeomOrtho, material );

    //updateSlice(ui_params.slice_id);
    //updateTextureParams(sliceGeomOrtho, ui_params.slice_id);

    sceneOrtho.add( plane );

    /*
    var material = new THREE.SpriteMaterial( { map: voltex } );
    var sprite = new THREE.Sprite( material );

    var ratio1 = width / material.map.image.width;
    var ratio2 = height / material.map.image.height;
    if ( ratio2 < ratio1 ) {
        ratio1 = ratio2;
    }

    sprite.scale.set( material.map.image.width*ratio1, material.map.image.height*ratio1, 1 );
    //sceneOrtho.add( sprite );
    sprite.position.set( 0, 0, 1 );
    */


    rendererOrtho = new THREE.WebGLRenderer();
    rendererOrtho.setPixelRatio( window.devicePixelRatio );
    rendererOrtho.setSize( width, height); //window.innerWidth, window.innerHeight);
    //renderer.setClearColor( 0xa0a0a0 );
    rendererOrtho.autoClear = false;

    while (vis2D_container.hasChildNodes()) {
        vis2D_container.removeChild(vis2D_container.lastChild);
    }
    vis2D_container.appendChild(rendererOrtho.domElement);

    slice_slider.setValue(0);
    slice_slider.max( Math.max(0, datasets[ui_params.dataset].z-1) );

    //updateSlice(ui_params.slice_id);
    renderOrtho();
}


function updateSlice(sliceId) {
    console.log('update slice id:: ', sliceId);

    var dataset = datasets[ ui_params.dataset ];

    var xIdx = sliceId % dataset.slicesx;
    var yIdx = Math.floor( sliceId / dataset.slicesx );

    var xStart = xIdx / dataset.slicesx; // 0..1
    var xEnd = (xIdx+1) / dataset.slicesx;

    var yStart = 1.0 - (yIdx / dataset.slicesy);
    var yEnd = 1.0 - ((yIdx+1) / dataset.slicesy);

    console.log('uv:', xStart, xEnd, yStart, yEnd);
    updateTextureParams(sliceGeomOrtho, xStart, xEnd, yStart, yEnd );

    renderOrtho();

}

function updateTextureParams(quad, sMin, sMax, tMin, tMax) {
    //JOJO todo: update texture params, cut out one slice

    /*
    var sMin = 0.0;
    var sMax = 0.25;
    var tMin = 0.0;
    var tMax = 1.0;
*/
/*
    var elt = quad.faceVertexUvs[0];
    var face0 = elt[0];
    face0[0] = new THREE.Vector2(sMin,tMax);
    face0[1] = new THREE.Vector2(sMin,tMin);
    face0[2] = new THREE.Vector2(sMax,tMax);
*/
    quad.faceVertexUvs[0][0][0].set( sMin, tMax );
    quad.faceVertexUvs[0][0][1].set( sMin, tMin );
    quad.faceVertexUvs[0][0][2].set( sMax, tMax );
/*
    var face1 = elt[1];
    face1[0] = new THREE.Vector2(sMin,tMin);
    face1[1] = new THREE.Vector2(sMax,tMin);
    face1[2] = new THREE.Vector2(sMax,tMax);
  */
    quad.faceVertexUvs[0][1][0].set( sMin, tMin );
    quad.faceVertexUvs[0][1][1].set( sMax, tMin );
    quad.faceVertexUvs[0][1][2].set( sMax, tMax );


    quad.uvsNeedUpdate = true;
    console.log('brb');
}


function loadDataset(dataid) {

    //console.log('loading ' + ((dataid<=0)?'hydrogen':'bunny'));
    console.log('loading ' + data_path + datasets[dataid].filename);

    // load image as texture
    var textureLoader = new THREE.TextureLoader();
    var tex = textureLoader.load(data_path + datasets[dataid].filename, initVis2D);




    // texture params
    //voltex.generateMipMaps = false;
    //voltex.minFilter = THREE.LinearFilter;
    //voltex.maxFilter = THREE.LinearFilter;

}



function animate() {
    requestAnimationFrame( animate );
    //controls.update();
    render();
    //renderer.render( scene, camera );
    //cube.rotation.x += 0.1;
    //cube.rotation.y += 0.1;
}

function renderOrtho() {
    console.log('r');
    rendererOrtho.clear();
    rendererOrtho.clearDepth();
    rendererOrtho.render( sceneOrtho, cameraOrtho );
}

// actual calls
initUI();
//loadDataset(2);
//initVis2D();
//animate();
//animate();

