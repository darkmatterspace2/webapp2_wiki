# Feature Specification: Low-Dependency Retro Gallery & Lightbox

**Context**: This document serves as a blueprint for an AI agent to replicate the "Retro Gallery", "float-controls", and "Lightbox" system in another application. The system is designed to be ultra-lightweight, dependency-free (Vanilla JS/CSS), and aesthetically retro (early 2000s web).

---

## 1. Retro Masonry Gallery (`.retro-gallery`)

### Core Concept
A CSS-only flex-based masonry layout that handles images and videos seamlessly. It degrades gracefully without JavaScript.

### HTML Structure
```html
<div class="retro-gallery cols-3">
    <!-- Item 1 -->
    <div class="retro-gallery-col">
        <figure class="gallery-item">
            <img src="path/to/image.jpg" alt="Description" />
            <figcaption>Caption Text</figcaption>
        </figure>
    </div>
    <!-- ... more items ... -->
</div>
```

### CSS Implementation Specs
*   **Flex Architecture**:
    *   Container: `display: flex; flex-wrap: wrap;`
    *   Columns: Usage of `flex-basis` or `width` percentage for columns (e.g., `33.33%`).
    *   No Gaps: Images should touch each other (`padding: 0; margin: 0`).
*   **Media Handling**:
    *   `img` and `video` elements must be `display: block; width: 100%` to remove inline spacing artifacts.
*   **Caption Overlay (Hover)**:
    *   Absolute positioning over the image: `top: 0; left: 0; right: 0;`.
    *   Hidden state: `transform: translateY(-100%); opacity: 0;`.
    *   Visible state (on hover): `transform: translateY(0); opacity: 1;`.
    *   Style: Semi-transparent black background (`rgba(0,0,0,0.7)`) with white text.
*   **Responsiveness**:
    *   Column width adjusts via media queries (e.g., 50% at 800px, 100% at mobile).
*   **Utility Classes**:
    *   `.cols-2`, `.cols-3`, `.cols-4`, `.cols-5` modifiers to override column widths.

---

## 2. Singleton JS Lightbox Module

### Core Concept
A self-contained JavaScript singleton (`window.Lightbox`) that injects its own HTML on initialization. It provides advanced viewing modes (Fit, 100%, Crop, Stretch) and drag-to-pan functionality.

### Functional Requirements

#### A. Initialization (`init()`)
1.  **HTML Injection**: Checks if `#lightbox` exists. If not, injects it into the DOM.
2.  **Markup**:
    *   Container: Fixed overlay (`z-index` > all).
    *   Image: `<img id="lightbox-img">`.
    *   Controls: A toolbar with buttons for resize modes.
    *   Caption: Display for `alt` text.
3.  **Event Binding**: Sets up keyboard (Escape to close) and drag logic.

#### B. API Methods
*   `attach(selector)`: Finds all elements matching the selector and binds their `onclick` to `Lightbox.open()`.
*   `open(src, alt)`:
    *   Sets `img.src`.
    *   Sets caption text.
    *   Shows modal (`display: block` or active class).
    *   Resets zoom/pan state.
*   `close()`: Hides modal and exits Fullscreen if active.

#### C. View Modes (`resize(mode)`)
The lightbox must support 4 distinct rendering modes via the toolbar:
1.  **Fit (Default)**:
    *   `object-fit: contain`
    *   `max-width: 90%`, `max-height: 90vh`
    *   Centered.
2.  **100% (Original)**:
    *   Shows image at natural resolution.
    *   Overflows screen (scrolling or panning required).
3.  **Crop (Smart Fill)**:
    *   Calculates aspect ratio of image vs screen.
    *   Sets either `width: 100vw` or `height: 100vh` to explicitly cover the viewport.
    *   No distortion, but edges are clipped.
4.  **Stretch**:
    *   `width: 100%`, `height: 100vh`, `object-fit: fill`.
    *   Intentionally distorts image to fill screen fully.

#### D. Drag-to-Pan Logic
*   Implementation: `mousedown`, `mousemove`, `mouseup` listeners on the image.
*   Calculates delta (dx, dy) and applies `transform: translate(x, y)` to the image.
*   Crucial for inspecting details in "100%" or "Crop" modes.

---

## 3. Floating Gallery Controls

### Core Concept
Non-intrusive, floating UI elements that allow the user to change gallery layout (column count) on the fly.

### CSS specs
*   **Positioning**: `position: fixed; bottom: 70px; right: 70px; z-index: 1100;`.
*   **Visibility**: Low opacity (e.g., 0.3) by default to avoid distraction. Fades to 1.0 on hover.
*   **Mobile View**: Logic to switch from `fixed` to `absolute` positioning if the UI layout changes (e.g., sidebar collapse), ensuring it doesn't float over content awkwardly on small screens.
*   **Aesthetics**:
    *   Vertical stack of small buttons.
    *   Translucent dark background.
    *   Retro borders (inset/outset style).

---

## Integration Guide

1.  **Include CSS**: Add the gallery and floating control styles to your main stylesheet.
2.  **Include JS**: Load `lightbox.js` at the end of `body`.
3.  **Initialize**:
    ```javascript
    document.addEventListener('DOMContentLoaded', () => {
        Lightbox.init();
        Lightbox.attach('.retro-gallery img'); // Bind to gallery images
        
        // Example binding for floating controls
        document.querySelectorAll('.gallery-float-controls button').forEach(btn => {
            btn.onclick = () => {
                // Logic to switch .cols-x classes on .retro-gallery container
            };
        });
    });
    ```
