/**
 * fragment shader for raycasting
 */

uniform sampler2D backfaceTexture;
uniform sampler2D volumeTexture;

uniform float sampleDistance;

varying vec3 worldSpaceCoords; //world space position of fragment (frontface)
varying vec4 projectedCoords; // screen space position of fragment

// tex is a texture with each slice of the cube placed in grid in a texture.
// texCoord is a 3d texture coord
// size is the size if the cube in pixels.
// slicesPerRow is how many slices there are across the texture
// numRows is the number of rows of slices

vec2 computeSliceOffset(float slice, float slicesPerRow, vec2 sliceSize) {
  return sliceSize * vec2(mod(slice, slicesPerRow),
                          floor(slice / slicesPerRow));
}

vec4 sampleAs3DTexture(
    sampler2D tex, vec3 texCoord, float size, float numRows, float slicesPerRow) {

  float slice   = (texCoord.z) * size; // [e.g., 35.7]
  float sliceZ  = floor(slice);                         // slice we need [e.g., 35]
  float zOffset = fract(slice);                         // dist between slices [e.g., 0.7]

  vec2 sliceSize = vec2(1.0 / slicesPerRow,             // u space of 1 slice
                        1.0 / numRows);                 // v space of 1 slice [e.g., vec2(1/16, 1/8) ]

  vec2 slice0Offset = computeSliceOffset(sliceZ, slicesPerRow, sliceSize); // [e.g., slicesize * (3,2)] - index between 0 an 1
  slice0Offset.y = 1.0 - slice0Offset.y;
  vec2 slice1Offset = computeSliceOffset(sliceZ + 1.0, slicesPerRow, sliceSize);
  slice1Offset.y = 1.0 - slice1Offset.y;


  vec2 slicePixelSize = sliceSize / size;               // space of 1 pixel [e.g. (1/16) / 128
  vec2 sliceInnerSize = slicePixelSize * (size - 1.0);  // space of size pixels

  vec2 uv = vec2(0.0);
  uv.x = slicePixelSize.x + texCoord.x * sliceInnerSize.x;
  uv.y = ( slicePixelSize.y ) + (1.0-texCoord.y) * sliceInnerSize.y;


  vec4 slice0Color = texture2D(tex, slice0Offset + uv);
  vec4 slice1Color = texture2D(tex, slice1Offset + uv);
  return mix(slice0Color, slice1Color, zOffset);
  return slice0Color;
}

vec4 applyTransferFunction(vec4 val){

    //todo
    if ( val.r > 0.4 ) {
        return vec4(val.r);
    } else {
        return vec4(0.0);
    }
}


void main() {

    // test - draw pink
    //gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0); // rgba

    vec3 startPos = worldSpaceCoords;

    //Transform the coordinates from clip space [-1;1] to [0;1]
    vec2 texCoord = vec2( ( ( projectedCoords.x / projectedCoords.w ) + 1.0 ) / 2.0,
                           ( ( projectedCoords.y / projectedCoords.w ) + 1.0 ) / 2.0 );

    vec3 endPos = texture2D(backfaceTexture, texCoord).rgb;

    vec3 rayDir = endPos - startPos;
    float rayLength = length(rayDir);

    vec3 stepVec = normalize(rayDir) * sampleDistance;
    float stepLength = length(stepVec);

    vec3 curPos = startPos;
    vec4 curSampleVal = vec4(0.0);
    vec4 curSampleCol = vec4(0.0);

    vec4 accumulatedColor = vec4(0.0);
    float accumulatedLength = 0.0;


    for ( int i = 0; i < 9999; i++ ) {

        // sample texture
        curSampleVal = sampleAs3DTexture( volumeTexture, curPos, 128.0, 8.0, 16.0 );

        // apply transfer function
        curSampleCol = applyTransferFunction(curSampleVal);

        //Perform the composition.
        accumulatedColor.rgb += (1.0 - accumulatedColor.a) * curSampleCol.rgb * curSampleCol.a;

        //Store the alpha accumulated so far.
        accumulatedColor.a += curSampleCol.a;

        // update position and length along ray
        curPos += stepVec;
        accumulatedLength += stepLength;


        if ( accumulatedColor.w > 0.95 || accumulatedLength >= rayLength) {
            break;
        }

    }

    gl_FragColor.xyz = accumulatedColor.xyz;
    gl_FragColor.w = accumulatedColor.w;

}


