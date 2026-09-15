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
                loader.classList.add('loaded');
                loader.style.opacity = '0';
                loader.style.pointerEvents = 'none';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 600);
            }
        }, 800);

        // Force initial minimap draw
        minimapDirty = true;
        animate();
    }

    // ===== 4. PARISIAN LUXURY ARCHITECTURE & MATERIAL PALETTE =====
    function buildLivingRoomArchitecture() {
        // Procedural Honed French Limestone Floor Texture
        function createLimestoneTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 1024;
            canvas.height = 1024;
            const ctx = canvas.getContext('2d');
            
            // Warm limestone base
            ctx.fillStyle = '#dfd6c8';
            ctx.fillRect(0, 0, 1024, 1024);
            
            // 4x4 stone tiles
            const tileSize = 256;
            const groutW = 3;
            
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    const tx = c * tileSize;
                    const ty = r * tileSize;
                    
                    const tileHueVar = ((r * 7 + c * 13) % 11) - 5;
                    const rVal = 223 + tileHueVar;
                    const gVal = 214 + tileHueVar;
                    const bVal = 200 + tileHueVar;
                    ctx.fillStyle = `rgb(${rVal}, ${gVal}, ${bVal})`;
                    ctx.fillRect(tx + groutW, ty + groutW, tileSize - groutW * 2, tileSize - groutW * 2);
                    
                    // Subtle stone grain
                    ctx.fillStyle = 'rgba(170, 155, 138, 0.08)';
                    for (let i = 0; i < 30; i++) {
                        const fx = tx + 8 + (Math.sin(i * 99 + r) * 0.5 + 0.5) * (tileSize - 20);
                        const fy = ty + 8 + (Math.cos(i * 77 + c) * 0.5 + 0.5) * (tileSize - 20);
                        ctx.fillRect(fx, fy, 5, 3);
                    }
                }
            }
            
            // Grout lines
            ctx.fillStyle = '#b8ad9c';
            for (let i = 0; i <= 4; i++) {
                ctx.fillRect(0, i * tileSize - groutW / 2, 1024, groutW);
                ctx.fillRect(i * tileSize - groutW / 2, 0, groutW, 1024);
            }
            
            const tex = new THREE.CanvasTexture(canvas);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(6, 6);
            return tex;
        }

        const limestoneTex = createLimestoneTexture();

        // 1. Parisian Warm Ivory Wall Material
        const wallMat = new THREE.MeshStandardMaterial({
            color: 0xf2eee6,
            roughness: 0.88,
            metalness: 0.01
        });

        // 2. Honed French Limestone Floor (Warm stone with satin sheen)
        const floorGeo = new THREE.PlaneGeometry(28, 28);
        const floorMat = new THREE.MeshStandardMaterial({
            map: limestoneTex,
            roughness: 0.38,
            metalness: 0.04
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        scene.add(floor);

        // 3. Ceiling with Pure White Plaster Finish
        const ceilingGeo = new THREE.PlaneGeometry(24, 24);
        const ceilingMat = new THREE.MeshStandardMaterial({
            color: 0xfaf8f4,
            roughness: 0.94
        });
        const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.set(0, 2.85, 0.5);
        scene.add(ceiling);

        // 4. Brushed & Polished Stainless Steel Materials
        const brushedSteelMat = new THREE.MeshStandardMaterial({
            color: 0xcdcfd4,
            metalness: 0.88,
            roughness: 0.26
        });

        const darkIronMat = new THREE.MeshStandardMaterial({
            color: 0x24262a,
            metalness: 0.75,
            roughness: 0.35
        });

        const stuccoMat = new THREE.MeshStandardMaterial({
            color: 0xf8f6f0,
            roughness: 0.90
        });

        const baseboardMat = new THREE.MeshStandardMaterial({
            color: 0xe0dad0,
            roughness: 0.65
        });

        // Helper: Create Wall with Baseboards, Stucco Cornice & Collision
        function createWall(x, z, width, depth, height = 2.85, mat = wallMat) {
            const wallGeo = new THREE.BoxGeometry(width, height, depth);
            const wall = new THREE.Mesh(wallGeo, mat);
            wall.position.set(x, height / 2, z);
            wall.castShadow = true;
            wall.receiveShadow = true;
            scene.add(wall);

            // Painted Baseboard (0.07m height)
            const trimH = 0.07;
            const trimD = depth > width ? depth : depth + 0.015;
            const trimW = width > depth ? width : width + 0.015;
            const trimGeo = new THREE.BoxGeometry(trimW, trimH, trimD);
            const trim = new THREE.Mesh(trimGeo, baseboardMat);
            trim.position.set(x, trimH / 2, z);
            scene.add(trim);

            // Classic Parisian Ceiling Stucco Cornice (0.10m stepped plaster molding)
            const corniceH = 0.10;
            const corniceD = depth > width ? depth + 0.08 : depth + 0.04;
            const corniceW = width > depth ? width + 0.04 : width + 0.08;
            const cornice = new THREE.Mesh(new THREE.BoxGeometry(corniceW, corniceH, corniceD), stuccoMat);
            cornice.position.set(x, height - corniceH / 2, z);
            scene.add(cornice);

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
        createWall(-4.0, 0.0, 0.2, 7.0, 2.85, wallMat);

        // --- 2. EAST WALL (GRAND PORTAL TO DINING ROOM) ---
        // South segment of East wall
        createWall(4.0, 2.2, 0.2, 2.6, 2.85, wallMat);
        // North segment of East wall
        createWall(4.0, -2.2, 0.2, 2.6, 2.85, wallMat);
        // Lintel over Dining Portal (Portal width 2.2m, height 2.45m)
        const portalLintel = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.40, 2.2), wallMat);
        portalLintel.position.set(4.0, 2.65, 0.0);
        scene.add(portalLintel);

        // Stucco portal casing frame
        const portalCasingTop = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 2.26), stuccoMat);
        portalCasingTop.position.set(4.0, 2.45, 0.0);
        scene.add(portalCasingTop);

        const portalCasingL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.45, 0.06), stuccoMat);
        portalCasingL.position.set(4.0, 1.225, -1.1);
        scene.add(portalCasingL);

        const portalCasingR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.45, 0.06), stuccoMat);
        portalCasingR.position.set(4.0, 1.225, 1.1);
        scene.add(portalCasingR);

        // --- 3. DINING ROOM & TULIP TABLE (Visible through Portal) ---
        // Back wall of dining room
        createWall(7.5, 0.0, 0.2, 6.0, 2.85, wallMat);
        createWall(5.75, -3.0, 3.5, 0.2, 2.85, wallMat);
        createWall(5.75, 3.0, 3.5, 0.2, 2.85, wallMat);

        // Oval Tulip Dining Table in Dining Room (Saarinen / Starck style)
        const diningTableGroup = new THREE.Group();
        const diningPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.38, 0.72, 32), wallMat);
        diningPedestal.position.set(0, 0.36, 0);
        diningPedestal.castShadow = true;
        diningTableGroup.add(diningPedestal);

        const diningTop = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.04, 36), wallMat);
        diningTop.scale.set(1.4, 1.0, 0.9); // Oval shape
        diningTop.position.set(0, 0.74, 0);
        diningTop.castShadow = true;
        diningTableGroup.add(diningTop);

        // Brushed Stainless Disc Pendant over dining table
        const discPendant = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.04, 32), brushedSteelMat);
        discPendant.position.set(0, 2.10, 0);
        diningTableGroup.add(discPendant);

        const discStem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.75), brushedSteelMat);
        discStem.position.set(0, 2.475, 0);
        diningTableGroup.add(discStem);

        // Brushed Stainless Steel Sideboard in Dining Room (Bild 2)
        const diningSideboard = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.65, 2.40), brushedSteelMat);
        diningSideboard.position.set(7.25, 0.325, 0.0);
        diningSideboard.castShadow = true;
        scene.add(diningSideboard);

        // Sculptural Liquid Chrome Art on Dining Sideboard
        const sculptArt = new THREE.Mesh(new THREE.TorusKnotGeometry(0.15, 0.05, 64, 16), brushedSteelMat);
        sculptArt.position.set(7.20, 0.85, -0.40);
        sculptArt.castShadow = true;
        scene.add(sculptArt);

        diningTableGroup.position.set(5.8, 0, 0.0);
        scene.add(diningTableGroup);
        collisionBoxes.push({ minX: 4.8, maxX: 6.8, minZ: -1.2, maxZ: 1.2 });

        // --- 4. SOUTH WALL (MAIN CREDENZA & ARTWORK WALL + DOORWAY TO ENTRANCE) ---
        // Left main section of south wall (Behind Credenza & My Heart Has Teeth)
        createWall(0.8, 3.4, 6.2, 0.2, 2.85, wallMat);
        // Right section of south wall (West of entrance doorway)
        createWall(-3.7, 3.4, 0.6, 0.2, 2.85, wallMat);
        // Doorway Lintel over Entrance
        const doorLintel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.55, 0.2), wallMat);
        doorLintel.position.set(-2.6, 2.575, 3.4);
        scene.add(doorLintel);

        // Stucco casing around entrance doorway
        const casingTop = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.06, 0.24), stuccoMat);
        casingTop.position.set(-2.6, 2.30, 3.4);
        scene.add(casingTop);

        const casingL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.30, 0.24), stuccoMat);
        casingL.position.set(-3.2, 1.15, 3.4);
        scene.add(casingL);

        const casingR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.30, 0.24), stuccoMat);
        casingR.position.set(-2.0, 1.15, 3.4);
        scene.add(casingR);

        // Entrance Vestibule Walls
        createWall(-3.5, 5.0, 0.2, 3.2, 2.85, wallMat);
        createWall(-1.7, 5.0, 0.2, 3.2, 2.85, wallMat);
        createWall(-2.6, 6.5, 1.8, 0.2, 2.85, wallMat); // Entrance wall (Golden Ticket)

        // --- 5. NORTH WALL (TALL FRENCH WINDOWS & PARISIAN BALCONY) ---
        createWall(-3.2, -3.4, 1.6, 0.2, 2.85, wallMat);
        createWall(3.2, -3.4, 1.6, 0.2, 2.85, wallMat);

        // Window Niche Lintel
        const winLintel = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.35, 0.45), wallMat);
        winLintel.position.set(0, 2.675, -3.4);
        scene.add(winLintel);

        // Stone Window Sill (Height 0.50m)
        const sill = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.50, 0.45), wallMat);
        sill.position.set(0, 0.25, -3.4);
        sill.receiveShadow = true;
        scene.add(sill);
        collisionBoxes.push({ minX: -2.5, maxX: 2.5, minZ: -3.7, maxZ: -3.1 });

        // French Window Frames (2 tall double-hung French windows)
        const frameW = 4.76;
        const frameH = 2.15;
        const frameZ = -3.62;

        // Outer frames & mullions
        const frameTop = new THREE.Mesh(new THREE.BoxGeometry(frameW, 0.05, 0.06), darkIronMat);
        frameTop.position.set(0, 2.62, frameZ);
        scene.add(frameTop);

        const frameBottom = new THREE.Mesh(new THREE.BoxGeometry(frameW, 0.05, 0.06), darkIronMat);
        frameBottom.position.set(0, 0.52, frameZ);
        scene.add(frameBottom);

        [-2.35, -0.80, 0.0, 0.80, 2.35].forEach((fx) => {
            const fv = new THREE.Mesh(new THREE.BoxGeometry(0.05, frameH, 0.06), darkIronMat);
            fv.position.set(fx, 1.57, frameZ);
            scene.add(fv);
        });

        // Horizontal transom bar
        const transom = new THREE.Mesh(new THREE.BoxGeometry(frameW, 0.04, 0.05), darkIronMat);
        transom.position.set(0, 2.05, frameZ);
        scene.add(transom);

        // Glass Panes
        const glassMat = new THREE.MeshStandardMaterial({
            color: 0xecf4fa,
            transparent: true,
            opacity: 0.20,
            roughness: 0.06,
            metalness: 0.8
        });
        const glassPane = new THREE.Mesh(new THREE.PlaneGeometry(frameW - 0.10, frameH - 0.10), glassMat);
        glassPane.position.set(0, 1.57, frameZ + 0.01);
        scene.add(glassPane);

        // Parisian Iron Balcony Railing outside window (Classic decorative balustrade)
        const railTop = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.04, 0.06), darkIronMat);
        railTop.position.set(0, 1.15, frameZ - 0.15);
        scene.add(railTop);

        const railBottom = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.03, 0.04), darkIronMat);
        railBottom.position.set(0, 0.52, frameZ - 0.15);
        scene.add(railBottom);

        for (let bx = -2.3; bx <= 2.3; bx += 0.18) {
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.63), darkIronMat);
            bar.position.set(bx, 0.835, frameZ - 0.15);
            scene.add(bar);
        }

        // Sheer White French Window Drapery
        const drapeMat = new THREE.MeshStandardMaterial({
            color: 0xf5f3ee,
            roughness: 0.95,
            side: THREE.DoubleSide
        });
        const drapeL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.25, 0.14), drapeMat);
        drapeL.position.set(-2.25, 1.65, -3.35);
        drapeL.castShadow = true;
        scene.add(drapeL);

        const drapeR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.25, 0.14), drapeMat);
        drapeR.position.set(2.25, 1.65, -3.35);
        drapeR.castShadow = true;
        scene.add(drapeR);

        // Parisian Skyline Backdrop (Distant Haussmann rooflines & dome)
        const backdropGeo = new THREE.PlaneGeometry(36, 14);
        const backdropMat = new THREE.MeshBasicMaterial({ color: 0xc8d8e8 });
        const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
        backdrop.position.set(0, 3.5, -16.0);
        scene.add(backdrop);
    }

    // ===== 5. SCULPTURAL STARCK HOME FURNISHINGS (INSPIRATION MATCH) =====
    function buildStarckFurniture() {
        // High-end Material Palette
        const liquidChromeMat = new THREE.MeshStandardMaterial({
            color: 0xdde0e6,
            metalness: 0.96,
            roughness: 0.14
        });

        const brushedSteelMat = new THREE.MeshStandardMaterial({
            color: 0xcdcfd4,
            metalness: 0.88,
            roughness: 0.26
        });

        const creamBoucleMat = new THREE.MeshStandardMaterial({
            color: 0xeee7dd,
            roughness: 0.92
        });

        const burgundyVelvetMat = new THREE.MeshStandardMaterial({
            color: 0x4a0e1b,
            roughness: 0.80
        });

        const oatmealRugMat = new THREE.MeshStandardMaterial({
            color: 0xe5dfd4,
            roughness: 0.98
        });

        const whiteLacquerMat = new THREE.MeshStandardMaterial({
            color: 0xf8f6f2,
            roughness: 0.35,
            metalness: 0.04
        });

        const smokeGlassMat = new THREE.MeshStandardMaterial({
            color: 0x222428,
            transparent: true,
            opacity: 0.75,
            roughness: 0.1
        });

        const darkIronMat = new THREE.MeshStandardMaterial({
            color: 0x24262a,
            metalness: 0.75,
            roughness: 0.35
        });

        // 1. Large Plush Oatmeal Wool Area Rug (4.2m x 3.2m)
        const rug = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.014, 3.2), oatmealRugMat);
        rug.position.set(-0.20, 0.007, 0.20);
        rug.receiveShadow = true;
        scene.add(rug);

        // 2. Curved Organic Bouclé Modular Sofa (Sweeping C-shape from Bild 1)
        const sofaGroup = new THREE.Group();

        // 4 articulated curved sofa segments creating a gentle, organic crescent
        const segments = [
            { x: -1.40, z: -0.50, rotY: 0.30, len: 1.05 },
            { x: -0.80, z: 0.30, rotY: 0.12, len: 1.10 },
            { x: 0.25, z: 0.70, rotY: -0.15, len: 1.10 },
            { x: 1.30, z: 0.65, rotY: -0.45, len: 0.95 }
        ];

        segments.forEach(seg => {
            const segGroup = new THREE.Group();

            // Plump low rounded seat cushion
            const seat = new THREE.Mesh(new THREE.BoxGeometry(seg.len, 0.38, 0.95), creamBoucleMat);
            seat.position.set(0, 0.20, 0);
            seat.castShadow = true;
            segGroup.add(seat);

            // Rounded low backrest
            const back = new THREE.Mesh(new THREE.BoxGeometry(seg.len, 0.35, 0.28), creamBoucleMat);
            back.position.set(0, 0.50, -0.34);
            back.castShadow = true;
            segGroup.add(back);

            // Back pillows
            const pillow = new THREE.Mesh(new THREE.BoxGeometry(seg.len * 0.85, 0.28, 0.14), creamBoucleMat);
            pillow.position.set(0, 0.52, -0.22);
            pillow.rotation.x = -0.12;
            pillow.castShadow = true;
            segGroup.add(pillow);

            segGroup.position.set(seg.x, 0, seg.z);
            segGroup.rotation.y = seg.rotY;
            sofaGroup.add(segGroup);
        });

        // Contrasting Deep Burgundy Velvet Accent Pillow on Sofa (Bild 1)
        const accentPillow = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.14), burgundyVelvetMat);
        accentPillow.position.set(-0.55, 0.50, 0.30);
        accentPillow.rotation.set(-0.10, 0.25, 0.15);
        accentPillow.castShadow = true;
        sofaGroup.add(accentPillow);

        // Cream throw pillow
        const creamPillow = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.32, 0.12), creamBoucleMat);
        creamPillow.position.set(-1.10, 0.46, -0.20);
        creamPillow.rotation.set(-0.12, 0.40, 0.10);
        creamPillow.castShadow = true;
        sofaGroup.add(creamPillow);

        sofaGroup.position.set(-0.40, 0, 0.50);
        scene.add(sofaGroup);
        collisionBoxes.push({ minX: -2.3, maxX: 1.4, minZ: -0.4, maxZ: 1.6 });

        // 3. Sculptural "Liquid Metal" Polished Stainless Steel Coffee Table (Bild 1)
        const tableGroup = new THREE.Group();

        // Faceted organic liquid metal table body
        const tableBase = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.32, 7), liquidChromeMat);
        tableBase.scale.set(1.45, 1.0, 0.95);
        tableBase.position.y = 0.16;
        tableBase.castShadow = true;
        tableBase.receiveShadow = true;
        tableGroup.add(tableBase);

        // Top polished plane
        const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.02, 7), liquidChromeMat);
        tableTop.scale.set(1.45, 1.0, 0.95);
        tableTop.position.y = 0.33;
        tableTop.castShadow = true;
        tableGroup.add(tableTop);

        // Styling on Coffee Table:
        // Art Monograph Book ("Art by Beckman")
        const bookCover = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.04, 0.22), darkIronMat);
        bookCover.position.set(-0.25, 0.36, 0.05);
        bookCover.rotation.y = 0.12;
        tableGroup.add(bookCover);

        // Second smaller art catalog
        const book2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.025, 0.18), whiteLacquerMat);
        book2.position.set(-0.25, 0.39, 0.05);
        book2.rotation.y = 0.18;
        tableGroup.add(book2);

        // Polished Chrome Sphere
        const chromeSphere = new THREE.Mesh(new THREE.SphereGeometry(0.06, 24, 24), liquidChromeMat);
        chromeSphere.position.set(-0.02, 0.40, 0.08);
        tableGroup.add(chromeSphere);

        // Dark Glass Vase with Burgundy Flowers (Bild 1)
        const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.22, 24), smokeGlassMat);
        vase.position.set(0.22, 0.45, -0.05);
        tableGroup.add(vase);

        const flowers = new THREE.Mesh(new THREE.SphereGeometry(0.10, 16, 16), burgundyVelvetMat);
        flowers.position.set(0.22, 0.60, -0.05);
        flowers.scale.set(1.2, 0.8, 1.2);
        tableGroup.add(flowers);

        tableGroup.position.set(-0.20, 0, -0.30);
        scene.add(tableGroup);
        collisionBoxes.push({ minX: -0.9, maxX: 0.6, minZ: -0.8, maxZ: 0.2 });

        // 4. Polished Stainless Steel Cylinder Side Table (Bild 1)
        const sideTable = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.46, 32), liquidChromeMat);
        sideTable.position.set(-2.30, 0.23, 0.10);
        sideTable.castShadow = true;
        scene.add(sideTable);

        const bronzeDish = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.06, 0.03, 24), darkIronMat);
        bronzeDish.position.set(-2.30, 0.475, 0.10);
        scene.add(bronzeDish);
        collisionBoxes.push({ minX: -2.6, maxX: -2.0, minZ: -0.2, maxZ: 0.4 });

        // 5. Sculptural Burgundy Wool Armchair (Bild 1)
        const armChairGroup = new THREE.Group();

        // Deep bucket seat in wine-red wool
        const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.36, 0.68), burgundyVelvetMat);
        chairSeat.position.set(0, 0.34, 0);
        chairSeat.castShadow = true;
        armChairGroup.add(chairSeat);

        // Sculptural curved high wrap-around back
        const chairBack = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.48, 24, 1, false, 0, Math.PI), burgundyVelvetMat);
        chairBack.rotation.y = -Math.PI / 2;
        chairBack.position.set(0, 0.62, -0.15);
        chairBack.castShadow = true;
        armChairGroup.add(chairBack);

        // 4 Thick Sculptural Cylindrical Legs
        const thickLegGeo = new THREE.CylinderGeometry(0.065, 0.085, 0.32, 24);
        [[-0.26, -0.22], [0.26, -0.22], [-0.26, 0.22], [0.26, 0.22]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(thickLegGeo, burgundyVelvetMat);
            leg.position.set(lx, 0.16, lz);
            leg.castShadow = true;
            armChairGroup.add(leg);
        });

        armChairGroup.position.set(1.45, 0, -0.50);
        armChairGroup.rotation.y = -Math.PI * 0.35; // Angled towards sofa & table
        scene.add(armChairGroup);
        collisionBoxes.push({ minX: 1.0, maxX: 1.9, minZ: -0.9, maxZ: -0.1 });

        // 6. Flos Arco Polished Chrome Floor Lamp (Bild 1)
        const lampGroup = new THREE.Group();

        // White Carrara Marble Base Block
        const marbleBase = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.48, 0.24), whiteLacquerMat);
        marbleBase.position.set(0, 0.24, 0);
        marbleBase.castShadow = true;
        lampGroup.add(marbleBase);

        // Sweeping Polished Chrome Arch Tube
        const arcCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0.48, 0),
            new THREE.Vector3(0, 1.90, 0),
            new THREE.Vector3(0.30, 2.55, -0.40),
            new THREE.Vector3(0.90, 2.45, -0.90),
            new THREE.Vector3(1.35, 2.15, -1.25)
        ]);
        const arcGeo = new THREE.TubeGeometry(arcCurve, 32, 0.016, 12, false);
        const arcMesh = new THREE.Mesh(arcGeo, liquidChromeMat);
        lampGroup.add(arcMesh);

        // Polished Chrome Hemispherical Dome Shade
        const shade = new THREE.Mesh(new THREE.SphereGeometry(0.19, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), liquidChromeMat);
        shade.rotation.x = Math.PI;
        shade.position.set(1.35, 2.15, -1.25);
        shade.castShadow = true;
        lampGroup.add(shade);

        lampGroup.position.set(-2.70, 0, 1.20);
        scene.add(lampGroup);
        collisionBoxes.push({ minX: -2.9, maxX: -2.4, minZ: 1.0, maxZ: 1.5 });

        // 7. Low White & Brushed Steel Sideboard / Credenza under "My Heart Has Teeth" (Bild 1)
        const credenzaGroup = new THREE.Group();

        // Low Satin White Credenza Body ($2.60m long x 0.45m deep x 0.52m high)
        const credenzaBody = new THREE.Mesh(new THREE.BoxGeometry(2.60, 0.48, 0.45), whiteLacquerMat);
        credenzaBody.position.set(0, 0.28, 0);
        credenzaBody.castShadow = true;
        credenzaBody.receiveShadow = true;
        credenzaGroup.add(credenzaBody);

        // Brushed Steel Shadow Gap & Plinth Legs
        const credenzaPlinth = new THREE.Mesh(new THREE.BoxGeometry(2.56, 0.04, 0.42), brushedSteelMat);
        credenzaPlinth.position.set(0, 0.02, 0);
        credenzaGroup.add(credenzaPlinth);

        // Styling on Credenza:
        // Oluce Atollo Style Chrome Mushroom Table Lamp (Bild 1)
        const atolloGroup = new THREE.Group();
        const atolloBase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 0.28, 24), liquidChromeMat);
        atolloBase.position.y = 0.14;
        atolloGroup.add(atolloBase);

        const atolloDome = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), liquidChromeMat);
        atolloDome.rotation.x = Math.PI;
        atolloDome.position.y = 0.32;
        atolloGroup.add(atolloDome);

        atolloGroup.position.set(1.05, 0.52, 0);
        credenzaGroup.add(atolloGroup);

        // Tall Branch Vase with Green Twigs (Bild 1)
        const branchVase = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.32, 24), smokeGlassMat);
        branchVase.position.set(-0.95, 0.68, 0);
        credenzaGroup.add(branchVase);

        const branches = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 8), darkIronMat);
        branches.position.set(-0.95, 0.98, 0);
        credenzaGroup.add(branches);

        // Stacks of Art Books & Bronze Bowl on Credenza
        const credenzaBook = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.03, 0.20), darkIronMat);
        credenzaBook.position.set(0.65, 0.535, 0);
        credenzaGroup.add(credenzaBook);

        const bronzeBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 0.035, 24), darkIronMat);
        bronzeBowl.position.set(-0.05, 0.54, 0);
        credenzaGroup.add(bronzeBowl);

        credenzaGroup.position.set(0.80, 0, 3.15);
        scene.add(credenzaGroup);
        collisionBoxes.push({ minX: -0.6, maxX: 2.2, minZ: 2.8, maxZ: 3.4 });
    }

    // ===== 6. LIGHTING DESIGN =====
    function setupLighting() {
        // Soft ambient daylight fill
        const ambient = new THREE.AmbientLight(0xfff5ea, 0.28);
        scene.add(ambient);

        // Hemisphere sky/floor bounce
        const hemi = new THREE.HemisphereLight(0xecf3fb, 0xdcd1c2, 0.42);
        scene.add(hemi);

        // Natural Directional Daylight from the North French Window
        const sun = new THREE.DirectionalLight(0xfff8ee, 1.25);
        sun.position.set(1.5, 4.2, -6.0);
        sun.target.position.set(0, 0.8, 0.8);
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

        // Flos Arc Lamp soft warm glow over the seating lounge
        const flosLight = new THREE.PointLight(0xffecd0, 0.70, 5.0);
        flosLight.position.set(-1.35, 2.05, -0.05);
        scene.add(flosLight);

        // Oluce Atollo Table Lamp warm glow on credenza
        const atolloLight = new THREE.PointLight(0xffeed6, 0.65, 3.5);
        atolloLight.position.set(1.85, 0.90, 3.15);
        scene.add(atolloLight);
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

