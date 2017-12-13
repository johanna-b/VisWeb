/**
 * author: johanna
 * created on: 12/12/17
 */

var rotateStartPoint = new THREE.Vector3( 0, 0, 1 );
var rotateEndPoint = new THREE.Vector3( 0, 0, 1 );
var deltaX = 0;
var deltaY = 0;

var rotationSpeed = 2;

// =================================
//
function onMouseDown( e ) {

    event.preventDefault();
    vis_container.addEventListener( 'mousemove', onMouseMove, false );
    vis_container.addEventListener( 'mouseup', onMouseUp, false );
    vis_container.addEventListener( 'mouseout', onMouseOut, false );

    previousMousePosition = {
        x: e.offsetX,
        y: e.offsetY
    };

    rotateStartPoint = rotateEndPoint = projectOnTrackball( 0, 0 );
    console.log( rotateStartPoint );
    console.log( camera.rotation );
}


// =================================
//
function onMouseMove( e ) {

    deltaX = e.offsetX - previousMousePosition.x;
    deltaY = e.offsetY - previousMousePosition.y;

    //handleRotation( boxMeshFirstPass );
    //handleRotation( boxMeshSecondPass );
    //handleRotation( boxWireframe );
    handleRotation( pivot );

    previousMousePosition = {
        x: e.offsetX,
        y: e.offsetY
    };
}


// =================================
//
var handleRotation = function ( mesh ) {

    rotateEndPoint = projectOnTrackball( deltaX, deltaY );

    var rotateQuaternion = rotateMatrix( rotateStartPoint, rotateEndPoint );
    var curQuaternion = mesh.quaternion;
    curQuaternion.multiplyQuaternions( rotateQuaternion, curQuaternion );
    curQuaternion.normalize();
    mesh.setRotationFromQuaternion( curQuaternion );

    rotateEndPoint = rotateStartPoint;

    renderVolume();
};


// =================================
// remove mouse move listener
function onMouseUp( event ) {
    vis_container.removeEventListener( 'mousemove', onMouseMove, false );
    vis_container.removeEventListener( 'mouseup', onMouseUp, false );
    vis_container.removeEventListener( 'mouseout', onMouseOut, false );
}


// =================================
// remove mouse move listener
function onMouseOut( event ) {
    vis_container.removeEventListener( 'mousemove', onMouseMove, false );
    vis_container.removeEventListener( 'mouseup', onMouseUp, false );
    vis_container.removeEventListener( 'mouseout', onMouseOut, false );
}


// =================================
//
function projectOnTrackball( touchX, touchY ) {

    var windowHalfX = render_vars.vis_width / 2;
    var windowHalfY = render_vars.vis_height / 2;

    var mouseOnBall = new THREE.Vector3();

    mouseOnBall.set(
        clamp( touchX / windowHalfX, -1, 1 ),
        clamp( -touchY / windowHalfY, -1, 1 ),
        0.0
    );

    var length = mouseOnBall.length();

    if ( length > 1.0 ) {
        mouseOnBall.normalize();
    } else {
        mouseOnBall.z = Math.sqrt( 1.0 - length * length );
    }

    return mouseOnBall;
}


// =================================
//
function rotateMatrix( rotateStart, rotateEnd ) {
    var axis = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();

    var angle = Math.acos( rotateStart.dot( rotateEnd ) / rotateStart.length() / rotateEnd.length() );

    if ( angle ) {
        axis.crossVectors( rotateStart, rotateEnd ).normalize();
        angle *= rotationSpeed;
        quaternion.setFromAxisAngle( axis, angle );
    }
    return quaternion;
}


// =================================
//
function clamp( value, min, max ) {
    return Math.min( Math.max( value, min ), max );
}





