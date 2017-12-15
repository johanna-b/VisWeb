/**
 * fragment shader for raycasting
 */

uniform sampler2D backfaceTexture;  // back face positions in worldspace (from first pass)
uniform sampler2D volumeTexture;    // texture holding volume data
uniform sampler2D transferFunctionTexture; // color scale along x, ydim: 1

uniform float sampleDistance;       // distance when sampling along ray
uniform vec3 volumeInfo;            // x/y dim, numSlicesPerRow, numRows

uniform vec3 cameraPos;
uniform vec3 lightPos;

varying vec3 worldSpaceCoords;      // world space position of fragment (frontface)
varying vec4 projectedCoords;       // screen space position of fragment in clip space -1..1


// =================================
// compute tex coord for slice (origin of slice)
vec2 computeSlicePositionInTexCoords( float sliceIdx, float slicesPerRow, vec2 sliceSizeInTexCoords ) {

    // offset (i.e., index) of slice in large flat 2D texture
    float sliceOffsetX = mod( sliceIdx, slicesPerRow );
    float sliceOffsetY = floor( sliceIdx / slicesPerRow );

    // convert to tex coords
    return sliceSizeInTexCoords * vec2( sliceOffsetX, sliceOffsetY );
}


// =================================
// sample large flat 2D texture containing individual slices as a 3D volume
vec4 sampleAs3DTexture( sampler2D tex, vec3 textCoord, float size, float slicesPerRow, float numRows ) {
    // tex is a 2D texture containing slices of the original 3D volume
    // texCoord is sample position within volume [0..1]
    // size is x/y dim of volume in voxels (assumed x and y dim is the same)
    // numRows is number of rows in 2D texture
    // slicesPerRow is number of slices in one row in 2D texture

    vec3 tCoord = textCoord;

    float sliceIdxZFloat = tCoord.z * (size - 1.0);   // slice position [e.g., 35.7]
    float sliceIdxZ  = floor( sliceIdxZFloat ); // lower slice position [e.g., 35]
    float zOffset = fract( sliceIdxZFloat );    // actual sample position between lower and upper slice [e.g., 0.7]

    vec2 sliceSizeInTexCoords = vec2( (1.0 / slicesPerRow), (1.0 / numRows) );  // x/y size of slice in texture space [e.g., vec2(1/16, 1/8) ]

    // compute tex coords for lower and upper z slice
    vec2 slice0OffsetInTexCoords = computeSlicePositionInTexCoords( sliceIdxZ, slicesPerRow, sliceSizeInTexCoords ); // [e.g., slicesize * (3,2)] - index between 0 an 1
    vec2 slice1OffsetInTexCoords = computeSlicePositionInTexCoords( sliceIdxZ + 1.0, slicesPerRow, sliceSizeInTexCoords );

    slice0OffsetInTexCoords.y = 1.0 - (sliceSizeInTexCoords.y + slice0OffsetInTexCoords.y); // invert y offset, to adjust to data storage format
    slice1OffsetInTexCoords.y = 1.0 - (sliceSizeInTexCoords.y + slice1OffsetInTexCoords.y);

    // compute tex coord offset within a z slice
    vec2 offsetWithinSliceInTexCoords = vec2(0.0);
    offsetWithinSliceInTexCoords.x = tCoord.x * sliceSizeInTexCoords.x;
    offsetWithinSliceInTexCoords.y = (1.0 - tCoord.y) * sliceSizeInTexCoords.y;

    // sample texture
    vec4 slice0Color = texture2D(tex, slice0OffsetInTexCoords + offsetWithinSliceInTexCoords);
    vec4 slice1Color = texture2D(tex, slice1OffsetInTexCoords + offsetWithinSliceInTexCoords);
    // interpolate along z
    return mix(slice0Color, slice1Color, zOffset);
}


// =================================
//
vec4 applyTransferFunction(float val){

    vec4 color = texture2D( transferFunctionTexture, vec2( val, 0.5 ) );
    return color;
}


// =================================
// Compute the Normal around the current voxel
vec3 getNormal(vec3 pos, float cellSize){
    float xdelta = (sampleAs3DTexture( volumeTexture, pos - vec3(cellSize, 0.0, 0.0), volumeInfo.x, volumeInfo.y, volumeInfo.z)).w -
                    (sampleAs3DTexture( volumeTexture, pos + vec3(cellSize, 0.0, 0.0), volumeInfo.x, volumeInfo.y, volumeInfo.z)).w;
    float ydelta = (sampleAs3DTexture( volumeTexture, pos - vec3(0.0, cellSize, 0.0), volumeInfo.x, volumeInfo.y, volumeInfo.z)).w -
                    (sampleAs3DTexture( volumeTexture, pos + vec3(0.0, cellSize, 0.0), volumeInfo.x, volumeInfo.y, volumeInfo.z)).w;
    float zdelta = (sampleAs3DTexture( volumeTexture, pos - vec3(0.0, 0.0, cellSize), volumeInfo.x, volumeInfo.y, volumeInfo.z)).w -
                    (sampleAs3DTexture( volumeTexture, pos + vec3(0.0, 0.0, cellSize), volumeInfo.x, volumeInfo.y, volumeInfo.z)).w;

    vec3 n = vec3( xdelta, ydelta, zdelta );
    //texture3D(volumeTexture, pos - vec3(cellSize, 0.0, 0.0)).w - texture3D(VolumeData, pos + vec3(cellSize, 0.0, 0.0)).w,

    return normalize(n);
 }


// =================================
//
vec4 applyShading(vec4 val){
    //todo
    return vec4(0.0);
}


// =================================
//
void main() {

    vec3 startPos = worldSpaceCoords; // start position of ray

    // transform the 2D screen coordinate from clip space [-1;1] to [0;1]
    vec2 screenCoord = vec2( ( ( projectedCoords.x / projectedCoords.w ) + 1.0 ) / 2.0,
                             ( ( projectedCoords.y / projectedCoords.w ) + 1.0 ) / 2.0 );

    vec3 endPos = texture2D( backfaceTexture, screenCoord ).rgb; // end position of ray

    vec3 rayDir = endPos - startPos; // ray from front to back face
    float rayLength = length( rayDir );

    vec3 stepVec = normalize( rayDir ) * sampleDistance; // one step along the ray
    float stepLength = length( stepVec );

    vec3 curPos = startPos;
    vec4 curSampleVal = vec4( 0.0 ); // current samples density value
    vec4 curSampleCol = vec4( 0.0 ); // current sample with applied transfer function

    vec4 accumulatedColor = vec4(0.0); // accumulated color/opacity along the ray (front to back)
    float accumulatedLength = 0.0;

    // sample along the ray
    for ( int i = 0; i < 9999; i++ ) {

        // sample texture
        curSampleVal = sampleAs3DTexture( volumeTexture, curPos, volumeInfo.x, volumeInfo.y, volumeInfo.z );

        // apply transfer function
        curSampleCol = applyTransferFunction( curSampleVal.r );

        // perform the accumulation of color and opacity (riemann sum of volume rendering integral)
        accumulatedColor.rgb += (1.0 - accumulatedColor.a) * curSampleCol.rgb * curSampleCol.a;
        accumulatedColor.a += curSampleCol.a;

        // update sample position and length along ray
        curPos += stepVec;
        accumulatedLength += stepLength;

        // early ray termination if opacity is reached or ray has left volume
        if ( accumulatedColor.w > 0.95 || accumulatedLength >= rayLength) {
            break;
        }
        if ( curPos.z < 0.0 || curPos.z > 1.0 ) {
            break;
        }
    }

    // write out accumulated color/opacity
    gl_FragColor.xyz = accumulatedColor.xyz;
    gl_FragColor.w = accumulatedColor.w;

}


