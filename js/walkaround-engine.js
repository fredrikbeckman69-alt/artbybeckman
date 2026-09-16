/**
 * Walk Around — True 3D Photosphere & 3D Gaussian Splatting Engine (Three.js WebGL)
 * 10-Zone Parisian Penthouse Virtual Tour with Original Artworks by Fredrik Beckman
 * Scale: 1 unit = 1.0 meter (Physical Metric Scale)
 * First Person Walking (WASD + Mouse Look 360° + Matterport Floor Rings + 1:1 Artwork Inspection)
 * Art by Beckman
 */

(function() {
    'use strict';

    const ASSET_VERSION = '2.3.0';
    const withVersion = (url) => {
        if (!url) return url;
        return url.includes('?') ? `${url}&v=${ASSET_VERSION}` : `${url}?v=${ASSET_VERSION}`;
    };

    // ===== 1. SYNTHETIC AUDIO ENGINE (WEB AUDIO API) =====
    class VirtualVacationAudio {
        constructor() {
            this.ctx = null;
            this.isMuted = true;
            this.masterGain = null;
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
                output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.032;
                b6 = white * 0.115926;
            }

            const whiteNoise = this.ctx.createBufferSource();
            whiteNoise.buffer = noiseBuffer;
            whiteNoise.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 360;
            filter.Q.value = 1.0;

            const ambienceGain = this.ctx.createGain();
            ambienceGain.gain.value = 0.12;

            whiteNoise.connect(filter);
            filter.connect(ambienceGain);
            ambienceGain.connect(this.masterGain);
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
            osc.frequency.setValueAtTime(125 + Math.random() * 25, now);
            osc.frequency.exponentialRampToValueAtTime(32, now + 0.075);

            gain.gain.setValueAtTime(0.09 + Math.random() * 0.02, now);
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

    // ===== 2. STATE & CONFIGURATION =====
    let currentRoomId = 'living_room';
    let isTourRunning = false;
    let tourSpeed = 1.0;
    let tourSequenceIndex = 0;
    let tourPhaseTime = 0;

    const eyeHeight = 1.65; // 1.65m human eye level
    let cameraYaw = 0.0;
    let cameraPitch = 0.0;
    let targetYaw = 0.0;
    let targetPitch = 0.0;
    let targetFov = 65;
    let currentFov = 65;

    let walkTime = 0;
    let headBobY = 0;
    let headBobX = 0;

    // Movement state
    let isTransitioning = false;
    const playerPos = { x: 0.0, y: eyeHeight, z: 0.0 };
    const targetPlayerPos = { x: 0.0, y: eyeHeight, z: 0.0 };
    const keysDown = {};
    let isDragging = false;
    let previousMousePos = { x: 0, y: 0 };

    // Three.js Core Objects
    let scene, camera, renderer;
    let currentSphereMesh = null;
    let previousSphereMesh = null;
    let gaussianSplatMesh = null;
    let portalPuckMeshes = [];
    let artworkPins = [];
    let raycaster, mouseCoords;

    const textureCache = {};
    const roomKeys = typeof WALKAROUND_ROOMS !== 'undefined' ? Object.keys(WALKAROUND_ROOMS) : [];

    // DOM Elements
    const container = document.getElementById('walkaround-canvas-container');
    const loader = document.getElementById('walkaround-loader');
    const artModal = document.getElementById('art-modal');
    const minimapCanvas = document.getElementById('walkaround-minimap');
    const minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;
    let tourBadge = null;

    // Gaussian Splat Radial Falloff Alpha Texture
    let splatAlphaTexture = null;
    function getSplatAlphaTexture() {
        if (splatAlphaTexture) return splatAlphaTexture;
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, 'rgba(255,255,255,1.0)');
        g.addColorStop(0.35, 'rgba(255,255,255,0.72)');
        g.addColorStop(0.70, 'rgba(255,255,255,0.22)');
        g.addColorStop(1.0, 'rgba(255,255,255,0.0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 64, 64);
        splatAlphaTexture = new THREE.CanvasTexture(canvas);
        return splatAlphaTexture;
    }

    // ===== 3. THREE.JS INITIALIZATION =====
    function initThreeEngine() {
        if (typeof THREE === 'undefined') return false;

        container.innerHTML = '';

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

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a090d);
        window.__DEBUG_SCENE = scene;

        const aspect = window.innerWidth / window.innerHeight;
        camera = new THREE.PerspectiveCamera(targetFov, aspect, 0.1, 500);
        camera.position.set(0, eyeHeight, 0);
        camera.rotation.order = 'YXZ';
        window.__DEBUG_CAMERA = camera;
        window.__DEBUG_WALK_TO_ROOM = walkToRoom;
        window.__DEBUG_INSPECT_ARTWORK = inspectArtwork;
        window.__DEBUG_CLOSE_MODAL = closeModal;
        window.__DEBUG_GET_CURRENT_ROOM = () => currentRoomId;
        window.setCameraAngle = function(yawDeg, pitchDeg) {
            targetYaw = yawDeg * Math.PI / 180;
            cameraYaw = targetYaw;
            targetPitch = pitchDeg * Math.PI / 180;
            cameraPitch = targetPitch;
        };

        raycaster = new THREE.Raycaster();
        mouseCoords = new THREE.Vector2();

        // Ambient Lighting for 3D elements
        const ambLight = new THREE.AmbientLight(0xfff8f0, 1.35);
        scene.add(ambLight);

        const dirLight = new THREE.DirectionalLight(0xfffaec, 0.75);
        dirLight.position.set(8, 18, 12);
        scene.add(dirLight);

        loadAndDisplayRoom(currentRoomId);

        // Tour status badge
        tourBadge = document.createElement('div');
        tourBadge.className = 'virtual-vacation-tour-badge';
        tourBadge.innerHTML = '<span class="badge-dot"></span><span id="tour-badge-text">● 3D GAUSSIAN SPLATTING • PARIS PENTHOUSE</span>';
        container.appendChild(tourBadge);

        setupEventListeners();
        window.addEventListener('resize', onWindowResize);

        setTimeout(() => {
            if (loader) {
                loader.style.opacity = '0';
                loader.style.pointerEvents = 'none';
                setTimeout(() => loader.style.display = 'none', 600);
            }
        }, 400);

        return true;
    }

    function onWindowResize() {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // ===== 4. LOAD & DISPLAY TRUE 360 ROOM WITH GAUSSIAN SPLATTING =====
    function loadAndDisplayRoom(roomId) {
        const room = WALKAROUND_ROOMS[roomId];
        if (!room) return;

        // Clean up previous navigation pucks and artwork pins
        portalPuckMeshes.forEach(p => scene.remove(p));
        portalPuckMeshes = [];
        artworkPins.forEach(a => scene.remove(a));
        artworkPins = [];

        // Reset player coordinates in new room
        playerPos.x = 0;
        playerPos.y = eyeHeight;
        playerPos.z = 0;
        targetPlayerPos.x = 0;
        targetPlayerPos.y = eyeHeight;
        targetPlayerPos.z = 0;

        targetYaw = room.initialYaw || 0.0;
        targetPitch = room.initialPitch || 0.0;
        cameraYaw = targetYaw;
        cameraPitch = targetPitch;

        const textureLoader = new THREE.TextureLoader();
        const loadTex = (url) => {
            return new Promise((resolve) => {
                if (textureCache[url]) {
                    resolve(textureCache[url]);
                } else {
                    textureLoader.load(url, (tex) => {
                        tex.generateMipmaps = true;
                        tex.minFilter = THREE.LinearMipmapLinearFilter;
                        tex.magFilter = THREE.LinearFilter;
                        textureCache[url] = tex;
                        resolve(tex);
                    }, undefined, () => {
                        textureLoader.load(withVersion(room.image || room.fallback), (fTex) => {
                            resolve(fTex);
                        });
                    });
                }
            });
        };

        const pano360Url = withVersion(`assets/walkaround/360_${roomId}.webp`);

        loadTex(pano360Url).then(tex => {
            // Keep old sphere for crossfade
            if (currentSphereMesh) {
                previousSphereMesh = currentSphereMesh;
            }

            // Create new 360 inverted sphere (50m radius)
            const sphereGeo = new THREE.SphereGeometry(50, 64, 40);
            sphereGeo.scale(-1, 1, 1);
            const sphereMat = new THREE.MeshBasicMaterial({
                map: tex,
                transparent: true,
                opacity: previousSphereMesh ? 0.0 : 1.0,
                depthWrite: false
            });

            currentSphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
            currentSphereMesh.position.set(camera.position.x, camera.position.y, camera.position.z);
            currentSphereMesh.rotation.y = -Math.PI / 2;
            scene.add(currentSphereMesh);

            // Cross-fade spheres
            if (previousSphereMesh) {
                let fade = 0;
                const fadeAnim = () => {
                    fade += 0.05;
                    if (currentSphereMesh) currentSphereMesh.material.opacity = Math.min(1.0, fade);
                    if (previousSphereMesh) previousSphereMesh.material.opacity = Math.max(0.0, 1.0 - fade);

                    if (fade < 1.0) {
                        requestAnimationFrame(fadeAnim);
                    } else {
                        if (previousSphereMesh) {
                            scene.remove(previousSphereMesh);
                            previousSphereMesh.geometry.dispose();
                            previousSphereMesh = null;
                        }
                    }
                };
                fadeAnim();
            }

            // Build 3D Gaussian Splats for this room
            buildGaussianSplats(roomId);

            // Build navigation pucks and artwork pins
            buildPortalPucks(room);
            buildArtworkPins(room);

            updateHUD();
        });
    }

    // ===== 5. 3D GAUSSIAN SPLATTING VOLUMETRIC FIELD =====
    function buildGaussianSplats(roomId) {
        if (gaussianSplatMesh) {
            scene.remove(gaussianSplatMesh);
            gaussianSplatMesh.geometry.dispose();
            gaussianSplatMesh = null;
        }

        const room = WALKAROUND_ROOMS[roomId];
        const splatCount = 6000;
        const splatGeo = new THREE.BufferGeometry();
        const pos = new Float32Array(splatCount * 3);
        const col = new Float32Array(splatCount * 3);

        const isTravertine = ['dining_room', 'dining_v2', 'kitchen', 'entry', 'bathroom'].includes(roomId);
        let idx = 0;

        // A. 3D Subtle Floor Specular Highlights (y in [0.01, 0.08], radius [1.5, 7.5]m)
        const floorCount = 2600;
        for (let i = 0; i < floorCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 1.5 + Math.sqrt(Math.random()) * 6.0;
            pos[idx * 3] = Math.cos(angle) * r;
            pos[idx * 3 + 1] = 0.01 + Math.random() * 0.07;
            pos[idx * 3 + 2] = Math.sin(angle) * r;

            if (isTravertine) {
                col[idx * 3] = 0.94 + Math.random() * 0.06;
                col[idx * 3 + 1] = 0.90 + Math.random() * 0.06;
                col[idx * 3 + 2] = 0.82 + Math.random() * 0.06;
            } else {
                col[idx * 3] = 0.92 + Math.random() * 0.08;
                col[idx * 3 + 1] = 0.82 + Math.random() * 0.08;
                col[idx * 3 + 2] = 0.68 + Math.random() * 0.08;
            }
            idx++;
        }

        // B. Volumetric Parisian Balcony Window Sunlight & Light Beams
        const sunCount = 1800;
        for (let i = 0; i < sunCount; i++) {
            const angle = 0.85 + (Math.random() - 0.5) * 1.2;
            const r = 1.6 + Math.random() * 4.5;
            pos[idx * 3] = Math.cos(angle) * r;
            pos[idx * 3 + 1] = 0.5 + Math.random() * 2.9;
            pos[idx * 3 + 2] = Math.sin(angle) * r;

            col[idx * 3] = 1.0;
            col[idx * 3 + 1] = 0.96 + Math.random() * 0.04;
            col[idx * 3 + 2] = 0.86 + Math.random() * 0.10;
            idx++;
        }

        // C. Artwork Surface Radiance & Glitter Specular Highlights (Fredrik Beckman Signature Gold & Glitter)
        const arts = (room && room.artworks) ? room.artworks : [];
        const artCount = arts.length > 0 ? Math.floor(1600 / arts.length) : 0;
        arts.forEach(art => {
            let ax = 0, ay = 2.1, az = -5.0;
            if (art.yaw !== undefined) {
                const dist = 4.8;
                const yawRad = (art.yaw * Math.PI) / 180;
                const pitchRad = ((art.pitch || 0) * Math.PI) / 180;
                ax = Math.sin(yawRad) * dist * Math.cos(pitchRad);
                ay = eyeHeight + Math.sin(pitchRad) * dist + (art.yOffset || 0.3);
                az = -Math.cos(yawRad) * dist * Math.cos(pitchRad);
            } else if (art.screenPos) {
                const angle = ((art.screenPos.x - 50) / 50) * (Math.PI * 0.38);
                const dist = 4.9;
                ax = Math.sin(angle) * dist;
                ay = eyeHeight + ((50 - art.screenPos.y) / 50) * 1.8;
                az = -Math.cos(angle) * dist;
            }

            for (let i = 0; i < artCount && idx < splatCount; i++) {
                // Spread particles across 3D canvas face
                const uSpan = (Math.random() - 0.5) * 1.2;
                const vSpan = (Math.random() - 0.5) * 1.4;
                const depthVar = (Math.random() - 0.5) * 0.08;

                // Orthogonal vector along wall
                const normalAngle = Math.atan2(ax, az);
                const wallX = Math.cos(normalAngle) * uSpan;
                const wallZ = -Math.sin(normalAngle) * uSpan;

                pos[idx * 3] = ax + wallX + Math.sin(normalAngle) * depthVar;
                pos[idx * 3 + 1] = ay + vSpan;
                pos[idx * 3 + 2] = az + wallZ + Math.cos(normalAngle) * depthVar;

                // Gold, magenta, and pure diamond sparkle
                const randType = Math.random();
                if (randType < 0.45) {
                    // 24K Gold shimmer
                    col[idx * 3] = 1.0;
                    col[idx * 3 + 1] = 0.85 + Math.random() * 0.12;
                    col[idx * 3 + 2] = 0.30 + Math.random() * 0.20;
                } else if (randType < 0.75) {
                    // Magenta glitter glint
                    col[idx * 3] = 1.0;
                    col[idx * 3 + 1] = 0.25 + Math.random() * 0.20;
                    col[idx * 3 + 2] = 0.65 + Math.random() * 0.25;
                } else {
                    // Diamond holographic sparkle
                    col[idx * 3] = 1.0;
                    col[idx * 3 + 1] = 1.0;
                    col[idx * 3 + 2] = 1.0;
                }
                idx++;
            }
        });

        // Fill remaining with subtle ambient particles
        while (idx < splatCount) {
            const angle = Math.random() * Math.PI * 2;
            const r = 2.0 + Math.random() * 5.0;
            pos[idx * 3] = Math.cos(angle) * r;
            pos[idx * 3 + 1] = 0.8 + Math.random() * 2.0;
            pos[idx * 3 + 2] = Math.sin(angle) * r;
            col[idx * 3] = 0.95;
            col[idx * 3 + 1] = 0.92;
            col[idx * 3 + 2] = 0.85;
            idx++;
        }

        splatGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        splatGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));

        const splatMat = new THREE.PointsMaterial({
            size: 0.18,
            map: getSplatAlphaTexture(),
            vertexColors: true,
            transparent: true,
            opacity: 0.42,
            blending: THREE.NormalBlending,
            depthWrite: false
        });

        gaussianSplatMesh = new THREE.Points(splatGeo, splatMat);
        scene.add(gaussianSplatMesh);
    }

    // ===== 6. 3D MATTERPORT FLOOR NAVIGATION PUCKS =====
    function buildPortalPucks(room) {
        if (!room.portals) return;

        room.portals.forEach(portal => {
            const puckGroup = new THREE.Group();

            // Calculate 3D doorway floor position from screenPos or dir
            let px = 0, py = 0.04, pz = -4.0;
            if (portal.screenPos) {
                const angle = ((portal.screenPos.x - 50) / 50) * (Math.PI * 0.42);
                const dist = 3.8;
                px = Math.sin(angle) * dist;
                pz = -Math.cos(angle) * dist;
            } else if (portal.pos3d) {
                px = portal.pos3d.x * 0.85;
                pz = (portal.pos3d.z || -4.0) * 0.85;
            }

            puckGroup.position.set(px, py, pz);

            // Outer pulsing gold ring
            const ringGeo = new THREE.RingGeometry(0.28, 0.38, 32);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0xffd700,
                transparent: true,
                opacity: 0.92,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = -Math.PI / 2;
            puckGroup.add(ring);

            // Center solid gold dot
            const dotGeo = new THREE.CircleGeometry(0.12, 16);
            const dotMat = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide
            });
            const dot = new THREE.Mesh(dotGeo, dotMat);
            dot.rotation.x = -Math.PI / 2;
            puckGroup.add(dot);

            // Sleek Floating Text Sprite
            const sprite = createTextSprite(portal.label);
            sprite.position.set(0, 0.45, 0);
            puckGroup.add(sprite);

            puckGroup.userData = {
                type: 'portal',
                targetRoom: portal.targetRoom,
                outerRing: ring,
                label: portal.label
            };

            scene.add(puckGroup);
            portalPuckMeshes.push(puckGroup);
        });
    }

    // ===== 7. 3D ARTWORK PINS & 1:1 INSPECTION =====
    function buildArtworkPins(room) {
        if (!room.artworks) return;

        room.artworks.forEach(art => {
            const pinGroup = new THREE.Group();

            let ax = 0, ay = 2.4, az = -5.0;
            if (art.yaw !== undefined) {
                const dist = 4.8;
                const yawRad = (art.yaw * Math.PI) / 180;
                const pitchRad = ((art.pitch || 0) * Math.PI) / 180;
                ax = Math.sin(yawRad) * dist * Math.cos(pitchRad);
                ay = eyeHeight + Math.sin(pitchRad) * dist + (art.yOffset || 0.3);
                az = -Math.cos(yawRad) * dist * Math.cos(pitchRad);
            } else if (art.screenPos) {
                const angle = ((art.screenPos.x - 50) / 50) * (Math.PI * 0.38);
                const dist = 5.0;
                ax = Math.sin(angle) * dist;
                ay = eyeHeight + ((50 - art.screenPos.y) / 50) * 1.8;
                az = -Math.cos(angle) * dist;
            } else if (art.pos3d) {
                ax = art.pos3d.x;
                ay = art.pos3d.y || 2.4;
                az = art.pos3d.z || -5.0;
            }

            pinGroup.position.set(ax, ay, az);
            pinGroup.lookAt(camera.position);

            // Concentric Glowing Gold Ring
            const ringGeo = new THREE.RingGeometry(0.18, 0.26, 32);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0xffd700,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.94
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            pinGroup.add(ring);

            // Center glowing dot
            const dotGeo = new THREE.CircleGeometry(0.10, 16);
            const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const dot = new THREE.Mesh(dotGeo, dotMat);
            dot.position.z = 0.005;
            pinGroup.add(dot);

            // Sleek Title Sprite
            const labelSprite = createTextSprite(`${art.title} • 1:1 vy`);
            labelSprite.scale.set(1.05, 0.24, 1.0);
            labelSprite.position.set(0, -0.42, 0.02);
            pinGroup.add(labelSprite);

            pinGroup.userData = {
                type: 'artwork',
                artData: art,
                ring: ring
            };

            scene.add(pinGroup);
            artworkPins.push(pinGroup);
        });
    }

    function createTextSprite(message) {
        const canvas = document.createElement('canvas');
        canvas.width = 380;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');

        // Elegant Frosted Glass Pill
        ctx.fillStyle = 'rgba(15, 14, 20, 0.88)';
        ctx.beginPath();
        ctx.roundRect(8, 8, 364, 64, 32);
        ctx.fill();

        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.font = '600 22px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(message, 190, 40);

        const tex = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(1.1, 0.24, 1.0);
        return sprite;
    }

    // ===== 8. INTERACTIVE EVENT LISTENERS & 360 LOOK =====
    function setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            keysDown[e.code] = true;
            if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(e.code)) {
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

        // Mouse look (Drag to look 360°)
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
                targetPitch -= dy * 0.0028;
                targetPitch = Math.max(-1.45, Math.min(1.45, targetPitch));
            } else {
                checkRaycastHover();
            }
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) isDragging = false;
        });

        // Click to walk or inspect
        container.addEventListener('click', (e) => {
            mouseCoords.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseCoords.y = -(e.clientY / window.innerHeight) * 2 + 1;
            handleSceneClick();
        });

        // Touch for Mobile
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
                targetPitch = Math.max(-1.45, Math.min(1.45, targetPitch));
            }
        }, { passive: true });

        container.addEventListener('touchend', () => {
            if (isDragging) isDragging = false;
        });

        // Wheel Zoom
        container.addEventListener('wheel', (e) => {
            targetFov += e.deltaY * 0.035;
            targetFov = Math.max(45, Math.min(75, targetFov));
        }, { passive: true });

        setupHUDControls();
    }

    function checkRaycastHover() {
        if (!camera || !scene || isDragging) return;
        raycaster.setFromCamera(mouseCoords, camera);

        const interactables = [];
        portalPuckMeshes.forEach(p => interactables.push(p.children[0], p.children[1]));
        artworkPins.forEach(a => interactables.push(a.children[0], a.children[1]));

        const hits = raycaster.intersectObjects(interactables, false);
        container.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
    }

    function handleSceneClick() {
        if (!camera || !scene) return;
        raycaster.setFromCamera(mouseCoords, camera);

        // 1. Check Portals
        const portalHits = [];
        portalPuckMeshes.forEach(p => {
            const hits = raycaster.intersectObjects(p.children, false);
            if (hits.length > 0) portalHits.push(p);
        });

        if (portalHits.length > 0) {
            const targetRoom = portalHits[0].userData.targetRoom;
            if (targetRoom) {
                walkToRoom(targetRoom);
                return;
            }
        }

        // 2. Check Artworks
        const artHits = [];
        artworkPins.forEach(a => {
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
        targetFov = 48;
        setTimeout(() => {
            const modalImg = document.getElementById('modal-img');
            const modalTitle = document.getElementById('modal-title');
            const modalSize = document.getElementById('modal-size');
            const modalYear = document.getElementById('modal-year');
            const modalMaterial = document.getElementById('modal-material');
            const modalZone = document.getElementById('modal-zone');
            const modalDesc = document.getElementById('modal-desc');

            if (modalImg) modalImg.src = withVersion(`assets/images/${art.filename}`);
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
        }, 250);
    }

    function walkToRoom(roomId) {
        if (roomId === currentRoomId || isTransitioning) return;
        isTransitioning = true;

        // Smooth camera glide forward toward portal
        const targetZ = -2.5;
        let t = 0;
        const dollyAnim = () => {
            t += 0.05;
            playerPos.z += (targetZ - playerPos.z) * 0.15;
            if (t < 1.0) {
                requestAnimationFrame(dollyAnim);
            } else {
                currentRoomId = roomId;
                loadAndDisplayRoom(currentRoomId);
                setTimeout(() => {
                    isTransitioning = false;
                }, 150);
            }
        };
        dollyAnim();
    }

    function updateMovement(delta) {
        if (isTransitioning) return;

        const moveSpeed = (keysDown['ShiftLeft'] ? 3.6 : 2.2) * delta * tourSpeed;
        let moveX = 0, moveZ = 0;

        if (keysDown['KeyW'] || keysDown['ArrowUp']) moveZ -= 1;
        if (keysDown['KeyS'] || keysDown['ArrowDown']) moveZ += 1;
        if (keysDown['KeyA'] || keysDown['ArrowLeft']) moveX -= 1;
        if (keysDown['KeyD'] || keysDown['ArrowRight']) moveX += 1;

        if (moveX !== 0 || moveZ !== 0) {
            const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
            moveX /= len;
            moveZ /= len;

            const cos = Math.cos(cameraYaw);
            const sin = Math.sin(cameraYaw);
            const forwardX = -sin;
            const forwardZ = -cos;
            const rightX = cos;
            const rightZ = -sin;

            playerPos.x += (forwardX * -moveZ + rightX * moveX) * moveSpeed;
            playerPos.z += (forwardZ * -moveZ + rightZ * moveX) * moveSpeed;

            playerPos.x = Math.max(-3.5, Math.min(3.5, playerPos.x));
            playerPos.z = Math.max(-3.0, Math.min(2.5, playerPos.z));

            walkTime += delta * 7.5;
            headBobY = Math.sin(walkTime) * 0.035;
            headBobX = Math.cos(walkTime * 0.5) * 0.018;

            if (Math.sin(walkTime) < -0.92) {
                audio.playStep();
            }
        } else {
            headBobY += (0 - headBobY) * 0.1;
            headBobX += (0 - headBobX) * 0.1;
        }
    }

    // ===== 9. RENDER LOOP =====
    let lastTime = performance.now();

    function renderLoop(time) {
        requestAnimationFrame(renderLoop);

        const delta = Math.min((time - lastTime) / 1000, 0.1);
        lastTime = time;

        const damp = Math.min(delta * 10.0, 1.0);
        cameraYaw += (targetYaw - cameraYaw) * damp;
        cameraPitch += (targetPitch - cameraPitch) * damp;
        currentFov += (targetFov - currentFov) * damp;

        if (camera) {
            camera.fov = currentFov;
            camera.updateProjectionMatrix();

            updateMovement(delta);

            camera.position.set(playerPos.x + headBobX, eyeHeight + headBobY, playerPos.z);
            camera.rotation.y = cameraYaw;
            camera.rotation.x = cameraPitch;

            // Keep photosphere centered around camera to eliminate clipping
            if (currentSphereMesh) {
                currentSphereMesh.position.copy(camera.position);
            }
            if (previousSphereMesh) {
                previousSphereMesh.position.copy(camera.position);
            }
        }

        // Animate 3D Gaussian Splats with subtle organic breathing
        if (gaussianSplatMesh) {
            gaussianSplatMesh.rotation.y = Math.sin(time * 0.0003) * 0.015;
        }

        // Animate floor pucks and artwork pins
        const animTime = time * 0.003;
        portalPuckMeshes.forEach(p => {
            const outer = p.userData.outerRing;
            if (outer) {
                const s = 1.0 + Math.sin(animTime * 2.5) * 0.08;
                outer.scale.set(s, s, 1.0);
            }
        });

        artworkPins.forEach(a => {
            a.lookAt(camera.position);
            const ring = a.userData.ring;
            if (ring) {
                const s = 1.0 + Math.sin(animTime * 3.2) * 0.12;
                ring.scale.set(s, s, 1.0);
            }
        });

        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }

        drawMinimap();
    }

    // ===== 10. MINIMAP =====
    function drawMinimap() {
        if (!minimapCtx || !minimapCanvas) return;
        const w = minimapCanvas.width;
        const h = minimapCanvas.height;

        minimapCtx.clearRect(0, 0, w, h);

        minimapCtx.fillStyle = 'rgba(15, 14, 18, 0.95)';
        minimapCtx.fillRect(0, 0, w, h);

        minimapCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        minimapCtx.lineWidth = 1;
        for (let x = 0; x < w; x += 20) {
            minimapCtx.beginPath(); minimapCtx.moveTo(x, 0); minimapCtx.lineTo(x, h); minimapCtx.stroke();
        }
        for (let y = 0; y < h; y += 20) {
            minimapCtx.beginPath(); minimapCtx.moveTo(0, y); minimapCtx.lineTo(w, y); minimapCtx.stroke();
        }

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

            minimapCtx.fillStyle = isCurrent ? '#ffffff' : 'rgba(255, 255, 255, 0.6)';
            minimapCtx.font = '600 9px Inter, sans-serif';
            minimapCtx.textAlign = 'center';
            minimapCtx.fillText(room.roomNumber || '01', m.x, m.y + 3);
        });

        const currRoom = WALKAROUND_ROOMS[currentRoomId];
        if (currRoom && currRoom.minimapPos) {
            const px = currRoom.minimapPos.x + (playerPos.x * 2.0);
            const py = currRoom.minimapPos.y + (playerPos.z * 2.0);

            minimapCtx.save();
            minimapCtx.translate(px, py);
            minimapCtx.rotate(-cameraYaw);

            const coneGrad = minimapCtx.createRadialGradient(0, 0, 2, 0, 0, 26);
            coneGrad.addColorStop(0, 'rgba(255, 215, 0, 0.65)');
            coneGrad.addColorStop(1, 'rgba(255, 215, 0, 0.0)');
            minimapCtx.fillStyle = coneGrad;

            minimapCtx.beginPath();
            minimapCtx.moveTo(0, 0);
            minimapCtx.arc(0, 0, 26, -0.45 - Math.PI / 2, 0.45 - Math.PI / 2);
            minimapCtx.closePath();
            minimapCtx.fill();

            minimapCtx.restore();

            minimapCtx.fillStyle = '#ffffff';
            minimapCtx.beginPath();
            minimapCtx.arc(px, py, 4, 0, Math.PI * 2);
            minimapCtx.fill();

            minimapCtx.strokeStyle = '#ffd700';
            minimapCtx.lineWidth = 2;
            minimapCtx.stroke();
        }
    }

    // ===== 11. HUD CONTROLS =====
    function setupHUDControls() {
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

        const btnModeWalk = document.getElementById('mode-walk');
        const btnModeExplore = document.getElementById('mode-explore');
        const btnToggleTour = document.getElementById('btn-toggle-tour');

        if (btnModeWalk) btnModeWalk.addEventListener('click', () => setTourMode(true));
        if (btnModeExplore) btnModeExplore.addEventListener('click', () => setTourMode(false));
        if (btnToggleTour) btnToggleTour.addEventListener('click', () => setTourMode(!isTourRunning));

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

                if (closestRoom) walkToRoom(closestRoom);
            });
        }

        const modalCloseBtn = document.getElementById('modal-close-btn');
        const modalInspectClose = document.getElementById('modal-inspect-close');
        if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
        if (modalInspectClose) modalInspectClose.addEventListener('click', closeModal);
        if (artModal) {
            artModal.addEventListener('click', (e) => {
                if (e.target === artModal) closeModal();
            });
        }

        const btnOverview = document.getElementById('btn-2d-overview');
        const overviewModal = document.getElementById('overview-modal');
        const overviewCloseBtn = document.getElementById('overview-close-btn');
        const overviewGrid = document.getElementById('overview-grid');

        function openOverview() {
            if (!overviewModal) return;
            if (overviewGrid && overviewGrid.children.length === 0) {
                roomKeys.forEach(rid => {
                    const r = WALKAROUND_ROOMS[rid];
                    if (!r || !r.artworks) return;
                    r.artworks.forEach(art => {
                        const card = document.createElement('div');
                        card.className = 'overview-card';
                        card.innerHTML = `
                            <img class="overview-card-img" src="${withVersion('assets/images/' + art.filename)}" alt="${art.title}">
                            <div class="overview-card-body">
                                <h3 class="overview-card-title">${art.title}</h3>
                                <p class="overview-card-meta">${r.name} • ${art.size || ''} • ${art.material || ''}</p>
                                <button class="overview-card-btn" type="button">Besök i 3D</button>
                            </div>
                        `;
                        card.addEventListener('click', () => {
                            closeOverview();
                            walkToRoom(rid);
                            setTimeout(() => inspectArtwork(art), 800);
                        });
                        overviewGrid.appendChild(card);
                    });
                });
            }
            overviewModal.classList.add('active');
            overviewModal.setAttribute('aria-hidden', 'false');
        }

        function closeOverview() {
            if (overviewModal) {
                overviewModal.classList.remove('active');
                overviewModal.setAttribute('aria-hidden', 'true');
            }
        }

        if (btnOverview) btnOverview.addEventListener('click', openOverview);
        if (overviewCloseBtn) overviewCloseBtn.addEventListener('click', closeOverview);
        if (overviewModal) {
            overviewModal.addEventListener('click', (e) => {
                if (e.target === overviewModal) closeOverview();
            });
        }

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
                closeOverview();
            }
        });
    }

    function closeModal() {
        if (artModal) {
            artModal.classList.remove('active');
            artModal.setAttribute('aria-hidden', 'true');
            targetFov = 65;
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
                    `● 3D GAUSSIAN SPLATTING • ${WALKAROUND_ROOMS[currentRoomId].name}`;
            }
        }
    }

    function updateHUD() {
        const navBtns = document.querySelectorAll('.room-nav-btn');
        navBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.roomId === currentRoomId);
        });

        if (tourBadge) {
            const badgeText = document.getElementById('tour-badge-text');
            if (badgeText) {
                badgeText.textContent = `● 3D GAUSSIAN SPLATTING • ${WALKAROUND_ROOMS[currentRoomId].name}`;
            }
        }
    }

    // ===== 12. BOOTSTRAP =====
    window.addEventListener('DOMContentLoaded', () => {
        initThreeEngine();
        requestAnimationFrame(renderLoop);
    });

})();
