document.addEventListener("DOMContentLoaded", () => {
    const galleryGrid = document.getElementById("gallery");
    let allPhotos = [];
    let currentColumnsCount = 0;

    function getColumnCount() {
        const width = window.innerWidth;
        if (width >= 1600) return 6;
        if (width >= 1280) return 5;
        if (width >= 1024) return 4;
        if (width >= 768)  return 3;
        if (width >= 480)  return 2;
        return 1;
    }

    async function renderGallery() {
        const columnsCount = getColumnCount();
        
        if (columnsCount === currentColumnsCount) return;
        currentColumnsCount = columnsCount;

        galleryGrid.innerHTML = "";

        const columns = [];
        for (let i = 0; i < columnsCount; i++) {
            const columnDOM = document.createElement("div");
            columnDOM.className = "gallery-column";
            galleryGrid.appendChild(columnDOM);
            columns.push(columnDOM);
        }

        for (const photo of allPhotos) {
            const shortestColumn = columns.reduce((prev, curr) => 
                prev.offsetHeight <= curr.offsetHeight ? prev : curr
            );

            const item = document.createElement("div");
            item.className = "gallery-item";
            item.innerHTML = `
                <img src="fotos/${photo.filename}" alt="${photo.description}" loading="lazy">
            `;
            // <div class="gallery-info">
            //     <p class="gallery-description">${photo.description}</p>
            //     <span class="gallery-technique">${photo.technique}</span>
            // </div>

            shortestColumn.appendChild(item);

            const img = item.querySelector("img");
            if (!img.complete) {
                await new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            }
        }
    }

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

    fetch("fotos.json")
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(photos => {
            allPhotos = photos;
            renderGallery();
            window.addEventListener("resize", handleResize);
        })
        .catch(error => {
            console.error("Error loading gallery:", error);
            galleryGrid.innerHTML = `<p style="text-align:center; color:red;">Failed to load images.</p>`;
        });
});

