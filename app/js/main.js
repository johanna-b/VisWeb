/**
 * author: johanna
 * created: 12/1/17
 */


// data =========================

var dataPath = "app/data/processed/";

var datasets = [
    //{ name: "none", filename: "", x: 0, y: 0, z: 0 },
    {name: "hydrogen", filename: "hydrogen3D.png", x: 128, y: 128, z: 128, slicesx: 16, slicesy: 8},
    {name: "bunny", filename: "bunny3d.png", x: 128, y: 128, z: 128, slicesx: 16, slicesy: 8},
    {name: "sprite", filename: "sprite0.png", x: 0, y: 0, z: 0, slicesx: 0, slicesy: 0},
    {name: "MRI", filename: "MRI.png", x: 512, y: 512, z: 92, slicesx: 10, slicesy: 10},
    {name: "lowresCT", filename: "CT.png", x:256, y: 256, z: 183, slicesx: 14, slicesy: 14},
    {name: "highresCT", filename: "CT_hr2.png", x:512, y: 512, z: 371, slicesx: 20, slicesy: 20},
    {name: "MRIinterp", filename: "MRIinterp.png", x : 256, y: 256, z: 189, slicesx: 14, slicesy: 14}
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
// chose between 3 default transfer fuctions, updates tf texture
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
        for ( var i = 0; i < 256; i++ ) {
            // rgb
            tfArrayRgba[ 4 * i ] = tfArrayRgba[ 4 * i + 1 ] = tfArrayRgba[ 4 * i + 2 ] = i;
            // opacity
            tfArrayRgba[ 4 * i + 3 ] = i / 20;
        }

        // colorful ramp
    } else if ( val == 2 ) {
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
    } else {
        let stop_points = [];
        let colors = [];
        for(let i = 1; i < tf_panel.tf_values.length - 1; i++) {
            stop_points.push(Math.floor(tf_panel.tf_values[i][0] * 255));
            colors.push(tf_panel.tf_values[i][1])
        }
        console.log("Boundary points are: ")
        console.log(stop_points)
        console.log("Boundary colors are: ")
        console.log(colors)
        for(let i = 0; i < 256; i++){
            //if(i < )
        }









        //console.log( '1' );
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


