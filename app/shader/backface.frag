/**
 * fragment shader that renders position as color
 */

varying vec3 worldSpaceCoords; //world space position of fragment (backface)

// =================================
//
void main() {

    gl_FragColor = vec4(
        worldSpaceCoords.x,
        worldSpaceCoords.y,
        worldSpaceCoords.z,
        1.0 );
}