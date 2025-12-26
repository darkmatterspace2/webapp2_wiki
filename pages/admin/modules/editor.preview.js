/**
 * EDITOR PREVIEW
 * Handles the logic for the preview modal and rendering gallery layouts.
 */

window.showPreview = function () {
    const title = document.getElementById('edit-title').value;
    const content = document.getElementById('edit-content').value;
    const category = document.getElementById('edit-category').value;
    const rating = document.getElementById('edit-rating').value;

    document.getElementById('preview-title').textContent = title || "Untitled";
    document.getElementById('preview-meta').textContent = `Category: ${category} | Rating: ${rating} | (Preview)`;

    const body = document.getElementById('preview-body');
    body.innerHTML = content;

    // Apply Gallery Logic to Preview
    window.formatGalleries(body);

    document.getElementById('preview-overlay').style.display = 'block';
};

window.formatGalleries = function (container) {
    const galleries = container.querySelectorAll('.retro-gallery');
    galleries.forEach(gallery => {
        if (gallery.querySelector('.retro-gallery-col')) return;
        const items = Array.from(gallery.children).filter(el => ['IMG', 'VIDEO', 'IFRAME', 'FIGURE'].includes(el.tagName));
        if (items.length === 0) return;

        // Determine Column Count
        let colCount = 3; // Default
        if (gallery.classList.contains('cols-2')) colCount = 2;
        if (gallery.classList.contains('cols-4')) colCount = 4;
        if (gallery.classList.contains('cols-5')) colCount = 5;

        // Create columns
        const cols = [];
        for (let i = 0; i < colCount; i++) {
            const div = document.createElement('div');
            div.className = 'retro-gallery-col';
            cols.push(div);
        }

        items.forEach((item, index) => {
            // FIGURE elements: append directly (they have their own figcaption)
            if (item.tagName === 'FIGURE') {
                cols[index % colCount].appendChild(item);
                return;
            }

            // Wrap in gallery-item with caption
            const wrapper = document.createElement('div');
            wrapper.className = 'gallery-item';
            wrapper.appendChild(item.cloneNode(true));

            // Create caption from alt, title, or data-caption
            const caption = item.getAttribute('data-caption') ||
                item.getAttribute('alt') ||
                item.getAttribute('title') || '';
            if (caption) {
                const captionEl = document.createElement('div');
                captionEl.className = 'gallery-caption';
                captionEl.textContent = caption;
                wrapper.appendChild(captionEl);
            }

            cols[index % colCount].appendChild(wrapper);
        });

        gallery.innerHTML = '';
        cols.forEach(c => gallery.appendChild(c));
    });
};

window.closePreview = function () {
    document.getElementById('preview-overlay').style.display = 'none';
};
