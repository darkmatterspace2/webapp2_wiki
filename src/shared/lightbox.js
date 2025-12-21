/**
 * specific Lightbox Module
 * Encapsulates full-screen image viewing logic
 */

const Lightbox = {
    isDragging: false,
    startX: 0,
    startY: 0,
    translateX: 0,
    translateY: 0,

    init() {
        // 1. Inject HTML if not present
        if (!document.getElementById('lightbox')) {
            const html = `
            <div id="lightbox" class="lightbox-modal" onclick="Lightbox.close()">
                <span class="lightbox-close">&times;</span>
                
                <!-- Image Container -->
                <img class="lightbox-content" id="lightbox-img" onclick="event.stopPropagation()">
                
                <!-- Controls -->
                <div class="lightbox-controls" onclick="event.stopPropagation()">
                    <button onclick="Lightbox.resize('fit')">F</button>
                    <button onclick="Lightbox.resize('100')">D</button>
                    <button onclick="Lightbox.resize('crop')">W</button>
                    <button onclick="Lightbox.resize('stretch')">S</button>
                    <button onclick="Lightbox.toggleFullScreen()">[ ]</button>
                </div>

                <div class="lightbox-caption" id="lightbox-caption"></div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', html);
        }

        // 2. Attach Global Listeners
        this.setupDragLogic();
        this.setupKeyboardLogic();
    },

    attach(selector) {
        const images = document.querySelectorAll(selector);
        images.forEach(img => {
            img.style.cursor = 'zoom-in';
            img.onclick = () => {
                this.open(img.src, img.alt);
            };
        });
    },

    open(src, alt) {
        const modal = document.getElementById('lightbox');
        const modalImg = document.getElementById('lightbox-img');
        const captionText = document.getElementById('lightbox-caption');

        modal.classList.add('active');
        modalImg.src = src;
        captionText.innerHTML = alt || '';

        // Reset Drag
        this.translateX = 0;
        this.translateY = 0;
        modalImg.style.transform = 'translate(0px, 0px)';

        // Default to 'fit'
        this.resize('fit');
    },

    close() {
        document.getElementById('lightbox').classList.remove('active');

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

    resize(mode) {
        const img = document.getElementById('lightbox-img');

        // Reset Drag
        this.translateX = 0;
        this.translateY = 0;
        img.style.transform = 'translate(0px, 0px)';

        // Reset common styles
        img.style.width = '';
        img.style.height = '';
        img.style.maxWidth = '';
        img.style.maxHeight = '';
        img.style.objectFit = '';
        img.style.margin = 'auto'; // Center by default

        switch (mode) {
            case 'fit':
                // Default: contained within max dimensions
                img.style.maxWidth = '90%';
                img.style.maxHeight = '90vh';
                img.style.objectFit = 'contain';
                break;
            case '100':
                // Natural size, allowing scroll
                img.style.maxWidth = 'none';
                img.style.maxHeight = 'none';
                // No specific width/height set, uses natural
                break;
            case 'crop':
                // "Zoom" logic: Fill screen but allow panning (don't clip with object-fit)
                const winRatio = window.innerWidth / window.innerHeight;
                const imgRatio = (img.naturalWidth || 1) / (img.naturalHeight || 1);

                if (imgRatio > winRatio) {
                    // Image is wider than screen relative to height -> Fill Height to cover
                    img.style.height = '100vh';
                    img.style.width = 'auto';
                } else {
                    // Image is taller than screen relative to width -> Fill Width to cover
                    img.style.width = '100vw'; // 100vw to ensure it covers width
                    img.style.height = 'auto';
                }

                img.style.maxWidth = 'none';
                img.style.maxHeight = 'none';
                break;
            case 'stretch':
                // Force fill screen, distorting
                img.style.width = '100%';
                img.style.height = '100vh';
                img.style.maxWidth = 'none';
                img.style.maxHeight = 'none';
                img.style.objectFit = 'fill';
                break;
        }
    },

    toggleFullScreen() {
        const elem = document.getElementById('lightbox');

        if (!document.fullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) { /* Safari */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE11 */
                elem.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
        }
    },

    setupDragLogic() {
        const lightboxImg = document.getElementById('lightbox-img');
        if (!lightboxImg) return;

        lightboxImg.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.startX = e.clientX - this.translateX;
            this.startY = e.clientY - this.translateY;
            e.preventDefault();
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            e.preventDefault();
            this.translateX = e.clientX - this.startX;
            this.translateY = e.clientY - this.startY;
            lightboxImg.style.transform = `translate(${this.translateX}px, ${this.translateY}px)`;
        });
    },

    setupKeyboardLogic() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('lightbox');
                if (modal && modal.classList.contains('active')) {
                    this.close();
                }
            }
        });
    }
};

// Make available globally
window.Lightbox = Lightbox;
