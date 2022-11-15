setupOsc(12345, 54321);

const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

function scaleSize(tx=-1,ty=-1,os){
    if(tx==-1 && ty!=-1){
        os.x = ty/os.y*os.x;
        os.y = ty;
    }
    if(tx!=-1 && ty==-1){
        os.y = tx/os.x*os.y;
        os.x = tx;
    }
    if(tx!=-1 && ty!=-1){
        os.x=tx;
        os.y=ty;
    }
    console.log(os);
}

var prevTime=0;
var imgSize={x:1280,y:720};
scaleSize(1080, -1, imgSize);

canvasCtx.rotate(Math.PI*-0.5);
canvasCtx.translate(-1280,0);
function onResults(results) {
    if (!results.poseLandmarks) {
        return;
    }
    sendKeypoints(results.poseLandmarks);
    canvasCtx.save();
    canvasCtx.setTransform(1, 0, 0, 1, 0, 0); // reset global(within the canvas) transformation matrix
        // rotate the mask
    canvasCtx.rotate(Math.PI*-0.5);
    canvasCtx.translate(-imgSize.x,0);
        // draw the mask
    canvasCtx.clearRect(0, 0, innerWidth, innerHeight);
    canvasCtx.drawImage(results.segmentationMask, 0, 0, imgSize.x, imgSize.y);

        // paint it black
    canvasCtx.globalCompositeOperation = 'source-in';
    canvasCtx.fillStyle = '#000000';
    canvasCtx.fillRect(0, 0, innerWidth, innerHeight);
    canvasCtx.restore();

    canvasCtx.save();
    canvasCtx.setTransform(1, 0, 0, 1, 0, 0); // reset global(within the canvas) transformation matrix
        // rotate the mask
    canvasCtx.rotate(Math.PI*-0.5);
    canvasCtx.translate(-imgSize.x,0);
        // translate to right(bottom?)
    canvasCtx.translate(0, imgSize.y);
        // draw the source 
    canvasCtx.drawImage(results.image, 0, 0, imgSize.x, imgSize.y);
    canvasCtx.restore();

    let currentTime = performance.now();
    if(measureFps==true) sendOsc('/fps', 1.0/(currentTime-prevTime)*1000.0);
    prevTime = currentTime;
}

const pose = new Pose({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    }
});
pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: false,
    enableSegmentation: true,
    smoothSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.7
});
pose.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await pose.send({ image: videoElement });
    },
    width: 1280,
    height: 720
});
camera.start();
videoElement.hidden = true;

setInterval(() => {
    if(canvasElement.width != innerWidth | canvasElement.height != innerHeight){
        canvasElement.width = innerWidth;
        canvasElement.height = innerHeight;
    }
    
    document.getElementsByClassName('monitor')[0].textContent = innerWidth.toString() + ", " + innerHeight.toString();
}, 1000);