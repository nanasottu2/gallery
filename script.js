// Initialize gallery data
let galleryData = JSON.parse(localStorage.getItem("galleryData")) || {
  folders: {},
};

document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.getElementById("gallery");
  const folderUpload = document.getElementById("folder-upload");

  // Handle folder upload
  folderUpload.addEventListener("change", handleFolderUpload);

  function handleFolderUpload(event) {
    const files = event.target.files;
    const folderName = event.target.value.split("\\").pop().split("/").pop(); // Get folder name
    galleryData.folders[folderName] = []; // Initialize folder in galleryData

    // Process each file in the uploaded folder
    for (let file of files) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const mediaItem = {
          type: file.type.startsWith("image/") ? "image" : "video",
          src: e.target.result,
          name: file.name,
        };
        galleryData.folders[folderName].push(mediaItem);
        displayGallery(folderName);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = ""; // Reset input
    saveGalleryData();
  }

  function displayGallery(folderName) {
    gallery.innerHTML = ""; // Clear gallery

    const backBtn = document.createElement("div");
    backBtn.textContent = "Back (Clear Gallery)";
    backBtn.className = "back-btn";
    backBtn.onclick = () => {
      gallery.innerHTML = "";
      galleryData.folders = {}; // Clear data (optional, reset on back)
      saveGalleryData();
    };
    gallery.appendChild(backBtn);

    galleryData.folders[folderName].forEach((item) => {
      const mediaDiv = document.createElement("div");
      mediaDiv.className = "media-item";
      const element =
        item.type === "image"
          ? document.createElement("img")
          : document.createElement("video");
      element.src = item.src;
      if (item.type === "video") element.controls = true;
      element.alt = item.name;
      element.onerror = () => console.error(`Failed to load ${item.src}`);
      element.onclick = () => openInNewTab(item); // Open in new tab on click
      element.style.cursor = "pointer"; // Indicate clickable
      mediaDiv.appendChild(element);
      const p = document.createElement("p");
      p.textContent = item.name;
      mediaDiv.appendChild(p);
      gallery.appendChild(mediaDiv);
    });
  }

  function openInNewTab(item) {
    // Create a new HTML page as a Blob
    const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${item.name}</title>
                <style>
                    body { 
                        margin: 0;
                        padding: 20px;
                        background: #1e1e2f;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        overflow: auto;
                    }
                    img, video { 
                        max-width: 90%;
                        max-height: 90vh;
                        border-radius: 10px;
                        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
                    }
                    video { 
                        outline: none;
                    }
                </style>
            </head>
            <body>
                ${
                  item.type === "image"
                    ? `<img src="${item.src}" alt="${item.name}">`
                    : `<video controls autoplay><source src="${
                        item.src
                      }" type="${
                        item.type === "video" ? "video/mp4" : ""
                      }">Your browser does not support the video tag.</video>`
                }
            </body>
            </html>
        `;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    // Clean up the URL object after a delay to avoid memory leaks
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  function saveGalleryData() {
    localStorage.setItem("galleryData", JSON.stringify(galleryData));
    console.log("Gallery data saved:", galleryData);
  }
});
