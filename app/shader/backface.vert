/**
 *
 * multiply vertex with model-view and projection matrix
 */

varying vec3 worldSpaceCoords; //defined for vertex position, will be interpolated for fragments in fragment shade

// =================================
//
void main() {

    // save world space position of vertex
    worldSpaceCoords = position + vec3( 0.5, 0.5, 0.5 ); //move it from [-0.5;0.5] to [0,1]

    // simple pass through
    gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4( position, 1.0 );
}