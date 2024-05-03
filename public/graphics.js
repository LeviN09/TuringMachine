import * as THREE from './resources/three.module.min.js';
import { DragControls } from './resources/DragControls.js';
import { FontLoader } from './resources/FontLoader.js';
import { TextGeometry } from './resources/TextGeometry.js';

const scene = new THREE.Scene();

const canvasWidth = window.innerWidth / 1.5;
const canvasHeight = window.innerHeight / 1.0;

const aspect = canvasWidth / canvasHeight;

const maxYPosition = -0.75;//(canvasHeight / 3) * 2;

const cameraWidth = 8;
const cameraHeight = cameraWidth / aspect;

const camera = new THREE.OrthographicCamera(
    cameraWidth / -2,   // Left
    cameraWidth / 2,    // Right
    cameraHeight / 2,   // Top
    cameraHeight / -2,  // Bottom
    0.1,                // Near
    1000               // Far
);

const graphGroup = new THREE.Group();
scene.add(graphGroup);

const tapeGroup = new THREE.Group();
scene.add(tapeGroup);

camera.position.set(0, 0, 8);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(canvasWidth, canvasHeight);
document.body.appendChild(renderer.domElement);

const nodes = [];
const nodeMeshes = [];
const lines = [];
const tapes = [];
const texts = [];

class Node {
    constructor(x, y, z, color, text) {
        this.geometry = new THREE.CircleGeometry(0.3, 32, 32);
        this.material = new THREE.MeshBasicMaterial({ color: color });
        this.node = new THREE.Mesh(this.geometry, this.material);
        this.node.position.set(x, y, z);
        this.text = text;
        const loader = new FontLoader();
        loader.load('./resources/Madimi One_Regular.json', (font) => {
            const textGeometry = new TextGeometry(text, {
                font: font,
                size: 0.1,
                height: 0.01
            });
            textGeometry.computeBoundingBox();
            const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
            const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
            this.textMesh = new THREE.Mesh(textGeometry, textMaterial);
            this.textMesh.position.set(-textWidth / 2, -textHeight / 2, 0.1);
            this.textMesh.material.pointerEvents = false;

            this.node.add(this.textMesh);
        });

        graphGroup.add(this.node);
        nodes.push(this);
        nodeMeshes.push(this.node);
    }
}

const diff = new THREE.Vector3(0, 0, 0.5);
class Line {
    constructor(startNode, endNode, text) {
        this.startNode = startNode;
        this.endNode = endNode;
        const direction = endNode.node.position.clone().sub(startNode.node.position);
        this.geometry = new THREE.ArrowHelper(direction.normalize(), new THREE.Vector3().subVectors(startNode.node.position, diff), direction.length() - 0.3, 0x0f0f0f, 0.1, 0.1);

        this.text = text;
        const loader = new FontLoader();
        loader.load('./resources/Madimi One_Regular.json', (font) => {
            const textGeometry = new TextGeometry(text, {
                font: font,
                size: 0.1,
                height: 0.01
            });
            textGeometry.computeBoundingBox();
            const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
            const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
            this.textMesh = new THREE.Mesh(textGeometry, textMaterial);
            const to = endNode.node.position.clone();
            const from = startNode.node.position.clone();
            const textPosition = from.multiplyScalar(0.25).add(to.clone().multiplyScalar(0.75));

            this.textMesh.position.clone(textPosition);
            this.textMesh.material.pointerEvents = false;

            graphGroup.add(this.textMesh);
            texts.push(this.textMesh);
        });
        console.log("hoy");
        graphGroup.add(this.geometry);
        lines.push(this);
    }
}

function connectNodes(node1, node2, text) {
    var line = new Line(node1, node2, text);
}

function connectNodesWithNames(name1, name2, text) {
    if (name1 == name2) {
        return;
    }
    lines.forEach(line => {
        if ((line.startNode.text == name1 && line.endNode.text == name2) ||
        (line.endNode.text == name1 && line.startNode.text == name2)) {
            return;
        }
    });

    var node1;
    var node2;

    for (let i = 0; i < nodes.length; ++i) {
        if (nodes[i].text == name1) {
            node1 = nodes[i];
        }
        if (nodes[i].text == name2) {
            node2 = nodes[i];
        }
    }
    connectNodes(node1, node2, text);
}

const dragControls = new DragControls(nodeMeshes, camera, renderer.domElement);

dragControls.addEventListener('drag', function onDrag(event) {
    if (event.object.position.y < maxYPosition) {
        event.object.position.y = event.object.userData.initialY;
    }

    lines.forEach(line => {
        const direction = line.endNode.node.position.clone().sub(line.startNode.node.position);
        line.geometry.setLength(direction.length() - 0.3, 0.1, 0.1);
        line.geometry.setDirection(direction.normalize());
        line.geometry.position.copy(new THREE.Vector3().subVectors(line.startNode.node.position, diff));

        const to = line.endNode.node.position.clone();
        const from = line.startNode.node.position.clone();
        const textPosition = from.multiplyScalar(0.25).add(to.clone().multiplyScalar(0.75));
        line.textMesh.position.copy(textPosition);
    });
    event.object.userData.initialY = event.object.position.y;
});


//-----------------------------------------------------------

class TapeElement {
    constructor(text, verticalOffset, size) {
        this.text = text;
        this.geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        this.material = new THREE.MeshBasicMaterial({ color: 0x7ec5e9 });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.setY(verticalOffset);
        tapeGroup.add(this.mesh);
        
        this.loadText();

        const borderGeometry = new THREE.EdgesGeometry(this.geometry);
        const borderMaterial = new THREE.LineBasicMaterial({ color: 0x2A4494 });
        const borderMesh = new THREE.LineSegments(borderGeometry, borderMaterial);

        this.mesh.add(borderMesh);
    }

    changeText(text) {
        this.text = text;
        this.mesh.remove(this.textMesh);

        this.loadText();
    }

    loadText() {
        const fontLoader = new FontLoader();
        fontLoader.load('./resources/Madimi One_Regular.json', (font) => {
            const textGeometry = new TextGeometry(this.text, {
                font: font,
                size: 0.3,
                height: 0.01,
            });
            textGeometry.computeBoundingBox();
            const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
            const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0x111155 });
            this.textMesh = new THREE.Mesh(textGeometry, textMaterial);
            this.textMesh.position.x -= textWidth / 2;
            this.textMesh.position.y -= textHeight / 2;
            this.textMesh.position.z += 1;
            this.mesh.add(this.textMesh);
        });
    }
}

class Tape {
    constructor(position, size) {
        this.position = position;
        this.size = size;
        this.elements = [];
        this.offset = 0;
        tapes.push(this);
        
        const indicatorGeometry = new THREE.BoxGeometry(size.x * 1.2, size.y * 1.2, size.z * 1.2);
        const indicatorMaterial = new THREE.MeshBasicMaterial({ color: 0x5555bb });
        const indicatorMesh = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
        this.indicator = indicatorMesh;
        tapeGroup.add(indicatorMesh);

        indicatorMesh.position.copy(position);
    }

    initTape(text) {
        for (let i = 0; i < text.length; ++i) {
            this.addElementFront(text.charAt(i));
        }
        for (let i = 0; i < 10; ++i) {
            this.addElementBack('');
            this.addElementFront('');
        }
    }

    deleteTape() {
        this.elements.forEach(element => {
            tapeGroup.remove(element.mesh);
        });
    }

    addElementFront(text) {
        const element = new TapeElement(text, this.position.y, this.size);
        this.elements.push(element);
        this.updatePos();
    }

    addElementBack(text) {
        const element = new TapeElement(text, this.position.y, this.size);
        this.elements.splice(0, 0, element);
        this.offset += 1;
        this.updatePos();
    }

    shiftRight() {
        this.offset -= 1;
        this.updatePosWithAnimation();
    }

    shiftLeft() {
        this.offset += 1;
        this.updatePosWithAnimation();
    }

    updatePos() {
        for (var i = 0; i < this.elements.length; ++i) {
            var newPos = (i - this.offset) * this.size.x;
            this.elements[i].mesh.position.setX(newPos);
        }
    }

    updatePosWithAnimation() {
        for (var i = 0; i < this.elements.length; ++i) {
            var newPos = new THREE.Vector3((i - this.offset) * this.size.x,
                this.elements[i].mesh.position.y,
                this.elements[i].mesh.position.z);
            new TWEEN.Tween(this.elements[i].mesh.position)
            .to(newPos, 200)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
        }
    }
}

renderer.setClearColor(0xffffff);
function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    renderer.render(scene, camera);
}
animate();

const tape1 = new Tape(new THREE.Vector3(0, -1.2, 0), new THREE.Vector3(0.5, 0.5, 0.5));
tape1.initTape("");

export function initCanvas(turingMachineState) {
    lines.forEach(line => {
        graphGroup.remove(line.geometry);
    });
    lines.length = 0;

    nodes.forEach(node => {
        graphGroup.remove(node.node);
    });
    nodes.length = 0;
    nodeMeshes.length = 0;

    texts.forEach(text => {
        graphGroup.remove(text);
    });
    texts.length = 0;

    tapes.forEach(tape => {
        tape.deleteTape();
        tapeGroup.remove(tape.indicator);
    });
    tapes.length = 0;

    //--------------------------------------------

    let i = 0;
    turingMachineState.states.forEach(state => {
        new Node(i, 0, 0, 0x123456, state);
        ++i;
    });

    nodes.forEach(node => {
        if (node.text == turingMachineState.initState) {
            node.node.material.color = new THREE.Color(0xff00ff);
        }
    });

    for (let fromState in turingMachineState.transFunct) {
        for (let fromValue in turingMachineState.transFunct[fromState]) {
            connectNodesWithNames(fromState, turingMachineState.transFunct[fromState][fromValue].nextState, fromValue);
        }
    }

    for (var j = 0; j < turingMachineState.tapeNum; ++j) {
        const tape = new Tape(new THREE.Vector3(0, -1.2 - j * 0.7, 0), new THREE.Vector3(0.5, 0.5, 0.5));
        
        tape.initTape(turingMachineState.tapes[j].join(''));

        if (turingMachineState.headPosis[j] > 0) {
            for (var k = 0; k < turingMachineState.headPosis[j]; ++k) {
                tape.shiftLeft();
            }
        }
        else {
            for (var k = 0; k > turingMachineState.headPosis[j]; --k) {
                tape.shiftRight();
            }
        }
    }
}

export function updateCanvas(turingMachineState) {
    for (var i = 0; i < turingMachineState.tapeNum; ++i) {
        tapes[i].elements[tapes[i].offset].changeText(turingMachineState.lastWrittens[i]);
        if (turingMachineState.lastMoves[i] === 'R') {
            tapes[i].shiftLeft();
            tapes[i].addElementFront('');
        }
        else if (turingMachineState.lastMoves[i] === 'L') {
            tapes[i].shiftRight();
            tapes[i].addElementBack('');
        }
    }

    nodes.forEach(node => {
        if (node.text == turingMachineState.currState) {
            node.node.material.color = new THREE.Color(0xff00ff);
        }
        else {
            node.node.material.color = new THREE.Color(0x123456);
        }
    });
}