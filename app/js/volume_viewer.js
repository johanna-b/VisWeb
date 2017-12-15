/**
 * author: johanna
 * created: 12/5/17
 */

// =================================
// variables
// =================================

var renderVars = {
    visWidth: 500,
    visHeight: 500,
    visMaxWidth: 1000,
    visMaxHeight: 1000

}

var scene;
var camera;
var renderer;
var controls;

var offscreenBufferScene;
var offscreenBufferTexture;

var boxGeometry;
var boxMeshFirstPass;
var boxMeshSecondPass;
var boxWireframe;

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

var pointLight;
var lightPivot;

var visContainer;

var previousMousePosition;


// =================================
// methods
// =================================

var resetCamera = function () {
    controls.reset();
};

// =================================
//
var initVis3D = function () {

    visContainer = document.getElementById( 'div_vis3D' );

    // ==================
    // create basic scene / renderer / camera

    scene = new THREE.Scene();

    //camera = new THREE.OrthographicCamera(-3, 3, 3, -3 , -20, 20);
    camera = new THREE.PerspectiveCamera( 45, renderVars.visWidth / renderVars.visHeight, 0.1, 1000 );
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( renderVars.visWidth, renderVars.visHeight );
    var col = new THREE.Color(
        uiParams.background_color[ 0 ] / 255,
        uiParams.background_color[ 1 ] / 255,
        uiParams.background_color[ 2 ] / 255 );
    renderer.setClearColor( col );

    // create offscreen scene and texture
    offscreenBufferScene = new THREE.Scene();

    offscreenBufferTexture = new THREE.WebGLRenderTarget(
        renderVars.visWidth, renderVars.visHeight,
        {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter} );

    // ==================
    // create scene elements

    // bounding box geometry (for raycasting)
    boxGeometry = new THREE.BoxGeometry( 1, 1, 1 );
    var boxMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff, wireframe: false} );
    boxMeshFirstPass = new THREE.Mesh( boxGeometry, boxMaterial );
    boxMeshSecondPass = new THREE.Mesh( boxGeometry, boxMaterial );

    // create bounding box, light

    // bounding box wireframe (for rendering bounding box)
    var edgesGeo = new THREE.EdgesGeometry( boxGeometry ); // or WireframeGeometry( geometry )
    var lineMat = new THREE.LineBasicMaterial( {color: 0xffffff, linewidth: 2} );
    boxWireframe = new THREE.LineSegments( edgesGeo, lineMat );

    // light
    lightPivot = new THREE.Object3D();
    var sphereGeom = new THREE.SphereGeometry( 0.1, 32, 16 );
    pointLight = new THREE.PointLight( 0xffffff, 1, 20, 2 );
    pointLight.add( new THREE.Mesh( sphereGeom, new THREE.MeshBasicMaterial( {color: 0xffff00} ) ) );
    pointLight.position.set( 1, 1, 1 );
    //scene.add( pointLight );
    lightPivot.add( pointLight );

    // create ground texture (checkerboard)
    var groundMesh = createGroundMesh();

    // fog
    var fog_near = 1;
    var fog_far = 20;
    scene.fog = new THREE.Fog( 0x000000, fog_near, fog_far );
    //scene.fog = new THREE.FogExp2( 0x000000, 0.075 );

    // ==================
    // add scene elements

    offscreenBufferScene.add( boxMeshFirstPass );

    scene.add( boxMeshSecondPass );
    scene.add( boxWireframe );
    scene.add( lightPivot );
    scene.add( groundMesh );

    // ==================
    // add renderer to HTML

    while ( visContainer.hasChildNodes() ) {
        visContainer.removeChild( visContainer.lastChild );
    }
    visContainer.appendChild( renderer.domElement );

    // ==================
    // Mouse controls

    controls = new THREE.TrackballControls( camera, renderer.domElement );
    controls.addEventListener( 'change', function () {

        updateLightPos();
        renderVolume();

    } );

    // loads shaders and renders the scene when done
    loadShaderAndRender();

    visContainer.addEventListener( 'mousedown', onMouseDown, false );
}


// =================================
// create checkerboard texture, us for ground
var createGroundMesh = function () {

    // create checkerboard image
    var imageCanvas = document.createElement( "canvas" );
    var context = imageCanvas.getContext( "2d" );

    imageCanvas.width = imageCanvas.height = 128;

    context.fillStyle = "#CCC";
    context.fillRect( 0, 0, 128, 128 );

    context.fillStyle = "#fff";
    context.fillRect( 0, 0, 64, 64 );
    context.fillRect( 64, 64, 64, 64 );

    // create texture
    var textureCanvas = new THREE.Texture( imageCanvas,
        THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping );
    var materialCanvas = new THREE.MeshBasicMaterial( {map: textureCanvas} );

    textureCanvas.needsUpdate = true;
    textureCanvas.repeat.set( 10000, 10000 );

    // geometry
    var geometry = new THREE.PlaneGeometry( 100, 100 );

    var meshCanvas = new THREE.Mesh( geometry, materialCanvas );
    meshCanvas.scale.set( 100, 100, 100 );
    meshCanvas.position.set( 0, 0, -1 );

    return meshCanvas;
}


// =================================
//
var resize3DView = function ( width, height ) {

    // if size wasn't changed, return
    if ( width == renderVars.visWidth && height == renderVars.visHeight ) {
        return;
    }

    var w = renderVars.visWidth;
    var h = renderVars.visHeight;
    // update internal width
    if ( width > 0 && width <= renderVars.visMaxWidth ) {
        w = width;
    }
    if ( height > 0 && height <= renderVars.visMaxHeight ) {
        h = height;
    }

    /*
     if ( w < h ) {
     renderVars.visWidth = w;
     renderVars.visHeight = w;
     } else {
     renderVars.visWidth = h;
     renderVars.visHeight = h;
     }
     */

    renderVars.visWidth = w;
    renderVars.visHeight = w;

    camera.aspect = renderVars.visWidth / renderVars.visHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( renderVars.visWidth, renderVars.visHeight );

    offscreenBufferTexture.setSize( renderVars.visWidth, renderVars.visHeight );

    console.log( 'resized 3D view: ', renderVars.visWidth, renderVars.visHeight );

    renderVolume();

}


// =================================
//
var animateVolume = function () {
    requestAnimationFrame( animate );
    renderVolume();
}


// =================================
//
var renderVolume = function () {

    stats.begin();

    renderer.clear();
    renderer.clearDepth();

    if ( showFirstPass ) {
        renderer.render( offscreenBufferScene, camera );
    } else {
        // Render onto our off-screen texture
        renderer.render( offscreenBufferScene, camera, offscreenBufferTexture );

        renderer.render( scene, camera );
    }

    stats.end();
}


// =================================
//
var updateLightPos = function () {

    // get light position in world coords
    var lightPos = new THREE.Vector3();
    pointLight.getWorldPosition( lightPos );

    console.log( "camera pos:", camera.position );
    console.log( "light pos:", lightPos );

    // update renderer
    shaderMaterialSecondPass.uniforms.lightPos.value = lightPos;
    shaderMaterialSecondPass.uniforms.cameraPos.value = camera.position;
}


// =================================
//
var loadShaderAndRender = function () {
    ShaderLoader( vertPathBackFace, fragPathBackFace, onFirstPassShaderLoad, onLoadProgress, onLoadError );
}


// =================================
//
var ShaderLoader = function ( vertex_url, fragment_url, onLoad, onProgress, onError ) {

    var vertex_loader = new THREE.FileLoader( THREE.DefaultLoadingManager );
    vertex_loader.setResponseType( 'text' );
    vertex_loader.load( vertex_url, function ( vertex_text ) {
        var fragment_loader = new THREE.FileLoader( THREE.DefaultLoadingManager );
        fragment_loader.setResponseType( 'text' );
        fragment_loader.load( fragment_url, function ( fragment_text ) {
            onLoad( vertex_text, fragment_text );
        } );
    }, onProgress, onError );
}


// =================================
//
var onFirstPassShaderLoad = function ( vertex_text, fragment_text ) {

    vertTextBackFace = vertex_text;
    fragTextBackFace = fragment_text;

    shaderMaterialFirstPass =
        new THREE.ShaderMaterial( {
            vertexShader: vertTextBackFace,
            fragmentShader: fragTextBackFace,
            side: THREE.BackSide
        } );

    boxMeshFirstPass.material = shaderMaterialFirstPass;

    // load second pass shader
    ShaderLoader( vertPathRaycast, fragPathRaycast, onSecondPassShaderLoad, onLoadProgress, onLoadError );
}


// =================================
//
var onSecondPassShaderLoad = function ( vertex_text, fragment_text ) {

    vertTextRaycast = vertex_text;
    fragTextRaycast = fragment_text;

    x = datasets[ datasetId ].x;
    y = datasets[ datasetId ].y;
    z = datasets[ datasetId ].z;

    var sampleDist = uiParams.sample_distance / (Math.max( x, y, z ));

    var volInfo = new THREE.Vector3(
        datasets[ datasetId ].x, // volume dim x/y in voxel
        datasets[ datasetId ].slicesx, // num slices per row
        datasets[ datasetId ].slicesy // num rows
    );

    console.log( "camera pos:", camera.position );
    console.log( "light pos:", pointLight.position );

    var uniformsRaycast = {
        backfaceTexture: {type: 't', value: offscreenBufferTexture.texture},
        volumeTexture: {type: 't', value: volumeTex},
        transferFunctionTexture: {type: 't', value: tfTex},
        sampleDistance: {value: sampleDist},
        volumeInfo: {type: "v3", value: volInfo},
        cameraPos: {type: "v3", value: camera.position},
        lightPos: {type: "v3", value: pointLight.position}
    };

    shaderMaterialSecondPass =
        new THREE.ShaderMaterial( {
            uniforms: uniformsRaycast,
            vertexShader: vertTextRaycast,
            fragmentShader: fragTextRaycast,
            side: THREE.FrontSide,
            //blending: THREE.NormalBlending,
            //depthTest: false,
            transparent: true
        } );

    boxMeshSecondPass.material = shaderMaterialSecondPass;

    onWindowResize();
}


// =================================
//
var updateSampleDistance = function ( val ) {

    var sampleDist = uiParams.sample_distance / (Math.max( x, y, z ));
    shaderMaterialSecondPass.uniforms.sampleDistance.value = sampleDist;
    renderVolume();

}


// =================================
//
var updateBackgroundColor = function () {

    var col = new THREE.Color(
        uiParams.background_color[ 0 ] / 255,
        uiParams.background_color[ 1 ] / 255,
        uiParams.background_color[ 2 ] / 255 );

    renderer.setClearColor( col );

    renderVolume();
}


// =================================
//
var onLoadProgress = function ( xhr ) {

}


// =================================
//
var onLoadError = function ( xhr ) {
    console.log( 'loading error' );
}


// =================================
//

