/**
 *
 * multiply vertex with model-view and projection matrix
 */

varying vec3 worldSpaceCoords; // worldspace coords for vetex
varying vec4 projectedCoords; // 2D screen coordinates for vertex

// =================================
//
void main() {

    // save world space position of vertex
    worldSpaceCoords = position + vec3( 0.5, 0.5, 0.5 ); //move it from [-0.5;0.5] to [0,1]

    // 2D screen coordinates
    projectedCoords = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); // now in clip space -1 to 1

    // simple pass through
    gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4( position, 1.0 );
}