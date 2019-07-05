var boxVertShader =
` #version 300 es
  layout(location=0) in vec3 pos;
  out vec3 samp;

  uniform vec3 slices;
  uniform mat4 scaletrans;
  uniform int axis;
  uniform vec3 volume_scale;

  void main() {
    gl_Position = scaletrans * vec4(pos, 1);
    if (axis == 1) {
    	samp.yz = pos.xy * volume_scale.yz * 0.5 + vec2(0.5);
    	samp.x = slices.x;
    }
    if (axis == 2) {
    	samp.xz = pos.xy * volume_scale.xz * 0.5 + vec2(0.5);
    	samp.y = slices.y;
    }
    if (axis == 3) {
    	samp.xy = pos.xy * volume_scale.xy * 0.5 + vec2(0.5);
    	samp.z = slices.z;
    }
  }
`

var boxFragShader = 
` #version 300 es
  precision highp float;
  uniform highp sampler3D volume;
  uniform highp sampler2D colormap;
  uniform bool use_colormap;
  uniform ivec2 comp;
  in vec3 samp;
  out vec4 color;

  void main() {
  	bool invert = false;
  	if (comp.x == int(gl_FragCoord.x) || comp.y == int(gl_FragCoord.y)) {
  		invert = true;
  	}
  	float val = texture(volume, samp).r;
  	if ((any(greaterThan(samp, vec3(1.0))) || any(lessThan(samp, vec3(0.0))))) {
  		val = 0.0;
  	}
  	color = vec4(1.0,1.0,1.0,val);
  	if (use_colormap) {
  		color = vec4(texture(colormap, vec2(val, 0.5)).rgb, val);
  	}
	if (invert && !use_colormap) {
		color = vec4(1.0,1.0,1.0, 1.0 - val);
	}
	if (invert && use_colormap) {
		color = vec4(1.0,1.0,1.0, 1.0);
	}
  }`