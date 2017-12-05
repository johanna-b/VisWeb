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
var cube;
var controls;

// =================================
// methods
// =================================

// =================================
//
var initVis3D = function() {

    var vis_container = document.getElementById('div_vis3D');
    //console.log( '3d view: ', vis_container.offsetWidth, vis_container.offsetHeight);

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

    //renderer.render( scene, camera );
    onWindowResize();
}


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

    console.log( 'resized: ', render_vars.vis_width, render_vars.vis_height);


    renderVolume();

}

// =================================
//
function animateVolume() {
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
    renderer.clear();
    renderer.clearDepth();
    renderer.render( scene, camera );
}