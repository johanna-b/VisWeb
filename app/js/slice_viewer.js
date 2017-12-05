/**
 * author: johanna
 * created: 12/5/17
 */

// =================================
// variables
// =================================

var render_vars_2D = {
    vis_width: 200,
    vis_height: 200
}

var sceneOrtho;
var cameraOrtho;
var rendererOrtho;

var sliceGeomOrtho;

// =================================
// methods
// =================================

// =================================
// init slice viewer
var initVis2D = function(texture) {

    voltex = texture;

    var vis2D_container = document.getElementById('div_vis2D');

    var width = render_vars_2D.vis_width;
    var height = render_vars_2D.vis_height;

    // set up camera and scene
    cameraOrtho = new THREE.OrthographicCamera(- width / 2, width / 2, height / 2, - height / 2, 1, 10 );
    cameraOrtho.position.z = 5;
    sceneOrtho = new THREE.Scene();

    // set up renderer
    rendererOrtho = new THREE.WebGLRenderer();
    rendererOrtho.setPixelRatio( window.devicePixelRatio );
    rendererOrtho.setSize( width, height);
    rendererOrtho.autoClear = false;

    // create slice geometry and material for texturing
    sliceGeomOrtho = new THREE.PlaneGeometry(width, height);
    var material = new THREE.MeshBasicMaterial( {map: voltex, color: 0xffffff, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh( sliceGeomOrtho, material );

    sceneOrtho.add( plane );

    // add renderer to HTML
    while (vis2D_container.hasChildNodes()) {
        vis2D_container.removeChild(vis2D_container.lastChild);
    }
    vis2D_container.appendChild(rendererOrtho.domElement);

    // init slider
    slice_slider.setValue(0);
    slice_slider.max( Math.max(0, datasets[ui_params.dataset].z-1) );

    // render
    renderOrtho();
}


// =================================
// update displayed slice
var updateSlice = function(sliceId) {

    var dataset = datasets[ ui_params.dataset ];

    // get index of slice in large 2D texture
    var xIdx = sliceId % dataset.slicesx;
    var yIdx = Math.floor( sliceId / dataset.slicesx );

    // compute texture coordinates
    var xStart = xIdx / dataset.slicesx; // 0..1
    var xEnd = (xIdx+1) / dataset.slicesx;

    var yStart = 1.0 - (yIdx / dataset.slicesy);
    var yEnd = 1.0 - ((yIdx+1) / dataset.slicesy);

    //console.log('uv:', xStart, xEnd, yStart, yEnd);

    // update texture coordinates
    updateTextureParams(sliceGeomOrtho, xStart, xEnd, yStart, yEnd );

    // render
    renderOrtho();
}


// =================================
// update uv texture coordinates
var updateTextureParams = function(quad, sMin, sMax, tMin, tMax) {

    quad.faceVertexUvs[0][0][0].set( sMin, tMax );
    quad.faceVertexUvs[0][0][1].set( sMin, tMin );
    quad.faceVertexUvs[0][0][2].set( sMax, tMax );

    quad.faceVertexUvs[0][1][0].set( sMin, tMin );
    quad.faceVertexUvs[0][1][1].set( sMax, tMin );
    quad.faceVertexUvs[0][1][2].set( sMax, tMax );

    quad.uvsNeedUpdate = true;
}


// =================================
// render slice view
var renderOrtho = function() {
    rendererOrtho.clear();
    rendererOrtho.clearDepth();
    rendererOrtho.render( sceneOrtho, cameraOrtho );
}