/**
 * author: johanna
 * created: 12/5/17
 */

var gui;
var ui_container;

var slice_slider;

var initUI = function() {

    window.addEventListener("resize", onWindowResize);

    // main UI =========================

    gui = new dat.GUI({ autoPlace: false, width: 200, height:600 });
    ui_container = document.getElementById('div_ui_menu');
    ui_container.appendChild(gui.domElement);

    // Volume Renderer folder =========================

    var folder_VR = gui.addFolder('Volume Renderer');

    // dataset combobox
    var dataset_combo = folder_VR.add(ui_params, 'dataset', {none: -1, hydrogen: 0, bunny:1, sprite:2});

    dataset_combo.onChange(function (value) {
        loadDataset(value);
    });

    // sample distance slider
    var sample_dist_slider = folder_VR.add(ui_params, "sample_distance").min(1).max(50).step(1);

    sample_dist_slider.onChange(function (value) {
        console.log('sample dist fire');
    });

    sample_dist_slider.onFinishChange(function (value) {
        alert("The new value is " + value);
    });

    // shading checkbox
    folder_VR.add(ui_params, "shading");

    // background color
    folder_VR.addColor(ui_params, 'background_color');

    folder_VR.open();

    // Slice Viewer ===============================

    var folder_Slicer = gui.addFolder('Slice View');

    // slice id slider
    slice_slider = folder_Slicer.add(ui_params, "slice_id").min(0).max(64).step(1);

    slice_slider.onChange(function (value) {
        updateSlice(value);
    });

    folder_Slicer.open();

    // General UI ===============================

    gui.add(btn_obj,'magic');

}
