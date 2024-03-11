import * as THREE from './resources/three.module.min.js';
import { DragControls } from './resources/DragControls.js';
import { FontLoader } from './resources/FontLoader.js';
import { TextGeometry } from './resources/TextGeometry.js';

const scene = new THREE.Scene();

const aspect = window.innerWidth / window.innerHeight;

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

camera.position.set(0, 0, 8);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const nodes = [];

class Node {
    constructor(x, y, z, color, text) {
        this.geometry = new THREE.CircleGeometry(0.5, 32, 32);
        this.material = new THREE.MeshBasicMaterial({ color: color });
        this.node = new THREE.Mesh(this.geometry, this.material);
        this.node.position.set(x, y, z);

        const loader = new FontLoader();
        loader.load('./resources/Madimi One_Regular.json', (font) => {
            const textGeometry = new TextGeometry(text, {
                font: font,
                size: 0.05,
                height: 0.01
            });
            textGeometry.computeBoundingBox();
            const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
            const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
            this.textMesh = new THREE.Mesh(textGeometry, textMaterial);
            this.textMesh.position.set(-textWidth / 2, -textHeight / 2, 0.1);
            this.textMesh.userData = { draggable: false };
            this.node.add(this.textMesh);
        });

        scene.add(this.node);
        nodes.push(this.node);
    }
}

const node1 = new Node(-1, 0, 0, 0xff0000, 'Node 1');
const node2 = new Node(0, 1, 0, 0x00ff00, 'Node 2');
const node3 = new Node(1, 0, 0, 0x0000ff, 'Node 3');

class Line {
    constructor(startNode, endNode) {
        const diff = new THREE.Vector3(0, 0, 0);
        const geometry = new THREE.BufferGeometry().setFromPoints([startNode.position.sub(diff), endNode.position.sub(diff)]);
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        this.line = new THREE.Line(geometry, material);
        scene.add(this.line);
    }
}

const line1 = new Line(node1.node, node2.node);
const line2 = new Line(node2.node, node3.node);

const dragControls = new DragControls(nodes, camera, renderer.domElement);
dragControls.addEventListener('drag', onDrag);

function onDrag() {
    nodes.forEach(node => {
        if (node.userData.draggable) {
            line1.line.geometry.setFromPoints([node1.node.position, node2.node.position]);
            line2.line.geometry.setFromPoints([node2.node.position, node3.node.position]);
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();