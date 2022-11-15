var socket;
var receivingAddress='192.168.178.23'
var sendingAddress='192.168.178.21'
var measureFps=false;

function receiveOsc(address, value) {
    console.log("Received: ", address, value);
    if(address=='/fps'){
        if(value == true || value == 1){
            measureFps = true;
        }
        if(value == false || value == 0){
            measureFps = false;
        }
    }
}

function sendOsc(address, value) {
    socket.emit('message', [address].concat(value));
}

function setupOsc(oscPortIn, oscPortOut) {
    socket = io.connect('http://127.0.0.1:8081', { port: 8081, rememberTransport: false });
    socket.on('connect', function () {
        socket.emit('config', {
            server: { port: oscPortIn, host: receivingAddress },
            client: { port: oscPortOut, host: sendingAddress }
        });
    });
    socket.on('message', function (msg) {
        if (msg[0] == '#bundle') {
            for (var i = 2; i < msg.length; i++) {
                receiveOsc(msg[i][0], msg[i].splice(1));
            }
        } else {
            receiveOsc(msg[0], msg.splice(1));
        }
    });
}

function sendKeypoints(kps) {
    let arr = [];
    kps.forEach(kp => {
        arr.push(kp["x"]);
        arr.push(kp["y"]);
        arr.push(kp["z"]);
        arr.push(kp["visibility"]);
    });
    sendOsc("/skeleton", arr);
}