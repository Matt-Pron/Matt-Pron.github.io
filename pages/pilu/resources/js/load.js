document.addEventListener("DOMContentLoaded", () => {
    const galleryGrid = document.getElementById("gallery");
    let allPhotos = [];
    let currentColumnsCount = 0;

    // Determine how many columns to show based on screen width
    function getColumnCount() {
        const width = window.innerWidth;
        if (width >= 1600) return 6;
        if (width >= 1280) return 5;
        if (width >= 1024) return 4;
        if (width >= 768)  return 3;
        if (width >= 480)  return 2;
        return 1;
    }

    // High-performance asynchronous masonry balancer
    async function renderGallery() {
        const columnsCount = getColumnCount();
        
        // Only trigger a rebuild if the target column count actually changes
        if (columnsCount === currentColumnsCount) return;
        currentColumnsCount = columnsCount;

        galleryGrid.innerHTML = "";

        // 1. Create and inject empty structural column tracks into the DOM
        const columns = [];
        for (let i = 0; i < columnsCount; i++) {
            const columnDOM = document.createElement("div");
            columnDOM.className = "gallery-column";
            galleryGrid.appendChild(columnDOM);
            columns.push(columnDOM);
        }

        // 2. Process and append each photo sequentially
        for (const photo of allPhotos) {
            // Find the column that is currently the shortest (lowest offsetHeight)
            const shortestColumn = columns.reduce((prev, curr) => 
                prev.offsetHeight <= curr.offsetHeight ? prev : curr
            );

            // Create the item element
            const item = document.createElement("div");
            item.className = "gallery-item";
            item.innerHTML = `
                <img src="fotos/${photo.filename}" alt="${photo.description}" loading="lazy">
                <div class="gallery-info">
                    <p class="gallery-description">${photo.description}</p>
                    <span class="gallery-technique">${photo.technique}</span>
                </div>
            `;

            // Append item to the shortest column track
            shortestColumn.appendChild(item);

            // CRITICAL: Wait for this specific image to load before moving to the next photo.
            // This ensures .offsetHeight reads accurately including the image height.
            const img = item.querySelector("img");
            if (!img.complete) {
                await new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve; // Continue even if an image breaks
                });
            }
        }
    }

    // Real-time animation frame loop for window scaling
    let resizeTicking = false;
    function handleResize() {
        if (!resizeTicking) {
            window.requestAnimationFrame(() => {
                renderGallery();
                resizeTicking = false;
            });
            resizeTicking = true;
        }
    }

    // Initial Fetch
    fetch("fotos.json")
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(photos => {
            allPhotos = photos;
            renderGallery(); // Initial render
            window.addEventListener("resize", handleResize);
        })
        .catch(error => {
            console.error("Error loading gallery:", error);
            galleryGrid.innerHTML = `<p style="text-align:center; color:red;">Failed to load images.</p>`;
        });
});

