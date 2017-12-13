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
var pivot;

var vis_container;

var previousMousePosition;



// =================================
// methods
// =================================

var resetCamera = function ( ) {
    controls.reset();
};

// =================================
//
var initVis3D = function () {

    vis_container = document.getElementById( 'div_vis3D' );

    // create basic scene / renderer / camera
    scene = new THREE.Scene();

    camera = new THREE.OrthographicCamera(-3, 3, 3, -3 , -20, 20);
    //camera = new THREE.PerspectiveCamera( 45, render_vars.vis_width / render_vars.vis_height, 0.1, 1000 );
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( render_vars.vis_width, render_vars.vis_height );
    var col = new THREE.Color(
        uiParams.background_color[ 0 ] / 255,
        uiParams.background_color[ 1 ] / 255,
        uiParams.background_color[ 2 ] / 255 );
    renderer.setClearColor( col );

    // add renderer to HTML
    while ( vis_container.hasChildNodes() ) {
        vis_container.removeChild( vis_container.lastChild );
    }
    vis_container.appendChild( renderer.domElement );

    // create offscreen scene and texture
    offscreenBufferScene = new THREE.Scene();

    offscreenBufferTexture = new THREE.WebGLRenderTarget(
        render_vars.vis_width, render_vars.vis_height,
        {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter} );

    // ==================
    // populate scene


    // bounding box geometry (for raycasting)
    boxGeometry = new THREE.BoxGeometry( 1, 1, 1 );
    var boxMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff, wireframe: false} );
    boxMeshFirstPass = new THREE.Mesh( boxGeometry, boxMaterial );
    boxMeshSecondPass = new THREE.Mesh( boxGeometry, boxMaterial );

    // bounding box, light

    // bounding box wireframe (for rendering bounding box)
    var edgesGeo = new THREE.EdgesGeometry( boxGeometry ); // or WireframeGeometry( geometry )
    var lineMat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
    boxWireframe = new THREE.LineSegments( edgesGeo, lineMat );
    scene.add( boxWireframe );

    // light
    pivot = new THREE.Object3D();
    var sphereGeom = new THREE.SphereGeometry( 0.1, 32, 16 );
    pointLight = new THREE.PointLight( 0xffffff, 1, 20, 2);
    pointLight.add( new THREE.Mesh( sphereGeom, new THREE.MeshBasicMaterial( { color: 0xffff00 } ) ) );
    pointLight.position.set( 1, 1, 1 );
    //scene.add( pointLight );
    pivot.add(pointLight);
    scene.add(pivot);



    offscreenBufferScene.add( boxMeshFirstPass );

    scene.add( boxMeshSecondPass );

    // checkerboard
    // ground
        // create checkerboard image
        var imageCanvas = document.createElement( "canvas" );
        var context = imageCanvas.getContext( "2d" );

        imageCanvas.width = imageCanvas.height = 128;

        context.fillStyle = "#CCC";
        context.fillRect( 0, 0, 128, 128 );

        context.fillStyle = "#fff";
        context.fillRect(0, 0, 64, 64);
        context.fillRect(64, 64, 64, 64);

        // create texture
        var textureCanvas = new THREE.Texture( imageCanvas,
            THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping );
        var materialCanvas = new THREE.MeshBasicMaterial( { map: textureCanvas } );

        textureCanvas.needsUpdate = true;
        textureCanvas.repeat.set( 10000, 10000 );

        // geometry
        var geometry = new THREE.PlaneGeometry( 100, 100 );

        var meshCanvas = new THREE.Mesh( geometry, materialCanvas );
        meshCanvas.scale.set( 100, 100, 100 );
        meshCanvas.position.set(0, 0, -1);

        scene.add(meshCanvas);


    // fog
    var fog_near = 1;
    var fog_far = 20;
    scene.fog = new THREE.Fog( 0x000000, fog_near, fog_far );
    //scene.fog = new THREE.FogExp2( 0x000000, 0.075 );


    // TrackballControls OrbitControls
    controls = new THREE.TrackballControls( camera, renderer.domElement );
    controls.addEventListener( 'change', function () {
        renderVolume();
    } );

    // loads shaders and renders the scene when done
    loadShaderAndRender();

    vis_container.addEventListener( 'mousedown', onMouseDown, false );
}


// =================================
//
var resize3DView = function ( width, height ) {

    console.log( 'new size 3d view: ', width, height );

    // if size wasn't changed, return
    if ( width == render_vars.vis_width && height == render_vars.vis_height ) {
        return;
    }

    var w = render_vars.vis_width;
    var h = render_vars.vis_height;
    // update internal width
    if ( width > 0 && width <= render_vars.vis_max_width ) {
        w = width;
    }
    if ( height > 0 && height <= render_vars.vis_max_height ) {
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

    renderer.setSize( render_vars.vis_width, render_vars.vis_height );

    offscreenBufferTexture.setSize( render_vars.vis_width, render_vars.vis_height );

    console.log( 'resized: ', render_vars.vis_width, render_vars.vis_height );

    renderVolume();

}


// =================================
//
var animateVolume = function () {
    requestAnimationFrame( animate );
    //controls.update();
    renderVolume();
    //renderer.render( scene, camera );
    //cube.rotation.x += 0.1;
    //cube.rotation.y += 0.1;
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

    var uniformsRaycast = {
        backfaceTexture: {type: 't', value: offscreenBufferTexture.texture},
        volumeTexture: {type: 't', value: volumeTex},
        transferFunctionTexture: {type: 't', value: tfTex},
        sampleDistance: {value: sampleDist},
        volumeInfo: {type: "v3", value: volInfo}
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

