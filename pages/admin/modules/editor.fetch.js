/**
 * EDITOR FETCH
 * Handles tools for extracting content from external sources or raw HTML.
 */

window.extractImagesFromHtml = function () {
    const input = document.getElementById('fetch-html-source').value;
    if (!input.trim()) {
        alert("Please paste some HTML code first.");
        return;
    }

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(input, 'text/html');
        const images = doc.querySelectorAll('img');

        let output = '';
        let count = 0;

        images.forEach(img => {
            const src = img.getAttribute('src');
            if (src) {
                // Determine if we should preserve other attributes? 
                // User said "it should in img tag", implying a simple extraction.
                // We'll stick to just src to keep it clean, as usually that's what's needed.
                output += `<img src="${src}">\n`;
                count++;
            }
        });

        const outputArea = document.getElementById('fetch-output');
        outputArea.value = output;

        if (count === 0) {
            alert("No images found in the provided HTML.");
        }

    } catch (e) {
        console.error("Extraction error:", e);
        alert("Error parsing HTML: " + e.message);
    }
};

window.copyFetchOutput = function (btn) {
    const outputArea = document.getElementById('fetch-output');
    if (!outputArea || !outputArea.value) {
        console.warn("Nothing to copy");
        return;
    }

    outputArea.select();
    outputArea.setSelectionRange(0, 99999); // For mobile devices

    const showFeedback = () => {
        if (btn) {
            const originalText = btn.innerText;
            btn.innerText = "Copied!";
            setTimeout(() => btn.innerText = originalText, 2000);
        }
    };

    try {
        navigator.clipboard.writeText(outputArea.value).then(() => {
            showFeedback();
        }).catch(err => {
            console.error('Async: Could not copy text: ', err);
            // Fallback for older browsers
            document.execCommand('copy');
            showFeedback();
        });
    } catch (err) {
        console.error('Could not copy text: ', err);
        alert("Failed to copy.");
    }
};
