/**
 * author: johanna
 * created: 12/1/17
 */


// data =========================

var data_path = "app/data/processed/";

var datasets = [
    //{ name: "none", filename: "", x: 0, y: 0, z: 0 },
    { name: "hydrogen", filename: "hydrogen3D.png", x: 128, y: 128, z: 128, slicesx: 16, slicesy: 8 },
    { name: "bunny", filename: "bunny3D.png", x: 128, y: 128, z: 128, slicesx: 16, slicesy: 8 },
    { name: "sprite", filename: "sprite0.png", x: 0, y: 0, z: 0, slicesx: 0, slicesy: 0 }
];


// ui parameters =========================

var ui_params = {
    dataset: -1,
    sample_distance: 25,
    shading: false,
    background_color: [ 0, 128, 255 ],
    slice_id: 0
};


// data texture =========================

var voltex;


// =================================
// methods
// =================================

// =================================
// load dataset as one large 2D texture
var loadDataset = function(dataid) {

    console.log('loading ' + data_path + datasets[dataid].filename);

    // load image as texture
    var textureLoader = new THREE.TextureLoader();
    var tex = textureLoader.load(data_path + datasets[dataid].filename, loadDatasetFinished);

}


// =================================
// after data has loaded, init visualizations
var loadDatasetFinished = function(texture) {

    // texture params
    //voltex.generateMipMaps = false;
    //voltex.minFilter = THREE.LinearFilter;
    //voltex.maxFilter = THREE.LinearFilter;

    initVis2D(texture);
    //initVis3D();
}


// =================================
// auto run
// =================================

initUI();


