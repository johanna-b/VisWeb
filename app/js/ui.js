/**
 * author: johanna
 * created: 12/5/17
 */

var gui;
var ui_container;

var slice_slider;

var stats;

var tf_panel;

var initUI = function () {

    window.addEventListener( "resize", onWindowResize );

    // main UI =========================

    gui = new dat.GUI( {autoPlace: false, width: 200, height: 600} );
    ui_container = document.getElementById( 'div_ui_menu' );

    ui_container.appendChild( gui.domElement );

    // FPS UI =========================

    stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    stats.domElement.style.position = 'relative';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '30px';

    ui_container.appendChild( stats.domElement );

    // Volume Renderer folder =========================

    var folder_VR = gui.addFolder( 'Volume Renderer' );

    // dataset combobox
    var dataset_combo = folder_VR.add( uiParams, 'dataset', {none: -1, hydrogen: 0, bunny: 1, sprite: 2, MRI: 3, lowresCT: 4, highresCT: 5, MRIinterp: 6} );

    dataset_combo.onChange( function ( value ) {
        loadDataset( value );
    } );

    // sample distance slider
    var sample_dist_slider = folder_VR.add( uiParams, "sample_distance" ).min( 0.1 ).max( 2.0 ).step( 0.1 );

    sample_dist_slider.onFinishChange( function ( value ) {
        updateSampleDistance();
    } );

    var tf_combo = folder_VR.add( uiParams, 'transfer_function', {ramp1: 0, ramp2: 1, colors: 2, custom: 3} );

    tf_combo.onChange( function ( value ) {
        updateTFTexture( value );
        renderVolume();
    } );

    // shading checkbox
    folder_VR.add( uiParams, "shading" );

    // background color
    var background_color_chooser = folder_VR.addColor( uiParams, 'background_color' );

    background_color_chooser.onChange( function ( value ) {
        updateBackgroundColor();
    } );

    // show front faces checkbox
    var frontfaces_checkbox = gui.add( uiParams, 'show_frontfaces' );
    frontfaces_checkbox.onChange( function ( value ) {
        showFirstPass = !showFirstPass;
        renderVolume();
    } );

    // move light
    var movelight_checkbox = gui.add( uiParams, 'move_light' );

    movelight_checkbox.onChange( function ( value ) {

        controls.enabled = !uiParams.move_light;
        if ( uiParams.move_light ) {
            resetCamera();
        }

        renderVolume();
    } );

    folder_VR.open();

    // Slice Viewer ===============================

    var folder_Slicer = gui.addFolder( 'Slice View' );

    // slice id slider
    slice_slider = folder_Slicer.add( uiParams, "slice_id" ).min( 0 ).max( 64 ).step( 1 );

    slice_slider.onChange( function ( value ) {
        updateSlice( value );
    } );

    //folder_Slicer.open();

    // General UI ===============================

    gui.add( btn_refresh, 'refresh' );

    var options = {
        //container: document.getElementById( 'div_vis3D' ),
        panel: {
            isCollapsible: true
        },
        colors: ['#cc7832', '#f7d911', '#c40a10'],
        location: {
            x: 0.1,
            y: 0.8
        }
    };

    console.log(document.getElementById( 'div_vis3D' ));
    tf_panel = new TF_panel( options );
    tf_panel.registerCallback(function(){
        updateTFTexture(uiParams.transfer_function);
        renderVolume();
    } );

}
