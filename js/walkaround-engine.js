/**
 * Walk Around — 3D Virtual Exhibition Engine
 * Scale: 1 unit = 1.0 meter (Physical 1:1 Metric Scale)
 * Quality Reference: Philippe Starck Modern Luxury Apartment Living Room
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
    const minimapContainer = document.querySelector('.minimap-container');
    const minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;
    const controlsGuide = document.querySelector('.controls-guide');

    let scene, camera, renderer;
    let clock = new THREE.Clock();
    let activeArtwork = null;
    let isTransitioning = false;
    let transitionProgress = 0;
    const transitionStartPos = new THREE.Vector3();
    const transitionTargetPos = new THREE.Vector3();
    let transitionStartRot = { yaw: 0, pitch: 0 };
    let transitionTargetRot = { yaw: 0, pitch: 0 };
    const transitionDuration = 1.1;

    // Movement configuration (Physical 1:1 Scale)
    const EYE_HEIGHT = 1.62; // Standard human standing eye level (1.62m)
    const PLAYER_RADIUS = 0.32; // Collision radius (32cm)
    const WALK_SPEED = 3.2; // meters per second
    const keys = { forward: false, backward: false, left: false, right: false };
    const moveVelocity = new THREE.Vector3();
    const tempMoveDir = new THREE.Vector3();
    let cameraYaw = 0;
    let cameraPitch = 0;
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    // Minimap dirty tracking to avoid 60fps canvas redraws
    let minimapLastPos = new THREE.Vector3(-999, -999, -999);
    let minimapLastYaw = -999;
    let minimapDirty = true;
    let isMinimapVisible = true;

    // Interactive Objects Arrays
    const interactiveArtworks = [];
    const interactiveHotspots = [];
    const collisionBoxes = [];
    const hotspotMeshes = [];

    // Raycaster & Coordinates
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Auto-fade controls guide after 4 seconds or on first movement
    let guideDismissed = false;
    function dismissGuide() {
        if (guideDismissed || !controlsGuide) return;
        guideDismissed = true;
        controlsGuide.style.opacity = '0';
        controlsGuide.style.pointerEvents = 'none';
        setTimeout(() => {
            if (controlsGuide) controlsGuide.style.display = 'none';
        }, 600);
    }
    setTimeout(dismissGuide, 4000);

    // ===== 3. INITIALIZATION =====
    function init() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0ede6);
        scene.fog = new THREE.FogExp2(0xf0ede6, 0.012);

        // Natural Human Perspective (52 deg FOV eliminates wide-angle distortion)
        camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.05, 50);
        camera.position.set(-2.20, EYE_HEIGHT, 1.90);
        camera.rotation.order = 'YXZ';
        cameraYaw = -1.05; // Look across living room seating group towards sofa and coffee table
        cameraPitch = -0.10;

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // Build Living Room Quality Reference Architecture & Furniture
        buildLivingRoomArchitecture();
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
        }, 1000);

        // Force initial minimap draw
        minimapDirty = true;
        animate();
    }

    // ===== 4. LIVING ROOM ARCHITECTURE (7.6m x 6.4m x 2.85m) =====
    function buildLivingRoomArchitecture() {
        // High-end residential wall material (Soft off-white with matte finish)
        const wallMat = new THREE.MeshStandardMaterial({
            color: 0xf5f4ee,
            roughness: 0.88,
            metalness: 0.01
        });

        // Feature Wall Material (Subtle warm stone tint behind art)
        const featureWallMat = new THREE.MeshStandardMaterial({
            color: 0xf0ede5,
            roughness: 0.85,
            metalness: 0.01
        });

        // Ceiling (Matte pure white)
        const ceilingMat = new THREE.MeshStandardMaterial({
            color: 0xfbfbfa,
            roughness: 0.95
        });

        // Brushed Stainless Steel Material (Starck signature)
        const steelMat = new THREE.MeshStandardMaterial({
            color: 0xd2d4d8,
            metalness: 0.88,
            roughness: 0.24
        });

        // Dark Anthracite Metal Material (Window frames)
        const darkFrameMat = new THREE.MeshStandardMaterial({
            color: 0x222428,
            metalness: 0.7,
            roughness: 0.35
        });

        // Scandinavian Pale Oak Parquet Floor (Warm satin finish)
        const floorGeo = new THREE.PlaneGeometry(24, 24);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0xded7ca,
            roughness: 0.36,
            metalness: 0.06
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        scene.add(floor);

        // Ceiling at 2.85m height
        const ceilingGeo = new THREE.PlaneGeometry(20, 20);
        const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.set(0, 2.85, 1.0);
        scene.add(ceiling);

        // Helper: Create Wall with Baseboards & Collision Box
        function createWall(x, z, width, depth, height = 2.85, mat = wallMat) {
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

        // --- 1. WEST WALL (GALLERY WALL: Origami & Vertigo) ---
        createWall(-3.8, 0.0, 0.2, 6.4, 2.85, featureWallMat);

        // --- 2. EAST WALL (LIVING ROOM CREDENZA WALL) ---
        createWall(3.8, 0.0, 0.2, 6.4, 2.85, wallMat);

        // --- 3. SOUTH WALL (MAIN SOFA WALL with Doorway to Vestibule) ---
        // Left section of south wall (Behind Sofa: My Heart Has Teeth)
        createWall(1.0, 3.2, 5.6, 0.2, 2.85, featureWallMat);
        // Right section of south wall (West of doorway)
        createWall(-3.5, 3.2, 0.6, 0.2, 2.85, wallMat);
        // Header lintel over doorway (Doorway: width 1.2m, height 2.15m)
        const doorLintelGeo = new THREE.BoxGeometry(1.2, 0.70, 0.2);
        const doorLintel = new THREE.Mesh(doorLintelGeo, wallMat);
        doorLintel.position.set(-2.4, 2.50, 3.2);
        scene.add(doorLintel);

        // Stainless steel casing frame around doorway
        const casingTopGeo = new THREE.BoxGeometry(1.24, 0.04, 0.22);
        const casingTop = new THREE.Mesh(casingTopGeo, steelMat);
        casingTop.position.set(-2.4, 2.15, 3.2);
        scene.add(casingTop);

        const casingSideGeo = new THREE.BoxGeometry(0.04, 2.15, 0.22);
        const casingL = new THREE.Mesh(casingSideGeo, steelMat);
        casingL.position.set(-3.0, 1.075, 3.2);
        scene.add(casingL);
        const casingR = new THREE.Mesh(casingSideGeo, steelMat);
        casingR.position.set(-1.8, 1.075, 3.2);
        scene.add(casingR);

        // --- 4. ENTRANCE VESTIBULE CORRIDOR ---
        createWall(-3.3, 4.9, 0.2, 3.4, 2.85, wallMat); // West vestibule wall
        createWall(-1.5, 4.9, 0.2, 3.4, 2.85, wallMat); // East vestibule wall
        createWall(-2.4, 6.5, 1.8, 0.2, 2.85, wallMat); // South entrance entry wall (Golden Ticket)

        // --- 5. NORTH WALL (DEEP WINDOW NICHE & SKYLINE PANORAMA) ---
        // Left & right wall returns framing the window niche
        createWall(-3.0, -3.2, 1.6, 0.2, 2.85, wallMat);
        createWall(3.0, -3.2, 1.6, 0.2, 2.85, wallMat);

        // Niche lintel above window (Height 2.60m to 2.85m)
        const winLintelGeo = new THREE.BoxGeometry(4.4, 0.25, 0.45);
        const winLintel = new THREE.Mesh(winLintelGeo, wallMat);
        winLintel.position.set(0, 2.725, -3.2);
        scene.add(winLintel);

        // Window sill / nischbänk (Height 0.55m, depth 0.45m)
        const sillGeo = new THREE.BoxGeometry(4.4, 0.55, 0.45);
        const sill = new THREE.Mesh(sillGeo, wallMat);
        sill.position.set(0, 0.275, -3.2);
        sill.receiveShadow = true;
        scene.add(sill);
        collisionBoxes.push({ minX: -2.3, maxX: 2.3, minZ: -3.5, maxZ: -2.9 });

        // Stainless steel window sill top plate
        const sillTopGeo = new THREE.BoxGeometry(4.42, 0.03, 0.47);
        const sillTop = new THREE.Mesh(sillTopGeo, steelMat);
        sillTop.position.set(0, 0.565, -3.2);
        scene.add(sillTop);

        // Window Frame & Mullions (Dark anthracite steel & brushed stainless)
        const frameW = 4.36;
        const frameH = 2.05;
        const frameZ = -3.42;

        // Top & bottom window frame profiles
        const frameHorizGeo = new THREE.BoxGeometry(frameW, 0.05, 0.06);
        const frameTop = new THREE.Mesh(frameHorizGeo, darkFrameMat);
        frameTop.position.set(0, 2.58, frameZ);
        scene.add(frameTop);

        const frameBottom = new THREE.Mesh(frameHorizGeo, darkFrameMat);
        frameBottom.position.set(0, 0.60, frameZ);
        scene.add(frameBottom);

        // Left & right window frame profiles
        const frameVertGeo = new THREE.BoxGeometry(0.05, frameH, 0.06);
        const frameL = new THREE.Mesh(frameVertGeo, darkFrameMat);
        frameL.position.set(-frameW / 2 + 0.025, 1.60, frameZ);
        scene.add(frameL);

        const frameR = new THREE.Mesh(frameVertGeo, darkFrameMat);
        frameR.position.set(frameW / 2 - 0.025, 1.60, frameZ);
        scene.add(frameR);

        // Center vertical mullion
        const mullionGeo = new THREE.BoxGeometry(0.06, frameH, 0.07);
        const mullion = new THREE.Mesh(mullionGeo, steelMat);
        mullion.position.set(0, 1.60, frameZ);
        scene.add(mullion);

        // Double Glass Window Panes
        const glassMat = new THREE.MeshStandardMaterial({
            color: 0xebf4fa,
            transparent: true,
            opacity: 0.22,
            roughness: 0.08,
            metalness: 0.7
        });
        const glassPane = new THREE.Mesh(new THREE.PlaneGeometry(frameW - 0.10, frameH - 0.10), glassMat);
        glassPane.position.set(0, 1.60, frameZ + 0.01);
        scene.add(glassPane);

        // Drapery / Linen Curtains on sides of window niche
        const drapeMat = new THREE.MeshStandardMaterial({
            color: 0xedeae3,
            roughness: 0.95,
            side: THREE.DoubleSide
        });
        const drapeGeoL = new THREE.BoxGeometry(0.38, 2.15, 0.16);
        const drapeL = new THREE.Mesh(drapeGeoL, drapeMat);
        drapeL.position.set(-2.05, 1.65, -3.15);
        drapeL.castShadow = true;
        scene.add(drapeL);

        const drapeR = new THREE.Mesh(drapeGeoL, drapeMat);
        drapeR.position.set(2.05, 1.65, -3.15);
        drapeR.castShadow = true;
        scene.add(drapeR);

        // Ceiling Recessed Downlights (Stainless rings)
        const spotRingGeo = new THREE.RingGeometry(0.04, 0.07, 24);
        const spotLensGeo = new THREE.CircleGeometry(0.04, 24);
        const spotLensMat = new THREE.MeshBasicMaterial({ color: 0xfffcf2 });
        [[-1.8, -1.2], [1.8, -1.2], [-1.8, 1.4], [1.8, 1.4], [0.0, 0.0]].forEach(([sx, sz]) => {
            const ring = new THREE.Mesh(spotRingGeo, steelMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.set(sx, 2.848, sz);
            scene.add(ring);

            const lens = new THREE.Mesh(spotLensGeo, spotLensMat);
            lens.rotation.x = Math.PI / 2;
            lens.position.set(sx, 2.847, sz);
            scene.add(lens);
        });

        // Terrace Wood Decking outside window
        const deckGeo = new THREE.PlaneGeometry(12, 6);
        const deckMat = new THREE.MeshStandardMaterial({
            color: 0x7c7062,
            roughness: 0.75,
            metalness: 0.05
        });
        const deck = new THREE.Mesh(deckGeo, deckMat);
        deck.rotation.x = -Math.PI / 2;
        deck.position.set(0, 0.01, -6.5);
        scene.add(deck);

        // Balustrade outside on terrace
        const railCap = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.04, 0.08), steelMat);
        railCap.position.set(0, 1.10, -9.2);
        scene.add(railCap);

        // Distant City Skyline Horizon
        const backdropGeo = new THREE.PlaneGeometry(36, 14);
        const backdropMat = new THREE.MeshBasicMaterial({ color: 0xc4d4e3 });
        const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
        backdrop.position.set(0, 3.5, -16.0);
        scene.add(backdrop);
    }

    // ===== 5. STARCK-INSPIRED HOME FURNISHINGS =====
    function buildStarckFurniture() {
        const chromeMat = new THREE.MeshStandardMaterial({
            color: 0xdadce0,
            metalness: 0.95,
            roughness: 0.16
        });

        const darkUpholsteryMat = new THREE.MeshStandardMaterial({
            color: 0x2e3035,
            roughness: 0.85
        });

        const cushionAccentMat = new THREE.MeshStandardMaterial({
            color: 0xc8b29b,
            roughness: 0.90
        });

        const woolRugMat = new THREE.MeshStandardMaterial({
            color: 0xe6e2da,
            roughness: 0.96
        });

        const glassTableMat = new THREE.MeshStandardMaterial({
            color: 0x8291a0,
            transparent: true,
            opacity: 0.48,
            roughness: 0.12,
            metalness: 0.6
        });

        const ghostChairMat = new THREE.MeshStandardMaterial({
            color: 0x98a5b5,
            transparent: true,
            opacity: 0.38,
            roughness: 0.12,
            metalness: 0.2
        });

        const whiteLacquerMat = new THREE.MeshStandardMaterial({
            color: 0xfcfbfa,
            roughness: 0.35,
            metalness: 0.05
        });

        // 1. Large Luxury Wool Area Rug (3.8m x 2.7m)
        const rugGeo = new THREE.BoxGeometry(3.8, 0.012, 2.7);
        const rug = new THREE.Mesh(rugGeo, woolRugMat);
        rug.position.set(0.5, 0.006, 1.2);
        rug.receiveShadow = true;
        scene.add(rug);

        // 2. Modern Sectional Lounge Sofa (Centered under "My Heart Has Teeth")
        const sofaGroup = new THREE.Group();

        // Plinth base in brushed stainless steel
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.70, 0.06, 0.95), chromeMat);
        plinth.position.set(0, 0.03, 0);
        plinth.castShadow = true;
        sofaGroup.add(plinth);

        // Main seat deck
        const seatBase = new THREE.Mesh(new THREE.BoxGeometry(2.68, 0.20, 0.93), darkUpholsteryMat);
        seatBase.position.set(0, 0.16, 0);
        seatBase.castShadow = true;
        sofaGroup.add(seatBase);

        // 3 Plump Seat Cushions
        for (let i = 0; i < 3; i++) {
            const sc = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.16, 0.78), darkUpholsteryMat);
            sc.position.set(-0.88 + i * 0.88, 0.34, 0.04);
            sc.castShadow = true;
            sofaGroup.add(sc);
        }

        // Low Horizontal Backrest
        const backrest = new THREE.Mesh(new THREE.BoxGeometry(2.70, 0.40, 0.22), darkUpholsteryMat);
        backrest.position.set(0, 0.46, 0.36);
        backrest.castShadow = true;
        sofaGroup.add(backrest);

        // 3 Plush Back Pillows
        for (let i = 0; i < 3; i++) {
            const bp = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.32, 0.15), darkUpholsteryMat);
            bp.position.set(-0.88 + i * 0.88, 0.54, 0.25);
            bp.rotation.x = -0.10;
            bp.castShadow = true;
            sofaGroup.add(bp);
        }

        // Side Armrests
        const armL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.92), darkUpholsteryMat);
        armL.position.set(-1.26, 0.36, 0);
        armL.castShadow = true;
        sofaGroup.add(armL);

        const armR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.92), darkUpholsteryMat);
        armR.position.set(1.26, 0.36, 0);
        armR.castShadow = true;
        sofaGroup.add(armR);

        // Decorative Accent Throw Pillow
        const throwPillow = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.12), cushionAccentMat);
        throwPillow.position.set(-0.95, 0.48, 0.18);
        throwPillow.rotation.set(-0.15, 0.20, 0.10);
        throwPillow.castShadow = true;
        sofaGroup.add(throwPillow);

        // Place sofa in front of south wall
        sofaGroup.position.set(0.60, 0, 2.45);
        scene.add(sofaGroup);
        collisionBoxes.push({ minX: -0.9, maxX: 2.1, minZ: 1.8, maxZ: 3.1 });

        // 3. Philippe Starck Louis Ghost Armchair
        const chairGroup = new THREE.Group();

        // Molded translucent seat
        const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.04, 0.50), ghostChairMat);
        chairSeat.position.set(0, 0.42, 0);
        chairSeat.castShadow = true;
        chairGroup.add(chairSeat);

        // Iconic Medallion Oval Backrest
        const medallionGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.03, 32);
        const medallion = new THREE.Mesh(medallionGeo, ghostChairMat);
        medallion.rotation.x = Math.PI / 2;
        medallion.position.set(0, 0.74, 0.22);
        medallion.castShadow = true;
        chairGroup.add(medallion);

        // Armrests
        const armGeo = new THREE.BoxGeometry(0.04, 0.18, 0.36);
        const chArmL = new THREE.Mesh(armGeo, ghostChairMat);
        chArmL.position.set(-0.25, 0.52, 0.04);
        chairGroup.add(chArmL);

        const chArmR = new THREE.Mesh(armGeo, ghostChairMat);
        chArmR.position.set(0.25, 0.52, 0.04);
        chairGroup.add(chArmR);

        // 4 Chrome Legs
        const legGeo = new THREE.CylinderGeometry(0.014, 0.010, 0.42, 16);
        [[-0.22, -0.20], [0.22, -0.20], [-0.22, 0.20], [0.22, 0.20]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(legGeo, chromeMat);
            leg.position.set(lx, 0.21, lz);
            chairGroup.add(leg);
        });

        // Place chair angled towards sofa group
        chairGroup.position.set(-1.40, 0, 1.10);
        chairGroup.rotation.y = Math.PI * 0.35;
        scene.add(chairGroup);
        collisionBoxes.push({ minX: -1.8, maxX: -1.0, minZ: 0.7, maxZ: 1.5 });

        // 4. Architectural Starck Coffee Table with Styling
        const tableGroup = new THREE.Group();

        // Smoked Glass Table Top
        const glassTop = new THREE.Mesh(new THREE.BoxGeometry(1.20, 0.02, 0.65), glassTableMat);
        glassTop.position.set(0, 0.33, 0);
        glassTop.castShadow = true;
        tableGroup.add(glassTop);

        // Stainless Steel Trestle Legs
        const trestleGeo = new THREE.BoxGeometry(0.04, 0.32, 0.60);
        const trestle1 = new THREE.Mesh(trestleGeo, chromeMat);
        trestle1.position.set(-0.48, 0.16, 0);
        trestle1.castShadow = true;
        tableGroup.add(trestle1);

        const trestle2 = new THREE.Mesh(trestleGeo, chromeMat);
        trestle2.position.set(0.48, 0.16, 0);
        trestle2.castShadow = true;
        tableGroup.add(trestle2);

        // Styling: Art Monograph Book on Table
        const bookCoverMat = new THREE.MeshStandardMaterial({ color: 0x1c1d21, roughness: 0.5 });
        const bookPagesMat = new THREE.MeshStandardMaterial({ color: 0xf4f2ea, roughness: 0.9 });
        const bookCover = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.035, 0.22), bookCoverMat);
        bookCover.position.set(-0.20, 0.355, 0.02);
        bookCover.rotation.y = 0.15;
        tableGroup.add(bookCover);

        // Styling: Stainless Steel Decorative Tray
        const tray = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.015, 0.20), chromeMat);
        tray.position.set(0.24, 0.345, -0.04);
        tableGroup.add(tray);

        tableGroup.position.set(0.60, 0, 1.10);
        scene.add(tableGroup);
        collisionBoxes.push({ minX: -0.1, maxX: 1.3, minZ: 0.7, maxZ: 1.5 });

        // 5. Architectural Arc Floor Lamp (Flos Arco / Starck Style)
        const lampGroup = new THREE.Group();

        // Heavy Base Block (White Carrara finish)
        const lampBase = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.45, 0.24), whiteLacquerMat);
        lampBase.position.set(0, 0.225, 0);
        lampBase.castShadow = true;
        lampGroup.add(lampBase);

        // Stainless base trim
        const lampBaseTrim = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.04, 0.25), chromeMat);
        lampBaseTrim.position.set(0, 0.02, 0);
        lampGroup.add(lampBaseTrim);

        // Sweeping Arc Tube
        const arcCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0.45, 0),
            new THREE.Vector3(0, 1.80, 0),
            new THREE.Vector3(-0.20, 2.45, -0.30),
            new THREE.Vector3(-0.80, 2.35, -0.70),
            new THREE.Vector3(-1.10, 2.10, -0.90)
        ]);
        const arcGeo = new THREE.TubeGeometry(arcCurve, 32, 0.016, 12, false);
        const arcMesh = new THREE.Mesh(arcGeo, chromeMat);
        lampGroup.add(arcMesh);

        // Polished Chrome Hemispherical Dome Shade
        const shadeGeo = new THREE.SphereGeometry(0.18, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const shade = new THREE.Mesh(shadeGeo, chromeMat);
        shade.rotation.x = Math.PI;
        shade.position.set(-1.10, 2.10, -0.90);
        shade.castShadow = true;
        lampGroup.add(shade);

        lampGroup.position.set(2.40, 0, 2.30);
        scene.add(lampGroup);
        collisionBoxes.push({ minX: 2.1, maxX: 2.7, minZ: 2.0, maxZ: 2.6 });

        // 6. Low Minimalist Sideboard / Credenza (East Wall)
        const credenzaGroup = new THREE.Group();

        // Plinth
        const credenzaPlinth = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.06, 2.00), chromeMat);
        credenzaPlinth.position.set(0, 0.03, 0);
        credenzaGroup.add(credenzaPlinth);

        // Cabinet Body
        const credenzaBody = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 2.02), whiteLacquerMat);
        credenzaBody.position.set(0, 0.30, 0);
        credenzaBody.castShadow = true;
        credenzaGroup.add(credenzaBody);

        // Recessed shadow gap in stainless steel
        const credenzaGap = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.015, 2.03), chromeMat);
        credenzaGap.position.set(0, 0.53, 0);
        credenzaGroup.add(credenzaGap);

        // Minimalist Sculptural Vase on Sideboard
        const vaseGeo = new THREE.CylinderGeometry(0.06, 0.09, 0.36, 24);
        const vase = new THREE.Mesh(vaseGeo, darkUpholsteryMat);
        vase.position.set(0, 0.72, 0.50);
        vase.castShadow = true;
        credenzaGroup.add(vase);

        credenzaGroup.position.set(3.55, 0, -0.20);
        scene.add(credenzaGroup);
        collisionBoxes.push({ minX: 3.2, maxX: 3.8, minZ: -1.3, maxZ: 0.9 });
    }

    // ===== 6. LIGHTING DESIGN =====
    function setupLighting() {
        // Soft ambient daylight fill
        const ambient = new THREE.AmbientLight(0xffffff, 0.52);
        scene.add(ambient);

        // Hemisphere sky/floor bounce
        const hemi = new THREE.HemisphereLight(0xf4f7ff, 0xe4dfd7, 0.62);
        scene.add(hemi);

        // Natural Directional Daylight from the North Window
        const sun = new THREE.DirectionalLight(0xfffaf0, 0.85);
        sun.position.set(1.5, 4.5, -6.5);
        sun.target.position.set(0, 1.0, 1.0);
        scene.add(sun.target);

        sun.castShadow = true;
        sun.shadow.mapSize.width = 1024;
        sun.shadow.mapSize.height = 1024;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 20;
        sun.shadow.camera.left = -6;
        sun.shadow.camera.right = 6;
        sun.shadow.camera.top = 5;
        sun.shadow.camera.bottom = -5;
        sun.shadow.bias = -0.0004;
        scene.add(sun);

        // Subtle warm glow over the seating lounge
        const lampLight = new THREE.PointLight(0xffecd0, 0.45, 4.5);
        lampLight.position.set(1.30, 2.05, 1.40);
        scene.add(lampLight);
    }

    // ===== 7. CURATED ARTWORKS (Domestic Placement, No Wall Plaques) =====
    function spawnCuratedArtworks() {
        const textureLoader = new THREE.TextureLoader();

        WALKAROUND_CURATED_ROOM.forEach((art) => {
            const artGroup = new THREE.Group();

            // 1. Stretched Canvas Surface Mesh (1:1 Exact Centimeters)
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
            canvasMesh.position.set(0, 0, 0.020);
            artGroup.add(canvasMesh);

            // 2. Realistic 3.5cm Deep Stretched Canvas Frame Edges (No permanent plaques)
            const frameGeo = new THREE.BoxGeometry(art.widthM + 0.006, art.heightM + 0.006, 0.035);
            const frameMat = new THREE.MeshStandardMaterial({
                color: 0x161719,
                roughness: 0.85
            });
            const frameMesh = new THREE.Mesh(frameGeo, frameMat);
            frameMesh.position.set(0, 0, 0.002);
            artGroup.add(frameMesh);

            // 3. Invisible Raycast Hitbox for Interactive Inspection
            const hitGeo = new THREE.BoxGeometry(art.widthM * 1.15, art.heightM * 1.15, 0.45);
            const hitMat = new THREE.MeshBasicMaterial({ visible: false });
            const hitMesh = new THREE.Mesh(hitGeo, hitMat);
            hitMesh.userData = { artworkData: art };
            artGroup.add(hitMesh);
            interactiveArtworks.push(hitMesh);

            // Placement in Room
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
        const ringGeo = new THREE.RingGeometry(0.24, 0.32, 32);
        const innerGeo = new THREE.CircleGeometry(0.08, 32);

        WALKAROUND_HOTSPOTS.forEach((spot) => {
            const spotGroup = new THREE.Group();

            const ringMat = new THREE.MeshBasicMaterial({
                color: 0xd81b60,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.70
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = -Math.PI / 2;
            spotGroup.add(ring);

            const innerMat = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.85
            });
            const inner = new THREE.Mesh(innerGeo, innerMat);
            inner.rotation.x = -Math.PI / 2;
            inner.position.y = 0.001;
            spotGroup.add(inner);

            spotGroup.position.set(spot.pos[0], 0.015, spot.pos[2]);

            const hitGeo = new THREE.CylinderGeometry(0.50, 0.50, 0.4, 16);
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
        dismissGuide();
        if (prefersReducedMotion) {
            camera.position.copy(targetPos);
            cameraYaw = targetYaw;
            cameraPitch = targetPitch;
            minimapDirty = true;
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

            dismissGuide();

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
                dismissGuide();
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

                const sensitivity = 0.0026;
                cameraYaw -= deltaX * sensitivity;
                cameraPitch -= deltaY * sensitivity;
                cameraPitch = Math.max(-Math.PI / 2.6, Math.min(Math.PI / 2.6, cameraPitch));
                minimapDirty = true;
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
                dismissGuide();
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

                const sensitivity = 0.0032;
                cameraYaw -= deltaX * sensitivity;
                cameraPitch -= deltaY * sensitivity;
                cameraPitch = Math.max(-Math.PI / 2.6, Math.min(Math.PI / 2.6, cameraPitch));
                minimapDirty = true;
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

        // Toggle Minimap Button
        const toggleMinimapBtn = document.getElementById('btn-toggle-minimap');
        if (toggleMinimapBtn && minimapContainer) {
            toggleMinimapBtn.addEventListener('click', () => {
                isMinimapVisible = !isMinimapVisible;
                minimapContainer.style.display = isMinimapVisible ? 'block' : 'none';
                toggleMinimapBtn.classList.toggle('active', isMinimapVisible);
                if (isMinimapVisible) minimapDirty = true;
            });
        }

        // Help Button
        const helpBtn = document.getElementById('btn-help');
        if (helpBtn && controlsGuide) {
            helpBtn.addEventListener('click', () => {
                controlsGuide.style.display = 'block';
                controlsGuide.style.opacity = '1';
                controlsGuide.style.pointerEvents = 'auto';
                guideDismissed = false;
                setTimeout(dismissGuide, 5000);
            });
        }

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
        document.getElementById('modal-size').textContent = `${art.size} (Fysisk Skala 1:1)`;
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

    // ===== 14. THROTTLED MINIMAP RADAR (Zero GPU Stall) =====
    function drawMinimap() {
        if (!minimapCtx || !isMinimapVisible) return;

        // Check if player position or angle actually changed significantly
        const dist = minimapLastPos.distanceTo(camera.position);
        const deltaYaw = Math.abs(minimapLastYaw - cameraYaw);
        if (!minimapDirty && dist < 0.04 && deltaYaw < 0.04) {
            return;
        }

        minimapLastPos.copy(camera.position);
        minimapLastYaw = cameraYaw;
        minimapDirty = false;

        const w = minimapCanvas.width;
        const h = minimapCanvas.height;

        minimapCtx.clearRect(0, 0, w, h);
        minimapCtx.fillStyle = 'rgba(20, 22, 26, 0.92)';
        minimapCtx.fillRect(0, 0, w, h);

        // Coordinate transformation (-4.5 to +4.5 X, -4.0 to +7.0 Z)
        const scaleX = w / 9.0;
        const scaleZ = h / 11.0;
        const offsetX = 4.5 * scaleX;
        const offsetZ = 4.0 * scaleZ;

        function toScreen(x, z) {
            return {
                x: offsetX + x * scaleX,
                y: offsetZ + z * scaleZ
            };
        }

        minimapCtx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        minimapCtx.lineWidth = 1.2;

        // 1. Living Room Outline (-3.8 to +3.8 X, -3.2 to +3.2 Z)
        const r1 = toScreen(-3.8, -3.2);
        minimapCtx.strokeRect(r1.x, r1.y, 7.6 * scaleX, 6.4 * scaleZ);

        // 2. Vestibule Outline (-3.3 to -1.5 X, +3.2 to +6.5 Z)
        const v1 = toScreen(-3.3, 3.2);
        minimapCtx.strokeRect(v1.x, v1.y, 1.8 * scaleX, 3.3 * scaleZ);

        // 3. Sofa outline
        const s1 = toScreen(-0.75, 1.98);
        minimapCtx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        minimapCtx.fillRect(s1.x, s1.y, 2.7 * scaleX, 0.95 * scaleZ);

        // 4. Draw Artworks on Minimap
        WALKAROUND_CURATED_ROOM.forEach(art => {
            const p = toScreen(art.wallPlacement.position[0], art.wallPlacement.position[2]);
            minimapCtx.fillStyle = '#d81b60';
            minimapCtx.fillRect(p.x - 2, p.y - 2, 4, 4);
        });

        // 5. Player marker & View cone
        const playerScreen = toScreen(camera.position.x, camera.position.z);
        minimapCtx.fillStyle = 'rgba(216, 27, 96, 0.28)';
        minimapCtx.beginPath();
        minimapCtx.moveTo(playerScreen.x, playerScreen.y);
        const coneAngle = 0.45;
        const coneDist = 22;
        const angle = cameraYaw + Math.PI;
        minimapCtx.arc(playerScreen.x, playerScreen.y, coneDist, angle - coneAngle, angle + coneAngle);
        minimapCtx.closePath();
        minimapCtx.fill();

        minimapCtx.fillStyle = '#ffffff';
        minimapCtx.beginPath();
        minimapCtx.arc(playerScreen.x, playerScreen.y, 3.0, 0, Math.PI * 2);
        minimapCtx.fill();
        minimapCtx.strokeStyle = '#d81b60';
        minimapCtx.lineWidth = 1.4;
        minimapCtx.stroke();
    }

    // ===== 15. MAIN ANIMATION & PHYSICS LOOP (Target: 60 FPS) =====
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
                minimapDirty = true;
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
                minimapDirty = true;
            }
        }

        // 2. Free Movement with Box Collision Physics
        if (!isTransitioning && (keys.forward || keys.backward || keys.left || keys.right)) {
            tempMoveDir.set(0, 0, 0);
            if (keys.forward) tempMoveDir.z -= 1;
            if (keys.backward) tempMoveDir.z += 1;
            if (keys.left) tempMoveDir.x -= 1;
            if (keys.right) tempMoveDir.x += 1;
            tempMoveDir.normalize();

            const moveAngle = cameraYaw;
            const targetVX = (tempMoveDir.x * Math.cos(moveAngle) - tempMoveDir.z * Math.sin(moveAngle)) * WALK_SPEED;
            const targetVZ = (tempMoveDir.x * Math.sin(moveAngle) + tempMoveDir.z * Math.cos(moveAngle)) * WALK_SPEED;

            moveVelocity.x = THREE.MathUtils.lerp(moveVelocity.x, targetVX, 0.22);
            moveVelocity.z = THREE.MathUtils.lerp(moveVelocity.z, targetVZ, 0.22);

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
            minimapDirty = true;
        } else if (!isTransitioning) {
            moveVelocity.set(0, 0, 0);
        }

        camera.rotation.set(cameraPitch, cameraYaw, 0);

        // Pulse hotspot rings smoothly
        const time = clock.getElapsedTime();
        const spotScale = 1.0 + Math.sin(time * 2.5) * 0.05;
        for (let i = 0; i < hotspotMeshes.length; i++) {
            hotspotMeshes[i].scale.set(spotScale, spotScale, 1);
        }

        // WebGL Render
        renderer.render(scene, camera);

        // Throttled minimap draw
        drawMinimap();
    }

    function onWindowResize() {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        minimapDirty = true;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

