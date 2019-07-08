  var boxFragShaderInt = 
` #version 300 es
  precision highp float;
  uniform highp usampler3D volume;
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
  	float val = float(texture(volume, samp).r) / 65536.0;
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