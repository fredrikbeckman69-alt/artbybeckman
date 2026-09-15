/**
 * Walk Around — True 3D Virtual Walk Engine (Three.js WebGL)
 * Photorealistic 10-Zone Parisian Penthouse Virtual Tour
 * Scale: 1 unit = 1.0 meter (Physical 1:1 Metric Scale)
 * First Person Walking (WASD + Mouse Look + Matterport Floor Pucks)
 * Art by Beckman
 */

(function() {
    'use strict';

    // ===== 1. SYNTHETIC AUDIO ENGINE (WEB AUDIO API) =====
    class VirtualVacationAudio {
        constructor() {
            this.ctx = null;
            this.isMuted = true;
            this.masterGain = null;
            this.ambienceGain = null;
            this.lastStepTime = 0;
        }

        init() {
            if (this.ctx) return;
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            this.ctx = new AudioCtx();

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.isMuted ? 0 : 0.35;
            this.masterGain.connect(this.ctx.destination);

            // Generera realistiskt rumsljud / parisiskt vinddrag i rummet
            const bufferSize = this.ctx.sampleRate * 2;
            const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
                b6 = white * 0.115926;
            }

            const whiteNoise = this.ctx.createBufferSource();
            whiteNoise.buffer = noiseBuffer;
            whiteNoise.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 380;
            filter.Q.value = 1.0;

            this.ambienceGain = this.ctx.createGain();
            this.ambienceGain.gain.value = 0.14;

            whiteNoise.connect(filter);
            filter.connect(this.ambienceGain);
            this.ambienceGain.connect(this.masterGain);
            whiteNoise.start(0);
        }

        playStep() {
            if (!this.ctx || this.isMuted) return;
            const now = this.ctx.currentTime;
            if (now - this.lastStepTime < 0.28) return;
            this.lastStepTime = now;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(130 + Math.random() * 30, now);
            osc.frequency.exponentialRampToValueAtTime(35, now + 0.075);

            gain.gain.setValueAtTime(0.10 + Math.random() * 0.03, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 0.08);
        }

        toggleMute() {
            if (!this.ctx) this.init();
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            this.isMuted = !this.isMuted;
            if (this.masterGain && this.ctx) {
                this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
            }
            return !this.isMuted;
        }
    }

    const audio = new VirtualVacationAudio();

    // ===== 2. STATE VARIABLES =====
    let currentRoomId = 'living_room';
    let isTourRunning = false; // Default to free interactive 3D walk
    let tourSpeed = 1.0;
    let tourSequenceIndex = 0;
    let tourPhaseTime = 0;

    // Movement & Camera State
    const eyeHeight = 1.65; // 1.65m human eye level
    let cameraYaw = 0.08;
    let cameraPitch = -0.02;
    let targetYaw = 0.08;
    let targetPitch = -0.02;
    let targetFov = 65;
    let currentFov = 65;

    let walkTime = 0;
    let headBobY = 0;
    let headBobX = 0;

    // Physical position interpolation (for walking to pucks)
    let isWalkingToTarget = false;
    const playerPos = { x: 8.0, y: eyeHeight, z: 2.0 };
    const targetPlayerPos = { x: 8.0, y: eyeHeight, z: 2.0 };

    // Keyboard movement state
    const keysDown = {};

    // Mouse / Touch drag state
    let isDragging = false;
    let previousMousePos = { x: 0, y: 0 };

    // Three.js Core Objects
    let scene, camera, renderer;
    let roomMeshes = {};
    let artworkMeshes = [];
    let portalPuckMeshes = [];
    let raycaster, mouseCoords;

    // DOM Elements
    const container = document.getElementById('walkaround-canvas-container');
    const loader = document.getElementById('walkaround-loader');
    const artModal = document.getElementById('art-modal');
    const minimapCanvas = document.getElementById('walkaround-minimap');
    const minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;
    let tourBadge = null;

    const textureLoader = (typeof THREE !== 'undefined') ? new THREE.TextureLoader() : null;
    const roomKeys = Object.keys(WALKAROUND_ROOMS);

    // ===== 3. THREE.JS INITIALIZATION =====
    function initThreeEngine() {
        if (typeof THREE === 'undefined') {
            console.error('Three.js is not loaded! Falling back.');
            return false;
        }

        container.innerHTML = '';

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        if (renderer.outputColorSpace) {
            renderer.outputColorSpace = THREE.SRGBColorSpace;
        } else if (renderer.outputEncoding) {
            renderer.outputEncoding = THREE.sRGBEncoding;
        }
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        container.appendChild(renderer.domElement);

        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1920);

        // Camera
        const aspect = window.innerWidth / window.innerHeight;
        camera = new THREE.PerspectiveCamera(targetFov, aspect, 0.1, 500);
        camera.position.set(playerPos.x, playerPos.y, playerPos.z);
        camera.rotation.order = 'YXZ';

        // Raycaster for interactions
        raycaster = new THREE.Raycaster();
        mouseCoords = new THREE.Vector2();

        // Lighting
        const ambLight = new THREE.AmbientLight(0xfff6ee, 1.4);
        scene.add(ambLight);

        const dirLight = new THREE.DirectionalLight(0xfff2e0, 0.8);
        dirLight.position.set(10, 20, 15);
        scene.add(dirLight);

        // Build 3D Architectural Base (Travertine floor, ceiling, and all rooms)
        buildArchitecturalBase();
        buildAllRooms();
        buildPucksAndArtworksForRoom(currentRoomId);

        // Tour status badge
        tourBadge = document.createElement('div');
        tourBadge.className = 'virtual-vacation-tour-badge';
        tourBadge.innerHTML = '<span class="badge-dot"></span><span id="tour-badge-text">3D Interaktiv Promenad • Paris Penthouse</span>';
        container.appendChild(tourBadge);

        setupEventListeners();
        window.addEventListener('resize', onWindowResize);

        // Hide loader after ready
        setTimeout(() => {
            if (loader) {
                loader.style.opacity = '0';
                loader.style.pointerEvents = 'none';
                setTimeout(() => loader.style.display = 'none', 600);
            }
        }, 500);

        return true;
    }

    function onWindowResize() {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // ===== 4. ARCHITECTURAL 3D MESHES & ENVIRONMENT (FILLING GAPS IN 360°) =====
    function buildArchitecturalBase() {
        // Procedural French Travertine Floor Canvas Texture
        const floorCanvas = document.createElement('canvas');
        floorCanvas.width = 512;
        floorCanvas.height = 512;
        const fCtx = floorCanvas.getContext('2d');
        fCtx.fillStyle = '#e8e2d5'; // Warm limestone
        fCtx.fillRect(0, 0, 512, 512);

        // Subtle tile seams
        fCtx.strokeStyle = 'rgba(160, 150, 138, 0.35)';
        fCtx.lineWidth = 3;
        for (let i = 0; i <= 512; i += 128) {
            fCtx.beginPath();
            fCtx.moveTo(i, 0); fCtx.lineTo(i, 512);
            fCtx.moveTo(0, i); fCtx.lineTo(512, i);
            fCtx.stroke();
        }
        // Surface stone noise
        for (let i = 0; i < 2000; i++) {
            const nx = Math.random() * 512;
            const ny = Math.random() * 512;
            fCtx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.15)' : 'rgba(120,110,95,0.08)';
            fCtx.fillRect(nx, ny, 2, 2);
        }

        const floorTexture = new THREE.CanvasTexture(floorCanvas);
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(32, 32);

        const floorGeo = new THREE.PlaneGeometry(120, 120);
        const floorMat = new THREE.MeshStandardMaterial({
            map: floorTexture,
            roughness: 0.45,
            metalness: 0.08
        });
        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.position.y = 0;
        floorMesh.receiveShadow = true;
        scene.add(floorMesh);

        // Ceiling plane at 3.8m height
        const ceilGeo = new THREE.PlaneGeometry(120, 120);
        const ceilMat = new THREE.MeshStandardMaterial({
            color: 0xfdfdfd,
            roughness: 0.95
        });
        const ceilMesh = new THREE.Mesh(ceilGeo, ceilMat);
        ceilMesh.rotation.x = Math.PI / 2;
        ceilMesh.position.y = 3.8;
        scene.add(ceilMesh);
    }

    function buildAllRooms() {
        roomKeys.forEach(id => {
            const roomData = WALKAROUND_ROOMS[id];
            const p = roomData.pos3d || { x: 0, y: 1.65, z: 0 };

            // Inverted Environment Sphere for each room
            // Using 360 geometry with high-resolution image mapped inside
            const sphereGeo = new THREE.SphereGeometry(14, 48, 32);
            sphereGeo.scale(-1, 1, 1); // Inside-out

            const mat = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: (id === currentRoomId) ? 1.0 : 0.0
            });

            const sphere = new THREE.Mesh(sphereGeo, mat);
            sphere.position.set(p.x, 1.65, p.z);
            sphere.rotation.y = roomData.initialYaw || 0;
            scene.add(sphere);

            roomMeshes[id] = {
                mesh: sphere,
                material: mat,
                loaded: false
            };

            // Preload room texture
            textureLoader.load(roomData.image, (tex) => {
                tex.generateMipmaps = true;
                tex.minFilter = THREE.LinearMipmapLinearFilter;
                mat.map = tex;
                mat.needsUpdate = true;
                roomMeshes[id].loaded = true;
            }, undefined, () => {
                // Fallback to jpg
                textureLoader.load(roomData.fallback, (fTex) => {
                    mat.map = fTex;
                    mat.needsUpdate = true;
                });
            });
        });
    }

    // ===== 5. 3D MATTERPORT FLOOR PUCKS & FRAMED ARTWORKS =====
    function buildPucksAndArtworksForRoom(roomId) {
        // Clear previous room interactables
        portalPuckMeshes.forEach(m => scene.remove(m));
        portalPuckMeshes = [];

        artworkMeshes.forEach(m => scene.remove(m));
        artworkMeshes = [];

        const roomData = WALKAROUND_ROOMS[roomId];
        if (!roomData) return;

        // 1. Build 3D Matterport Floor Pucks for Portals
        if (roomData.portals) {
            roomData.portals.forEach(portal => {
                const targetRoom = WALKAROUND_ROOMS[portal.targetRoom];
                if (!targetRoom) return;

                const puckGroup = new THREE.Group();
                const puckPos = portal.pos3d || targetRoom.pos3d || { x: 0, y: 0, z: 0 };
                puckGroup.position.set(puckPos.x, 0.03, puckPos.z);

                // Outer pulsing ring
                const outerGeo = new THREE.RingGeometry(0.45, 0.58, 32);
                const outerMat = new THREE.MeshBasicMaterial({
                    color: 0xdeb887,
                    transparent: true,
                    opacity: 0.85,
                    side: THREE.DoubleSide
                });
                const outerRing = new THREE.Mesh(outerGeo, outerMat);
                outerRing.rotation.x = -Math.PI / 2;
                puckGroup.add(outerRing);

                // Inner solid dot
                const innerGeo = new THREE.CircleGeometry(0.24, 32);
                const innerMat = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.90,
                    side: THREE.DoubleSide
                });
                const innerDot = new THREE.Mesh(innerGeo, innerMat);
                innerDot.rotation.x = -Math.PI / 2;
                puckGroup.add(innerDot);

                // Floating 3D Text Billboard Sprite
                const sprite = createTextSprite(portal.label || `Gå till ${targetRoom.name}`);
                sprite.position.set(0, 0.75, 0);
                puckGroup.add(sprite);

                puckGroup.userData = {
                    type: 'portal',
                    targetRoom: portal.targetRoom,
                    label: portal.label,
                    outerRing: outerRing,
                    baseScale: 1.0
                };

                scene.add(puckGroup);
                portalPuckMeshes.push(puckGroup);
            });
        }

        // 2. Build 3D Framed Artworks on the Walls
        if (roomData.artworks) {
            roomData.artworks.forEach(art => {
                const artGroup = new THREE.Group();
                const aPos = art.pos3d || { x: roomData.pos3d.x, y: 2.0, z: roomData.pos3d.z - 4 };
                artGroup.position.set(aPos.x, aPos.y, aPos.z);

                // Physical dimensions parsed from size string (e.g. "100 × 120 cm")
                let w = 1.0, h = 1.2;
                const sizeMatch = art.size.match(/(\d+)[\s*×x]+(\d+)/);
                if (sizeMatch) {
                    w = parseInt(sizeMatch[1], 10) / 100;
                    h = parseInt(sizeMatch[2], 10) / 100;
                }

                // 3D Canvas Mesh
                const frameGeo = new THREE.BoxGeometry(w, h, 0.05);
                const frameMat = new THREE.MeshStandardMaterial({
                    color: 0x1f1d1b, // Dark gallery frame
                    roughness: 0.5,
                    metalness: 0.3
                });

                // Front face texture
                const canvasMat = new THREE.MeshStandardMaterial({
                    roughness: 0.4,
                    metalness: 0.05
                });
                const artTexPath = `assets/images/${art.filename}`;
                textureLoader.load(artTexPath, (tex) => {
                    canvasMat.map = tex;
                    canvasMat.needsUpdate = true;
                }, undefined, () => {
                    textureLoader.load(`assets/images/${art.originalFilename}`, (fTex) => {
                        canvasMat.map = fTex;
                        canvasMat.needsUpdate = true;
                    });
                });

                // Mesh with multi-materials (front canvas face = index 4)
                const materials = [frameMat, frameMat, frameMat, frameMat, canvasMat, frameMat];
                const mesh = new THREE.Mesh(frameGeo, materials);
                artGroup.add(mesh);

                // 3D Floating Gold Inspection Pin
                const pinGeo = new THREE.RingGeometry(0.08, 0.12, 24);
                const pinMat = new THREE.MeshBasicMaterial({
                    color: 0xffd700,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.9
                });
                const pinMesh = new THREE.Mesh(pinGeo, pinMat);
                pinMesh.position.set(0, 0, 0.04);
                artGroup.add(pinMesh);

                // Small center glow dot
                const dotGeo = new THREE.CircleGeometry(0.04, 16);
                const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
                const dotMesh = new THREE.Mesh(dotGeo, dotMat);
                dotMesh.position.set(0, 0, 0.041);
                artGroup.add(dotMesh);

                // Point camera towards room center
                artGroup.lookAt(roomData.pos3d.x, aPos.y, roomData.pos3d.z);

                artGroup.userData = {
                    type: 'artwork',
                    artData: art,
                    pinMesh: pinMesh
                };

                scene.add(artGroup);
                artworkMeshes.push(artGroup);
            });
        }
    }

    function createTextSprite(message) {
        const canvas = document.createElement('canvas');
        canvas.width = 380;
        canvas.height = 96;
        const ctx = canvas.getContext('2d');

        // Pill background
        ctx.fillStyle = 'rgba(20, 18, 24, 0.85)';
        ctx.beginPath();
        ctx.roundRect(10, 10, 360, 76, 38);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = '600 32px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(message, 190, 48);

        const tex = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(1.6, 0.4, 1.0);
        return sprite;
    }

    // ===== 6. FIRST PERSON WALKING CONTROLS (WASD, ARROWS, TOUCH, CLICK-TO-WALK) =====
    function setupEventListeners() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            keysDown[e.code] = true;
            if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(e.code)) {
                // Instantly switch to interactive free exploration mode
                if (isTourRunning) setTourMode(false);
            }
            if (e.code === 'Space') {
                e.preventDefault();
                setTourMode(!isTourRunning);
            }
        });

        window.addEventListener('keyup', (e) => {
            keysDown[e.code] = false;
        });

        // Mouse Drag to Look (360° Panoramic Pan)
        container.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            isDragging = true;
            previousMousePos = { x: e.clientX, y: e.clientY };
            if (isTourRunning) setTourMode(false);
        });

        window.addEventListener('mousemove', (e) => {
            mouseCoords.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseCoords.y = -(e.clientY / window.innerHeight) * 2 + 1;

            if (isDragging) {
                const dx = e.clientX - previousMousePos.x;
                const dy = e.clientY - previousMousePos.y;
                previousMousePos = { x: e.clientX, y: e.clientY };

                targetYaw -= dx * 0.0035;
                targetPitch -= dy * 0.0030;
                targetPitch = Math.max(-1.3, Math.min(1.3, targetPitch));
            } else {
                checkRaycastHover();
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (isDragging) {
                isDragging = false;
            }
        });

        // Click to interact (floor rings or artwork inspection)
        container.addEventListener('click', (e) => {
            mouseCoords.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseCoords.y = -(e.clientY / window.innerHeight) * 2 + 1;
            handleSceneClick();
        });

        // Touch drag for Mobile
        container.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                isDragging = true;
                previousMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                if (isTourRunning) setTourMode(false);
            }
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (isDragging && e.touches.length === 1) {
                const dx = e.touches[0].clientX - previousMousePos.x;
                const dy = e.touches[0].clientY - previousMousePos.y;
                previousMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };

                targetYaw -= dx * 0.0045;
                targetPitch -= dy * 0.0035;
                targetPitch = Math.max(-1.3, Math.min(1.3, targetPitch));
            }
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            if (isDragging) isDragging = false;
        }, { passive: true });

        // Mousewheel Zoom (Dolly in/out)
        container.addEventListener('wheel', (e) => {
            targetFov += e.deltaY * 0.035;
            targetFov = Math.max(40, Math.min(80, targetFov));
        }, { passive: true });

        setupHUDControls();
    }

    function checkRaycastHover() {
        if (!camera || !scene || isDragging) return;
        raycaster.setFromCamera(mouseCoords, camera);

        const interactables = [];
        portalPuckMeshes.forEach(p => interactables.push(p.children[0], p.children[1]));
        artworkMeshes.forEach(a => interactables.push(a.children[0], a.children[1]));

        const intersects = raycaster.intersectObjects(interactables, false);
        if (intersects.length > 0) {
            container.style.cursor = 'pointer';
        } else {
            container.style.cursor = 'grab';
        }
    }

    function handleSceneClick() {
        if (!camera || !scene) return;
        raycaster.setFromCamera(mouseCoords, camera);

        // Check portals first
        const portalHits = [];
        portalPuckMeshes.forEach(p => {
            const hits = raycaster.intersectObjects(p.children, false);
            if (hits.length > 0) portalHits.push(p);
        });

        if (portalHits.length > 0) {
            const targetRoomId = portalHits[0].userData.targetRoom;
            if (targetRoomId) {
                walkToRoom(targetRoomId);
                return;
            }
        }

        // Check artworks
        const artHits = [];
        artworkMeshes.forEach(a => {
            const hits = raycaster.intersectObjects(a.children, false);
            if (hits.length > 0) artHits.push(a);
        });

        if (artHits.length > 0) {
            const artData = artHits[0].userData.artData;
            if (artData) {
                inspectArtwork(artData);
                return;
            }
        }
    }

    function inspectArtwork(art) {
        // Open modal
        const modalImg = document.getElementById('modal-img');
        const modalTitle = document.getElementById('modal-title');
        const modalSize = document.getElementById('modal-size');
        const modalYear = document.getElementById('modal-year');
        const modalMaterial = document.getElementById('modal-material');
        const modalZone = document.getElementById('modal-zone');
        const modalDesc = document.getElementById('modal-desc');

        if (modalImg) modalImg.src = `assets/images/${art.filename}`;
        if (modalTitle) modalTitle.textContent = art.title;
        if (modalSize) modalSize.textContent = art.size;
        if (modalYear) modalYear.textContent = art.year || '2026';
        if (modalMaterial) modalMaterial.textContent = art.material || 'Originalverk';
        if (modalZone) modalZone.textContent = art.zone || 'Paris Penthouse';
        if (modalDesc) modalDesc.textContent = art.description || '';

        if (artModal) {
            artModal.classList.add('active');
            artModal.setAttribute('aria-hidden', 'false');
        }
    }

    // ===== 7. WALKING & TRANSITIONS =====
    function walkToRoom(roomId) {
        if (roomId === currentRoomId) return;
        const targetRoom = WALKAROUND_ROOMS[roomId];
        if (!targetRoom) return;

        const startRoom = WALKAROUND_ROOMS[currentRoomId];

        // Smoothly walk player position to destination
        const destPos = targetRoom.pos3d || { x: 0, y: eyeHeight, z: 0 };
        targetPlayerPos.x = destPos.x;
        targetPlayerPos.y = eyeHeight;
        targetPlayerPos.z = destPos.z;
        isWalkingToTarget = true;

        // Cross-fade 3D environment spheres
        const startMesh = roomMeshes[currentRoomId];
        const destMesh = roomMeshes[roomId];

        if (destMesh) {
            destMesh.material.opacity = 0.0;
            destMesh.mesh.visible = true;
        }

        let fadeTime = 0;
        const duration = 1.6;

        function animateTransition() {
            fadeTime += 0.025;
            const t = Math.min(fadeTime / duration, 1.0);

            if (startMesh) startMesh.material.opacity = 1.0 - t;
            if (destMesh) destMesh.material.opacity = t;

            if (t < 1.0) {
                requestAnimationFrame(animateTransition);
            } else {
                if (startMesh) startMesh.material.opacity = 0.0;
                if (destMesh) destMesh.material.opacity = 1.0;
                currentRoomId = roomId;
                buildPucksAndArtworksForRoom(currentRoomId);
                updateHUD();
            }
        }
        animateTransition();
    }

    function updateKeyboardMovement(delta) {
        if (isWalkingToTarget) return;

        const moveSpeed = (keysDown['ShiftLeft'] ? 4.2 : 2.4) * delta;
        let moveX = 0;
        let moveZ = 0;

        if (keysDown['KeyW'] || keysDown['ArrowUp']) moveZ -= 1;
        if (keysDown['KeyS'] || keysDown['ArrowDown']) moveZ += 1;
        if (keysDown['KeyA'] || keysDown['ArrowLeft']) moveX -= 1;
        if (keysDown['KeyD'] || keysDown['ArrowRight']) moveX += 1;

        if (moveX !== 0 || moveZ !== 0) {
            // Normalize
            const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
            moveX /= len;
            moveZ /= len;

            // Rotate direction according to camera yaw
            const cos = Math.cos(cameraYaw);
            const sin = Math.sin(cameraYaw);
            const forwardX = -sin;
            const forwardZ = -cos;
            const rightX = cos;
            const rightZ = -sin;

            playerPos.x += (forwardX * -moveZ + rightX * moveX) * moveSpeed;
            playerPos.z += (forwardZ * -moveZ + rightZ * moveX) * moveSpeed;

            // Walking cadence and head bob
            walkTime += delta * 7.5;
            headBobY = Math.sin(walkTime) * 0.045;
            headBobX = Math.cos(walkTime * 0.5) * 0.025;

            // Step sounds on troughs
            if (Math.sin(walkTime) < -0.92) {
                audio.playStep();
            }
        } else {
            headBobY += (0 - headBobY) * 0.1;
            headBobX += (0 - headBobX) * 0.1;
        }
    }

    function updatePhysicalWalkToTarget(delta) {
        if (!isWalkingToTarget) return;

        const dx = targetPlayerPos.x - playerPos.x;
        const dz = targetPlayerPos.z - playerPos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > 0.15) {
            const speed = Math.min(dist * 3.5, 4.0) * delta;
            playerPos.x += (dx / dist) * speed;
            playerPos.z += (dz / dist) * speed;

            walkTime += delta * 8.0;
            headBobY = Math.sin(walkTime) * 0.05;
            headBobX = Math.cos(walkTime * 0.5) * 0.025;

            if (Math.sin(walkTime) < -0.92) {
                audio.playStep();
            }
        } else {
            playerPos.x = targetPlayerPos.x;
            playerPos.z = targetPlayerPos.z;
            isWalkingToTarget = false;
        }
    }

    // ===== 8. MAIN RENDER LOOP (60 FPS WEBGL) =====
    let lastTime = performance.now();

    function renderLoop(time) {
        requestAnimationFrame(renderLoop);

        const delta = Math.min((time - lastTime) / 1000, 0.1);
        lastTime = time;

        // Camera yaw/pitch damping
        const damp = Math.min(delta * 10.0, 1.0);
        cameraYaw += (targetYaw - cameraYaw) * damp;
        cameraPitch += (targetPitch - cameraPitch) * damp;
        currentFov += (targetFov - currentFov) * damp;

        if (camera) {
            camera.fov = currentFov;
            camera.updateProjectionMatrix();

            updateKeyboardMovement(delta);
            updatePhysicalWalkToTarget(delta);

            // Apply camera position with human head bob
            camera.position.set(playerPos.x + headBobX, eyeHeight + headBobY, playerPos.z);
            camera.rotation.y = cameraYaw;
            camera.rotation.x = cameraPitch;
        }

        // Animate pulsing floor pucks
        const animTime = time * 0.003;
        portalPuckMeshes.forEach(puck => {
            const outer = puck.userData.outerRing;
            if (outer) {
                const scale = 1.0 + Math.sin(animTime * 2) * 0.08;
                outer.scale.set(scale, scale, 1.0);
            }
        });

        // Animate artwork golden pins
        artworkMeshes.forEach(artGroup => {
            const pin = artGroup.userData.pinMesh;
            if (pin) {
                const pinScale = 1.0 + Math.sin(animTime * 3) * 0.12;
                pin.scale.set(pinScale, pinScale, 1.0);
            }
        });

        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }

        drawMinimap();
    }

    // ===== 9. ARCHITECTURAL ORIENTATION MINIMAP =====
    function drawMinimap() {
        if (!minimapCtx || !minimapCanvas) return;
        const w = minimapCanvas.width;
        const h = minimapCanvas.height;

        minimapCtx.clearRect(0, 0, w, h);

        // Blueprint dark grid background
        minimapCtx.fillStyle = 'rgba(15, 14, 18, 0.95)';
        minimapCtx.fillRect(0, 0, w, h);

        // Grid lines
        minimapCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        minimapCtx.lineWidth = 1;
        for (let x = 0; x < w; x += 20) {
            minimapCtx.beginPath(); minimapCtx.moveTo(x, 0); minimapCtx.lineTo(x, h); minimapCtx.stroke();
        }
        for (let y = 0; y < h; y += 20) {
            minimapCtx.beginPath(); minimapCtx.moveTo(0, y); minimapCtx.lineTo(w, y); minimapCtx.stroke();
        }

        // Draw penthouse rooms
        roomKeys.forEach(id => {
            const room = WALKAROUND_ROOMS[id];
            const m = room.minimapPos;
            if (!m) return;

            const isCurrent = (id === currentRoomId);

            minimapCtx.fillStyle = isCurrent ? 'rgba(255, 215, 0, 0.25)' : 'rgba(255, 255, 255, 0.07)';
            minimapCtx.strokeStyle = isCurrent ? '#ffd700' : 'rgba(255, 255, 255, 0.25)';
            minimapCtx.lineWidth = isCurrent ? 2 : 1;

            minimapCtx.beginPath();
            minimapCtx.roundRect(m.x - 14, m.y - 12, 28, 24, 4);
            minimapCtx.fill();
            minimapCtx.stroke();

            // Room number
            minimapCtx.fillStyle = isCurrent ? '#ffffff' : 'rgba(255, 255, 255, 0.6)';
            minimapCtx.font = '600 9px Inter, sans-serif';
            minimapCtx.textAlign = 'center';
            minimapCtx.fillText(room.roomNumber || '01', m.x, m.y + 3);
        });

        // Player Position & Rotating Field-of-View Cone
        const currRoom = WALKAROUND_ROOMS[currentRoomId];
        if (currRoom && currRoom.minimapPos) {
            const px = currRoom.minimapPos.x;
            const py = currRoom.minimapPos.y;

            // FOV cone
            minimapCtx.save();
            minimapCtx.translate(px, py);
            minimapCtx.rotate(-cameraYaw + Math.PI);

            const coneGrad = minimapCtx.createRadialGradient(0, 0, 2, 0, 0, 26);
            coneGrad.addColorStop(0, 'rgba(255, 215, 0, 0.65)');
            coneGrad.addColorStop(1, 'rgba(255, 215, 0, 0.0)');
            minimapCtx.fillStyle = coneGrad;

            minimapCtx.beginPath();
            minimapCtx.moveTo(0, 0);
            minimapCtx.arc(0, 0, 26, -0.45, 0.45);
            minimapCtx.closePath();
            minimapCtx.fill();

            minimapCtx.restore();

            // Player dot
            minimapCtx.fillStyle = '#ffffff';
            minimapCtx.beginPath();
            minimapCtx.arc(px, py, 4, 0, Math.PI * 2);
            minimapCtx.fill();

            minimapCtx.strokeStyle = '#ffd700';
            minimapCtx.lineWidth = 2;
            minimapCtx.stroke();
        }
    }

    // ===== 10. HUD CONTROLS & INITIALIZATION =====
    function setupHUDControls() {
        // Toggle Audio Button
        const btnSound = document.getElementById('btn-toggle-sound');
        if (btnSound) {
            btnSound.addEventListener('click', () => {
                const unmuted = audio.toggleMute();
                const icon = document.getElementById('sound-icon');
                const text = document.getElementById('sound-text');
                if (icon) icon.textContent = unmuted ? '🔊' : '🔇';
                if (text) text.textContent = unmuted ? 'Ljud På' : 'Ljud';
                btnSound.classList.toggle('active', unmuted);
            });
        }

        // Room Navigation Bar Buttons
        const navBar = document.getElementById('room-nav-bar');
        if (navBar) {
            navBar.innerHTML = '';
            roomKeys.forEach(id => {
                const room = WALKAROUND_ROOMS[id];
                const btn = document.createElement('button');
                btn.className = `room-nav-btn ${id === currentRoomId ? 'active' : ''}`;
                btn.dataset.roomId = id;
                btn.innerHTML = `<span class="room-nav-num">${room.roomNumber}</span><span class="room-nav-name">${room.name}</span>`;
                btn.addEventListener('click', () => {
                    walkToRoom(id);
                });
                navBar.appendChild(btn);
            });
        }

        // Mode Toggles (Promenad vs Fri Utforskning)
        const btnModeWalk = document.getElementById('mode-walk');
        const btnModeExplore = document.getElementById('mode-explore');
        const btnToggleTour = document.getElementById('btn-toggle-tour');

        if (btnModeWalk) {
            btnModeWalk.addEventListener('click', () => setTourMode(true));
        }
        if (btnModeExplore) {
            btnModeExplore.addEventListener('click', () => setTourMode(false));
        }
        if (btnToggleTour) {
            btnToggleTour.addEventListener('click', () => setTourMode(!isTourRunning));
        }

        // Minimap click to walk
        if (minimapCanvas) {
            minimapCanvas.addEventListener('click', (e) => {
                const rect = minimapCanvas.getBoundingClientRect();
                const clickX = ((e.clientX - rect.left) / rect.width) * minimapCanvas.width;
                const clickY = ((e.clientY - rect.top) / rect.height) * minimapCanvas.height;

                let closestRoom = null;
                let minDist = 999;
                roomKeys.forEach(id => {
                    const m = WALKAROUND_ROOMS[id].minimapPos;
                    if (!m) return;
                    const d = Math.hypot(clickX - m.x, clickY - m.y);
                    if (d < minDist && d < 28) {
                        minDist = d;
                        closestRoom = id;
                    }
                });

                if (closestRoom) {
                    walkToRoom(closestRoom);
                }
            });
        }

        // Modal Close Buttons
        const modalCloseBtn = document.getElementById('modal-close-btn');
        const modalInspectClose = document.getElementById('modal-inspect-close');
        if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
        if (modalInspectClose) modalInspectClose.addEventListener('click', closeModal);
        if (artModal) {
            artModal.addEventListener('click', (e) => {
                if (e.target === artModal) closeModal();
            });
        }
    }

    function closeModal() {
        if (artModal) {
            artModal.classList.remove('active');
            artModal.setAttribute('aria-hidden', 'true');
        }
    }

    function setTourMode(active) {
        isTourRunning = active;
        const btnModeWalk = document.getElementById('mode-walk');
        const btnModeExplore = document.getElementById('mode-explore');
        const btnToggleTour = document.getElementById('btn-toggle-tour');

        if (btnModeWalk) btnModeWalk.classList.toggle('active', isTourRunning);
        if (btnModeExplore) btnModeExplore.classList.toggle('active', !isTourRunning);

        if (btnToggleTour) {
            btnToggleTour.innerHTML = isTourRunning ?
                `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg><span>Pausa Rundtur</span>` :
                `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg><span>Starta Rundtur</span>`;
        }

        if (tourBadge) {
            const badgeText = document.getElementById('tour-badge-text');
            if (badgeText) {
                badgeText.textContent = isTourRunning ?
                    `Virtuell Promenad • ${WALKAROUND_ROOMS[currentRoomId].name}` :
                    `Fri 3D Utforskning (WASD / Mus / Golvringar) • ${WALKAROUND_ROOMS[currentRoomId].name}`;
            }
        }
    }

    function updateHUD() {
        // Update nav bar active state
        const navBtns = document.querySelectorAll('.room-nav-btn');
        navBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.roomId === currentRoomId);
        });

        // Update badge
        if (tourBadge) {
            const badgeText = document.getElementById('tour-badge-text');
            if (badgeText) {
                badgeText.textContent = `${WALKAROUND_ROOMS[currentRoomId].name} • Skala 1:1`;
            }
        }
    }

    // ===== 11. BOOTSTRAP =====
    window.addEventListener('DOMContentLoaded', () => {
        initThreeEngine();
        requestAnimationFrame(renderLoop);
    });

})();
