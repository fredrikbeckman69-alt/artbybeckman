/**
 * Walk Around — 3D Virtual Exhibition Engine
 * Scale: 1 unit = 1.0 meter (Physical 1:1 Scale)
 * Art by Beckman
 */

(function() {
    'use strict';

    // ===== 1. WEBGL CAPABILITY CHECK =====
    function isWebGLAvailable() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    if (!isWebGLAvailable()) {
        const fallback = document.getElementById('webgl-fallback');
        if (fallback) fallback.style.display = 'flex';
        const loader = document.getElementById('walkaround-loader');
        if (loader) loader.style.display = 'none';
        return;
    }

    // ===== 2. STATE & CONFIGURATION =====
    const container = document.getElementById('walkaround-canvas-container');
    const loader = document.getElementById('walkaround-loader');
    const loaderBar = document.querySelector('.loader-bar-fill');
    const hoverPrompt = document.getElementById('walkaround-hover-prompt');
    const artModal = document.getElementById('art-modal');
    const overviewModal = document.getElementById('overview-modal');
    const minimapCanvas = document.getElementById('walkaround-minimap');
    const minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;

    let scene, camera, renderer;
    let clock = new THREE.Clock();
    let isLocked = false;
    let activeArtwork = null;
    let isTransitioning = false;
    let transitionProgress = 0;
    let transitionStartPos = new THREE.Vector3();
    let transitionTargetPos = new THREE.Vector3();
    let transitionStartRot = { yaw: 0, pitch: 0 };
    let transitionTargetRot = { yaw: 0, pitch: 0 };
    let transitionDuration = 1.2;

    // Movement state
    const EYE_HEIGHT = 1.65; // Standard human standing eye level (1.65m)
    const PLAYER_RADIUS = 0.35; // Collision radius (35cm)
    const WALK_SPEED = 3.2; // meters per second
    const keys = { forward: false, backward: false, left: false, right: false };
    let moveVelocity = new THREE.Vector3();
    let cameraYaw = 0;
    let cameraPitch = 0;
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    // Interactive Objects Arrays
    const interactiveArtworks = [];
    const interactiveHotspots = [];
    const collisionBoxes = [];
    const hotspotMeshes = [];

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ===== 3. INITIALIZATION =====
    function init() {
        // Scene setup
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xefede8);
        scene.fog = new THREE.FogExp2(0xefede8, 0.022);

        // Camera setup (65 FOV for natural architectural perspective)
        camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.05, 60);
        camera.position.set(-2.0, EYE_HEIGHT, 7.8);
        camera.rotation.order = 'YXZ';

        // Renderer setup
        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // Build Architectural Environment
        buildArchitecture();
        buildStarckFurniture();
        setupLighting();
        spawnCuratedArtworks();
        spawnFloorHotspots();

        // Setup Controls & Event Listeners
        setupControls();
        setupUI();
        setup2DOverview();

        // Responsive resize
        window.addEventListener('resize', onWindowResize);

        // Hide loader smoothly
        setTimeout(() => {
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 600);
            }
        }, 1200);

        // Start render loop
        animate();
    }

    // ===== 4. ARCHITECTURAL ENVIRONMENT (1 unit = 1.0m) =====
    function buildArchitecture() {
        const wallMat = new THREE.MeshStandardMaterial({
            color: 0xf5f3ee,
            roughness: 0.90,
            metalness: 0.02
        });

        const accentWallMat = new THREE.MeshStandardMaterial({
            color: 0xedeae3,
            roughness: 0.88,
            metalness: 0.02
        });

        const ceilingMat = new THREE.MeshStandardMaterial({
            color: 0xfaf9f6,
            roughness: 0.95
        });

        // Terrazzo / Pale Microcement Floor
        const floorGeo = new THREE.PlaneGeometry(30, 30);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0xe2ded7,
            roughness: 0.38,
            metalness: 0.08
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        scene.add(floor);

        // Ceiling at 3.00m height
        const ceilingGeo = new THREE.PlaneGeometry(30, 30);
        const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = 3.00;
        scene.add(ceiling);

        // Brushed Stainless Steel Baseboards (0.10m high)
        const steelMat = new THREE.MeshStandardMaterial({
            color: 0xd8dadf,
            metalness: 0.92,
            roughness: 0.24
        });

        // Helper function to create a solid wall with collision
        function createWall(x, z, width, depth, height = 3.0, mat = wallMat) {
            const wallGeo = new THREE.BoxGeometry(width, height, depth);
            const wall = new THREE.Mesh(wallGeo, mat);
            wall.position.set(x, height / 2, z);
            wall.castShadow = true;
            wall.receiveShadow = true;
            scene.add(wall);

            // Add stainless steel baseboard strip at base (0.08m height)
            const trimHeight = 0.08;
            const trimDepth = depth > width ? depth : depth + 0.02;
            const trimWidth = width > depth ? width : width + 0.02;
            const trimGeo = new THREE.BoxGeometry(trimWidth, trimHeight, trimDepth);
            const trim = new THREE.Mesh(trimGeo, steelMat);
            trim.position.set(x, trimHeight / 2, z);
            scene.add(trim);

            // Collision boundary
            collisionBoxes.push({
                minX: x - width / 2 - PLAYER_RADIUS,
                maxX: x + width / 2 + PLAYER_RADIUS,
                minZ: z - depth / 2 - PLAYER_RADIUS,
                maxZ: z + depth / 2 + PLAYER_RADIUS
            });
            return wall;
        }

        // --- ENTRANCE VESTIBULE WALLS ---
        // South boundary wall of Entrance
        createWall(-2.0, 8.6, 4.2, 0.2);
        // West boundary wall of Entrance
        createWall(-4.1, 6.3, 0.2, 4.8);
        // East wall separating Entrance from service area
        createWall(0.1, 6.5, 0.2, 4.4);

        // --- GRAND SALON WALLS ---
        // West main gallery wall (housing Origami & Pink Dress)
        createWall(-5.1, -0.2, 0.2, 8.4, 3.0, accentWallMat);
        // South salon wall (housing My Heart Has Teeth)
        createWall(2.5, 4.1, 5.0, 0.2, 3.0, accentWallMat);
        // South corner return
        createWall(-4.5, 4.1, 1.4, 0.2);

        // --- NORTH PANORAMIC WINDOW WALL (Deep recessed bays) ---
        // North solid structural pillars
        createWall(-5.0, -4.6, 0.4, 0.4);
        createWall(0.0, -4.6, 0.4, 0.4);
        createWall(6.5, -4.6, 0.4, 0.4);
        // North wall top lintel over windows
        const lintelGeo = new THREE.BoxGeometry(12.0, 0.4, 0.4);
        const lintel = new THREE.Mesh(lintelGeo, wallMat);
        lintel.position.set(0.75, 2.8, -4.6);
        scene.add(lintel);

        // North window glass with horizon light
        const glassMat = new THREE.MeshPhysicalMaterial({
            color: 0xebf2fa,
            transparent: true,
            opacity: 0.35,
            roughness: 0.1,
            metalness: 0.1,
            transmission: 0.7
        });
        const glassGeo = new THREE.PlaneGeometry(11.6, 2.6);
        const windowPane = new THREE.Mesh(glassGeo, glassMat);
        windowPane.position.set(0.75, 1.3, -4.58);
        scene.add(windowPane);

        // Soft sky backdrop behind windows
        const backdropGeo = new THREE.PlaneGeometry(24, 10);
        const backdropMat = new THREE.MeshBasicMaterial({ color: 0xcedae8 });
        const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
        backdrop.position.set(0.75, 3.0, -8.0);
        scene.add(backdrop);

        // North boundary collision
        collisionBoxes.push({ minX: -6.0, maxX: 7.0, minZ: -4.8, maxZ: -4.4 });

        // --- MATPLATS / DINING WALLS ---
        // East wall of Dining (housing Daylight)
        createWall(6.1, -1.5, 0.2, 6.0, 3.0, accentWallMat);
        // Architectural partition between Salon and Dining with stainless opening
        createWall(1.5, 1.5, 0.2, 2.4);

        // Sculptural brushed stainless column (Starck architectural touch)
        const colGeo = new THREE.CylinderGeometry(0.18, 0.18, 3.0, 32);
        const column = new THREE.Mesh(colGeo, steelMat);
        column.position.set(1.5, 1.5, 0.2);
        column.castShadow = true;
        scene.add(column);
        collisionBoxes.push({ minX: 1.1, maxX: 1.9, minZ: -0.2, maxZ: 0.6 });

        // Outer bounds failsafe collision
        collisionBoxes.push({ minX: -8.0, maxX: 8.0, minZ: 8.7, maxZ: 10.0 });
    }

    // ===== 5. STARCK-INSPIRED FURNITURE (Carefully Curated & Scaled) =====
    function buildStarckFurniture() {
        const chromeMat = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 0.96,
            roughness: 0.15
        });

        const darkCharcoalMat = new THREE.MeshStandardMaterial({
            color: 0x222224,
            roughness: 0.75
        });

        const ghostChairMat = new THREE.MeshPhysicalMaterial({
            color: 0x99a2b0,
            transparent: true,
            opacity: 0.45,
            roughness: 0.15,
            metalness: 0.1,
            transmission: 0.8
        });

        const oakMat = new THREE.MeshStandardMaterial({
            color: 0xd6cbb8,
            roughness: 0.6
        });

        // 1. Lounge Sofa (Modern, low architectural profile in front of South wall)
        // Position: x = 2.5, z = -0.2 (leaves 3.8m open distance to My Heart Has Teeth)
        const sofaGroup = new THREE.Group();
        const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.38, 1.0), darkCharcoalMat);
        sofaBase.position.y = 0.19;
        sofaBase.castShadow = true;
        sofaBase.receiveShadow = true;
        sofaGroup.add(sofaBase);

        const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.35, 0.25), darkCharcoalMat);
        sofaBack.position.set(0, 0.45, -0.38);
        sofaBack.castShadow = true;
        sofaGroup.add(sofaBack);

        sofaGroup.position.set(2.5, 0, -0.3);
        scene.add(sofaGroup);
        collisionBoxes.push({ minX: 1.0, maxX: 4.0, minZ: -1.0, maxZ: 0.4 });

        // 2. Starck Louis Ghost Armchair (Translucent polycarbonate)
        const chairGroup = new THREE.Group();
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.5), ghostChairMat);
        seat.position.y = 0.44;
        chairGroup.add(seat);

        const back = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 24), ghostChairMat);
        back.rotation.x = Math.PI / 2;
        back.position.set(0, 0.76, -0.22);
        chairGroup.add(back);

        // Legs (Chrome thin legs)
        const legGeo = new THREE.CylinderGeometry(0.015, 0.012, 0.44);
        [[-0.22, -0.2], [0.22, -0.2], [-0.22, 0.2], [0.22, 0.2]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(legGeo, chromeMat);
            leg.position.set(lx, 0.22, lz);
            chairGroup.add(leg);
        });
        chairGroup.position.set(0.6, 0, 0.6);
        chairGroup.rotation.y = Math.PI / 4;
        scene.add(chairGroup);

        // 3. Low Minimalist Coffee Table
        const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.6), chromeMat);
        tableTop.position.set(2.5, 0.32, 0.8);
        tableTop.castShadow = true;
        scene.add(tableTop);

        // 4. Dining Table & Chairs in Matplats (x = 3.8, z = -1.5)
        const diningGroup = new THREE.Group();
        const diningTop = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.06, 0.9), oakMat);
        diningTop.position.y = 0.74;
        diningTop.castShadow = true;
        diningGroup.add(diningTop);

        const trestleGeo = new THREE.BoxGeometry(0.06, 0.74, 0.8);
        const trestleL = new THREE.Mesh(trestleGeo, chromeMat);
        trestleL.position.set(-0.8, 0.37, 0);
        diningGroup.add(trestleL);
        const trestleR = new THREE.Mesh(trestleGeo, chromeMat);
        trestleR.position.set(0.8, 0.37, 0);
        diningGroup.add(trestleR);

        diningGroup.position.set(3.8, 0, -1.5);
        scene.add(diningGroup);
        collisionBoxes.push({ minX: 2.6, maxX: 5.0, minZ: -2.2, maxZ: -0.8 });

        // 5. Brushed Stainless Steel Credenza below Daylight (x = 5.85, z = -1.5)
        const credenzaGeo = new THREE.BoxGeometry(0.40, 0.60, 1.8);
        const credenza = new THREE.Mesh(credenzaGeo, chromeMat);
        credenza.position.set(5.75, 0.30, -1.5);
        credenza.castShadow = true;
        scene.add(credenza);
        collisionBoxes.push({ minX: 5.4, maxX: 6.1, minZ: -2.6, maxZ: -0.4 });
    }

    // ===== 6. LIGHTING DESIGN (sRGB, Neutral 5000K Gallery Lighting) =====
    function setupLighting() {
        // Soft ambient fill
        const ambient = new THREE.AmbientLight(0xffffff, 0.55);
        scene.add(ambient);

        // Hemisphere sky/floor bounce
        const hemi = new THREE.HemisphereLight(0xf4f6ff, 0xdfdad2, 0.65);
        scene.add(hemi);

        // Directional soft daylight from North windows
        const sun = new THREE.DirectionalLight(0xfffdfa, 0.75);
        sun.position.set(1.0, 4.5, -6.0);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 1024;
        sun.shadow.mapSize.height = 1024;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 20;
        sun.shadow.camera.left = -8;
        sun.shadow.camera.right = 8;
        sun.shadow.camera.top = 6;
        sun.shadow.camera.bottom = -4;
        sun.shadow.bias = -0.0005;
        scene.add(sun);
    }

    // ===== 7. CURATED ARTWORKS (Exact Metric Scale 1:1) =====
    function spawnCuratedArtworks() {
        const textureLoader = new THREE.TextureLoader();
        const steelPlaqueMat = new THREE.MeshStandardMaterial({
            color: 0xc8cad0,
            metalness: 0.90,
            roughness: 0.25
        });

        WALKAROUND_CURATED_ROOM.forEach((art) => {
            const artGroup = new THREE.Group();

            // 1. Artwork Canvas Mesh (Vibrant true-color rendering)
            const canvasGeo = new THREE.PlaneGeometry(art.widthM, art.heightM);
            const canvasMat = new THREE.MeshBasicMaterial({
                color: 0xffffff
            });

            // Load high quality artwork texture
            const imagePath = encodeURI(`assets/images/${art.filename}`);
            textureLoader.load(imagePath, (tex) => {
                tex.encoding = THREE.sRGBEncoding;
                tex.generateMipmaps = false;
                tex.minFilter = THREE.LinearFilter;
                tex.magFilter = THREE.LinearFilter;
                canvasMat.map = tex;
                canvasMat.needsUpdate = true;
            });

            const canvasMesh = new THREE.Mesh(canvasGeo, canvasMat);
            canvasMesh.position.set(0, 0, 0.022);
            artGroup.add(canvasMesh);

            // 2. Stretched Canvas Frame (0.035m / 3.5cm deep dark charcoal edges)
            const frameGeo = new THREE.BoxGeometry(art.widthM + 0.008, art.heightM + 0.008, 0.035);
            const frameMat = new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: 0.8 });
            const frameMesh = new THREE.Mesh(frameGeo, frameMat);
            frameMesh.position.set(0, 0, 0.002);
            artGroup.add(frameMesh);

            // 3. Brushed Stainless Steel Plaque below canvas
            const plaqueGeo = new THREE.BoxGeometry(0.18, 0.045, 0.008);
            const plaque = new THREE.Mesh(plaqueGeo, steelPlaqueMat);
            const plaqueY = -(art.heightM / 2) - 0.09;
            plaque.position.set(0, plaqueY, 0.015);
            artGroup.add(plaque);

            // 4. Directional Neutral Museum Spotlight
            const spot = new THREE.SpotLight(0xfffaee, 1.4);
            spot.position.set(0, 1.1, 1.6);
            spot.angle = Math.PI / 4;
            spot.penumbra = 0.6;
            spot.distance = 4.5;
            spot.decay = 1.2;
            spot.target = artGroup;
            artGroup.add(spot);

            // 5. Invisible Hitbox for reliable raycast click & hover
            const hitGeo = new THREE.BoxGeometry(art.widthM * 1.1, art.heightM * 1.1, 0.4);
            const hitMat = new THREE.MeshBasicMaterial({ visible: false });
            const hitMesh = new THREE.Mesh(hitGeo, hitMat);
            hitMesh.userData = { artworkData: art };
            artGroup.add(hitMesh);
            interactiveArtworks.push(hitMesh);

            // Spatial Placement on Wall
            artGroup.position.set(
                art.wallPlacement.position[0],
                art.wallPlacement.position[1],
                art.wallPlacement.position[2]
            );
            artGroup.rotation.y = art.wallPlacement.rotationY;

            scene.add(artGroup);
        });
    }

    // ===== 8. INTERACTIVE FLOOR HOTSPOTS =====
    function spawnFloorHotspots() {
        const ringGeo = new THREE.RingGeometry(0.28, 0.36, 32);
        const innerGeo = new THREE.CircleGeometry(0.10, 32);

        WALKAROUND_HOTSPOTS.forEach((spot) => {
            const spotGroup = new THREE.Group();

            const ringMat = new THREE.MeshBasicMaterial({
                color: 0xd81b60,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.75
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = -Math.PI / 2;
            spotGroup.add(ring);

            const innerMat = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9
            });
            const inner = new THREE.Mesh(innerGeo, innerMat);
            inner.rotation.x = -Math.PI / 2;
            inner.position.y = 0.001;
            spotGroup.add(inner);

            spotGroup.position.set(spot.pos[0], 0.015, spot.pos[2]);

            // Hitbox for clicking
            const hitGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
            const hitMat = new THREE.MeshBasicMaterial({ visible: false });
            const hit = new THREE.Mesh(hitGeo, hitMat);
            hit.position.y = 0.2;
            hit.userData = { hotspotData: spot };
            spotGroup.add(hit);

            interactiveHotspots.push(hit);
            hotspotMeshes.push(ring);
            scene.add(spotGroup);
        });
    }

    // ===== 9. CAMERA TRANSITIONS & HOTSPOT TELEPORT =====
    function moveToHotspot(hotspotId) {
        const spot = WALKAROUND_HOTSPOTS.find(h => h.id === hotspotId);
        if (!spot) return;

        // Calculate target camera rotation
        const dx = spot.target[0] - spot.pos[0];
        const dz = spot.target[2] - spot.pos[2];
        const targetYaw = Math.atan2(-dx, -dz);
        const dy = spot.target[1] - spot.pos[1];
        const distHoriz = Math.sqrt(dx * dx + dz * dz);
        const targetPitch = Math.atan2(dy, distHoriz);

        startCameraTransition(
            new THREE.Vector3(spot.pos[0], EYE_HEIGHT, spot.pos[2]),
            targetYaw,
            targetPitch
        );

        // Update active button state
        document.querySelectorAll('.room-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.hotspot === hotspotId);
        });
    }

    function inspectArtwork(art) {
        activeArtwork = art;
        const wp = art.wallPlacement;
        const targetPos = new THREE.Vector3(wp.viewpoint[0], EYE_HEIGHT, wp.viewpoint[2]);

        // Look directly at center of painting
        const dx = wp.position[0] - wp.viewpoint[0];
        const dz = wp.position[2] - wp.viewpoint[2];
        const targetYaw = Math.atan2(-dx, -dz);
        const dy = wp.position[1] - EYE_HEIGHT;
        const distHoriz = Math.sqrt(dx * dx + dz * dz);
        const targetPitch = Math.atan2(dy, distHoriz);

        startCameraTransition(targetPos, targetYaw, targetPitch, () => {
            openArtworkModal(art);
        });
    }

    function startCameraTransition(targetPos, targetYaw, targetPitch, onComplete = null) {
        if (prefersReducedMotion) {
            camera.position.copy(targetPos);
            cameraYaw = targetYaw;
            cameraPitch = targetPitch;
            if (onComplete) onComplete();
            return;
        }

        transitionStartPos.copy(camera.position);
        transitionTargetPos.copy(targetPos);
        transitionStartRot = { yaw: cameraYaw, pitch: cameraPitch };

        // Normalize yaw angle delta
        let deltaYaw = targetYaw - cameraYaw;
        while (deltaYaw > Math.PI) deltaYaw -= Math.PI * 2;
        while (deltaYaw < -Math.PI) deltaYaw += Math.PI * 2;
        transitionTargetRot = { yaw: cameraYaw + deltaYaw, pitch: targetPitch };

        transitionProgress = 0;
        isTransitioning = true;
        window._transitionCallback = onComplete;
    }

    // ===== 10. CONTROLS & EVENT LISTENERS =====
    function setupControls() {
        // Keyboard inputs
        window.addEventListener('keydown', (e) => {
            if (artModal && artModal.classList.contains('active')) {
                if (e.key === 'Escape') closeArtworkModal();
                return;
            }
            if (overviewModal && overviewModal.classList.contains('active')) {
                if (e.key === 'Escape') close2DOverview();
                return;
            }

            switch(e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    keys.forward = true; break;
                case 'KeyS':
                case 'ArrowDown':
                    keys.backward = true; break;
                case 'KeyA':
                case 'ArrowLeft':
                    keys.left = true; break;
                case 'KeyD':
                case 'ArrowRight':
                    keys.right = true; break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    keys.forward = false; break;
                case 'KeyS':
                case 'ArrowDown':
                    keys.backward = false; break;
                case 'KeyA':
                case 'ArrowLeft':
                    keys.left = false; break;
                case 'KeyD':
                case 'ArrowRight':
                    keys.right = false; break;
            }
        });

        // Mouse Drag to look around
        const domEl = renderer.domElement;
        domEl.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left click
                isDragging = true;
                prevMousePos = { x: e.clientX, y: e.clientY };
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (isDragging) {
                // If it was a short click without significant drag, perform raycast inspection
                const moveDist = Math.hypot(e.clientX - prevMousePos.x, e.clientY - prevMousePos.y);
                if (moveDist < 6) {
                    performClickRaycast(e.clientX, e.clientY);
                }
            }
            isDragging = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (isDragging && !isTransitioning) {
                const deltaX = e.clientX - prevMousePos.x;
                const deltaY = e.clientY - prevMousePos.y;
                prevMousePos = { x: e.clientX, y: e.clientY };

                const sensitivity = 0.0028;
                cameraYaw -= deltaX * sensitivity;
                cameraPitch -= deltaY * sensitivity;
                cameraPitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, cameraPitch));
            }

            // Update mouse coordinates for hover raycast
            mouseCoord.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseCoord.y = -(e.clientY / window.innerHeight) * 2 + 1;
            updateHoverRaycast();
        });

        // Touch support for mobile / tablet
        let touchStartPos = { x: 0, y: 0 };
        let touchHasMoved = false;

        domEl.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                touchHasMoved = false;
            }
        }, { passive: true });

        domEl.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && !isTransitioning) {
                const touch = e.touches[0];
                const deltaX = touch.clientX - prevMousePos.x;
                const deltaY = touch.clientY - prevMousePos.y;
                prevMousePos = { x: touch.clientX, y: touch.clientY };

                if (Math.hypot(touch.clientX - touchStartPos.x, touch.clientY - touchStartPos.y) > 10) {
                    touchHasMoved = true;
                }

                const sensitivity = 0.0035;
                cameraYaw -= deltaX * sensitivity;
                cameraPitch -= deltaY * sensitivity;
                cameraPitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, cameraPitch));
            }
        }, { passive: true });

        domEl.addEventListener('touchend', (e) => {
            if (!touchHasMoved && e.changedTouches.length === 1) {
                const touch = e.changedTouches[0];
                performClickRaycast(touch.clientX, touch.clientY);
            }
        });
    }

    // ===== 11. RAYCASTING & INTERACTION =====
    function updateHoverRaycast() {
        if (isDragging || isTransitioning) {
            if (hoverPrompt) hoverPrompt.classList.remove('visible');
            document.body.style.cursor = 'default';
            return;
        }

        raycaster.setFromCamera(mouseCoord, camera);
        const artHits = raycaster.intersectObjects(interactiveArtworks);
        const spotHits = raycaster.intersectObjects(interactiveHotspots);

        if (artHits.length > 0) {
            const artData = artHits[0].object.userData.artworkData;
            document.body.style.cursor = 'pointer';
            if (hoverPrompt) {
                hoverPrompt.textContent = `Klicka för att inspektera "${artData.title}" (${artData.size})`;
                hoverPrompt.classList.add('visible');
            }
        } else if (spotHits.length > 0) {
            const spotData = spotHits[0].object.userData.hotspotData;
            document.body.style.cursor = 'pointer';
            if (hoverPrompt) {
                hoverPrompt.textContent = `Gå till: ${spotData.label}`;
                hoverPrompt.classList.add('visible');
            }
        } else {
            document.body.style.cursor = 'default';
            if (hoverPrompt) hoverPrompt.classList.remove('visible');
        }
    }

    function performClickRaycast(clientX, clientY) {
        mouseCoord.x = (clientX / window.innerWidth) * 2 - 1;
        mouseCoord.y = -(clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouseCoord, camera);

        // Check artwork hit first
        const artHits = raycaster.intersectObjects(interactiveArtworks);
        if (artHits.length > 0) {
            const artData = artHits[0].object.userData.artworkData;
            inspectArtwork(artData);
            return;
        }

        // Check hotspot hit
        const spotHits = raycaster.intersectObjects(interactiveHotspots);
        if (spotHits.length > 0) {
            const spotData = spotHits[0].object.userData.hotspotData;
            moveToHotspot(spotData.id);
            return;
        }
    }

    // ===== 12. UI & MODAL MANAGEMENT =====
    function setupUI() {
        // Hotspot buttons in HUD
        document.querySelectorAll('.room-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const hotspotId = btn.dataset.hotspot;
                if (hotspotId) moveToHotspot(hotspotId);
            });
        });

        // Artwork Modal Close Buttons
        const modalCloseBtn = document.getElementById('modal-close-btn');
        const modalSecondaryClose = document.getElementById('modal-inspect-close');
        if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeArtworkModal);
        if (modalSecondaryClose) modalSecondaryClose.addEventListener('click', closeArtworkModal);

        if (artModal) {
            artModal.addEventListener('click', (e) => {
                if (e.target === artModal) closeArtworkModal();
            });
        }
    }

    function openArtworkModal(art) {
        if (!artModal) return;
        document.getElementById('modal-img').src = `assets/images/${art.filename}`;
        document.getElementById('modal-title').textContent = art.title;
        document.getElementById('modal-size').textContent = `${art.size} (Skala 1:1)`;
        document.getElementById('modal-year').textContent = art.year;
        document.getElementById('modal-material').textContent = art.material;
        document.getElementById('modal-zone').textContent = art.zone;
        document.getElementById('modal-desc').textContent = art.description;

        // Deep link to gallery.html?id=...
        const galleryLink = document.getElementById('modal-gallery-link');
        if (galleryLink) {
            galleryLink.href = `gallery.html?id=${art.id}`;
        }

        artModal.classList.add('active');
        artModal.setAttribute('aria-hidden', 'false');
    }

    function closeArtworkModal() {
        if (!artModal) return;
        artModal.classList.remove('active');
        artModal.setAttribute('aria-hidden', 'true');
    }

    // ===== 13. 2D GALLERY OVERVIEW (Fallback & Accessibility) =====
    function setup2DOverview() {
        const btn2D = document.getElementById('btn-2d-overview');
        const fallbackBtn = document.getElementById('fallback-open-2d');
        const closeBtn = document.getElementById('overview-close-btn');
        const grid = document.getElementById('overview-grid');

        function openOverview() {
            if (!overviewModal) return;
            overviewModal.classList.add('active');
            overviewModal.setAttribute('aria-hidden', 'false');
        }

        if (btn2D) btn2D.addEventListener('click', openOverview);
        if (fallbackBtn) fallbackBtn.addEventListener('click', openOverview);
        if (closeBtn) closeBtn.addEventListener('click', close2DOverview);

        if (overviewModal) {
            overviewModal.addEventListener('click', (e) => {
                if (e.target === overviewModal) close2DOverview();
            });
        }

        // Populate 2D grid with curated artworks
        if (grid) {
            grid.innerHTML = WALKAROUND_CURATED_ROOM.map(art => `
                <div class="overview-card">
                    <img class="overview-card-img" src="assets/images/${art.filename}" alt="${art.title}" loading="lazy">
                    <div class="overview-card-body">
                        <h3 class="overview-card-title">${art.title}</h3>
                        <div class="overview-card-meta">
                            <strong>${art.size}</strong> • ${art.year}<br>
                            <em>${art.material}</em>
                        </div>
                        <p style="font-size:0.85rem; color:#666; margin-bottom:12px;">${art.description}</p>
                        <a href="gallery.html?id=${art.id}" class="overview-card-btn">Öppna i Galleriet &rarr;</a>
                    </div>
                </div>
            `).join('');
        }
    }

    function close2DOverview() {
        if (!overviewModal) return;
        overviewModal.classList.remove('active');
        overviewModal.setAttribute('aria-hidden', 'true');
    }

    // ===== 14. MINIMAP RADAR =====
    function drawMinimap() {
        if (!minimapCtx) return;
        const w = minimapCanvas.width;
        const h = minimapCanvas.height;

        minimapCtx.clearRect(0, 0, w, h);
        minimapCtx.fillStyle = 'rgba(24, 25, 30, 0.88)';
        minimapCtx.fillRect(0, 0, w, h);

        // Map coordinate space (-6 to +7 X, -5 to +9 Z) to canvas
        const scaleX = w / 14;
        const scaleZ = h / 15;
        const offsetX = 6.5 * scaleX;
        const offsetZ = 5.2 * scaleZ;

        function toScreen(x, z) {
            return {
                x: offsetX + x * scaleX,
                y: offsetZ + z * scaleZ
            };
        }

        // Draw Room Boundaries
        minimapCtx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        minimapCtx.lineWidth = 1.5;

        // Entrance
        const e1 = toScreen(-4.0, 8.5);
        const e2 = toScreen(0.0, 4.0);
        minimapCtx.strokeRect(e1.x, e2.y, (0.0 - (-4.0)) * scaleX, (8.5 - 4.0) * scaleZ);

        // Salon
        const s1 = toScreen(-5.0, 4.0);
        minimapCtx.strokeRect(s1.x, toScreen(0, -4.5).y, 11.5 * scaleX, 8.5 * scaleZ);

        // Draw Artworks on Minimap
        WALKAROUND_CURATED_ROOM.forEach(art => {
            const p = toScreen(art.wallPlacement.position[0], art.wallPlacement.position[2]);
            minimapCtx.fillStyle = '#d81b60';
            minimapCtx.fillRect(p.x - 2.5, p.y - 2.5, 5, 5);
        });

        // Draw Player Marker & View Cone
        const playerScreen = toScreen(camera.position.x, camera.position.z);

        // View cone
        minimapCtx.fillStyle = 'rgba(216, 27, 96, 0.22)';
        minimapCtx.beginPath();
        minimapCtx.moveTo(playerScreen.x, playerScreen.y);
        const coneAngle = 0.55;
        const coneDist = 26;
        const angle = cameraYaw + Math.PI;
        minimapCtx.arc(playerScreen.x, playerScreen.y, coneDist, angle - coneAngle, angle + coneAngle);
        minimapCtx.closePath();
        minimapCtx.fill();

        // Player dot
        minimapCtx.fillStyle = '#ffffff';
        minimapCtx.beginPath();
        minimapCtx.arc(playerScreen.x, playerScreen.y, 4, 0, Math.PI * 2);
        minimapCtx.fill();
        minimapCtx.strokeStyle = '#d81b60';
        minimapCtx.lineWidth = 2;
        minimapCtx.stroke();
    }

    // ===== 15. MAIN ANIMATION & PHYSICS LOOP =====
    function animate() {
        requestAnimationFrame(animate);

        const delta = Math.min(clock.getDelta(), 0.08);

        // 1. Camera Transition (Smooth Gliding to Hotspot or Artwork)
        if (isTransitioning) {
            transitionProgress += delta / transitionDuration;
            if (transitionProgress >= 1) {
                transitionProgress = 1;
                isTransitioning = false;
                camera.position.copy(transitionTargetPos);
                cameraYaw = transitionTargetRot.yaw;
                cameraPitch = transitionTargetRot.pitch;
                if (window._transitionCallback) {
                    window._transitionCallback();
                    window._transitionCallback = null;
                }
            } else {
                // Smooth Quadratic Easing
                const t = transitionProgress;
                const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                camera.position.lerpVectors(transitionStartPos, transitionTargetPos, ease);
                cameraYaw = THREE.MathUtils.lerp(transitionStartRot.yaw, transitionTargetRot.yaw, ease);
                cameraPitch = THREE.MathUtils.lerp(transitionStartRot.pitch, transitionTargetRot.pitch, ease);
            }
        }

        // 2. Free Movement (WASD / Arrow Keys)
        if (!isTransitioning && (keys.forward || keys.backward || keys.left || keys.right)) {
            const moveDir = new THREE.Vector3();
            if (keys.forward) moveDir.z -= 1;
            if (keys.backward) moveDir.z += 1;
            if (keys.left) moveDir.x -= 1;
            if (keys.right) moveDir.x += 1;
            moveDir.normalize();

            // Rotate move direction with camera yaw
            const moveAngle = cameraYaw;
            const targetVX = (moveDir.x * Math.cos(moveAngle) - moveDir.z * Math.sin(moveAngle)) * WALK_SPEED;
            const targetVZ = (moveDir.x * Math.sin(moveAngle) + moveDir.z * Math.cos(moveAngle)) * WALK_SPEED;

            moveVelocity.x = THREE.MathUtils.lerp(moveVelocity.x, targetVX, 0.2);
            moveVelocity.z = THREE.MathUtils.lerp(moveVelocity.z, targetVZ, 0.2);

            // Compute candidate next position
            const nextX = camera.position.x + moveVelocity.x * delta;
            const nextZ = camera.position.z + moveVelocity.z * delta;

            // Collision check against bounding boxes
            let collideX = false;
            let collideZ = false;

            for (let i = 0; i < collisionBoxes.length; i++) {
                const box = collisionBoxes[i];
                if (nextX >= box.minX && nextX <= box.maxX && camera.position.z >= box.minZ && camera.position.z <= box.maxZ) {
                    collideX = true;
                }
                if (camera.position.x >= box.minX && camera.position.x <= box.maxX && nextZ >= box.minZ && nextZ <= box.maxZ) {
                    collideZ = true;
                }
            }

            if (!collideX) camera.position.x = nextX;
            if (!collideZ) camera.position.z = nextZ;
            camera.position.y = EYE_HEIGHT; // Always maintain exact eye height
        } else if (!isTransitioning) {
            moveVelocity.set(0, 0, 0);
        }

        // Apply Camera Rotation
        camera.rotation.set(cameraPitch, cameraYaw, 0);

        // Pulse floor hotspots gently
        const time = clock.getElapsedTime();
        hotspotMeshes.forEach(mesh => {
            const scale = 1.0 + Math.sin(time * 2.5) * 0.05;
            mesh.scale.set(scale, scale, 1);
        });

        // Render 3D scene
        renderer.render(scene, camera);

        // Update 2D Minimap
        drawMinimap();
    }

    function onWindowResize() {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Initialize once DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
