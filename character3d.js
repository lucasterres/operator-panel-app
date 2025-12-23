
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Character3D (Public Skeleton Version)
 * A simplified 3D scene containing a placeholder "Pet" (Wireframe Sphere)
 * that follows the mouse cursor.
 * 
 * This version removes proprietary models (GLB files) and complex event logic.
 */
export class Character3D {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);

        if (!this.container) {
            console.error(`Character container not found: ${containerId}`);
            return;
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.petMesh = null;
        this.animationId = null;

        // Mouse tracking
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationY = 0;
        this.targetRotationX = 0;
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;

        this.init();
    }

    init() {
        // 1. Scene
        this.scene = new THREE.Scene();
        // this.scene.background = new THREE.Color(0x000000); // Transparent/Glass handling in CSS

        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.camera.position.z = 5;
        this.camera.position.y = 1;

        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // 4. Lighting (Simple)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0x00ff41, 0.8); // Matrix Green Light
        dirLight.position.set(2, 5, 5);
        this.scene.add(dirLight);

        // 5. Placeholder Object (The "Pet")
        const geometry = new THREE.IcosahedronGeometry(0.8, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ff41,
            wireframe: true,
            emissive: 0x002200
        });

        this.petMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.petMesh);

        // 6. Event Listeners
        window.addEventListener('resize', this.onWindowResize.bind(this));
        document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this));

        // 7. Start Loop
        this.animate();
    }

    onDocumentMouseMove(event) {
        this.mouseX = (event.clientX - this.windowHalfX) / 200; // Sensitivity
        this.mouseY = (event.clientY - this.windowHalfY) / 200;
    }

    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));

        if (this.petMesh) {
            // Idle rotation
            this.petMesh.rotation.z += 0.005;

            // Follow Mouse (Smoothly)
            this.targetRotationY = this.mouseX;
            this.targetRotationX = this.mouseY;

            this.petMesh.rotation.y += 0.05 * (this.targetRotationY - this.petMesh.rotation.y);
            this.petMesh.rotation.x += 0.05 * (this.targetRotationX - this.petMesh.rotation.x);
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        if (!this.container || !this.camera || !this.renderer) return;

        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    // --- API Methods called by main.js (Stubs for compatibility) ---

    setWind(speed, dir) {
        // Placeholder: speed up rotation on high wind?
        if (this.petMesh && speed > 20) {
            this.petMesh.rotation.z += 0.05;
        }
    }

    setTimeZone(tz) {
        // No-op in skeleton
    }

    decideAnimationByWeather(data) {
        // No-op in skeleton (Simpler pet doesn't change animations)
    }

    setSeason(season) {
        // No-op
    }

    setNightMode(isNight) {
        if (this.petMesh && this.petMesh.material) {
            // Change color slightly
            this.petMesh.material.color.setHex(isNight ? 0x00eeff : 0x00ff41); // Cyan vs Green
        }
    }

    goToSleep() {
        // Stop following mouse?
    }

    wakeUp() {
        // Resume
    }

    triggerFarmerEvent() {
        // No-op
    }

    previousCharacter() {
        // No-op (Only one skeletal pet)
    }

    nextCharacter() {
        // No-op
    }

    getCurrentCharacterName() {
        return "CORE";
    }

    moveToContainer(newContainerId) {
        // Handle moving canvas between DOM elements (Mini vs Large view)
        const oldContainer = this.container;
        const newContainer = document.getElementById(newContainerId);

        if (newContainer && this.renderer) {
            newContainer.appendChild(this.renderer.domElement);
            this.container = newContainer;
            this.containerId = newContainerId;
            this.onWindowResize();
        }
    }
}
