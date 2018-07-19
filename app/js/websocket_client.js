function WebSocketTest() {
    var test = 5;
    console.log("Length of an int is ", test.length)
    if ("WebSocket" in window) {
        alert("WebSocket is supported by your Browser!");

        // Let us open a web socket
        var ws = new WebSocket("ws://localhost:10112/echo");

        ws.onopen = function() {

            // Web Socket is connected, send data using send()
            var HVR_Message = {
                MessageId: HVRMessageId.HVR_INIT_REQUEST,
                numArgs: 2,
                options: [" ", "dll", "--app_petascale"],
            };

            ws.send(JSON.stringify(HVR_Message));
            alert("Message is sent...");
        };

        ws.onmessage = function (evt) {
            var received_msg = evt.data;
            alert("Message is received...");
        };

        ws.onclose = function() {

            // websocket is closed.
            alert("Connection is closed...");
        };
    } else {

        // The browser doesn't support WebSocket
        alert("WebSocket NOT supported by your Browser!");
    }
}


const HVRMessageId = {

    INVALID: 0,
    EXIT: 1,

    HVR_SERVER_LAUNCHED: 2,
    CLOSE_VOLUME: 3,
    HVR_FILE_LIST: 4,
    HVR_LAUNCH_SERVER: 5,
    HVR_INIT_REQUEST: 6,
    HVR_INIT_PARALLEL: 7,
    HVR_VOLUME_LIST_REQUEST: 8,
    HVR_LOAD_FILE: 9,
    HVR_LOAD_DATA: 10,

    HVR_VIEWSETTINGS: 11,
    HVR_CAMERA: 12,
    HVR_OBJECTSETTINGS: 13,
    HVR_TF: 14,
    HVR_KEY: 15,
    HVR_FRAME_UPDATE: 16,

    HVR_IMAGE: 17,

    HVR_THIN_CLIENT: 18,
    HVR_INIT_DATA: 19,
    HVR_META_DATA: 20,
    HVR_CLUSTER_SETTINGS: 21,
    HVR_OCCLUSION_INFO: 22,

    HVR_RENDERED_TILES: 23,
    HVR_COMPOSITED_TILES: 24,

    HVR_FRAME_RENDERING_COMPLETE: 25,
    HVR_FRAME_COMPOSITING_COMPLETE: 26,

    HVR_STATE: 27,
    HVR_NB_INIT: 28,
    HVR_VASTIDS: 29,
    HVR_VASTIDS_COMPARISON: 30
};