/**
 * 3D Walk Around Engine — Art by Beckman
 * Philippe Starck-inspired Luxury Modern Penthouse Virtual Gallery
 * Powered by Three.js WebGL
 */

(function () {
    'use strict';

    // Global references
    let scene, camera, renderer, clock;
    let paintingsGroup, furnitureGroup, spotlights = [];
    let interactivePaintings = [];
    let isLocked = false;
    let raycaster, mouse;

    // Expose debug handles
    window.__WALKAROUND__ = {
        get scene() { return scene; },
        get camera() { return camera; },
        get renderer() { return renderer; },
        get interactivePaintings() { return interactivePaintings; },
        inspectArtwork: (mesh) => inspectArtwork(mesh),
        teleportToRoom: (roomKey) => teleportToRoom(roomKey)
    };

    // Movement & Controls state
    const moveState = { forward: false, backward: false, left: false, right: false };
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();
    const player = {
        height: 1.68, // Eye height in meters
        speed: 4.5,
        radius: 0.45
    };

    // Camera rotation angles
    let pitch = 0; // Look up/down
    let yaw = Math.PI; // Look left/right (start looking North)

    // Touch control state
    const touchState = {
        active: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        lookTouchId: null,
        lookStartX: 0,
        lookStartY: 0
    };

    // Room Waypoints for smooth teleportation
    const ROOM_WAYPOINTS = {
        'salon': { x: 0, y: 1.68, z: 3.8, yaw: 0, pitch: -0.05, name: 'Grand Living Salon' },
        'kitchen': { x: 10.5, y: 1.68, z: 5.5, yaw: -Math.PI / 2, pitch: 0, name: 'Stainless Kitchen Studio' },
        'linnea': { x: 0, y: 1.68, z: -1.8, yaw: 0, pitch: -0.02, name: 'Linnéa Gallery Hall' },
        'master': { x: -10.5, y: 1.68, z: -5.5, yaw: Math.PI / 2, pitch: 0, name: 'Master Lounge Suite' },
        'terrace': { x: 0, y: 1.68, z: 11.5, yaw: Math.PI, pitch: 0.05, name: 'Sky Terrace' }
    };

    let targetCameraPos = null;
    let targetCameraLook = null;
    let inspectingArtwork = null;

    // Mini-map canvas
    let minimapCanvas, minimapCtx;

    // Collision Bounding Boxes (Walls & obstacles)
    const collisionBoxes = [];

    // Initialize Engine when DOM is ready
    window.addEventListener('DOMContentLoaded', init);

    function init() {
        const container = document.getElementById('walkaround-canvas-container');
        if (!container) return;

        // 1. Three.js Scene, Camera, Renderer
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5f6f8);
        scene.fog = new THREE.FogExp2(0xf5f6f8, 0.015);

        camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, player.height, 3.8);
        yaw = 0;
        updateCameraRotation();
        camera.rotation.order = 'YXZ';

        clock = new THREE.Clock();
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        if (typeof THREE.sRGBEncoding !== 'undefined') {
            renderer.outputEncoding = THREE.sRGBEncoding;
        } else if (typeof THREE.SRGBColorSpace !== 'undefined') {
            renderer.outputColorSpace = THREE.SRGBColorSpace;
        }
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        paintingsGroup = new THREE.Group();
        furnitureGroup = new THREE.Group();
        scene.add(paintingsGroup);
        scene.add(furnitureGroup);

        // 2. Build World
        buildLighting();
        buildApartmentArchitecture();
        buildDesignerFurniture();
        placeCuratedPaintings();

        // 3. Setup Mini-map
        setupMinimap();

        // 4. Event Listeners & Interaction
        setupControls();
        setupHUD();
        window.addEventListener('resize', onWindowResize);

        // 5. Hide Loading Screen
        setTimeout(() => {
            const loader = document.getElementById('walkaround-loader');
            if (loader) {
                loader.classList.add('loaded');
                setTimeout(() => loader.style.display = 'none', 600);
            }
        }, 1200);

        // 6. Start Render Loop
        animate();
    }

    /* =========================================================================
       1. LIGHTING & ATMOSPHERE
       ========================================================================= */
    function buildLighting() {
        // Soft ambient fill
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
        scene.add(ambientLight);

        // Sunlight streaming from north panoramic windows
        const sunLight = new THREE.DirectionalLight(0xfffbf2, 1.1);
        sunLight.position.set(5, 12, 18);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 40;
        sunLight.shadow.camera.left = -18;
        sunLight.shadow.camera.right = 18;
        sunLight.shadow.camera.top = 18;
        sunLight.shadow.camera.bottom = -18;
        sunLight.shadow.bias = -0.0003;
        scene.add(sunLight);

        // Soft interior bounce light
        const interiorBounce = new THREE.HemisphereLight(0xffffff, 0xe2e6ea, 0.45);
        scene.add(interiorBounce);
    }

    /* =========================================================================
       2. PHILIPPE STARCK APARTMENT ARCHITECTURE
       ========================================================================= */
    function buildApartmentArchitecture() {
        // Materials
        // Floor: Polished Pale Concrete / Terrazzo
        const floorGeo = new THREE.PlaneGeometry(36, 28);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0xeeeeee,
            roughness: 0.18,
            metalness: 0.08
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        // Ceiling: Clean Matte Gallery White with recessed lighting slots
        const ceilGeo = new THREE.PlaneGeometry(36, 28);
        const ceilMat = new THREE.MeshStandardMaterial({
            color: 0xfcfcfc,
            roughness: 0.9,
            metalness: 0.0
        });
        const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
        ceiling.position.y = 3.4;
        ceiling.rotation.x = Math.PI / 2;
        scene.add(ceiling);

        // Shared Wall Material: Crisp Gallery White
        const wallMat = new THREE.MeshStandardMaterial({
            color: 0xfafafa,
            roughness: 0.85,
            metalness: 0.02
        });

        // Stainless Steel Trim Material (Baseboards, mullions, details)
        const steelMat = new THREE.MeshStandardMaterial({
            color: 0xd8d8d8,
            roughness: 0.22,
            metalness: 0.88
        });

        // Helper to create solid architectural walls with stainless baseboards
        function createWall(x, z, width, depth, height = 3.4, y = 1.7) {
            const wallGeo = new THREE.BoxGeometry(width, height, depth);
            const wall = new THREE.Mesh(wallGeo, wallMat);
            wall.position.set(x, y, z);
            wall.castShadow = true;
            wall.receiveShadow = true;
            scene.add(wall);

            // Stainless steel baseboard
            const baseGeo = new THREE.BoxGeometry(width + 0.02, 0.08, depth + 0.02);
            const baseboard = new THREE.Mesh(baseGeo, steelMat);
            baseboard.position.set(x, 0.04, z);
            scene.add(baseboard);

            // Add to collision
            const box = new THREE.Box3().setFromObject(wall);
            // Expand slightly for player comfort
            box.expandByScalar(0.2);
            collisionBoxes.push(box);

            return wall;
        }

        // --- EXTERIOR PERIMETER WALLS ---
        // North Wall: Glass Windows with central opening to Terrace
        createWall(-11, 12, 10, 0.3);
        createWall(11, 12, 10, 0.3);
        createWall(-5.9, 12, 0.4, 0.3);
        createWall(5.9, 12, 0.4, 0.3);

        // South Perimeter Wall
        createWall(0, -12, 34, 0.3);

        // East Perimeter Wall (Kitchen & Dining Studio)
        createWall(16, 0, 0.3, 24);

        // West Perimeter Wall (Living Room & Master Suite)
        createWall(-16, 0, 0.3, 24);

        // --- INTERIOR PARTITION WALLS ---
        // 1. Dividing Wall between Salon (West) and Kitchen/Dining (East) [Z: 1.5 to 11.5]
        createWall(6, 6.5, 0.3, 9);

        // 2. Dividing Wall between Master Suite (West) and Linnéa Hallway (Center) [Z: -11.8 to -0.2]
        createWall(-5, -6, 0.3, 11.5);

        // 3. Dividing Wall between Linnéa Hallway (Center) and East Wing [Z: -11.8 to -0.2]
        createWall(5, -6, 0.3, 11.5);

        // 4. Central Grand Salon Feature Wall (North facing, Z = 0)
        createWall(0, 0, 8.8, 0.3);

        // 5. West Wing Central Divider (Master Suite North Wall)
        createWall(-11.5, 0, 8.8, 0.3);

        // 6. East Wing Central Divider (Kitchen South Wall)
        createWall(11.5, 0, 8.8, 0.3);

        // --- PANORAMIC WINDOWS & BALCONY TERRACE ---
        const glassMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.25,
            roughness: 0.05,
            metalness: 0.1,
            transmission: 0.9,
            ior: 1.5
        });

        // Floor-to-ceiling glass panels along North
        const glassGeo = new THREE.BoxGeometry(11.6, 3.2, 0.05);
        const glassNorth = new THREE.Mesh(glassGeo, glassMat);
        glassNorth.position.set(0, 1.7, 12);
        scene.add(glassNorth);

        // Terrace Glass Balustrade
        const balustradeGeo = new THREE.BoxGeometry(12, 1.1, 0.05);
        const balustrade = new THREE.Mesh(balustradeGeo, glassMat);
        balustrade.position.set(0, 0.55, 14.5);
        scene.add(balustrade);

        // Stainless Steel Handrail
        const handrailGeo = new THREE.BoxGeometry(12.1, 0.06, 0.08);
        const handrail = new THREE.Mesh(handrailGeo, steelMat);
        handrail.position.set(0, 1.1, 14.5);
        scene.add(handrail);

        // Terrace Side Rails
        const sideRailGeo = new THREE.BoxGeometry(0.05, 1.1, 2.5);
        const sideRailL = new THREE.Mesh(sideRailGeo, glassMat);
        sideRailL.position.set(-6, 0.55, 13.25);
        scene.add(sideRailL);
        const sideRailR = new THREE.Mesh(sideRailGeo, glassMat);
        sideRailR.position.set(6, 0.55, 13.25);
        scene.add(sideRailR);

        // City Horizon Backdrop
        buildSkylineBackdrop();
    }

    function buildSkylineBackdrop() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Gradient sky (soft luminous twilight/daylight)
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, '#dbe7f3');
        grad.addColorStop(0.65, '#f5e8ea');
        grad.addColorStop(0.85, '#faeed9');
        grad.addColorStop(1, '#e3eef5');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 512);

        // Subtle minimalist city skyline silhouettes
        ctx.fillStyle = 'rgba(180, 190, 205, 0.35)';
        for (let i = 0; i < 40; i++) {
            const w = 15 + Math.random() * 35;
            const h = 40 + Math.random() * 110;
            const x = i * 26;
            const y = 440 - h;
            ctx.fillRect(x, y, w, h);
        }

        const texture = new THREE.CanvasTexture(canvas);
        const backdropGeo = new THREE.PlaneGeometry(60, 25);
        const backdropMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
        backdrop.position.set(0, 6, 22);
        scene.add(backdrop);
    }

    /* =========================================================================
       3. PHILIPPE STARCK-INSPIRED DESIGNER FURNITURE
       ========================================================================= */
    function buildDesignerFurniture() {
        const steelMat = new THREE.MeshStandardMaterial({
            color: 0xefefef,
            roughness: 0.15,
            metalness: 0.92
        });

        const ghostMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.55,
            roughness: 0.1,
            metalness: 0.1,
            transmission: 0.75,
            ior: 1.45
        });

        const leatherMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.4,
            metalness: 0.05
        });

        // --- 1. STAINLESS STEEL KITCHEN ISLAND (Zone 2) ---
        const islandGeo = new THREE.BoxGeometry(4.2, 0.92, 1.4);
        const island = new THREE.Mesh(islandGeo, steelMat);
        island.position.set(10.5, 0.46, 5.5);
        island.castShadow = true;
        island.receiveShadow = true;
        furnitureGroup.add(island);

        // Induction hob
        const hobGeo = new THREE.BoxGeometry(0.9, 0.01, 0.55);
        const hobMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.9 });
        const hob = new THREE.Mesh(hobGeo, hobMat);
        hob.position.set(9.5, 0.925, 5.5);
        furnitureGroup.add(hob);

        // Minimalist Starck Arc Faucet
        const faucetGeo = new THREE.TorusGeometry(0.18, 0.02, 16, 32, Math.PI);
        const faucet = new THREE.Mesh(faucetGeo, steelMat);
        faucet.rotation.z = Math.PI;
        faucet.position.set(11.8, 1.15, 5.5);
        furnitureGroup.add(faucet);

        // Add Island to collision
        collisionBoxes.push(new THREE.Box3().setFromObject(island).expandByScalar(0.2));

        // --- 2. MINIMALIST LOUNGE SEATING (Zone 1: Grand Salon) ---
        // Low-profile Starck Chaise / Sofa
        const sofaBaseGeo = new THREE.BoxGeometry(3.2, 0.38, 1.2);
        const sofaBase = new THREE.Mesh(sofaBaseGeo, leatherMat);
        sofaBase.position.set(0, 0.19, 5.5);
        sofaBase.castShadow = true;
        furnitureGroup.add(sofaBase);

        const sofaBackGeo = new THREE.BoxGeometry(3.2, 0.4, 0.3);
        const sofaBack = new THREE.Mesh(sofaBackGeo, leatherMat);
        sofaBack.position.set(0, 0.5, 6.0);
        sofaBack.castShadow = true;
        furnitureGroup.add(sofaBack);

        // Stainless Steel and Glass Coffee Table
        const tableBaseGeo = new THREE.BoxGeometry(1.6, 0.04, 0.9);
        const tableBase = new THREE.Mesh(tableBaseGeo, steelMat);
        tableBase.position.set(0, 0.28, 4.2);
        furnitureGroup.add(tableBase);

        const tableLegGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.28);
        [-0.7, 0.7].forEach(lx => {
            [-0.35, 0.35].forEach(lz => {
                const leg = new THREE.Mesh(tableLegGeo, steelMat);
                leg.position.set(lx, 0.14, 4.2 + lz);
                furnitureGroup.add(leg);
            });
        });

        // Iconic Ghost Chair in Dining area
        function createGhostChair(x, z, rotY) {
            const chairGroup = new THREE.Group();
            // Seat
            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.04, 0.46), ghostMat);
            seat.position.y = 0.46;
            chairGroup.add(seat);

            // Oval Backrest
            const back = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 32), ghostMat);
            back.rotation.x = Math.PI / 2;
            back.position.set(0, 0.76, -0.2);
            chairGroup.add(back);

            // Legs
            const legGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.46);
            [-0.18, 0.18].forEach(lx => {
                [-0.18, 0.18].forEach(lz => {
                    const leg = new THREE.Mesh(legGeo, ghostMat);
                    leg.position.set(lx, 0.23, lz);
                    chairGroup.add(leg);
                });
            });

            chairGroup.position.set(x, 0, z);
            chairGroup.rotation.y = rotY;
            furnitureGroup.add(chairGroup);
        }

        createGhostChair(8.8, 4.4, Math.PI * 0.1);
        createGhostChair(10.2, 4.4, 0);
        createGhostChair(11.6, 4.4, -Math.PI * 0.1);

        // Minimalist Sculptural Pedestal in Salon Corner
        const pedestalGeo = new THREE.BoxGeometry(0.5, 1.1, 0.5);
        const pedestal = new THREE.Mesh(pedestalGeo, steelMat);
        pedestal.position.set(-5.2, 0.55, 10.5);
        furnitureGroup.add(pedestal);

        // Abstract Sculptural Element on Pedestal
        const torusGeo = new THREE.TorusGeometry(0.18, 0.05, 16, 64);
        const torusMat = new THREE.MeshStandardMaterial({ color: 0xe6007e, roughness: 0.15, metalness: 0.8 });
        const sculpture = new THREE.Mesh(torusGeo, torusMat);
        sculpture.position.set(-5.2, 1.35, 10.5);
        sculpture.rotation.x = Math.PI / 4;
        furnitureGroup.add(sculpture);
    }

    /* =========================================================================
       4. CURATED 50 PAINTINGS WITH ACCURATE PHYSICAL METRIC SCALING
       ========================================================================= */
    function placeCuratedPaintings() {
        if (typeof WALKAROUND_PAINTINGS === 'undefined' || !WALKAROUND_PAINTINGS.length) {
            console.error('WALKAROUND_PAINTINGS dataset is missing!');
            return;
        }

        const textureLoader = new THREE.TextureLoader();
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.35,
            metalness: 0.6
        });

        // 50 Paintings Wall Layout Configuration
        // Assign each painting (index 0..49) to specific architectural zones and wall coordinates
        const wallAssignments = calculatePaintingWallPositions(WALKAROUND_PAINTINGS);

        wallAssignments.forEach((item, index) => {
            const pData = item.data;
            const w = pData.widthM;
            const h = pData.heightM;
            const depth = 0.04; // 4cm physical canvas depth

            // Asynchronously load artwork texture with sRGB encoding & NPOT support
            const tex = textureLoader.load(
                encodeURI(pData.src),
                (loadedTex) => {
                    if (typeof THREE.sRGBEncoding !== 'undefined') {
                        loadedTex.encoding = THREE.sRGBEncoding;
                    } else if (typeof THREE.SRGBColorSpace !== 'undefined') {
                        loadedTex.colorSpace = THREE.SRGBColorSpace;
                    }
                    loadedTex.generateMipmaps = false;
                    loadedTex.minFilter = THREE.LinearFilter;
                    loadedTex.magFilter = THREE.LinearFilter;
                    loadedTex.wrapS = THREE.ClampToEdgeWrapping;
                    loadedTex.wrapT = THREE.ClampToEdgeWrapping;
                    loadedTex.needsUpdate = true;
                },
                undefined,
                (err) => {
                    console.warn(`Could not load texture for ID ${pData.id}: ${pData.src}`);
                }
            );
            if (typeof THREE.sRGBEncoding !== 'undefined') {
                tex.encoding = THREE.sRGBEncoding;
            } else if (typeof THREE.SRGBColorSpace !== 'undefined') {
                tex.colorSpace = THREE.SRGBColorSpace;
            }
            tex.generateMipmaps = false;
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;

            const canvasMat = new THREE.MeshBasicMaterial({
                map: tex,
                color: 0xffffff,
                side: THREE.DoubleSide
            });

            // Group containing artwork + frame + plaque
            const artGroup = new THREE.Group();

            // Charcoal Aluminium Floating Frame Backing (Placed behind canvas)
            const frameGeo = new THREE.BoxGeometry(w + 0.04, h + 0.04, 0.03);
            const frameMesh = new THREE.Mesh(frameGeo, frameMat);
            frameMesh.position.set(0, 0, -0.01);
            frameMesh.castShadow = true;
            artGroup.add(frameMesh);

            // Front Artwork Canvas Plane (Placed in front of frame with DoubleSide)
            const canvasGeo = new THREE.PlaneGeometry(w, h);
            const canvasMesh = new THREE.Mesh(canvasGeo, canvasMat);
            canvasMesh.position.set(0, 0, 0.01);
            canvasMesh.castShadow = false;
            canvasMesh.receiveShadow = false;
            artGroup.add(canvasMesh);

            // Stainless Steel Minimalist Wall Plaque
            const plaqueCanvas = createPlaqueCanvas(pData);
            const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
            if (typeof THREE.sRGBEncoding !== 'undefined') {
                plaqueTex.encoding = THREE.sRGBEncoding;
            } else if (typeof THREE.SRGBColorSpace !== 'undefined') {
                plaqueTex.colorSpace = THREE.SRGBColorSpace;
            }
            const plaqueGeo = new THREE.PlaneGeometry(0.24, 0.08);
            const plaqueMat = new THREE.MeshBasicMaterial({ map: plaqueTex, side: THREE.DoubleSide });
            const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
            plaqueMesh.position.set(0, -(h / 2) - 0.12, 0.01);
            artGroup.add(plaqueMesh);

            // Position and Rotate the Artwork Group
            artGroup.position.set(item.x, item.y, item.z);
            artGroup.rotation.y = item.rotY;
            paintingsGroup.add(artGroup);

            // Add Directional Gallery Spotlight for each artwork
            const spot = new THREE.SpotLight(0xfffaec, 1.4, 6, Math.PI / 4.5, 0.45, 1.0);
            const lightOffset = new THREE.Vector3(0, 1.2, 1.0).applyAxisAngle(new THREE.Vector3(0, 1, 0), item.rotY);
            spot.position.set(item.x + lightOffset.x, 3.2, item.z + lightOffset.z);
            spot.target = artGroup;
            scene.add(spot);
            spotlights.push(spot);

            // Store metadata for raycasting / interactive click
            canvasMesh.userData = {
                artwork: pData,
                group: artGroup,
                normal: item.normal,
                inspectPos: item.inspectPos,
                inspectLook: new THREE.Vector3(item.x, item.y, item.z)
            };
            interactivePaintings.push(canvasMesh);
        });
    }

    /**
     * Create high-res 2D canvas plaque with elegant typography
     */
    function createPlaqueCanvas(p) {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 170;
        const ctx = c.getContext('2d');

        // Brushed Stainless Steel Plaque Background
        const grad = ctx.createLinearGradient(0, 0, 512, 170);
        grad.addColorStop(0, '#f2f2f2');
        grad.addColorStop(0.5, '#e4e4e4');
        grad.addColorStop(1, '#d8d8d8');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 170);

        // Fine border line
        ctx.strokeStyle = '#b0b0b0';
        ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, 504, 162);

        // Title
        ctx.fillStyle = '#111111';
        ctx.font = 'bold 36px "Inter", "Helvetica Neue", sans-serif';
        ctx.fillText(p.title.toUpperCase(), 24, 56);

        // Details: Size & Medium
        ctx.fillStyle = '#555555';
        ctx.font = '500 24px "Inter", "Helvetica Neue", sans-serif';
        const sizeStr = p.size ? p.size : `${(p.widthM * 100).toFixed(0)} × ${(p.heightM * 100).toFixed(0)} cm`;
        ctx.fillText(`${sizeStr}  •  ${p.year || '2026'}`, 24, 100);

        // Material / Technique
        ctx.fillStyle = '#777777';
        ctx.font = 'italic 20px "Playfair Display", Georgia, serif';
        const mat = p.material ? p.material : 'Acrylic & mixed media on canvas';
        ctx.fillText(mat.length > 38 ? mat.substring(0, 38) + '...' : mat, 24, 138);

        return c;
    }

    /**
     * Curated Wall Placements for exactly 50 paintings across the 4 apartment zones
     */
    function calculatePaintingWallPositions(paintings) {
        const positions = [];
        const eyeY = 1.62; // Standard museum hanging center line

        // Zone 1: Grand Living Salon (13 Paintings: IDs 270, 267..256)
        // 1.1 Main South Feature Wall (Facing North into Salon) [Z = 0.16, X: -4.3 to +4.3]
        const salonSouth = [paintings[1], paintings[4], paintings[5], paintings[6]]; // Origami, Pink Dress, Black Mirror, My Heart Has Teeth
        const southSpacing = 2.15;
        salonSouth.forEach((p, i) => {
            const x = -3.2 + i * southSpacing;
            positions.push({
                data: p,
                x: x,
                y: eyeY,
                z: 0.17,
                rotY: 0,
                normal: new THREE.Vector3(0, 0, 1),
                inspectPos: new THREE.Vector3(x, eyeY, 1.8)
            });
        });

        // 1.2 Salon West Perimeter Wall (Facing East) [X = -15.84, Z: 1 to 10.5]
        const salonWest = [paintings[7], paintings[8], paintings[9], paintings[10], paintings[11], paintings[12]]; // Warmpop, Grapefruit, Love In Lo-fi, Pearls, Who Knew, Red Rain
        const westSpacing = 1.6;
        salonWest.forEach((p, i) => {
            const z = 1.5 + i * westSpacing;
            positions.push({
                data: p,
                x: -15.83,
                y: eyeY,
                z: z,
                rotY: Math.PI / 2,
                normal: new THREE.Vector3(1, 0, 0),
                inspectPos: new THREE.Vector3(-14.2, eyeY, z)
            });
        });

        // 1.3 Salon East Dividing Wall (Facing West) [X = 5.84, Z: 3 to 8]
        const salonEast = [paintings[13], paintings[14], paintings[15]]; // Daylight, Bright Lights, Lost In Translation
        const seSpacing = 2.0;
        salonEast.forEach((p, i) => {
            const z = 3.5 + i * seSpacing;
            positions.push({
                data: p,
                x: 5.83,
                y: eyeY,
                z: z,
                rotY: -Math.PI / 2,
                normal: new THREE.Vector3(-1, 0, 0),
                inspectPos: new THREE.Vector3(4.2, eyeY, z)
            });
        });

        // Zone 2: Stainless Kitchen & Dining Studio (11 Paintings: IDs 271, 269, 268, 255..248)
        // 2.1 East Perimeter Wall (Facing West) [X = 15.84, Z: 1 to 10.5]
        const kitchenEast = [
            paintings[0], paintings[2], paintings[3], // Golden Ticket, Vertigo, Raspberry Beret
            paintings[16], paintings[17], paintings[18], paintings[19], paintings[20] // Equinoxe 1.7..Equinoxe 1.3
        ];
        const kSpacing = 1.15;
        kitchenEast.forEach((p, i) => {
            const z = 1.2 + i * kSpacing;
            positions.push({
                data: p,
                x: 15.83,
                y: eyeY,
                z: z,
                rotY: -Math.PI / 2,
                normal: new THREE.Vector3(-1, 0, 0),
                inspectPos: new THREE.Vector3(14.2, eyeY, z)
            });
        });

        // 2.2 Kitchen South Wall (Facing North) [Z = 0.16, X: 8 to 15]
        const kitchenSouth = [paintings[21], paintings[22], paintings[23]]; // Linnéas Trilogi 3, 2, 1
        const ksSpacing = 2.4;
        kitchenSouth.forEach((p, i) => {
            const x = 8.8 + i * ksSpacing;
            positions.push({
                data: p,
                x: x,
                y: eyeY,
                z: 0.17,
                rotY: 0,
                normal: new THREE.Vector3(0, 0, 1),
                inspectPos: new THREE.Vector3(x, eyeY, 1.8)
            });
        });

        // Zone 3: Linnéa Gallery Hallway (15 Paintings: IDs 247 down to 233)
        // 3.1 West Wall of Corridor (Facing East) [X = -4.84, Z: -1.2 to -10.5]
        const linneaWest = [
            paintings[24], paintings[25], paintings[26], paintings[27], paintings[28], paintings[29], paintings[30] // Graines D´Étoiles..Neverland
        ];
        const lwSpacing = 1.35;
        linneaWest.forEach((p, i) => {
            const z = -1.2 - i * lwSpacing;
            positions.push({
                data: p,
                x: -4.83,
                y: eyeY,
                z: z,
                rotY: Math.PI / 2,
                normal: new THREE.Vector3(1, 0, 0),
                inspectPos: new THREE.Vector3(-3.2, eyeY, z)
            });
        });

        // 3.2 East Wall of Corridor (Facing West) [X = 4.84, Z: -1.2 to -10.5]
        const linneaEast = [
            paintings[31], paintings[32], paintings[33], paintings[34], paintings[35], paintings[36], paintings[37] // Metropolis..Signs
        ];
        const leSpacing = 1.35;
        linneaEast.forEach((p, i) => {
            const z = -1.2 - i * leSpacing;
            positions.push({
                data: p,
                x: 4.83,
                y: eyeY,
                z: z,
                rotY: -Math.PI / 2,
                normal: new THREE.Vector3(-1, 0, 0),
                inspectPos: new THREE.Vector3(3.2, eyeY, z)
            });
        });

        // 3.3 Corridor South End Feature Wall [Z = -11.84, X = 0]
        positions.push({
            data: paintings[38], // Prism (ID 233)
            x: 0,
            y: eyeY,
            z: -11.83,
            rotY: 0,
            normal: new THREE.Vector3(0, 0, 1),
            inspectPos: new THREE.Vector3(0, eyeY, -10.2)
        });

        // Zone 4: Master Lounge & Suite (11 Paintings: IDs 232 down to 222)
        // 4.1 West Wall of Master Suite [X = -15.84, Z: -1.5 to -10.5]
        const masterWest = [
            paintings[39], paintings[40], paintings[41], paintings[42], paintings[43], paintings[44] // Petals..Limelight
        ];
        const mwSpacing = 1.5;
        masterWest.forEach((p, i) => {
            const z = -1.5 - i * mwSpacing;
            positions.push({
                data: p,
                x: -15.83,
                y: eyeY,
                z: z,
                rotY: Math.PI / 2,
                normal: new THREE.Vector3(1, 0, 0),
                inspectPos: new THREE.Vector3(-14.2, eyeY, z)
            });
        });

        // 4.2 South Wall of Master Suite [Z = -11.84, X: -14 to -6]
        const masterSouth = [
            paintings[45], paintings[46], paintings[47], paintings[48], paintings[49] // The Big Chair..Equinoxe 1.2
        ];
        const msSpacing = 1.5;
        masterSouth.forEach((p, i) => {
            const x = -13.2 + i * msSpacing;
            positions.push({
                data: p,
                x: x,
                y: eyeY,
                z: -11.83,
                rotY: 0,
                normal: new THREE.Vector3(0, 0, 1),
                inspectPos: new THREE.Vector3(x, eyeY, -10.2)
            });
        });

        return positions;
    }

    /* =========================================================================
       5. CONTROLS, INTERACTION & COLLISION DETECTION
       ========================================================================= */
    function setupControls() {
        const dom = renderer.domElement;

        // Desktop Keyboard WASD / Arrows
        window.addEventListener('keydown', (e) => {
            if (inspectingArtwork && e.key === 'Escape') {
                closeArtworkModal();
                return;
            }
            switch (e.code) {
                case 'KeyW': case 'ArrowUp': moveState.forward = true; break;
                case 'KeyS': case 'ArrowDown': moveState.backward = true; break;
                case 'KeyA': case 'ArrowLeft': moveState.left = true; break;
                case 'KeyD': case 'ArrowRight': moveState.right = true; break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'KeyW': case 'ArrowUp': moveState.forward = false; break;
                case 'KeyS': case 'ArrowDown': moveState.backward = false; break;
                case 'KeyA': case 'ArrowLeft': moveState.left = false; break;
                case 'KeyD': case 'ArrowRight': moveState.right = false; break;
            }
        });

        // Mouse Drag to Look & Click to Inspect
        let isMouseDown = false;
        let prevMouseX = 0;
        let prevMouseY = 0;
        let clickStartPos = { x: 0, y: 0 };

        dom.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
            clickStartPos = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('mousemove', (e) => {
            if (!isMouseDown) {
                // Check hover over paintings
                checkPaintingHover(e.clientX, e.clientY);
                return;
            }

            const dx = e.clientX - prevMouseX;
            const dy = e.clientY - prevMouseY;
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;

            yaw -= dx * 0.003;
            pitch -= dy * 0.003;
            pitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, pitch));
            updateCameraRotation();
        });

        window.addEventListener('mouseup', (e) => {
            if (isMouseDown) {
                isMouseDown = false;
                const dist = Math.hypot(e.clientX - clickStartPos.x, e.clientY - clickStartPos.y);
                // If it was a clean click without significant drag
                if (dist < 6) {
                    handlePaintingClick(e.clientX, e.clientY);
                }
            }
        });

        // Mobile Touch Virtual Joystick & Swipe Look
        setupTouchControls();
    }

    function setupTouchControls() {
        const joystick = document.getElementById('touch-joystick');
        const stick = document.getElementById('touch-stick');
        if (!joystick || !stick) return;

        let joyTouchId = null;
        let joyCenterX = 0;
        let joyCenterY = 0;

        joystick.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const t = e.changedTouches[0];
            joyTouchId = t.identifier;
            const rect = joystick.getBoundingClientRect();
            joyCenterX = rect.left + rect.width / 2;
            joyCenterY = rect.top + rect.height / 2;
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                if (t.identifier === joyTouchId) {
                    const dx = t.clientX - joyCenterX;
                    const dy = t.clientY - joyCenterY;
                    const dist = Math.min(45, Math.hypot(dx, dy));
                    const angle = Math.atan2(dy, dx);
                    const stickX = Math.cos(angle) * dist;
                    const stickY = Math.sin(angle) * dist;

                    stick.style.transform = `translate(${stickX}px, ${stickY}px)`;

                    // Normalize move state
                    moveState.forward = stickY < -12;
                    moveState.backward = stickY > 12;
                    moveState.left = stickX < -12;
                    moveState.right = stickX > 12;
                } else if (t.identifier === touchState.lookTouchId) {
                    const ldx = t.clientX - touchState.lookStartX;
                    const ldy = t.clientY - touchState.lookStartY;
                    touchState.lookStartX = t.clientX;
                    touchState.lookStartY = t.clientY;

                    yaw -= ldx * 0.005;
                    pitch -= ldy * 0.005;
                    pitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, pitch));
                    updateCameraRotation();
                }
            }
        }, { passive: false });

        function endTouch(t) {
            if (t.identifier === joyTouchId) {
                joyTouchId = null;
                stick.style.transform = 'translate(0px, 0px)';
                moveState.forward = false;
                moveState.backward = false;
                moveState.left = false;
                moveState.right = false;
            }
            if (t.identifier === touchState.lookTouchId) {
                touchState.lookTouchId = null;
            }
        }

        window.addEventListener('touchend', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                endTouch(e.changedTouches[i]);
            }
        });

        // Touch swipe on canvas for look / inspect
        renderer.domElement.addEventListener('touchstart', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                if (t.clientX > window.innerWidth * 0.35 && touchState.lookTouchId === null) {
                    touchState.lookTouchId = t.identifier;
                    touchState.lookStartX = t.clientX;
                    touchState.lookStartY = t.clientY;
                }
            }
        });
    }

    function updateCameraRotation() {
        camera.rotation.set(pitch, yaw, 0, 'YXZ');
    }

    /* =========================================================================
       6. RAYCASTING, HOVER & INSPECT MODAL
       ========================================================================= */
    function checkPaintingHover(cx, cy) {
        mouse.x = (cx / window.innerWidth) * 2 - 1;
        mouse.y = -(cy / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(interactivePaintings);
        const hoverPrompt = document.getElementById('walkaround-hover-prompt');

        if (hits.length > 0 && hits[0].distance < 7.5) {
            document.body.style.cursor = 'pointer';
            if (hoverPrompt) {
                const p = hits[0].object.userData.artwork;
                hoverPrompt.textContent = `Click to inspect: "${p.title}"`;
                hoverPrompt.classList.add('visible');
            }
        } else {
            document.body.style.cursor = 'default';
            if (hoverPrompt) hoverPrompt.classList.remove('visible');
        }
    }

    function handlePaintingClick(cx, cy) {
        mouse.x = (cx / window.innerWidth) * 2 - 1;
        mouse.y = -(cy / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(interactivePaintings);

        if (hits.length > 0 && hits[0].distance < 9.0) {
            const targetMesh = hits[0].object;
            inspectArtwork(targetMesh);
        }
    }

    function inspectArtwork(mesh) {
        const u = mesh.userData;
        inspectingArtwork = u.artwork;

        // Smoothly glide camera directly in front of the artwork
        targetCameraPos = u.inspectPos.clone();
        targetCameraLook = u.inspectLook.clone();

        // Calculate direct pitch/yaw to face the painting
        const diff = targetCameraLook.clone().sub(targetCameraPos);
        yaw = Math.atan2(-diff.x, -diff.z);
        pitch = Math.atan2(diff.y, Math.hypot(diff.x, diff.z));

        // Open Detail Modal
        openArtworkModal(u.artwork);
    }

    function openArtworkModal(p) {
        const modal = document.getElementById('art-modal');
        if (!modal) return;

        document.getElementById('modal-title').textContent = p.title;
        document.getElementById('modal-year').textContent = p.year || '2026';
        document.getElementById('modal-size').textContent = p.size ? p.size : `${(p.widthM * 100).toFixed(0)} × ${(p.heightM * 100).toFixed(0)} cm`;
        document.getElementById('modal-material').textContent = p.material || 'Acrylic & glitter on canvas';
        document.getElementById('modal-desc').textContent = p.description || 'Contemporary Swedish abstract expressionism by Fredrik Beckman.';
        document.getElementById('modal-img').src = p.src;
        document.getElementById('modal-img').alt = p.title;

        modal.classList.add('open');
    }

    function closeArtworkModal() {
        const modal = document.getElementById('art-modal');
        if (modal) modal.classList.remove('open');
        inspectingArtwork = null;
    }

    /* =========================================================================
       7. HUD & ROOM TELEPORTATION
       ========================================================================= */
    function setupHUD() {
        // Room Jump buttons
        const navBtns = document.querySelectorAll('.room-nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roomKey = btn.dataset.room;
                if (ROOM_WAYPOINTS[roomKey]) {
                    teleportToRoom(roomKey);
                    navBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                }
            });
        });

        // Close Modal button
        const closeBtn = document.getElementById('modal-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', closeArtworkModal);

        // Modal backdrop click to close
        const modal = document.getElementById('art-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeArtworkModal();
            });
        }
    }

    function teleportToRoom(roomKey) {
        const wp = ROOM_WAYPOINTS[roomKey];
        if (!wp) return;

        closeArtworkModal();
        targetCameraPos = new THREE.Vector3(wp.x, wp.y, wp.z);
        yaw = wp.yaw;
        pitch = wp.pitch;
        updateCameraRotation();
    }

    /* =========================================================================
       8. 2D ARCHITECTURAL MINIMAP RADAR
       ========================================================================= */
    function setupMinimap() {
        minimapCanvas = document.getElementById('walkaround-minimap');
        if (!minimapCanvas) return;
        minimapCtx = minimapCanvas.getContext('2d');
    }

    function drawMinimap() {
        if (!minimapCtx) return;
        const ctx = minimapCtx;
        const w = minimapCanvas.width;
        const h = minimapCanvas.height;

        ctx.clearRect(0, 0, w, h);

        // Map Scale: World (-18 to +18 X, -14 to +16 Z) -> Canvas 180x140
        const scaleX = w / 36;
        const scaleZ = h / 30;

        function worldToMap(x, z) {
            return {
                mx: (x + 18) * scaleX,
                my: (z + 14) * scaleZ
            };
        }

        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(0, 0, w, h);

        // Draw Room Boundaries
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 1.5;

        // Perimeter
        const p1 = worldToMap(-16, -12);
        const p2 = worldToMap(16, 12);
        ctx.strokeRect(p1.mx, p1.my, p2.mx - p1.mx, p2.my - p1.my);

        // Partitions
        const w1 = worldToMap(6, 0);
        const w2 = worldToMap(6, 12);
        ctx.beginPath();
        ctx.moveTo(w1.mx, w1.my);
        ctx.lineTo(w2.mx, w2.my);
        ctx.stroke();

        const w3 = worldToMap(-5, -12);
        const w4 = worldToMap(-5, 0);
        ctx.beginPath();
        ctx.moveTo(w3.mx, w3.my);
        ctx.lineTo(w4.mx, w4.my);
        ctx.stroke();

        // Player Dot & View Cone
        const pPos = worldToMap(camera.position.x, camera.position.z);
        ctx.fillStyle = '#e6007e';
        ctx.beginPath();
        ctx.arc(pPos.mx, pPos.my, 4, 0, Math.PI * 2);
        ctx.fill();

        // View direction cone
        const coneLen = 14;
        const dirX = -Math.sin(yaw);
        const dirZ = -Math.cos(yaw);
        ctx.fillStyle = 'rgba(230, 0, 126, 0.25)';
        ctx.beginPath();
        ctx.moveTo(pPos.mx, pPos.my);
        ctx.arc(pPos.mx, pPos.my, coneLen, yaw - Math.PI / 2 - 0.4, yaw - Math.PI / 2 + 0.4);
        ctx.closePath();
        ctx.fill();
    }

    /* =========================================================================
       9. MAIN ANIMATION & COLLISION PHYSICS LOOP
       ========================================================================= */
    function animate() {
        requestAnimationFrame(animate);

        const delta = Math.min(clock.getDelta(), 0.1);

        // Smooth Camera Teleport / Inspection Glide
        if (targetCameraPos) {
            camera.position.lerp(targetCameraPos, 0.08);
            if (camera.position.distanceTo(targetCameraPos) < 0.05) {
                targetCameraPos = null;
            }
        }

        // First-Person Walk Physics
        if (!targetCameraPos) {
            updateMovementPhysics(delta);
        }

        // Render 3D Scene
        renderer.render(scene, camera);

        // Update Mini-map
        drawMinimap();
    }

    function updateMovementPhysics(delta) {
        // Calculate forward/strafe intent relative to camera yaw
        direction.z = Number(moveState.forward) - Number(moveState.backward);
        direction.x = Number(moveState.right) - Number(moveState.left);
        direction.normalize();

        if (moveState.forward || moveState.backward || moveState.left || moveState.right) {
            const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
            const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);

            const moveVec = new THREE.Vector3();
            if (moveState.forward) moveVec.add(forward);
            if (moveState.backward) moveVec.sub(forward);
            if (moveState.right) moveVec.add(right);
            if (moveState.left) moveVec.sub(right);

            moveVec.normalize().multiplyScalar(player.speed * delta);

            // Attempt movement with wall collision prevention
            const nextX = camera.position.x + moveVec.x;
            const nextZ = camera.position.z + moveVec.z;

            if (!checkWallCollision(nextX, camera.position.z)) {
                camera.position.x = nextX;
            }
            if (!checkWallCollision(camera.position.x, nextZ)) {
                camera.position.z = nextZ;
            }
        }

        // Clamp boundaries
        camera.position.x = Math.max(-15.2, Math.min(15.2, camera.position.x));
        camera.position.z = Math.max(-11.2, Math.min(13.8, camera.position.z));
        camera.position.y = player.height;
    }

    function checkWallCollision(x, z) {
        const playerBox = new THREE.Box3(
            new THREE.Vector3(x - player.radius, 0.2, z - player.radius),
            new THREE.Vector3(x + player.radius, player.height, z + player.radius)
        );

        for (let i = 0; i < collisionBoxes.length; i++) {
            if (playerBox.intersectsBox(collisionBoxes[i])) {
                return true;
            }
        }
        return false;
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

})();
