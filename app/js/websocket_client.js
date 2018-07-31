function WebSocketTest() {
    if ("WebSocket" in window) {
        alert("WebSocket is supported by your Browser!");

        // Let us open a web socket
        var ws = new WebSocket("ws://localhost:10112/echo");

        ws.onopen = function() {

            ws.send(JSON.stringify(sendInitRequest(["dll", "--app_petascale"])));
            alert("Init message sent...");

            ws.send(JSON.stringify(sendLoadVolRequest([0, 1])));
            alert("Load Volume Message Sent...")

            ws.send(JSON.stringify(sendTFfunction(1, [
                new HVRTransferFunctionNode([0.0,0.0,0.0,0.0],0.0),
                new HVRTransferFunctionNode([1.0,0.0,0.0,1.0],1.0),
                new HVRTransferFunctionNode([1.0,0.0,0.0,0.0],1.0)
            ])));
            alert("Change TF request sent...")
            ws.send(JSON.stringify(sendTFfunction(1, [
                new HVRTransferFunctionNode([0.0,0.0,0.0,0.0],0.0),
                new HVRTransferFunctionNode([0.0,1.0,0.0,1.0],1.0),
                new HVRTransferFunctionNode([0.0,1.0,0.0,0.0],1.0)
            ])));
            alert("Change TF request sent...")
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

class HVRTransferFunctionNode {
    constructor(color, position){
        this.color = color;
        this.position = position;
    }
};

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

var sendTFfunction = function(objId, nodes){
    let numNodes = nodes.length;
    let HVR_Message = {
        MessageId: HVRMessageId.HVR_TF,
        objId: objId,
        numNodes: numNodes,
        tf: nodes
    }
    return HVR_Message;
};

var sendInitRequest = function(options){
    let HVR_Message;
    if(options == null){
        HVR_Message = {
            MessageId: HVRMessageId.HVR_INIT_REQUEST,
            numArgs: 0,
            options: []
        };
    }
    else {
        console.log(options.length)
        HVR_Message = {
            MessageId: HVRMessageId.HVR_INIT_REQUEST,
            numArgs: options.length,
            options: options
        }
    }
    return HVR_Message;
};

var sendLoadVolRequest = function(vols){
    let HVR_Message = {
        MessageId: HVRMessageId.HVR_LOAD_DATA,
        numVols: vols.length,
        vols: vols
    }
    return HVR_Message;
};

