/**
 * author: johanna
 * created: 12/5/17
 */

// =================================
// variables
// =================================

var render_vars = {
    vis_width: 500,
    vis_height: 500,
    vis_max_width: 1000,
    vis_max_height: 1000

}

var scene;
var camera;
var renderer;
var cubeFirstPass;
var cubeSecondPass
var controls;

var bufferscene;
var bufferTexture;

//var vertShaderBoundingBox;
//var fragShaderBackFace;
var shaderMaterialFirstPass;
var shaderMaterialSecondPass;

var vertPathBackFace = "app/shader/backface.vert"
var fragPathBackFace = "app/shader/backface.frag"
var vertPathRaycast = "app/shader/raycast.vert"
var fragPathRaycast = "app/shader/raycast.frag"

var vertTextBackFace = "";
var fragTextBackFace = "";
var vertTextRaycast = "";
var fragTextRaycast = "";

var showFirstPass = false;

// =================================
// methods
// =================================

// =================================
//
var initVis3D = function() {

    var vis_container = document.getElementById('div_vis3D');
    //console.log( '3d view: ', vis_container.offsetWidth, vis_container.offsetHeight);

    // create basic scene / renderer / camera
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, render_vars.vis_width / render_vars.vis_height, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(render_vars.vis_width, render_vars.vis_height); //window.innerWidth, window.innerHeight);
    renderer.setClearColor( 0xa0a0a0 );

    // add renderer to HTML
    while (vis_container.hasChildNodes()) {
        vis_container.removeChild(vis_container.lastChild);
    }
    vis_container.appendChild(renderer.domElement);

    // create offscreen scene and texture
    bufferScene = new THREE.Scene();

    bufferTexture = new THREE.WebGLRenderTarget(
        render_vars.vis_width, render_vars.vis_height,
        { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});

    // load shaders
    ShaderLoader(vertPathBackFace, fragPathBackFace, onFirstPassShaderLoad, onLoadProgress, onLoadError);
    ShaderLoader(vertPathRaycast, fragPathRaycast, onSecondPassShaderLoad, onLoadProgress, onLoadError);

    // populate scene
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe:false});
    cubeFirstPass = new THREE.Mesh(geometry, material);
    cubeSecondPass = new THREE.Mesh(geometry, material);
/*
    ///And a blue plane behind it
    var blueMaterial = new THREE.MeshBasicMaterial({color:0x7074FF})
    var plane = new THREE.PlaneBufferGeometry( render_vars.vis_width, render_vars.vis_height );
    var planeObject = new THREE.Mesh(plane,blueMaterial);
    planeObject.position.z = -15;

    var boxMaterial = new THREE.MeshBasicMaterial({map:bufferTexture.texture});
    var boxGeometry2 = new THREE.BoxGeometry( 1, 1, 1 );
    var mainBoxObject = new THREE.Mesh(boxGeometry2,boxMaterial);
    mainBoxObject.position.z = -10;
    */

    bufferScene.add(cubeFirstPass);
    //bufferScene.add(planeObject);
    //scene.add(mainBoxObject);

    scene.add(cubeSecondPass);


    // TrackballControls OrbitControls
    controls = new THREE.TrackballControls( camera, renderer.domElement );
    controls.addEventListener( 'change', function() {
        renderVolume();
    } );

    //renderer.render( scene, camera );
    onWindowResize();
}



// =================================
//
var resize3DView = function(width, height) {

    console.log( 'new size 3d view: ', width, height);

    // if size wasn't changed, return
    if (width == render_vars.vis_width && height == render_vars.vis_height ){
        return;
    }

    var w = render_vars.vis_width;
    var h = render_vars.vis_height;
    // update internal width
    if ( width > 0 && width <= render_vars.vis_max_width) {
        w = width;
    }
    if ( height > 0 && height <= render_vars.vis_max_height) {
        h = height;
    }

    /*
    if ( w < h ) {
        render_vars.vis_width = w;
        render_vars.vis_height = w;
    } else {
        render_vars.vis_width = h;
        render_vars.vis_height = h;
    }
    */

    render_vars.vis_width = w;
    render_vars.vis_height = w;

    camera.aspect = render_vars.vis_width / render_vars.vis_height;
    camera.updateProjectionMatrix();

    renderer.setSize(render_vars.vis_width, render_vars.vis_height);

    bufferTexture.setSize(render_vars.vis_width, render_vars.vis_height);

    console.log( 'resized: ', render_vars.vis_width, render_vars.vis_height);


    renderVolume();

}


// =================================
//
var animateVolume = function() {
    requestAnimationFrame( animate );
    //controls.update();
    renderVolume();
    //renderer.render( scene, camera );
    //cube.rotation.x += 0.1;
    //cube.rotation.y += 0.1;
}


// =================================
//
var renderVolume = function() {
    console.log('render');

    renderer.clear();
    renderer.clearDepth();

    if ( showFirstPass ) {
        renderer.render( bufferScene, camera );
    } else {
        // Render onto our off-screen texture
        renderer.render(bufferScene, camera, bufferTexture);

        renderer.render(scene, camera);
    }
}


// =================================
//
var ShaderLoader = function(vertex_url, fragment_url, onLoad, onProgress, onError) {

    var vertex_loader = new THREE.FileLoader(THREE.DefaultLoadingManager);
    vertex_loader.setResponseType('text');
    vertex_loader.load(vertex_url, function (vertex_text) {
        var fragment_loader = new THREE.FileLoader(THREE.DefaultLoadingManager);
        fragment_loader.setResponseType('text');
        fragment_loader.load(fragment_url, function (fragment_text) {
            onLoad(vertex_text, fragment_text);
        });
    }, onProgress, onError);
}


var onFirstPassShaderLoad = function(vertex_text, fragment_text){

    vertTextBackFace = vertex_text;
    fragTextBackFace = fragment_text;

    shaderMaterialFirstPass =
        new THREE.ShaderMaterial({
            vertexShader:   vertTextBackFace,
            fragmentShader: fragTextBackFace,
            side: THREE.BackSide
        });

    cubeFirstPass.material = shaderMaterialFirstPass;
}


var onSecondPassShaderLoad = function(vertex_text, fragment_text){

    vertTextRaycast = vertex_text;
    fragTextRaycast = fragment_text;

    x = datasets[datasetId].x;
    y = datasets[datasetId].y;
    z = datasets[datasetId].z;

    var sampleDist = uiParams.sample_distance / (Math.max(x, y, z));

    var uniformsRaycast = {
        backfaceTexture: { type: 't', value: bufferTexture.texture },
        sampleDistance: { value: sampleDist },
        volumeTexture: { type: 't', value: volumeTex }
    };

    shaderMaterialSecondPass =
        new THREE.ShaderMaterial({
            uniforms: uniformsRaycast,
            vertexShader:   vertTextRaycast,
            fragmentShader: fragTextRaycast,
            side: THREE.FrontSide
        });

    cubeSecondPass.material = shaderMaterialSecondPass;

}

var updateSampleDistance = function(val){

    var sampleDist = uiParams.sample_distance / (Math.max(x, y, z));
    shaderMaterialSecondPass.uniforms.sampleDistance.value = sampleDist;
    renderVolume();

}


var onLoadProgress = function(xhr){

}

var onLoadError = function(xhr){
    console.log('loading error');
}




