/**
 * Walk Around — Virtual Vacation Walk Engine
 * Photorealistic 5-Zone Parisian Penthouse Virtual Tour
 * Scale: 1 unit = 1.0 meter (Physical 1:1 Metric Scale)
 * Inspired by virtualvacation.us/walk
 * Art by Beckman
 */

(function() {
    'use strict';

    // ===== 1. AUDIO ENGINE (WEB AUDIO API - ZERO EXTERNAL FILES) =====
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
            this.masterGain.gain.value = this.isMuted ? 0 : 0.40;
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
                output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.045;
                b6 = white * 0.115926;
            }

            const whiteNoise = this.ctx.createBufferSource();
            whiteNoise.buffer = noiseBuffer;
            whiteNoise.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400;
            filter.Q.value = 1.1;

            this.ambienceGain = this.ctx.createGain();
            this.ambienceGain.gain.value = 0.16;

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
            osc.frequency.setValueAtTime(135 + Math.random() * 35, now);
            osc.frequency.exponentialRampToValueAtTime(38, now + 0.075);

            gain.gain.setValueAtTime(0.12 + Math.random() * 0.03, now);
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
                this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.45, this.ctx.currentTime);
            }
            return !this.isMuted;
        }
    }

    // ===== 2. GLOBAL STATE =====
    const audio = new VirtualVacationAudio();

    let currentRoomId = 'living_room';
    let isTourRunning = true;
    let tourSpeed = 1.0;
    let tourSequenceIndex = 0;
    let tourPhaseTime = 0;
    let isTransitioning = false;
    let transitionProgress = 0;

    // Viewport camera parameters
    let currentYaw = 0;
    let currentPitch = 0;
    let targetYaw = 0;
    let targetPitch = 0;
    let currentZoom = 1.0;
    let targetZoom = 1.0;
    let headBobY = 0;
    let headBobX = 0;
    let walkTime = 0;

    let isDragging = false;
    let dragStartPos = { x: 0, y: 0 };
    let dragStartTarget = { yaw: 0, pitch: 0 };

    // DOM Elements
    const container = document.getElementById('walkaround-canvas-container');
    const loader = document.getElementById('walkaround-loader');
    const artModal = document.getElementById('art-modal');
    const overviewModal = document.getElementById('overview-modal');
    const minimapCanvas = document.getElementById('walkaround-minimap');
    const minimapContainer = document.querySelector('.minimap-container');
    const minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;

    // Hotspot overlays container
    let hotspotsContainer = null;
    let tourBadge = null;

    // Canvas & Context
    let canvas = null;
    let ctx = null;

    // Image Preloader Cache
    const imageCache = {};
    const roomKeys = Object.keys(WALKAROUND_ROOMS);

    function preloadImages() {
        roomKeys.forEach(id => {
            const room = WALKAROUND_ROOMS[id];
            const img = new Image();
            img.src = room.image;
            img.onerror = () => { img.src = room.fallback; };
            imageCache[id] = img;
        });
    }

    // ===== 3. SETUP CANVAS & OVERLAYS =====
    function setupCanvas() {
        container.innerHTML = '';

        canvas = document.createElement('canvas');
        canvas.className = 'walkaround-main-canvas';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        container.appendChild(canvas);
        ctx = canvas.getContext('2d');

        // Hotspots DOM container
        hotspotsContainer = document.createElement('div');
        hotspotsContainer.className = 'walkaround-hotspots-overlay';
        hotspotsContainer.style.position = 'absolute';
        hotspotsContainer.style.top = '0';
        hotspotsContainer.style.left = '0';
        hotspotsContainer.style.width = '100%';
        hotspotsContainer.style.height = '100%';
        hotspotsContainer.style.pointerEvents = 'none';
        container.appendChild(hotspotsContainer);

        // Tour Status / Artwork Badge
        tourBadge = document.createElement('div');
        tourBadge.className = 'virtual-vacation-tour-badge';
        tourBadge.innerHTML = '<span class="badge-dot"></span><span id="tour-badge-text">Virtuell Promenad • Paris Penthouse</span>';
        container.appendChild(tourBadge);

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    function resizeCanvas() {
        if (!canvas) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        if (ctx) ctx.scale(dpr, dpr);
    }

    // ===== 4. RENDER LOOP (60 FPS SMOOTH PERSPECTIVE PROJECTION) =====
    let lastFrameTime = performance.now();

    function render(time) {
        requestAnimationFrame(render);

        const delta = Math.min((time - lastFrameTime) / 1000, 0.1);
        lastFrameTime = time;

        updateTour(delta);
        updateCameraDamping(delta);
        drawScene();
        updateHotspotsPositions();
        drawMinimap();
    }

    function updateCameraDamping(delta) {
        // Damping factors for natural Steadicam response
        const damp = Math.min(delta * 8.5, 1.0);
        currentYaw += (targetYaw - currentYaw) * damp;
        currentPitch += (targetPitch - currentPitch) * damp;
        currentZoom += (targetZoom - currentZoom) * damp;

        // Walking head-bobbing simulation
        if (isTourRunning && !isTransitioning) {
            walkTime += delta * 3.6 * tourSpeed;
            headBobY = Math.sin(walkTime) * 6.5;
            headBobX = Math.cos(walkTime * 0.5) * 3.5;

            // Trigger footsteps sound at step troughs
            const stepPhase = Math.sin(walkTime);
            if (stepPhase < -0.92) {
                audio.playStep();
            }
        } else {
            headBobY += (0 - headBobY) * 0.1;
            headBobX += (0 - headBobX) * 0.1;
        }
    }

    function drawScene() {
        if (!ctx || !canvas) return;
        const w = window.innerWidth;
        const h = window.innerHeight;

        ctx.clearRect(0, 0, w, h);

        const img = imageCache[currentRoomId];
        if (!img || !img.complete || img.naturalWidth === 0) {
            ctx.fillStyle = '#1c1a20';
            ctx.fillRect(0, 0, w, h);
            return;
        }

        // Calculate aspect ratio covering
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const screenRatio = w / h;

        let baseW, baseH;
        if (screenRatio > imgRatio) {
            baseW = w;
            baseH = w / imgRatio;
        } else {
            baseH = h;
            baseW = h * imgRatio;
        }

        // Apply Zoom & Panorama pan
        const zoomW = baseW * currentZoom;
        const zoomH = baseH * currentZoom;

        // Pan displacement
        const panRangeX = (zoomW - w) * 0.5 + 160;
        const panRangeY = (zoomH - h) * 0.5 + 90;

        const posX = (w - zoomW) * 0.5 + (currentYaw * panRangeX) + headBobX;
        const posY = (h - zoomH) * 0.5 + (currentPitch * panRangeY) + headBobY;

        ctx.save();

        // Cross-dissolve transition effect
        if (isTransitioning) {
            ctx.globalAlpha = 1.0 - transitionProgress;
        }

        // Draw photorealistic room image
        ctx.drawImage(img, posX, posY, zoomW, zoomH);

        // Subtle ambient vignette & bloom lighting
        const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.35, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, 'rgba(10, 8, 14, 0.28)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        ctx.restore();

        // Draw next room cross-fade during walk transition
        if (isTransitioning && nextRoomId) {
            const nextImg = imageCache[nextRoomId];
            if (nextImg && nextImg.complete && nextImg.naturalWidth > 0) {
                ctx.save();
                ctx.globalAlpha = transitionProgress;
                // Forward dolly zoom during transition
                const transZoom = 1.0 + (1.0 - transitionProgress) * 0.15;
                const nextZoomW = baseW * transZoom;
                const nextZoomH = baseH * transZoom;
                const nextX = (w - nextZoomW) * 0.5;
                const nextY = (h - nextZoomH) * 0.5;
                ctx.drawImage(nextImg, nextX, nextY, nextZoomW, nextZoomH);
                ctx.restore();
            }
        }
    }

    // ===== 5. TOUR ENGINE (VIRTUAL VACATION WALK) =====
    let nextRoomId = null;

    function updateTour(delta) {
        if (!isTourRunning || isTransitioning) return;

        const room = WALKAROUND_ROOMS[currentRoomId];
        if (!room || !room.walkSequence || room.walkSequence.length === 0) return;

        tourPhaseTime += delta * tourSpeed;
        const currentStep = room.walkSequence[tourSequenceIndex];

        // Apply smooth target yaw/pitch from walkpoint
        targetYaw = currentStep.yaw;
        targetPitch = currentStep.pitch;
        targetZoom = currentStep.zoom || 1.0;

        // Update tour badge text
        const badgeElem = document.getElementById('tour-badge-text');
        if (badgeElem && currentStep.label) {
            badgeElem.textContent = `${room.name} • ${currentStep.label}`;
        }

        if (tourPhaseTime >= currentStep.duration) {
            tourPhaseTime = 0;
            tourSequenceIndex++;

            if (tourSequenceIndex >= room.walkSequence.length) {
                tourSequenceIndex = 0;
                // Move to next room in cycle
                const roomIndex = roomKeys.indexOf(currentRoomId);
                const nextIndex = (roomIndex + 1) % roomKeys.length;
                startRoomTransition(roomKeys[nextIndex]);
            }
        }
    }

    function startRoomTransition(targetId) {
        if (targetId === currentRoomId || isTransitioning) return;
        isTransitioning = true;
        nextRoomId = targetId;
        transitionProgress = 0;

        // Play footsteps during transition
        audio.playStep();
        setTimeout(() => audio.playStep(), 280);
        setTimeout(() => audio.playStep(), 560);

        const startTime = performance.now();
        const duration = 900; // ms

        function stepTransition(now) {
            const elapsed = now - startTime;
            transitionProgress = Math.min(elapsed / duration, 1.0);

            if (transitionProgress < 1.0) {
                requestAnimationFrame(stepTransition);
            } else {
                currentRoomId = nextRoomId;
                nextRoomId = null;
                isTransitioning = false;
                transitionProgress = 0;
                tourSequenceIndex = 0;
                tourPhaseTime = 0;

                const newRoom = WALKAROUND_ROOMS[currentRoomId];
                targetYaw = newRoom.initialYaw || 0;
                targetPitch = newRoom.initialPitch || 0;
                targetZoom = 1.0;

                updateRoomUI();
                rebuildHotspots();
            }
        }
        requestAnimationFrame(stepTransition);
    }

    // ===== 6. HOTSPOTS & PORTALS OVERLAYS =====
    function rebuildHotspots() {
        if (!hotspotsContainer) return;
        hotspotsContainer.innerHTML = '';

        const room = WALKAROUND_ROOMS[currentRoomId];
        if (!room) return;

        // Artwork Pins
        if (room.artworks) {
            room.artworks.forEach(art => {
                const pin = document.createElement('div');
                pin.className = 'virtual-art-pin';
                pin.dataset.artId = art.id;
                pin.innerHTML = `
                    <div class="pin-glow"></div>
                    <div class="pin-core">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                    <div class="pin-tag">
                        <span class="pin-tag-title">${art.title}</span>
                        <span class="pin-tag-meta">${art.size} • 1:1</span>
                    </div>
                `;
                pin.addEventListener('click', (e) => {
                    e.stopPropagation();
                    isTourRunning = false;
                    updatePlayBtnUI();
                    inspectArtwork(art);
                });
                hotspotsContainer.appendChild(pin);
            });
        }

        // Room Portals (Doorway Arrows)
        if (room.portals) {
            room.portals.forEach(portal => {
                const portalElem = document.createElement('div');
                portalElem.className = 'virtual-portal-marker';
                portalElem.dataset.targetRoom = portal.targetRoom;
                portalElem.innerHTML = `
                    <div class="portal-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                    <span class="portal-text">${portal.label}</span>
                `;
                portalElem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    startRoomTransition(portal.targetRoom);
                });
                hotspotsContainer.appendChild(portalElem);
            });
        }
    }

    function updateHotspotsPositions() {
        if (!hotspotsContainer || !canvas) return;
        const w = window.innerWidth;
        const h = window.innerHeight;

        const img = imageCache[currentRoomId];
        if (!img || !img.complete || img.naturalWidth === 0) return;

        const imgRatio = img.naturalWidth / img.naturalHeight;
        const screenRatio = w / h;

        let baseW, baseH;
        if (screenRatio > imgRatio) {
            baseW = w;
            baseH = w / imgRatio;
        } else {
            baseH = h;
            baseW = h * imgRatio;
        }

        const zoomW = baseW * currentZoom;
        const zoomH = baseH * currentZoom;
        const panRangeX = (zoomW - w) * 0.5 + 160;
        const panRangeY = (zoomH - h) * 0.5 + 90;
        const posX = (w - zoomW) * 0.5 + (currentYaw * panRangeX) + headBobX;
        const posY = (h - zoomH) * 0.5 + (currentPitch * panRangeY) + headBobY;

        const room = WALKAROUND_ROOMS[currentRoomId];
        if (!room) return;

        // Position Artwork Pins
        const artPins = hotspotsContainer.querySelectorAll('.virtual-art-pin');
        artPins.forEach(pin => {
            const artId = parseInt(pin.dataset.artId, 10);
            const art = room.artworks.find(a => a.id === artId);
            if (!art || !art.screenPos) return;

            const screenX = posX + (art.screenPos.x / 100) * zoomW;
            const screenY = posY + (art.screenPos.y / 100) * zoomH;

            pin.style.transform = `translate(${screenX}px, ${screenY}px)`;
            pin.style.opacity = (screenX < -60 || screenX > w + 60 || screenY < -60 || screenY > h + 60) ? '0' : '1';
        });

        // Position Doorway Portals
        const portalElems = hotspotsContainer.querySelectorAll('.virtual-portal-marker');
        portalElems.forEach(elem => {
            const targetId = elem.dataset.targetRoom;
            const portal = room.portals.find(p => p.targetRoom === targetId);
            if (!portal || !portal.screenPos) return;

            const screenX = posX + (portal.screenPos.x / 100) * zoomW;
            const screenY = posY + (portal.screenPos.y / 100) * zoomH;

            elem.style.transform = `translate(${screenX}px, ${screenY}px)`;
            elem.style.opacity = (screenX < -100 || screenX > w + 100 || screenY < -100 || screenY > h + 100) ? '0' : '1';
        });
    }

    // ===== 7. ARCHITECTURAL MINIMAP (DYNAMIC FLOOR PLAN RADAR) =====
    function drawMinimap() {
        if (!minimapCtx || !minimapCanvas) return;
        const mw = minimapCanvas.width;
        const mh = minimapCanvas.height;

        minimapCtx.clearRect(0, 0, mw, mh);

        // Limestone tile blueprint background
        minimapCtx.fillStyle = '#141419';
        minimapCtx.fillRect(0, 0, mw, mh);

        // 5 Zones Layout:
        const zoneLayouts = {
            bedroom: { x: 14, y: 14, w: 54, h: 54, name: '05' },
            living_room: { x: 68, y: 35, w: 52, h: 65, name: '02' },
            dining_room: { x: 120, y: 14, w: 46, h: 54, name: '03' },
            kitchen: { x: 120, y: 68, w: 46, h: 58, name: '04' },
            entry: { x: 14, y: 68, w: 54, h: 58, name: '01' }
        };

        Object.keys(zoneLayouts).forEach(zid => {
            const z = zoneLayouts[zid];
            const isCur = (zid === currentRoomId);

            minimapCtx.fillStyle = isCur ? 'rgba(230, 0, 126, 0.24)' : 'rgba(255, 255, 255, 0.04)';
            minimapCtx.fillRect(z.x, z.y, z.w, z.h);

            minimapCtx.strokeStyle = isCur ? 'rgba(230, 0, 126, 0.85)' : 'rgba(255, 255, 255, 0.16)';
            minimapCtx.strokeRect(z.x, z.y, z.w, z.h);

            // Room number label
            minimapCtx.font = '600 9px Inter, sans-serif';
            minimapCtx.fillStyle = isCur ? '#ffffff' : 'rgba(255, 255, 255, 0.4)';
            minimapCtx.fillText(z.name, z.x + 6, z.y + 14);
        });

        // Player Dot & Viewing Cone
        const curZone = zoneLayouts[currentRoomId] || { x: 90, y: 70, w: 50, h: 50 };
        const px = curZone.x + curZone.w * 0.5;
        const py = curZone.y + curZone.h * 0.5;

        // Viewing Cone
        const angle = -currentYaw * 1.3 - Math.PI / 2;
        const fov = 0.75; // rad
        const coneLen = 24;

        minimapCtx.beginPath();
        minimapCtx.moveTo(px, py);
        minimapCtx.arc(px, py, coneLen, angle - fov / 2, angle + fov / 2);
        minimapCtx.closePath();
        minimapCtx.fillStyle = 'rgba(230, 0, 126, 0.28)';
        minimapCtx.fill();

        // Pulsating Radar Ring
        const pulse = (Math.sin(performance.now() * 0.006) * 0.5 + 0.5) * 6 + 4;
        minimapCtx.beginPath();
        minimapCtx.arc(px, py, pulse, 0, Math.PI * 2);
        minimapCtx.strokeStyle = 'rgba(230, 0, 126, 0.4)';
        minimapCtx.stroke();

        // Center dot
        minimapCtx.beginPath();
        minimapCtx.arc(px, py, 3.5, 0, Math.PI * 2);
        minimapCtx.fillStyle = '#ffffff';
        minimapCtx.fill();
        minimapCtx.strokeStyle = '#BA1655';
        minimapCtx.lineWidth = 1.5;
        minimapCtx.stroke();
    }

    // Minimap Click to Navigate
    function setupMinimapClick() {
        if (!minimapCanvas) return;
        minimapCanvas.style.cursor = 'pointer';
        minimapCanvas.addEventListener('click', (e) => {
            const rect = minimapCanvas.getBoundingClientRect();
            const cx = e.clientX - rect.left;
            const cy = e.clientY - rect.top;

            const zoneLayouts = {
                bedroom: { x: 14, y: 14, w: 54, h: 54 },
                living_room: { x: 68, y: 35, w: 52, h: 65 },
                dining_room: { x: 120, y: 14, w: 46, h: 54 },
                kitchen: { x: 120, y: 68, w: 46, h: 58 },
                entry: { x: 14, y: 68, w: 54, h: 58 }
            };

            for (const zid of Object.keys(zoneLayouts)) {
                const z = zoneLayouts[zid];
                if (cx >= z.x && cx <= z.x + z.w && cy >= z.y && cy <= z.y + z.h) {
                    startRoomTransition(zid);
                    break;
                }
            }
        });
    }

    // ===== 8. CONTROLS & INTERACTION =====
    function setupInteraction() {
        // Drag to Pan
        window.addEventListener('mousedown', (e) => {
            if (e.target.closest('.walkaround-header, .walkaround-hud, .minimap-container, .art-modal, .overview-modal')) return;
            isDragging = true;
            dragStartPos = { x: e.clientX, y: e.clientY };
            dragStartTarget = { yaw: targetYaw, pitch: targetPitch };
            isTourRunning = false;
            updatePlayBtnUI();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = (e.clientX - dragStartPos.x) / window.innerWidth;
            const dy = (e.clientY - dragStartPos.y) / window.innerHeight;

            targetYaw = Math.max(-0.65, Math.min(0.65, dragStartTarget.yaw - dx * 1.4));
            targetPitch = Math.max(-0.40, Math.min(0.40, dragStartTarget.pitch - dy * 1.2));
        });

        window.addEventListener('mouseup', () => { isDragging = false; });

        // Touch drag
        window.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                if (e.target.closest('.walkaround-header, .walkaround-hud, .minimap-container, .art-modal, .overview-modal')) return;
                isDragging = true;
                dragStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                dragStartTarget = { yaw: targetYaw, pitch: targetPitch };
                isTourRunning = false;
                updatePlayBtnUI();
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging || e.touches.length !== 1) return;
            const dx = (e.touches[0].clientX - dragStartPos.x) / window.innerWidth;
            const dy = (e.touches[0].clientY - dragStartPos.y) / window.innerHeight;

            targetYaw = Math.max(-0.65, Math.min(0.65, dragStartTarget.yaw - dx * 1.4));
            targetPitch = Math.max(-0.40, Math.min(0.40, dragStartTarget.pitch - dy * 1.2));
        }, { passive: true });

        window.addEventListener('touchend', () => { isDragging = false; });

        // Mouse Wheel Zoom
        window.addEventListener('wheel', (e) => {
            if (e.target.closest('.art-modal, .overview-modal')) return;
            const zoomDelta = e.deltaY > 0 ? -0.06 : 0.06;
            targetZoom = Math.max(1.0, Math.min(1.45, targetZoom + zoomDelta));
        }, { passive: true });

        // Keyboard navigation
        window.addEventListener('keydown', (e) => {
            if (artModal && artModal.getAttribute('aria-hidden') === 'false') return;
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                targetYaw = Math.max(-0.65, targetYaw + 0.12);
                isTourRunning = false;
                updatePlayBtnUI();
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                targetYaw = Math.min(0.65, targetYaw - 0.12);
                isTourRunning = false;
                updatePlayBtnUI();
            } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                targetPitch = Math.max(-0.40, targetPitch + 0.10);
                isTourRunning = false;
                updatePlayBtnUI();
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                targetPitch = Math.min(0.40, targetPitch - 0.10);
                isTourRunning = false;
                updatePlayBtnUI();
            } else if (e.key === ' ') {
                e.preventDefault();
                toggleTourPlay();
            }
        });
    }

    // ===== 9. UI WIRING & VIRTUAL VACATION HUD =====
    function setupUI() {
        // Room nav buttons
        const navBar = document.getElementById('room-nav-bar') || document.getElementById('hotspot-buttons-bar');
        if (navBar) {
            navBar.innerHTML = '';
            roomKeys.forEach(id => {
                const room = WALKAROUND_ROOMS[id];
                const btn = document.createElement('button');
                btn.className = `room-nav-btn ${id === currentRoomId ? 'active' : ''}`;
                btn.dataset.room = id;
                btn.textContent = `${room.roomNumber} ${room.name.replace('Grand ', '')}`;
                btn.addEventListener('click', () => {
                    startRoomTransition(id);
                });
                navBar.appendChild(btn);
            });
        }

        // Tour Play/Pause Toggle
        const playBtn = document.getElementById('btn-toggle-tour');
        if (playBtn) {
            playBtn.addEventListener('click', toggleTourPlay);
        }

        // Mode Pill Buttons
        const modeWalk = document.getElementById('mode-walk');
        const modeExplore = document.getElementById('mode-explore');
        if (modeWalk && modeExplore) {
            modeWalk.addEventListener('click', () => {
                isTourRunning = true;
                updatePlayBtnUI();
            });
            modeExplore.addEventListener('click', () => {
                isTourRunning = false;
                updatePlayBtnUI();
            });
        }

        // Speed Pill Button
        const speedBtn = document.getElementById('btn-speed');
        if (speedBtn) {
            speedBtn.addEventListener('click', () => {
                tourSpeed = tourSpeed === 1.0 ? 1.5 : (tourSpeed === 1.5 ? 2.0 : 1.0);
                speedBtn.textContent = `${tourSpeed.toFixed(1)}x`;
            });
        }

        // Sound Toggle Button
        const soundBtn = document.getElementById('btn-toggle-sound');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                const isAudible = audio.toggleMute();
                const icon = document.getElementById('sound-icon');
                const text = document.getElementById('sound-text');
                if (icon) icon.textContent = isAudible ? '🔊' : '🔇';
                if (text) text.textContent = isAudible ? 'Ljud På' : 'Ljud Av';
                soundBtn.classList.toggle('active', isAudible);
            });
        }

        // Minimap Toggle Button
        const minimapBtn = document.getElementById('btn-toggle-minimap');
        if (minimapBtn && minimapContainer) {
            minimapBtn.addEventListener('click', () => {
                const isVis = minimapContainer.style.display !== 'none';
                minimapContainer.style.display = isVis ? 'none' : 'block';
                minimapBtn.classList.toggle('active', !isVis);
            });
        }

        // Fullscreen Toggle Button
        const fsBtn = document.getElementById('btn-toggle-fullscreen');
        if (fsBtn) {
            fsBtn.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                } else {
                    document.exitFullscreen().catch(() => {});
                }
            });
        }

        // 2D Overview Modal
        const overviewBtn = document.getElementById('btn-2d-overview');
        const overviewCloseBtn = document.getElementById('overview-close-btn');
        if (overviewBtn && overviewModal) {
            overviewBtn.addEventListener('click', () => {
                isTourRunning = false;
                updatePlayBtnUI();
                overviewModal.setAttribute('aria-hidden', 'false');
                overviewModal.classList.add('open');
                populateOverviewGrid();
            });
        }
        if (overviewCloseBtn && overviewModal) {
            overviewCloseBtn.addEventListener('click', () => {
                overviewModal.setAttribute('aria-hidden', 'true');
                overviewModal.classList.remove('open');
            });
        }

        // Artwork Inspection Modal Close
        const modalCloseBtn = document.getElementById('modal-close-btn');
        const modalInspectClose = document.getElementById('modal-inspect-close');
        if (modalCloseBtn && artModal) {
            modalCloseBtn.addEventListener('click', closeArtModal);
        }
        if (modalInspectClose && artModal) {
            modalInspectClose.addEventListener('click', closeArtModal);
        }

        setupMinimapClick();
    }

    function toggleTourPlay() {
        isTourRunning = !isTourRunning;
        updatePlayBtnUI();
    }

    function updatePlayBtnUI() {
        const playBtn = document.getElementById('btn-toggle-tour');
        if (playBtn) {
            playBtn.innerHTML = isTourRunning ? 
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg><span>Pausa Rundtur</span>' :
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg><span>Starta Rundtur</span>';
        }
        const modeWalk = document.getElementById('mode-walk');
        const modeExplore = document.getElementById('mode-explore');
        if (modeWalk && modeExplore) {
            modeWalk.classList.toggle('active', isTourRunning);
            modeExplore.classList.toggle('active', !isTourRunning);
        }
    }

    function updateRoomUI() {
        const navBar = document.getElementById('room-nav-bar') || document.getElementById('hotspot-buttons-bar');
        if (navBar) {
            navBar.querySelectorAll('.room-nav-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.room === currentRoomId);
            });
        }
    }

    // ===== 10. ARTWORK INSPECTION MODAL =====
    function inspectArtwork(art) {
        if (!artModal) return;
        document.getElementById('modal-title').textContent = art.title;
        document.getElementById('modal-size').textContent = art.size;
        document.getElementById('modal-year').textContent = art.year;
        document.getElementById('modal-material').textContent = art.material;
        document.getElementById('modal-zone').textContent = art.zone;
        document.getElementById('modal-desc').textContent = art.description;

        const imgElem = document.getElementById('modal-img');
        if (imgElem) {
            imgElem.src = `assets/images/${art.filename}`;
            imgElem.alt = art.title;
            imgElem.onerror = () => { imgElem.src = `assets/images/${art.originalFilename}`; };
        }

        artModal.setAttribute('aria-hidden', 'false');
        artModal.classList.add('open');
    }

    function closeArtModal() {
        if (artModal) {
            artModal.setAttribute('aria-hidden', 'true');
            artModal.classList.remove('open');
        }
    }

    function populateOverviewGrid() {
        const grid = document.getElementById('overview-grid');
        if (!grid) return;
        grid.innerHTML = '';

        WALKAROUND_CURATED_ROOM.forEach(art => {
            const card = document.createElement('div');
            card.className = 'overview-card';
            card.innerHTML = `
                <div class="card-img-wrap">
                    <img src="assets/images/${art.filename}" alt="${art.title}" loading="lazy" onerror="this.src='assets/images/${art.originalFilename}'">
                </div>
                <div class="card-info">
                    <h3>${art.title}</h3>
                    <p class="card-size">${art.size} • 1:1 Skala</p>
                    <p class="card-zone">${art.zone}</p>
                </div>
            `;
            card.addEventListener('click', () => {
                overviewModal.setAttribute('aria-hidden', 'true');
                overviewModal.classList.remove('open');
                inspectArtwork(art);
            });
            grid.appendChild(card);
        });
    }

    // ===== 11. INITIALIZATION =====
    function init() {
        preloadImages();
        setupCanvas();
        setupInteraction();
        setupUI();
        rebuildHotspots();
        updateRoomUI();
        updatePlayBtnUI();

        // Dismiss loader smoothly
        setTimeout(() => {
            if (loader) {
                loader.classList.add('loaded');
                loader.style.opacity = '0';
                loader.style.pointerEvents = 'none';
                setTimeout(() => { loader.style.display = 'none'; }, 600);
            }
        }, 600);

        requestAnimationFrame(render);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
