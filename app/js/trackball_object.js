/**
 * author: johanna
 * created on: 12/12/17
 * Trackball interaction on given object (e.g., for rotating the volume, not the camera)
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
    visContainer.addEventListener( 'mousemove', onMouseMove, false );
    visContainer.addEventListener( 'mouseup', onMouseUp, false );
    visContainer.addEventListener( 'mouseout', onMouseOut, false );

    previousMousePosition = {
        x: e.offsetX,
        y: e.offsetY
    };

    rotateStartPoint = rotateEndPoint = projectOnTrackball( 0, 0 );
    //console.log( rotateStartPoint );
    //console.log( camera.rotation );
}


// =================================
//
function onMouseMove( e ) {

    deltaX = e.offsetX - previousMousePosition.x;
    deltaY = e.offsetY - previousMousePosition.y;

    //handleRotation( boxMeshFirstPass );
    //handleRotation( boxMeshSecondPass );
    //handleRotation( boxWireframe );
    handleRotation( lightPivot );

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

    updateLightPos();
    renderVolume();
};


// =================================
// remove mouse move listener
function onMouseUp( event ) {
    visContainer.removeEventListener( 'mousemove', onMouseMove, false );
    visContainer.removeEventListener( 'mouseup', onMouseUp, false );
    visContainer.removeEventListener( 'mouseout', onMouseOut, false );
}


// =================================
// remove mouse move listener
function onMouseOut( event ) {
    // visContainer.removeEventListener( 'mousemove', onMouseMove, false );
    // visContainer.removeEventListener( 'mouseup', onMouseUp, false );
    // visContainer.removeEventListener( 'mouseout', onMouseOut, false );
}


// =================================
//
function projectOnTrackball( touchX, touchY ) {

    var windowHalfX = renderVars.visWidth / 2;
    var windowHalfY = renderVars.visHeight / 2;

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





