const electron = require('electron');
const ImageDataURL = require('image-data-uri');
const fs = require('fs');
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/OrbitControls.js';
import {OBJLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/loaders/OBJLoader.js';
const archiver = require('archiver');

const mpHands = window;
const drawingUtils = window;
const controls = window;
const controls3d = window;

// 3D hand mesh demonstration setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,256/200,0.0001,1000);
const renderer = new THREE.WebGLRenderer();
const Loader = new OBJLoader();
// Scene setup
renderer.setClearColor('#999999')
renderer.setSize(256,200);
document.getElementById('webgl').append(renderer.domElement);
var cnts = new OrbitControls(camera,renderer.domElement);
cnts.enableDamping = true;
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.2 );
const light = new THREE.HemisphereLight( 0xffffff, 0x080820, 1 );
const light2 = new THREE.PointLight( 0xffffff, 0.2, 0 );
light.position.set( 0, -2, -2 );
scene.add( light );
scene.add( light2 );
scene.add( directionalLight );
camera.position.z = 1;
function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene,camera);
    cnts.update();
}
animate();


// Our input frames will come from here.
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const controlsElement = document.getElementsByClassName('control-panel')[0];
const canvasCtx = canvasElement.getContext('2d');
const buttonPose = document.getElementsByName('submitPose')[0];
const buttonMove = document.getElementsByName('submitMove')[0];
const buttonRedo = document.getElementsByName('submitRedo')[0];
const completelist= document.getElementById("thelist");
const btnclear = document.getElementsByName('ClearAll')[0];
const btnsave = document.getElementsByName('Save')[0];

// Load Mediapipe hand core utils and data
const config = { locateFile: (file) => {
        return `mphcore/${file}`;
    } };
// We'll add this to our control panel later, but we'll save it here so we can
// call tick() each time the graph runs.
const fpsControl = new controls.FPS();
// Optimization: Turn off animated spinner after its hiding animation is done.
const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
    spinner.style.display = 'none';
};
const landmarkContainer = document.getElementsByClassName('landmark-grid-container')[0];
const grid = new controls3d.LandmarkGrid(landmarkContainer, {
    connectionColor: 0xCCCCCC,
    definedColors: [{ name: 'Left', value: 0xffa500 }, { name: 'Right', value: 0x00ffff }],
    range: 0.2,
    fitToGrid: false,
    labelSuffix: 'm',
    landmarkSize: 2,
    numCellsPerAxis: 4,
    showHidden: false,
    centered: false,
});

// Latest hand pose time stamp
var LatestPose;
// Indicator for whether deleting mesh is needed
var poseexist = false;
// Landmark recording flag
var landmark = false;
// Movement recording flag
var moveR = false;
// Pose ID
var poseId = -1;
// Pose lists
var poseList = [];
// Normalized Pose lists
var norposeList = [];
// Mesh Loading time delay
var timeout = 3000;
// Left or right or Both hand mesh display indicator
var displayLR;
// Pose recording function
buttonPose.onclick = function() {setTimeout(function(){
      poseId +=1;
      let image_data = canvasElement.toDataURL('image/jpeg');
      var today = new Date();
      var date=today.getFullYear() + "-" + (today.getMonth()+1)+"-"+today.getDate()+"-"+today.getHours()+"-"+today.getMinutes()+"-"+today.getSeconds();
      var fn = date+"_pose.jpg";
      LatestPose = date
      ImageDataURL.outputFile(image_data,"img/"+fn);
      if (timeout==3000){
        setTimeout(displayHandpose, timeout);
        timeout = timeout/2;
      } else {
        setTimeout(displayHandpose, timeout);
      }
      landmark = true;
      buttonMove.disabled = false;
      buttonRedo.disabled = false;
      btnclear.disabled = false;
      btnsave.disabled = false;
}, 3000)};

// Movement recording counter
var counter;
// Movement reocrd
var movementR = [];
buttonMove.onclick = function() {setTimeout(function() {
    console.log("Movement recording start!");
    moveR = true;
    counter = 100;
    buttonMove.disabled = false;
    buttonRedo.disabled = false;
    btnclear.disabled = false;
    btnsave.disabled = false;
}, 1000)};
// Redo activation
buttonRedo.onclick = function() {
    console.log("Latest recording is removed!");
    let popped = poseList.pop();
    norposeList.pop();
    let listLength = completelist.children.length;
    completelist.removeChild(completelist.children[listLength-1]);
    if (popped.type=="pose"){
        poseId = poseId -1;
        for (let k=poseList.length-1; k>=0; k--){
            if (poseList[k].type=='pose'){
                displayHandposeredo(poseList[k]);
                break;
            }
        }
    }
    if (poseList.length==0){
        buttonRedo.disabled = true;
        // buttonMove.disabled = true;
        btnclear.disabled = true;
        btnsave.disabled = true;
        var exobj = scene.getObjectByName("hand_pose");
        scene.remove( exobj );
    }
}

// Hand mesh rendering function
function displayHandpose(){
    if (poseexist){
        const exobj = scene.getObjectByName("hand_pose");
        scene.remove( exobj );
    }
    console.log('handPoseMesh/'+LatestPose + "_pose.jpg_output"+ displayLR+ ".obj");
    Loader.load(
        // resource URL
        'handPoseMesh/'+LatestPose +"_pose.jpg_output"+ displayLR+ ".obj",
        // called when resource is loaded
        function ( object ) {
            object.name = "hand_pose";
            scene.add( object );
        },
        // called when loading is in progresses
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        function ( error ) {
            console.log( 'An error happened' );
        }
    );
    poseexist = true;
}

// Hand mesh rendering function
function displayHandposeredo(obj){
    const exobj = scene.getObjectByName("hand_pose");
    scene.remove( exobj );
    console.log(obj.dir);
    Loader.load(
        // resource URL
        obj.dir,
        // called when resource is loaded
        function ( object ) {
            object.name = "hand_pose";
            scene.add( object );
        },
        // called when loading is in progresses
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        function ( error ) {
            console.log( 'An error happened' );
        }
    );
    poseexist = true;
}

// Clear all recording
btnclear.onclick = function() {
    console.log("Clear all saved");
    // Reset all variables
    poseId = -1;
    poseList = [];
    norposeList = [];
    // Reset record list
    let listLength = completelist.children.length;
    for (let l =listLength-1;l>=0;l--){
        completelist.removeChild(completelist.children[l]);
    }
    buttonRedo.disabled = true;
    // buttonMove.disabled = true;
    btnclear.disabled = true;
    btnsave.disabled = true;
    const exobj = scene.getObjectByName("hand_pose");
    scene.remove( exobj );
}

// Save design
btnsave.onclick = function() {
    console.log("Save the design");
    // Generate json file for the designs
    //write JSON string to a file
    const data = JSON.stringify(poseList);
    const datanor = JSON.stringify(norposeList);
    fs.writeFile('DesignJson/HandPoseDesign.json', data, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });
    fs.writeFile('DesignJson/HandPoseDesignNormalized.json', datanor, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved (Normalized).");
    });
    var output = fs.createWriteStream('target.zip');
    var archive = archiver('zip');
    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });
    archive.on('error', function(err){
        throw err;
    });
    archive.pipe(output);
    for (let j = 0;j<poseList.length;j++){
        if (poseList[j].type=="pose"){
            archive.file("img/"+poseList[j].date+"_pose.jpg");
            archive.file(poseList[j].dir);
        }
    }
    // append files from a sub-directory and naming it `new-subdir` within the archive
    archive.file("DesignJson/HandPoseDesign.json");
    archive.file("DesignJson/HandPoseDesignNormalized.json");
    archive.finalize();
}

function onResults(results) {
    // Hide the spinner.
    document.body.classList.add('loaded');
    // Update the frame rate.
    fpsControl.tick();
    // Draw the overlays.
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    // Which hand is found in the frame
    var leftfound = false;
    var rightfound = false;

    if (results.multiHandLandmarks && results.multiHandedness) {
        
        for (let index = 0; index < results.multiHandLandmarks.length; index++) {
            const classification = results.multiHandedness[index];
            if (landmark){
                if (classification.label=='Right'){
                rightfound = true;
                };
                if (classification.label=='Left'){
                    leftfound = true;
                };
            
                if (classification.label=='Right'){
                    rightfound = true;
                };
                if (classification.label=='Left'){
                    leftfound = true;
                };
                if (rightfound & leftfound){
                    displayLR = "";
                }
                if (rightfound & !leftfound){
                    displayLR = "R";
                }
                if (!rightfound & leftfound){
                    displayLR = "L";
                }
            }
            // Draw overlay on the video feedback.....
            if (moveR){
                const isRightHand = classification.label === 'Right';
                const landmarks = results.multiHandLandmarks[index];
                movementR.push(landmarks);
                drawingUtils.drawConnectors(canvasCtx, landmarks, mpHands.HAND_CONNECTIONS, { color: isRightHand ? '#00FF00' : '#FF0000' });
                drawingUtils.drawLandmarks(canvasCtx, landmarks, {
                color: isRightHand ? '#00FF00' : '#FF0000',
                fillColor: isRightHand ? '#FF0000' : '#00FF00',
                radius: (data) => {
                    return drawingUtils.lerp(data.from.z, -0.15, .1, 10, 1);
                }   
            });
            counter = counter - 1;
            if (counter ==0){
                moveR = false;
                counter = 100;
                // Start distance between mid knuckle and wrist
                let start_idt = movementR[0][8];
                let end_idt = movementR[99][8];
                let start_idtk = movementR[0][5];
                let end_idtk = movementR[99][5];
                let start_wrst = movementR[0][0];
                let end_wrst = movementR[99][0];
                let starV = [start_idtk.x-start_wrst.x,start_idtk.y-start_wrst.y];
                let endV = [end_idtk.x-end_wrst.x,end_idtk.y-end_wrst.y];
                let cosinsim = cosinesim(starV,endV);
                if (cosinsim>0.9){
                    let fraccz = start_wrst.z/end_wrst.z;
                let fraccx = start_wrst.x/end_wrst.x;
                let fraccy = start_wrst.y/end_wrst.y;
                // Find the dominance movements
                let zratio = fraccz>1 ? fraccz: 1/fraccz; 
                let xratio = fraccx>1 ? fraccx: 1/fraccx;
                let yratio = fraccy>1 ? fraccy: 1/fraccy;
                let arr = [zratio,xratio,yratio];
                let i = arr.indexOf(Math.max(...arr));
                // Indicate direction
                var label;
                if (i==0){
                    label = fraccz<1 ? "MoveForward"
                              : "MoveBackward";
                }
                if (i==1){
                    label = fraccx>1 ? "MoveLeft"
                              : "MoveRight";
                }
                if (i==2){
                    label = fraccy<1 ? "MoveDown"
                              : "MoveUp";
                }
                } else {
                    label = start_idt.x>end_idt.x? "VerticalAntiClockwise"
                                    : "VerticalClockwise";
                }
                
                console.log(label);
                let movementL = {
                    "Label": label,
                    "id": poseId,
                    "type": "Move"
                };
                poseList.push(movementL);
                norposeList.push(movementL)
                poseDisplay(movementL);
                console.log(poseList);
                console.log(norposeList);
                movementR = [];
            };
            }
        }
    }

    var newCommand;
    function poseDisplay(record){
        if (record.type=="pose"){
            console.log("Pose Displayed in list");
            const li = document.createElement("li");
            li.classList.add('lep');
            li.appendChild(document.createTextNode("Pose "+ record.id));
            completelist.appendChild(li);
        } else {
            console.log("Move Displayed in list");
            const li = document.createElement("li");
            li.classList.add('lem');
            li.appendChild(document.createTextNode(record.Label));
            completelist.appendChild(li);
        }
    }

    // Cosine similarity calculation
    function cosinesim(A,B){
        var dotproduct=0;
        var mA=0;
        var mB=0;
        for(i = 0; i < A.length; i++){ // here you missed the i++
            dotproduct += (A[i] * B[i]);
            mA += (A[i]*A[i]);
            mB += (B[i]*B[i]);
        }
        mA = Math.sqrt(mA);
        mB = Math.sqrt(mB);
        var similarity = (dotproduct)/((mA)*(mB)) // here you needed extra brackets
        return similarity;
    }

    canvasCtx.restore();
    if (results.multiHandWorldLandmarks) {
        // We only get to call updateLandmarks once, so we need to cook the data to
        // fit. The landmarks just merge, but the connections need to be offset.
        const landmarks = results.multiHandWorldLandmarks.reduce((prev, current) => [...prev, ...current], []);
        const colors = [];
        let connections = [];
        for (let loop = 0; loop < results.multiHandWorldLandmarks.length; ++loop) {
            const offset = loop * mpHands.HAND_CONNECTIONS.length;
            const offsetConnections = mpHands.HAND_CONNECTIONS.map((connection) => [connection[0] + offset, connection[1] + offset]);
            connections = connections.concat(offsetConnections);
            const classification = results.multiHandedness[loop];
            colors.push({
                list: offsetConnections.map((unused, i) => i + offset),
                color: classification.label,
            });
        }
        var lm = grid.updateLandmarks(landmarks, connections, colors);
        // Save the landmark of joints
        if (landmark){
            // console.log(lm)
            // Landmark: Right hand (0-20) & Left hand (21-41)            
            var left = [];
            var right = [];
            for (var i = 0; i < 21; i++) {
                left.push([lm[i].x,-lm[i].y,lm[i].z])
            }
            if (lm.length==42){
                for (var i = 21; i < 42; i++) {
                    right.push([lm[i].x,-lm[i].y,lm[i].z])
                }
            }
            if (displayLR=='R'){
                right = left;
                left = [];
            }
            var handlandmark = {
                "left": left,
                "right": right,
                "id": poseId,
                "dir": 'handPoseMesh/'+LatestPose +"_pose.jpg_output"+ displayLR+ ".obj",
                "date": LatestPose,
                "type": "pose"
            }; 
            // Normalized handlandmakr
            var hleft = [];
            var hright = [];

            for (let i =1;i<6;i++){
                var knuckle = 4*(i-1)+1;
                hleft.push([lm[knuckle].x-lm[0].x,-lm[knuckle].y+lm[0].y,lm[knuckle].z-lm[0].z]);
                for (let j = knuckle;j<knuckle+3;j++){
                    hleft.push([lm[j+1].x-lm[j].x,-lm[j+1].y+lm[j].y,lm[j+1].z-lm[j].z]);
                }
            }
            
            if (lm.length==42){
                for (let i =1;i<6;i++){
                    var knuckle = 4*(i-1)+1+21;
                    hright.push([lm[knuckle].x-lm[21].x,-lm[knuckle].y+lm[21].y,lm[knuckle].z-lm[21].z]);
                    for (let j = knuckle;j<knuckle+3;j++){
                        hright.push([lm[j+1].x-lm[j].x,-lm[j+1].y+lm[j].y,lm[j+1].z-lm[j].z]);
                    }
                }
            }
            if (displayLR=='R'){
                hright = hleft;
                hleft = [];
            }
            var norhlm = {
                "left": hleft,
                "right": hright,
                "id": poseId,
                "dir": 'handPoseMesh/'+LatestPose +"_pose.jpg_output"+ displayLR+ ".obj",
                "date": LatestPose,
                "type": "pose"
            }; 
            poseList.push(handlandmark);
            norposeList.push(norhlm);
            poseDisplay(handlandmark);
            console.log(poseList);
            console.log(norposeList);
            landmark = false;
        }
    }
    else {
        grid.updateLandmarks([]);
    }
}

const hands = new mpHands.Hands(config);
hands.onResults(onResults);
// Present a control panel through which the user can manipulate the solution
// options.
new controls
    .ControlPanel(controlsElement, {
    selfieMode: true,
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
})
    .add([
    //new controls.StaticText({ title: 'MediaPipe Hands' }),
    fpsControl,
    //new controls.Toggle({ title: 'Selfie Mode', field: 'selfieMode' }),
    new controls.SourcePicker({
        onFrame: async (input, size) => {
            const aspect = size.height / size.width;
            let width, height;
            if (window.innerWidth > window.innerHeight) {
                height = window.innerHeight;
                width = height / aspect;
            }
            else {
                width = window.innerWidth;
                height = width * aspect;
            }
            canvasElement.width = width;
            canvasElement.height = height;
            await hands.send({ image: input });
        },
    }),

])
    .on(x => {
    const options = x;
    videoElement.classList.toggle('selfie', options.selfieMode);
    hands.setOptions(options);
});