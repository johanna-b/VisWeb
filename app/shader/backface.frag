/**
 * fragment shader that renders position as color
 */

varying vec3 worldSpaceCoords; //world space position of fragment (backface)

void main() {

    // test - draw pink
    //gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0); // rgba

    gl_FragColor = vec4(
        worldSpaceCoords.x,
        worldSpaceCoords.y,
        worldSpaceCoords.z,
        1.0 );
}