/**
 * Walk Around — 3D Virtual Exhibition Engine
 * Scale: 1 unit = 1.0 meter (Physical 1:1 Scale)
 * Complete Penthouse Exhibition
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
    const hoverPrompt = document.getElementById('walkaround-hover-prompt');
    const artModal = document.getElementById('art-modal');
    const overviewModal = document.getElementById('overview-modal');
    const minimapCanvas = document.getElementById('walkaround-minimap');
    const minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;

    let scene, camera, renderer;
    let clock = new THREE.Clock();
    let activeArtwork = null;
    let isTransitioning = false;
    let transitionProgress = 0;
    const transitionStartPos = new THREE.Vector3();
    const transitionTargetPos = new THREE.Vector3();
    let transitionStartRot = { yaw: 0, pitch: 0 };
    let transitionTargetRot = { yaw: 0, pitch: 0 };
    let transitionDuration = 1.2;

    // Movement configuration (Exact Physical Scale)
    const EYE_HEIGHT = 1.65; // Standard human standing eye level (1.65m)
    const PLAYER_RADIUS = 0.35; // Collision radius (35cm)
    const WALK_SPEED = 3.4; // meters per second
    const keys = { forward: false, backward: false, left: false, right: false };
    const moveVelocity = new THREE.Vector3();
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

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ===== 3. INITIALIZATION =====
    function init() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xefede8);
        scene.fog = new THREE.FogExp2(0xefede8, 0.018);

        camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.05, 70);
        camera.position.set(-2.0, EYE_HEIGHT, 7.8);
        camera.rotation.order = 'YXZ';

        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // Build Complete Penthouse Environment
        buildPenthouseArchitecture();
        buildStarckFurniture();
        setupLighting();
        spawnCuratedArtworks();
        spawnFloorHotspots();

        // Controls & UI Setup
        setupControls();
        setupUI();
        setup2DOverview();

        window.addEventListener('resize', onWindowResize);

        // Hide loader smoothly
        setTimeout(() => {
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 600);
            }
        }, 1200);

        animate();
    }

    // ===== 4. PENTHOUSE ARCHITECTURE (1 unit = 1.0m) =====
    function buildPenthouseArchitecture() {
        const wallMat = new THREE.MeshStandardMaterial({
            color: 0xf5f3ee,
            roughness: 0.90,
            metalness: 0.02
        });

        const galleryAccentMat = new THREE.MeshStandardMaterial({
            color: 0xedeae3,
            roughness: 0.88,
            metalness: 0.02
        });

        const ceilingMat = new THREE.MeshStandardMaterial({
            color: 0xfaf9f6,
            roughness: 0.95
        });

        // Honed Terrazzo / Pale Microcement Floor
        const floorGeo = new THREE.PlaneGeometry(36, 36);
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

        // Terrace Wood Decking (Outside North glass doors)
        const deckGeo = new THREE.PlaneGeometry(16, 6);
        const deckMat = new THREE.MeshStandardMaterial({
            color: 0x8a7b6c,
            roughness: 0.7,
            metalness: 0.05
        });
        const deck = new THREE.Mesh(deckGeo, deckMat);
        deck.rotation.x = -Math.PI / 2;
        deck.position.set(0, 0.01, -7.5);
        scene.add(deck);

        // Interior Ceilings at 3.00m height
        const ceilingGeo = new THREE.PlaneGeometry(32, 24);
        const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.set(-2, 3.00, 2);
        scene.add(ceiling);

        // Brushed Stainless Steel Material
        const steelMat = new THREE.MeshStandardMaterial({
            color: 0xd8dadf,
            metalness: 0.92,
            roughness: 0.22
        });

        // Helper: Create Wall with Baseboards & Collision
        function createWall(x, z, width, depth, height = 3.0, mat = wallMat) {
            const wallGeo = new THREE.BoxGeometry(width, height, depth);
            const wall = new THREE.Mesh(wallGeo, mat);
            wall.position.set(x, height / 2, z);
            wall.castShadow = true;
            wall.receiveShadow = true;
            scene.add(wall);

            // Stainless Steel Baseboards (0.08m height)
            const trimH = 0.08;
            const trimD = depth > width ? depth : depth + 0.02;
            const trimW = width > depth ? width : width + 0.02;
            const trimGeo = new THREE.BoxGeometry(trimW, trimH, trimD);
            const trim = new THREE.Mesh(trimGeo, steelMat);
            trim.position.set(x, trimH / 2, z);
            scene.add(trim);

            // Collision Bounding Box
            collisionBoxes.push({
                minX: x - width / 2 - PLAYER_RADIUS,
                maxX: x + width / 2 + PLAYER_RADIUS,
                minZ: z - depth / 2 - PLAYER_RADIUS,
                maxZ: z + depth / 2 + PLAYER_RADIUS
            });
            return wall;
        }

        // --- 1. ENTRÉ & VESTIBUL ---
        createWall(-2.0, 8.6, 4.2, 0.2); // South entrance entry wall
        createWall(-4.1, 6.3, 0.2, 4.8); // West entry wall
        createWall(0.1, 6.5, 0.2, 4.4);  // East entry wall

        // --- 2. GRAND SALON (VARDAGSRUM) ---
        createWall(-5.1, -0.2, 0.2, 8.4, 3.0, galleryAccentMat); // West main gallery wall (Origami & Vertigo)
        createWall(2.5, 4.1, 5.0, 0.2, 3.0, galleryAccentMat);  // South salon wall (My Heart Has Teeth)
        createWall(-4.5, 4.1, 1.4, 0.2);                       // Salon south return

        // --- 3. MATPLATS / DINING ---
        createWall(6.1, -1.5, 0.2, 6.0, 3.0, galleryAccentMat); // East wall (Daylight)
        createWall(1.5, 1.5, 0.2, 2.4);                        // Salon/Dining divider

        // --- 4. KITCHEN STUDIO (KÖK & BAR) ---
        createWall(4.0, 8.6, 4.2, 0.2, 3.0, galleryAccentMat); // South kitchen wall (Grapefruit & Pearls)
        createWall(6.1, 6.5, 0.2, 4.4, 3.0, galleryAccentMat); // East kitchen wall (Junior B)

        // --- 5. LINNÉA GALLERY CORRIDOR ---
        createWall(-10.6, -1.5, 0.2, 6.2, 3.0, galleryAccentMat); // West corridor wall (Black Mirror, Graines, Love Is Magic)
        createWall(-5.4, -1.5, 0.2, 6.0, 3.0, galleryAccentMat);  // East corridor wall (Love In Lo-fi, Waking Light, Help Me Lose My Mind)
        createWall(-8.0, -4.6, 5.4, 0.2);                         // North corridor return

        // --- 6. MASTER SUITE ---
        createWall(-7.8, 8.6, 5.6, 0.2, 3.0, galleryAccentMat); // South bedroom wall (Linnéas Trilogi 1 & 3, Protected)
        createWall(-10.6, 5.5, 0.2, 6.2, 3.0, galleryAccentMat); // West bedroom wall (Bungalow, Chaos)
        createWall(-4.9, 6.5, 0.2, 4.4);                        // East bedroom corridor wall

        // --- 7. NORTH PANORAMIC WINDOW WALL & SKY TERRACE ---
        createWall(-5.0, -4.6, 0.4, 0.4);
        createWall(0.0, -4.6, 0.4, 0.4);
        createWall(6.5, -4.6, 0.4, 0.4);

        // Lintel over windows
        const lintel = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.4, 0.4), wallMat);
        lintel.position.set(0.75, 2.8, -4.6);
        scene.add(lintel);

        // Glass window sliding panes
        const glassMat = new THREE.MeshPhysicalMaterial({
            color: 0xebf2fa,
            transparent: true,
            opacity: 0.28,
            roughness: 0.08,
            metalness: 0.1,
            transmission: 0.75
        });
        const windowPane = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 2.6), glassMat);
        windowPane.position.set(0.75, 1.3, -4.58);
        scene.add(windowPane);

        // Terrace Glass Balustrade (1.1m height)
        const railGlassMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.4,
            roughness: 0.05
        });
        const railGeo = new THREE.BoxGeometry(16.0, 1.1, 0.04);
        const rail = new THREE.Mesh(railGeo, railGlassMat);
        rail.position.set(0, 0.55, -10.5);
        scene.add(rail);

        // Steel rail cap
        const railCap = new THREE.Mesh(new THREE.BoxGeometry(16.0, 0.04, 0.08), steelMat);
        railCap.position.set(0, 1.1, -10.5);
        scene.add(railCap);

        // Terrace boundary collision
        collisionBoxes.push({ minX: -8.5, maxX: 8.5, minZ: -10.8, maxZ: -10.3 });
        collisionBoxes.push({ minX: -8.5, maxX: -7.8, minZ: -10.5, maxZ: -4.8 });
        collisionBoxes.push({ minX: 7.8, maxX: 8.5, minZ: -10.5, maxZ: -4.8 });

        // Distant City Horizon Backdrop
        const backdropGeo = new THREE.PlaneGeometry(40, 16);
        const backdropMat = new THREE.MeshBasicMaterial({ color: 0xc8d7e6 });
        const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
        backdrop.position.set(0, 4.0, -18.0);
        scene.add(backdrop);
    }

    // ===== 5. STARCK-INSPIRED FURNITURE =====
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

        // 1. Salon Lounge Sofa
        const sofaGroup = new THREE.Group();
        const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.38, 1.0), darkCharcoalMat);
        sofaBase.position.y = 0.19;
        sofaBase.castShadow = true;
        sofaGroup.add(sofaBase);

        const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.35, 0.25), darkCharcoalMat);
        sofaBack.position.set(0, 0.45, -0.38);
        sofaBack.castShadow = true;
        sofaGroup.add(sofaBack);

        sofaGroup.position.set(2.5, 0, -0.3);
        scene.add(sofaGroup);
        collisionBoxes.push({ minX: 1.0, maxX: 4.0, minZ: -1.0, maxZ: 0.4 });

        // 2. Starck Ghost Armchairs (Salon & Nook)
        function createGhostChair(x, z, rotY) {
            const chairGroup = new THREE.Group();
            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.5), ghostChairMat);
            seat.position.y = 0.44;
            chairGroup.add(seat);

            const back = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 24), ghostChairMat);
            back.rotation.x = Math.PI / 2;
            back.position.set(0, 0.76, -0.22);
            chairGroup.add(back);

            const legGeo = new THREE.CylinderGeometry(0.015, 0.012, 0.44);
            [[-0.22, -0.2], [0.22, -0.2], [-0.22, 0.2], [0.22, 0.2]].forEach(([lx, lz]) => {
                const leg = new THREE.Mesh(legGeo, chromeMat);
                leg.position.set(lx, 0.22, lz);
                chairGroup.add(leg);
            });
            chairGroup.position.set(x, 0, z);
            chairGroup.rotation.y = rotY;
            scene.add(chairGroup);
        }

        createGhostChair(0.6, 0.6, Math.PI / 4);
        createGhostChair(4.2, 0.6, -Math.PI / 4);

        // 3. Low Minimalist Coffee Table
        const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.6), chromeMat);
        tableTop.position.set(2.5, 0.32, 0.8);
        tableTop.castShadow = true;
        scene.add(tableTop);

        // 4. Dining Table & Chairs (Matplats)
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

        // 5. Stainless Credenza below Daylight
        const credenzaGeo = new THREE.BoxGeometry(0.40, 0.60, 1.8);
        const credenza = new THREE.Mesh(credenzaGeo, chromeMat);
        credenza.position.set(5.75, 0.30, -1.5);
        credenza.castShadow = true;
        scene.add(credenza);
        collisionBoxes.push({ minX: 5.4, maxX: 6.1, minZ: -2.6, maxZ: -0.4 });

        // 6. Modern Stainless Kitchen Island (Kök & Bar)
        const islandGeo = new THREE.BoxGeometry(1.0, 0.90, 2.4);
        const island = new THREE.Mesh(islandGeo, chromeMat);
        island.position.set(3.8, 0.45, 6.0);
        island.castShadow = true;
        island.receiveShadow = true;
        scene.add(island);
        collisionBoxes.push({ minX: 3.1, maxX: 4.5, minZ: 4.6, maxZ: 7.4 });

        // 7. Master Suite Platform Bed with Stainless Plinth
        const bedGroup = new THREE.Group();
        const bedPlinth = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.20, 2.2), chromeMat);
        bedPlinth.position.y = 0.10;
        bedGroup.add(bedPlinth);

        const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.30, 2.0), darkCharcoalMat);
        mattress.position.y = 0.35;
        bedGroup.add(mattress);

        const headboard = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.80, 0.15), darkCharcoalMat);
        headboard.position.set(0, 0.50, 1.05);
        bedGroup.add(headboard);

        bedGroup.position.set(-7.8, 0, 7.3);
        scene.add(bedGroup);
        collisionBoxes.push({ minX: -9.1, maxX: -6.5, minZ: 6.0, maxZ: 8.5 });
    }

    // ===== 6. LIGHTING DESIGN =====
    function setupLighting() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.58);
        scene.add(ambient);

        const hemi = new THREE.HemisphereLight(0xf4f6ff, 0xdfdad2, 0.65);
        scene.add(hemi);

        const sun = new THREE.DirectionalLight(0xfffdfa, 0.75);
        sun.position.set(1.0, 5.0, -8.0);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 1024;
        sun.shadow.mapSize.height = 1024;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 28;
        sun.shadow.camera.left = -12;
        sun.shadow.camera.right = 12;
        sun.shadow.camera.top = 8;
        sun.shadow.camera.bottom = -8;
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

            // 1. Artwork Canvas Mesh
            const canvasGeo = new THREE.PlaneGeometry(art.widthM, art.heightM);
            const canvasMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

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

            // 2. Stretched Canvas Frame (3.5cm deep dark charcoal edges)
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

            // 4. Hitbox for clicking
            const hitGeo = new THREE.BoxGeometry(art.widthM * 1.1, art.heightM * 1.1, 0.4);
            const hitMat = new THREE.MeshBasicMaterial({ visible: false });
            const hitMesh = new THREE.Mesh(hitGeo, hitMat);
            hitMesh.userData = { artworkData: art };
            artGroup.add(hitMesh);
            interactiveArtworks.push(hitMesh);

            // Placement
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

            const hitGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.4, 16);
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

        document.querySelectorAll('.room-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.hotspot === hotspotId);
        });
    }

    function inspectArtwork(art) {
        activeArtwork = art;
        const wp = art.wallPlacement;
        const targetPos = new THREE.Vector3(wp.viewpoint[0], EYE_HEIGHT, wp.viewpoint[2]);

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
        window.addEventListener('keydown', (e) => {
            if (artModal && (artModal.classList.contains('active') || artModal.classList.contains('open'))) {
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

        const domEl = renderer.domElement;
        domEl.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                isDragging = true;
                prevMousePos = { x: e.clientX, y: e.clientY };
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (isDragging) {
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

            mouseCoord.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseCoord.y = -(e.clientY / window.innerHeight) * 2 + 1;
            updateHoverRaycast();
        });

        // Touch support
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

        const artHits = raycaster.intersectObjects(interactiveArtworks);
        if (artHits.length > 0) {
            const artData = artHits[0].object.userData.artworkData;
            inspectArtwork(artData);
            return;
        }

        const spotHits = raycaster.intersectObjects(interactiveHotspots);
        if (spotHits.length > 0) {
            const spotData = spotHits[0].object.userData.hotspotData;
            moveToHotspot(spotData.id);
            return;
        }
    }

    // ===== 12. UI & MODAL MANAGEMENT =====
    function setupUI() {
        document.querySelectorAll('.room-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const hotspotId = btn.dataset.hotspot;
                if (hotspotId) moveToHotspot(hotspotId);
            });
        });

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

        const galleryLink = document.getElementById('modal-gallery-link');
        if (galleryLink) {
            galleryLink.href = `gallery.html?id=${art.id}`;
        }

        artModal.classList.add('active');
        artModal.classList.add('open');
        artModal.setAttribute('aria-hidden', 'false');
    }

    function closeArtworkModal() {
        if (!artModal) return;
        artModal.classList.remove('active');
        artModal.classList.remove('open');
        artModal.setAttribute('aria-hidden', 'true');
    }

    // ===== 13. 2D GALLERY OVERVIEW =====
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
        minimapCtx.fillStyle = 'rgba(22, 24, 28, 0.90)';
        minimapCtx.fillRect(0, 0, w, h);

        // Coordinate transformation (-12 to +8 X, -11 to +10 Z)
        const scaleX = w / 20;
        const scaleZ = h / 21;
        const offsetX = 12.0 * scaleX;
        const offsetZ = 11.0 * scaleZ;

        function toScreen(x, z) {
            return {
                x: offsetX + x * scaleX,
                y: offsetZ + z * scaleZ
            };
        }

        minimapCtx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        minimapCtx.lineWidth = 1.2;

        // Entré
        const e1 = toScreen(-4.0, 8.5);
        minimapCtx.strokeRect(e1.x, toScreen(0, 4.0).y, 4.0 * scaleX, 4.5 * scaleZ);

        // Grand Salon
        const s1 = toScreen(-5.0, 4.0);
        minimapCtx.strokeRect(s1.x, toScreen(0, -4.5).y, 11.0 * scaleX, 8.5 * scaleZ);

        // Linnéa Gallery Corridor
        const l1 = toScreen(-10.5, 1.5);
        minimapCtx.strokeRect(l1.x, toScreen(0, -4.5).y, 5.5 * scaleX, 6.0 * scaleZ);

        // Master Suite
        const m1 = toScreen(-10.5, 8.5);
        minimapCtx.strokeRect(m1.x, toScreen(0, 2.5).y, 5.5 * scaleX, 6.0 * scaleZ);

        // Kitchen Studio
        const k1 = toScreen(1.5, 8.5);
        minimapCtx.strokeRect(k1.x, toScreen(0, 4.5).y, 4.5 * scaleX, 4.0 * scaleZ);

        // Sky Terrace
        const t1 = toScreen(-4.0, -4.8);
        minimapCtx.strokeRect(t1.x, toScreen(0, -10.5).y, 8.0 * scaleX, 5.7 * scaleZ);

        // Draw Artworks on Minimap
        WALKAROUND_CURATED_ROOM.forEach(art => {
            const p = toScreen(art.wallPlacement.position[0], art.wallPlacement.position[2]);
            minimapCtx.fillStyle = '#d81b60';
            minimapCtx.fillRect(p.x - 2, p.y - 2, 4, 4);
        });

        // Player marker & View cone
        const playerScreen = toScreen(camera.position.x, camera.position.z);
        minimapCtx.fillStyle = 'rgba(216, 27, 96, 0.25)';
        minimapCtx.beginPath();
        minimapCtx.moveTo(playerScreen.x, playerScreen.y);
        const coneAngle = 0.55;
        const coneDist = 24;
        const angle = cameraYaw + Math.PI;
        minimapCtx.arc(playerScreen.x, playerScreen.y, coneDist, angle - coneAngle, angle + coneAngle);
        minimapCtx.closePath();
        minimapCtx.fill();

        minimapCtx.fillStyle = '#ffffff';
        minimapCtx.beginPath();
        minimapCtx.arc(playerScreen.x, playerScreen.y, 3.5, 0, Math.PI * 2);
        minimapCtx.fill();
        minimapCtx.strokeStyle = '#d81b60';
        minimapCtx.lineWidth = 1.5;
        minimapCtx.stroke();
    }

    // ===== 15. MAIN ANIMATION & PHYSICS LOOP =====
    function animate() {
        requestAnimationFrame(animate);

        const delta = Math.min(clock.getDelta(), 0.08);

        // 1. Camera Transition
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
                const t = transitionProgress;
                const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                camera.position.lerpVectors(transitionStartPos, transitionTargetPos, ease);
                cameraYaw = THREE.MathUtils.lerp(transitionStartRot.yaw, transitionTargetRot.yaw, ease);
                cameraPitch = THREE.MathUtils.lerp(transitionStartRot.pitch, transitionTargetRot.pitch, ease);
            }
        }

        // 2. Free Movement
        if (!isTransitioning && (keys.forward || keys.backward || keys.left || keys.right)) {
            const moveDir = new THREE.Vector3();
            if (keys.forward) moveDir.z -= 1;
            if (keys.backward) moveDir.z += 1;
            if (keys.left) moveDir.x -= 1;
            if (keys.right) moveDir.x += 1;
            moveDir.normalize();

            const moveAngle = cameraYaw;
            const targetVX = (moveDir.x * Math.cos(moveAngle) - moveDir.z * Math.sin(moveAngle)) * WALK_SPEED;
            const targetVZ = (moveDir.x * Math.sin(moveAngle) + moveDir.z * Math.cos(moveAngle)) * WALK_SPEED;

            moveVelocity.x = THREE.MathUtils.lerp(moveVelocity.x, targetVX, 0.2);
            moveVelocity.z = THREE.MathUtils.lerp(moveVelocity.z, targetVZ, 0.2);

            const nextX = camera.position.x + moveVelocity.x * delta;
            const nextZ = camera.position.z + moveVelocity.z * delta;

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
            camera.position.y = EYE_HEIGHT;
        } else if (!isTransitioning) {
            moveVelocity.set(0, 0, 0);
        }

        camera.rotation.set(cameraPitch, cameraYaw, 0);

        const time = clock.getElapsedTime();
        hotspotMeshes.forEach(mesh => {
            const scale = 1.0 + Math.sin(time * 2.5) * 0.05;
            mesh.scale.set(scale, scale, 1);
        });

        renderer.render(scene, camera);
        drawMinimap();
    }

    function onWindowResize() {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
