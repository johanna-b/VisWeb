/**
 * author: johanna
 * created: 12/1/17
 */


// data =========================

var dataPath = "app/data/processed/";

var datasets = [
    //{ name: "none", filename: "", x: 0, y: 0, z: 0 },
    { name: "hydrogen", filename: "hydrogen3D.png", x: 128, y: 128, z: 128, slicesx: 16, slicesy: 8 },
    { name: "bunny", filename: "bunny3D.png", x: 128, y: 128, z: 128, slicesx: 16, slicesy: 8 },
    { name: "sprite", filename: "sprite0.png", x: 0, y: 0, z: 0, slicesx: 0, slicesy: 0 }
];

var datasetId = 0;


// ui parameters =========================

var uiParams = {
    dataset: -1,
    sample_distance: 1.0,
    shading: false,
    background_color: [ 0, 128, 255 ],
    slice_id: 0
};


// data texture =========================

var volumeTex;


// =================================
// methods
// =================================

// =================================
// load dataset as one large 2D texture
var loadDataset = function(dataid) {

    if ( dataid < 0 ){
        return;
    }
    datasetId = dataid;

    console.log('loading ' + dataPath + datasets[dataid].filename);

    // load image as texture
    var textureLoader = new THREE.TextureLoader();
    var tex = textureLoader.load(dataPath + datasets[dataid].filename, loadDatasetFinished);

}


// =================================
// after data has loaded, init visualizations
var loadDatasetFinished = function(texture) {

    volumeTex = texture;

    // texture params
    volumeTex.generateMipMaps = false;
    volumeTex.minFilter = THREE.LinearFilter;
    volumeTex.maxFilter = THREE.LinearFilter;

    initVis2D();
    initVis3D();
}


// =================================
//
var onWindowResize = function(){
    var vis_container = document.getElementById('div_vis3D');
    //console.log( 'new size 3d view: ', vis_container.offsetWidth, vis_container.offsetHeight);

    resize3DView(vis_container.offsetWidth, vis_container.offsetHeight);
}

// magic button
var btn_obj = { magic:function(){
    console.log("clicked");
    //renderOrtho();
    //onWindowResize();

    //ShaderLoader(vertPathBackFace, fragPathBackFace, onFirstPassShaderLoad, onLoadProgress, onLoadError);

    showFirstPass = !showFirstPass;
}};

// magic button
var btn_refresh = { refresh:function(){
    console.log("refresh");
    //renderOrtho();
    //onWindowResize();

    renderVolume();
}};


// =================================
// auto run
// =================================

initUI();


