/**
 * RetroWiki Lightbox Module
 * Responsive, touch-enabled full-screen image viewing with desktop & mobile support
 * Includes 1-second auto-vanishing HUD/controls that reappear on activity
 */

const Lightbox = {
    images: [],
    currentIndex: -1,
    currentMode: 'fit',
    scale: 1.0,
    translateX: 0,
    translateY: 0,

    // Drag / Pan state
    isDragging: false,
    startX: 0,
    startY: 0,
    initialTranslateX: 0,
    initialTranslateY: 0,
    activePointers: new Map(),
    initialPinchDistance: null,
    initialPinchScale: 1.0,

    // Gesture tracking (swipe / tap)
    touchStartX: 0,
    touchStartY: 0,
    touchStartTime: 0,
    lastTapTime: 0,

    // HUD Auto-hide state
    hudTimer: null,
    isControlsHovered: false,

    init() {
        // 1. Inject HTML if not already present
        if (!document.getElementById('lightbox')) {
            const html = `
            <div id="lightbox" class="lightbox-modal" role="dialog" aria-modal="true" tabindex="-1">
                <!-- Top Bar: Counter & Close -->
                <div class="lightbox-top-bar" onclick="event.stopPropagation()">
                    <span class="lightbox-counter" id="lightbox-counter"></span>
                    <button type="button" class="lightbox-close-btn" onclick="Lightbox.close()" title="Close (Esc)" aria-label="Close">[ ✕ Close ]</button>
                </div>

                <!-- Nav Buttons (Desktop/Mobile) -->
                <button type="button" class="lightbox-nav-btn lightbox-prev-btn" id="lightbox-prev" onclick="event.stopPropagation(); Lightbox.prev()" title="Previous (Left Arrow)" aria-label="Previous image">&#10094;</button>
                <button type="button" class="lightbox-nav-btn lightbox-next-btn" id="lightbox-next" onclick="event.stopPropagation(); Lightbox.next()" title="Next (Right Arrow)" aria-label="Next image">&#10095;</button>

                <!-- Image Viewport Area -->
                <div class="lightbox-viewport" id="lightbox-viewport">
                    <img class="lightbox-content" id="lightbox-img" alt="" draggable="false">
                </div>

                <!-- Caption -->
                <div class="lightbox-caption" id="lightbox-caption"></div>

                <!-- Controls Bar -->
                <div class="lightbox-controls" id="lightbox-controls" onclick="event.stopPropagation()">
                    <button type="button" class="lb-btn" data-mode="fit" onclick="Lightbox.resize('fit')" title="Fit within screen">Fit</button>
                    <button type="button" class="lb-btn" data-mode="100" onclick="Lightbox.resize('100')" title="Original 1:1 Size">1:1</button>
                    <button type="button" class="lb-btn" data-mode="crop" onclick="Lightbox.resize('crop')" title="Smart Fill screen">Fill</button>
                    <button type="button" class="lb-btn" data-mode="stretch" onclick="Lightbox.resize('stretch')" title="Stretch to fill screen">Stretch</button>
                    <span class="lb-separator"></span>
                    <button type="button" class="lb-btn lb-btn-zoom" onclick="Lightbox.zoomStep(-0.25)" title="Zoom Out">-</button>
                    <button type="button" class="lb-btn lb-btn-zoom" onclick="Lightbox.zoomStep(0.25)" title="Zoom In">+</button>
                    <button type="button" class="lb-btn lb-btn-fs" id="lightbox-btn-fs" onclick="Lightbox.toggleFullScreen()" title="Toggle Fullscreen">⛶</button>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', html);
        }

        // 2. Attach Listeners
        this.setupPointerLogic();
        this.setupWheelLogic();
        this.setupKeyboardLogic();
        this.setupBackgroundClick();
        this.setupActivityListeners();

        // Fullscreen state listener
        ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
            document.addEventListener(evt, () => this.updateFullScreenState());
        });
    },

    attach(selector) {
        const elements = document.querySelectorAll(selector);
        this.images = [];

        elements.forEach((img, index) => {
            img.style.cursor = 'zoom-in';

            const caption = img.getAttribute('data-caption') ||
                            img.getAttribute('alt') ||
                            img.getAttribute('title') || '';

            const item = {
                src: img.currentSrc || img.src,
                alt: caption,
                element: img
            };
            this.images.push(item);

            img.onclick = (e) => {
                e.preventDefault();
                this.openIndex(index);
            };
        });
    },

    open(src, alt) {
        this.init(); // Ensure initialized
        // Find if this image is in our attached collection
        const foundIdx = this.images.findIndex(item => item.src === src);
        if (foundIdx !== -1) {
            this.openIndex(foundIdx);
        } else {
            // Standalone image not in collection
            this.images = [{ src, alt: alt || '' }];
            this.openIndex(0);
        }
    },

    openIndex(index) {
        if (!this.images || this.images.length === 0) return;
        if (index < 0) index = 0;
        if (index >= this.images.length) index = this.images.length - 1;

        this.currentIndex = index;
        const current = this.images[index];

        const modal = document.getElementById('lightbox');
        const modalImg = document.getElementById('lightbox-img');
        const captionText = document.getElementById('lightbox-caption');
        const counter = document.getElementById('lightbox-counter');
        const prevBtn = document.getElementById('lightbox-prev');
        const nextBtn = document.getElementById('lightbox-next');

        if (!modal || !modalImg) return;

        modal.classList.add('active');
        document.body.classList.add('lightbox-open');

        modalImg.src = current.src;
        captionText.textContent = current.alt || '';

        // Update counter & nav button visibility
        if (this.images.length > 1) {
            if (counter) counter.textContent = `[ ${index + 1} / ${this.images.length} ]`;
            if (prevBtn) prevBtn.style.display = 'flex';
            if (nextBtn) nextBtn.style.display = 'flex';
        } else {
            if (counter) counter.textContent = '';
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        }

        // Reset transform state
        this.scale = 1.0;
        this.translateX = 0;
        this.translateY = 0;
        this.resize('fit');

        // Show HUD and start 1-sec auto-hide timer
        this.showHud();
    },

    prev() {
        if (this.images.length <= 1) return;
        const newIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.openIndex(newIndex);
    },

    next() {
        if (this.images.length <= 1) return;
        const newIndex = (this.currentIndex + 1) % this.images.length;
        this.openIndex(newIndex);
    },

    close() {
        if (this.hudTimer) {
            clearTimeout(this.hudTimer);
            this.hudTimer = null;
        }
        this.isControlsHovered = false;

        const modal = document.getElementById('lightbox');
        if (modal) {
            modal.classList.remove('active');
            modal.classList.remove('hud-hidden');
        }
        document.body.classList.remove('lightbox-open');

        // Exit Fullscreen if active
        if (document.fullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    },

    isMobileDevice() {
        return window.innerWidth <= 768 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    },

    // HUD Auto-hide controls
    showHud() {
        const modal = document.getElementById('lightbox');
        if (!modal) return;
        modal.classList.remove('hud-hidden');
        this.resetHudTimer();
    },

    toggleHud() {
        const modal = document.getElementById('lightbox');
        if (!modal) return;
        if (modal.classList.contains('hud-hidden')) {
            this.showHud();
        } else {
            modal.classList.add('hud-hidden');
            if (this.hudTimer) {
                clearTimeout(this.hudTimer);
                this.hudTimer = null;
            }
        }
    },

    resetHudTimer() {
        if (this.hudTimer) {
            clearTimeout(this.hudTimer);
            this.hudTimer = null;
        }

        // On mobile / touch devices, do not auto-hide controls after a timer - keep toolbar accessible
        if (this.isMobileDevice()) return;

        if (this.isControlsHovered || this.isDragging) return;

        this.hudTimer = setTimeout(() => {
            const modal = document.getElementById('lightbox');
            if (modal && modal.classList.contains('active') && !this.isControlsHovered && !this.isDragging) {
                modal.classList.add('hud-hidden');
            }
        }, 3500);
    },

    resize(mode) {
        const img = document.getElementById('lightbox-img');
        if (!img) return;

        this.currentMode = mode;
        this.scale = 1.0;
        this.translateX = 0;
        this.translateY = 0;

        // Reset baseline styles
        img.style.width = '';
        img.style.height = '';
        img.style.maxWidth = '';
        img.style.maxHeight = '';
        img.style.objectFit = '';
        img.style.margin = 'auto';

        switch (mode) {
            case 'fit':
                img.style.maxWidth = '92%';
                img.style.maxHeight = '82vh';
                img.style.objectFit = 'contain';
                break;
            case '100':
                img.style.maxWidth = 'none';
                img.style.maxHeight = 'none';
                img.style.width = 'auto';
                img.style.height = 'auto';
                break;
            case 'crop':
                const winRatio = window.innerWidth / window.innerHeight;
                const naturalW = img.naturalWidth || 1;
                const naturalH = img.naturalHeight || 1;
                const imgRatio = naturalW / naturalH;

                if (imgRatio > winRatio) {
                    img.style.height = '100vh';
                    img.style.width = 'auto';
                } else {
                    img.style.width = '100vw';
                    img.style.height = 'auto';
                }
                img.style.maxWidth = 'none';
                img.style.maxHeight = 'none';
                break;
            case 'stretch':
                img.style.width = '100vw';
                img.style.height = '100vh';
                img.style.maxWidth = 'none';
                img.style.maxHeight = 'none';
                img.style.objectFit = 'fill';
                break;
        }

        this.updateTransform();
        this.updateActiveModeButton(mode);
        this.showHud();
    },

    zoomStep(delta) {
        this.scale = Math.min(Math.max(this.scale + delta, 0.25), 5.0);
        this.updateTransform();
        this.showHud();
    },

    updateTransform() {
        const img = document.getElementById('lightbox-img');
        if (!img) return;
        img.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
    },

    updateActiveModeButton(mode) {
        const buttons = document.querySelectorAll('.lightbox-controls .lb-btn[data-mode]');
        buttons.forEach(btn => {
            if (btn.getAttribute('data-mode') === mode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },

    updateFullScreenState() {
        const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        const btn = document.getElementById('lightbox-btn-fs') || document.querySelector('.lb-btn-fs');
        if (btn) {
            btn.classList.toggle('active', isFS);
            btn.innerHTML = isFS ? '⤡' : '⛶';
            btn.title = isFS ? 'Exit Fullscreen' : 'Toggle Fullscreen';
        }
    },

    toggleFullScreen() {
        const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        const elem = document.getElementById('lightbox') || document.documentElement;

        if (!isFS) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen().catch(() => {
                    if (document.documentElement.requestFullscreen) {
                        document.documentElement.requestFullscreen().catch(() => {});
                    }
                });
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            } else if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {});
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
        this.showHud();
        this.updateFullScreenState();
    },

    setupActivityListeners() {
        const modal = document.getElementById('lightbox');
        if (!modal) return;

        const onActivity = () => {
            if (modal.classList.contains('active')) {
                this.showHud();
            }
        };

        // User activity events
        modal.addEventListener('mousemove', onActivity);
        modal.addEventListener('pointermove', onActivity);
        modal.addEventListener('touchstart', onActivity, { passive: true });
        modal.addEventListener('touchmove', onActivity, { passive: true });

        // Hover protection for interactive UI elements
        const controls = document.getElementById('lightbox-controls');
        const topBar = modal.querySelector('.lightbox-top-bar');
        const prevBtn = document.getElementById('lightbox-prev');
        const nextBtn = document.getElementById('lightbox-next');

        [controls, topBar, prevBtn, nextBtn].forEach(el => {
            if (!el) return;
            el.addEventListener('pointerenter', () => {
                this.isControlsHovered = true;
                if (this.hudTimer) clearTimeout(this.hudTimer);
                this.showHud();
            });
            el.addEventListener('pointerleave', (e) => {
                if (e && e.relatedTarget && el.contains(e.relatedTarget)) return;
                this.isControlsHovered = false;
                this.resetHudTimer();
            });
        });
    },

    setupPointerLogic() {
        const img = document.getElementById('lightbox-img');
        const viewport = document.getElementById('lightbox-viewport');
        if (!img || !viewport) return;

        // Pointerdown (mouse, touch, pen)
        img.addEventListener('pointerdown', (e) => {
            this.showHud();
            img.setPointerCapture(e.pointerId);
            this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

            if (this.activePointers.size === 1) {
                this.isDragging = true;
                this.startX = e.clientX;
                this.startY = e.clientY;
                this.initialTranslateX = this.translateX;
                this.initialTranslateY = this.translateY;

                // Gesture record
                this.touchStartX = e.clientX;
                this.touchStartY = e.clientY;
                this.touchStartTime = Date.now();
            } else if (this.activePointers.size === 2) {
                // Multi-touch pinch start
                this.isDragging = false;
                const points = Array.from(this.activePointers.values());
                this.initialPinchDistance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
                this.initialPinchScale = this.scale;
            }
            e.preventDefault();
        });

        // Pointermove
        img.addEventListener('pointermove', (e) => {
            if (!this.activePointers.has(e.pointerId)) return;
            this.showHud();
            this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

            // Pinch-to-zoom with 2 fingers
            if (this.activePointers.size === 2 && this.initialPinchDistance) {
                const points = Array.from(this.activePointers.values());
                const currentDist = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
                if (this.initialPinchDistance > 0) {
                    const ratio = currentDist / this.initialPinchDistance;
                    this.scale = Math.min(Math.max(this.initialPinchScale * ratio, 0.25), 5.0);
                    this.updateTransform();
                }
                e.preventDefault();
                return;
            }

            // Single pointer pan / drag
            if (this.isDragging && this.activePointers.size === 1) {
                const deltaX = e.clientX - this.startX;
                const deltaY = e.clientY - this.startY;
                this.translateX = this.initialTranslateX + deltaX;
                this.translateY = this.initialTranslateY + deltaY;
                this.updateTransform();
                e.preventDefault();
            }
        });

        // Pointerup / Pointercancel
        const endPointer = (e) => {
            if (this.activePointers.has(e.pointerId)) {
                this.activePointers.delete(e.pointerId);
                try { img.releasePointerCapture(e.pointerId); } catch (err) {}
            }

            if (this.activePointers.size === 0) {
                // Check if this was a quick swipe gesture on mobile while in fit mode
                const deltaX = e.clientX - this.touchStartX;
                const deltaY = e.clientY - this.touchStartY;
                const duration = Date.now() - this.touchStartTime;

                if (duration < 350 && Math.abs(deltaX) > 50 && Math.abs(deltaY) < 60 && this.scale <= 1.1) {
                    if (deltaX < 0) {
                        this.next();
                    } else {
                        this.prev();
                    }
                } else if (duration < 250 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
                    // Tap / Double-tap detection
                    const now = Date.now();
                    if (now - this.lastTapTime < 300) {
                        // Double tap: toggle fit / 2x zoom
                        if (this.scale > 1.2) {
                            this.resize('fit');
                        } else {
                            this.scale = 2.0;
                            this.updateTransform();
                        }
                        this.lastTapTime = 0;
                    } else {
                        this.lastTapTime = now;
                        if (this.isMobileDevice()) {
                            this.toggleHud();
                        } else {
                            this.showHud();
                        }
                    }
                }

                this.isDragging = false;
                this.initialPinchDistance = null;
                this.resetHudTimer();
            } else if (this.activePointers.size === 1) {
                // Switched from 2 fingers back to 1
                const remaining = Array.from(this.activePointers.values())[0];
                this.startX = remaining.x;
                this.startY = remaining.y;
                this.initialTranslateX = this.translateX;
                this.initialTranslateY = this.translateY;
                this.isDragging = true;
            }
        };

        img.addEventListener('pointerup', endPointer);
        img.addEventListener('pointercancel', endPointer);
    },

    setupWheelLogic() {
        const viewport = document.getElementById('lightbox-viewport');
        if (!viewport) return;

        viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.showHud();
            const delta = e.deltaY < 0 ? 0.2 : -0.2;
            this.zoomStep(delta);
        }, { passive: false });
    },

    setupKeyboardLogic() {
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('lightbox');
            if (!modal || !modal.classList.contains('active')) return;

            this.showHud();

            switch (e.key) {
                case 'Escape':
                    this.close();
                    break;
                case 'ArrowLeft':
                    this.prev();
                    break;
                case 'ArrowRight':
                    this.next();
                    break;
                case '+':
                case '=':
                    this.zoomStep(0.25);
                    break;
                case '-':
                case '_':
                    this.zoomStep(-0.25);
                    break;
                case '0':
                    this.resize('fit');
                    break;
                case 'f':
                case 'F':
                    this.toggleFullScreen();
                    break;
            }
        });
    },

    setupBackgroundClick() {
        const viewport = document.getElementById('lightbox-viewport');
        if (!viewport) return;

        // Click outside image: if HUD is hidden, reveal it; if already visible, close lightbox
        viewport.addEventListener('click', (e) => {
            if (e.target === viewport) {
                const modal = document.getElementById('lightbox');
                if (modal && modal.classList.contains('hud-hidden')) {
                    this.showHud();
                } else {
                    this.close();
                }
            }
        });
    }
};

// Make available globally
window.Lightbox = Lightbox;


