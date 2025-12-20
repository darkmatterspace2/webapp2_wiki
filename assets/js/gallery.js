/**
 * Global Gallery Script - Auto-initializes masonry galleries with fullscreen viewer
 * 
 * Usage: Just include this script in article.html. Any element with class "gallery"
 * containing images will automatically get:
 * - Masonry layout via CSS variable --rows
 * - Fullscreen viewer on click
 * - ESC key to close
 * - Arrow keys to navigate
 */

(function () {
    'use strict';

    // Create fullscreen viewer container (recreate if destroyed by layout.js)
    function createFullscreenViewer() {
        var existing = document.getElementById('gallery-fullscreen');
        // If exists and is attached to body, reuse it
        if (existing && existing.parentNode === document.body) {
            return;
        }
        // Remove orphaned element if any
        if (existing) {
            existing.remove();
        }

        var viewer = document.createElement('div');
        viewer.id = 'gallery-fullscreen';
        viewer.className = 'gallery-fullscreen';
        viewer.innerHTML = '<img id="gallery-fs-img">';
        viewer.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.97);display:none;align-items:center;justify-content:center;z-index:9999;cursor:pointer;';

        var img = viewer.querySelector('img');
        img.style.cssText = 'max-width:95vw;max-height:95vh;object-fit:contain;';

        document.body.appendChild(viewer);

        // Close on click
        viewer.addEventListener('click', function () {
            viewer.style.display = 'none';
            img.src = '';
        });

        // ESC to close (only add once using a flag)
        if (!window._galleryEscListenerAdded) {
            window._galleryEscListenerAdded = true;
            document.addEventListener('keydown', function (e) {
                var fsViewer = document.getElementById('gallery-fullscreen');
                if (e.key === 'Escape' && fsViewer && fsViewer.style.display === 'flex') {
                    fsViewer.style.display = 'none';
                    var fsImg = document.getElementById('gallery-fs-img');
                    if (fsImg) fsImg.src = '';
                }
            });
        }

        return { viewer: viewer, img: img };
    }

    // Resize handler for masonry layout
    function resizeGalleryImages() {
        document.querySelectorAll('.gallery img').forEach(function (img) {
            var h = img.getBoundingClientRect().height;
            if (h > 0) {
                img.style.setProperty('--rows', Math.ceil(h));
            }
        });
    }

    // Initialize all galleries
    function initGalleries(container) {
        container = container || document;

        var viewer = createFullscreenViewer();
        var fsViewer = document.getElementById('gallery-fullscreen');
        var fsImg = document.getElementById('gallery-fs-img');

        var galleries = container.querySelectorAll('.gallery');

        galleries.forEach(function (gallery) {
            // Skip if already initialized
            if (gallery.dataset.galleryInit) return;
            gallery.dataset.galleryInit = 'true';

            var images = gallery.querySelectorAll('img');

            images.forEach(function (img) {
                img.style.cursor = 'zoom-in';

                // Resize on load
                img.addEventListener('load', function () {
                    var h = img.getBoundingClientRect().height;
                    if (h > 0) {
                        img.style.setProperty('--rows', Math.ceil(h));
                    }
                });

                // Click to fullscreen
                img.addEventListener('click', function () {
                    fsImg.src = img.src;
                    fsViewer.style.display = 'flex';
                });
            });
        });

        // Initial resize
        resizeGalleryImages();
    }

    // Expose globally for manual calls (e.g., after dynamic content load)
    window.initGalleries = initGalleries;
    window.resizeGalleryImages = resizeGalleryImages;

    // Auto-init on load
    window.addEventListener('load', function () {
        initGalleries();
        // Delayed resize to catch late-loading images
        setTimeout(resizeGalleryImages, 500);
        setTimeout(resizeGalleryImages, 1500);
        setTimeout(resizeGalleryImages, 3000);
    });

    // Resize on window resize
    window.addEventListener('resize', resizeGalleryImages);

})();
