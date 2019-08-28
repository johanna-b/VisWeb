# VolRen: A lightweight web-based volumetric data explorer


# How to use

To load a dataset simply follow the prompts provided. The main file and its dimensions and datatype are required. Adding a segmentation mask is optional. If one is included it should be in 8 bit format and the same dimensions as the volume. All of the files should be `.raw` files. Click the visualize button to launch the data explorer. You should see the volume rendered in the center, a panel with slice view on the upper left and a panel with controls on the upper right. In the controls there are options for controling the slices, transfer function and clipping planes. If a segmentation mask was included, there will be an additional section of the controls that allow you to select which segmentation ID's to render as well as which to selectively clip. You can find 3 demo videos on this repository as well as some sample data and a copy hosted on GitHub pages [here].(https://johanna-b.github.io/VisWeb/index.html)

# Code Overview

`index.html` - the html code for the main page of VelRen

`/colormaps` - a folder containing the default transfer function options. They are `.png` 1px by 180px with alpha channel set to 1.

`/fonts` - a folder with fonts for all of the icons used

`/css/component.css` - the main css file for VolRen

`/css/normalize.css` - standard normalizer so different browsers behave the same way

`/css/popper.css` - style for the info tooltip

`/css/nano.min.css` - style for the color picking tool

`/shaders` - a folder with the source code for all of the shaders. Those with box in the name for for the slices view and those with vol are for the volume renderer. Those with seg in the main are used when a segmentation mask is included. Those with int in the name are used when the datatype is 16 bit.

`/js/dat.gui.js` - the library for the control panel

`js/file.js` - the code for the file loading functionality and interface

`/js/FileSaver.js` - a library for file saving used for the screen shot feature

`/js/gl-matrix-min.js` - a library for linear algebra in JavaScript

`/js/helpers.js` - a collection of helper and utility functions

`/js/main.js` - the main script of VolRen

`/js/overlay.js` - the code for the transfer function editor overlay

`/js/pickr.min.js` - the library for the color picking tool

`/js/popper.min.js` - one of the libraries for the info tooltip

`/js/seedrandom.min.js` - a library to make `Math.random` have a settable seed

`/js/slices.js` - the code for the slice viewer

`/js/tooltip.min.js` - the other library for the info tooltip

`/js/two.min.js` - the graphics library used in the transfer function editor

`/js/volume-raycaster.js` - the code for the volume renderer

`/js/webgl-util.js` - a library of utility functions for WebGL

# Support

This is still a prototype however it should work smoothly on modern versions of Firefox and Chrome. For questions and support contact znicolaiscanio@college.harvard.edu
