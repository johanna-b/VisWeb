/**
 * author: johanna
 * created: 12/1/17
 */


// data =========================

var dataPath = "app/data/processed/";

var datasets = [
    //{ name: "none", filename: "", x: 0, y: 0, z: 0 },
    {name: "hydrogen", filename: "hydrogen3D.png", x: 128, y: 128, z: 128, slicesx: 16, slicesy: 8},
    {name: "bunny", filename: "bunny3D.png", x: 128, y: 128, z: 128, slicesx: 16, slicesy: 8},
    {name: "sprite", filename: "sprite0.png", x: 0, y: 0, z: 0, slicesx: 0, slicesy: 0}
];

var datasetId = 0;

// ui parameters =========================

var uiParams = {
    dataset: -1,
    sample_distance: 1.0,
    transfer_function: 0,
    shading: false,
    background_color: [ 0, 0, 0 ],
    slice_id: 0,
    show_frontfaces: false,
    move_light: false
};


// data texture =========================

var volumeTex;
var tfTex;


// =================================
// methods
// =================================

// =================================
// load dataset as one large 2D texture
var loadDataset = function ( dataid ) {

    if ( dataid < 0 ) {
        return;
    }
    datasetId = dataid;

    console.log( 'loading ' + dataPath + datasets[ dataid ].filename );

    // load image as texture
    var textureLoader = new THREE.TextureLoader();
    var tex = textureLoader.load( dataPath + datasets[ dataid ].filename, loadDatasetFinished );

}


// =================================
// after data has loaded, init visualizations
var loadDatasetFinished = function ( texture ) {

    volumeTex = texture;

    // texture params
    volumeTex.generateMipMaps = false;
    volumeTex.minFilter = THREE.LinearFilter;
    volumeTex.maxFilter = THREE.LinearFilter;

    volumeTex.wrapS = THREE.ClampToEdgeWrapping;
    volumeTex.wrapT = THREE.ClampToEdgeWrapping;

    updateTFTexture( uiParams.transfer_function );
    tfTex.generateMipMaps = false;
    tfTex.minFilter = THREE.LinearFilter;
    tfTex.maxFilter = THREE.LinearFilter;

    initVis2D();
    initVis3D();
}


// =================================
//
var updateTFTexture = function ( v ) {

    var val = uiParams.transfer_function;

    // create TF data array - right now it's a simple gray ramp
    var tfArrayRgba = new Uint8Array( 256 * 4 );

    // black/white ramp 1
    if ( val == 0 ) {
        console.log( '1' );
        for ( var i = 0; i < 256; i++ ) {
            // rgb
            tfArrayRgba[ 4 * i ] = tfArrayRgba[ 4 * i + 1 ] = tfArrayRgba[ 4 * i + 2 ] = i;
            // opacity
            tfArrayRgba[ 4 * i + 3 ] = i;

            // threshold
            if ( i < 100 ) {
                tfArrayRgba[ 4 * i + 3 ] = 0;
            }
        }

        // black/white ramp 2
    } else if ( val == 1 ) {
        console.log( '2' );
        for ( var i = 0; i < 256; i++ ) {
            // rgb
            tfArrayRgba[ 4 * i ] = tfArrayRgba[ 4 * i + 1 ] = tfArrayRgba[ 4 * i + 2 ] = i;
            // opacity
            tfArrayRgba[ 4 * i + 3 ] = i / 20;
        }

        // colorful ramp
    } else {
        console.log( '3' );
        for ( var i = 0; i < 256; i++ ) {
            // rgb
            if ( i < 150 ) {
                tfArrayRgba[ 4 * i ] = 255;
                tfArrayRgba[ 4 * i + 1 ] = i;
                tfArrayRgba[ 4 * i + 2 ] = i;
                // opacity
                tfArrayRgba[ 4 * i + 3 ] = i;
            } else {
                tfArrayRgba[ 4 * i ] = 255 - (i - 150);
                tfArrayRgba[ 4 * i + 2 ] = 255;
                tfArrayRgba[ 4 * i + 2 ] = i;
                // opacity
                tfArrayRgba[ 4 * i + 3 ] = i;
            }

            // threshold
            if ( i < 20 ) {
                tfArrayRgba[ 4 * i + 3 ] = 0;
            }
        }
    }

    // create/update texture
    tfTex = new THREE.DataTexture( tfArrayRgba, 256, 1, THREE.RGBAFormat );
    tfTex.needsUpdate = true;

    if ( shaderMaterialSecondPass != null ) {
        shaderMaterialSecondPass.uniforms.transferFunctionTexture.value = tfTex;
    }

}


// =================================
//
var onWindowResize = function () {
    var vis_container = document.getElementById( 'div_vis3D' );
    //console.log( 'new size 3d view: ', vis_container.offsetWidth, vis_container.offsetHeight);

    resize3DView( vis_container.offsetWidth, vis_container.offsetHeight );
}


// =================================
// refresh button
var btn_refresh = {
    refresh: function () {

        tfTex.needsUpdate = true;
        shaderMaterialSecondPass.uniforms.transferFunctionTexture.value = tfTex;

        renderOrtho();

        renderVolume();
    }
};


// =================================
// auto run
// =================================


initUI();


