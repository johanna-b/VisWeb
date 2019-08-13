var boxFragShaderSeg = 
` #version 300 es
  precision highp float;
  uniform highp sampler3D volume;
  uniform highp sampler2D colormap;
  uniform bool use_colormap;
  uniform ivec2 comp;
  uniform vec3 colors[25];
  uniform bool use_seg;
  uniform highp sampler3D segmentation;
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
  	if (use_colormap) {
  		color = vec4(texture(colormap, vec2(val, 0.5)).rgb, val);
      if (invert) {
        color = vec4(1.0,1.0,1.0, 1.0);
      }
  	}
    else if (use_seg) {
      int seg = int(255.0 * texture(segmentation, samp).r);
      for (int k = 0; k <= seg && k < 25; ++k)
        if (seg == k)
            color = vec4(colors[k], 1.0);
      if (invert) {
        color = vec4(1.0,1.0,1.0, 1.0);
      }
    }
    else {
      color = vec4(1.0,1.0,1.0,val);
      if (invert) {
        color = vec4(1.0,1.0,1.0, 1.0 - val);
      }
    }
}`