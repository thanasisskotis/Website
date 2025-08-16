let boxCounter = 1;  // To assign unique IDs to new boxes (might not be needed with backend IDs)
let selectedBoxId = boxCounter; // Which box is active (to upload/fetch images)
let dragged = false;
var disallowDrag = false; 
let uploadSuccessful = false;
const formContainer = document.querySelector('.form-container');

window.onload = () => { loadBoxes(); };

const exitBtn = document.getElementById("exitBtn");
exitBtn.onclick = function() {
    const container = document.getElementById("container");
    container.style.display = "flex";
    
    const layout = document.getElementById("imageLayout")
    layout.style.display = "none";

    const gallery = document.getElementById("gallery");
    gallery.style.display = "none";
}

function loadBoxes() {
    fetch(`https://backend-afc4.onrender.com/boxes`)
        .then((res) => res.json())
        .then((data) => {
            console.log("Boxes data received:", data);
            if (!data.success || !Array.isArray(data.boxes)) {
                alert("Failed to load boxes");
                return;
            }

            const container = document.getElementById('container');
            if (!container) {
                console.error("Container element not found");
                return;
            }

            data.boxes.sort((a, b) => new Date(b.date) - new Date(a.date));

            data.boxes.forEach((box) => {
                const newBox = document.createElement("div");
                newBox.className = "box";
                newBox.id = box.id;
                newBox.style.position = "relative"; // needed for date overlay
                newBox.style.overflow = "hidden";
                newBox.style.borderRadius = "1rem"; // keep rounded corners

                // clickable
                newBox.onclick = preventClickIfDragged((e, element) => {
                    showImages(element.id);
                });

                const firstBox = container.querySelector('.createBox');
                container.insertBefore(newBox, firstBox);

                // fetch images for this box
                fetch(`https://backend-afc4.onrender.com/images/${newBox.id}`)
                    .then((res2) => res2.json())
                    .then((data2) => {
                        if (!data2.success || !Array.isArray(data2.images)) {
                            console.warn("No images for box", newBox.id);
                            return;
                        }

                        if (data2.images.length > 0) {
                            // cover image
                            const imageElem = document.createElement("img");
                            imageElem.src = data2.images[0].url;
                            imageElem.style.height = "100%";
                            imageElem.style.width = "100%";
                            imageElem.style.objectFit = "cover";
                            newBox.appendChild(imageElem);
                        }

                        // date overlay
                        const formattedDate = new Date(box.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });

                        const dateOverlay = document.createElement("div");
                        dateOverlay.textContent = formattedDate;
                        dateOverlay.style.position = "absolute";
                        dateOverlay.style.bottom = "0";
                        dateOverlay.style.left = "0";
                        dateOverlay.style.width = "100%";
                        dateOverlay.style.background = "#fff8dc";
                        dateOverlay.style.color = "black";
                        dateOverlay.style.padding = "0.5rem";
                        dateOverlay.style.fontSize = "1rem";
                        dateOverlay.style.textAlign = "center";

                        newBox.appendChild(dateOverlay);

                        console.log(`📥 Loaded images for box ${newBox.id}`);
                    })
                    .catch((err2) => {
                        console.error("❌ Failed to load images:", err2);
                    });
            });
        })
        .catch((err) => {
            console.error("❌ Failed to load boxes:", err);
            alert("Upload error: " + err.message);
        });
}



const container = document.getElementById('container');

container.onmousedown = function(e) { 
    const formContainer = document.querySelector('.form-container');
    if (formContainer && disallowDrag == false) {
        Drag(e.clientX);
    }
};

container.onmouseleave = function() {
    document.onclick = function() {
        formContainer.style.display = 'none';
    };
};

const createBox = document.getElementById("createBox");
createBox.onclick = preventClickIfDragged((e, element) => {
    giveBoxId();
});


function preventClickIfDragged(callback) {
    return function(e) {
        if (dragged) {
            e.preventDefault();
            e.stopImmediatePropagation();
            dragged = false;
            return;
        }
        callback(e, e.currentTarget);
        dragged = false;
    };
}


function giveBoxId() {
    if (formContainer) {
        formContainer.style.display = 'flex';
        formContainer.style.justifyContent = 'center';
        formContainer.style.alignItems = "center";
        disallowDrag = true;
    }

    // Style #upload form
    const uploadForm = document.getElementById('upload');
    if (uploadForm) {
        uploadForm.style.display = 'flex';
        uploadForm.style.position = 'fixed';
        uploadForm.style.bottom = '40%';
        uploadForm.style.flexDirection = 'column';
        uploadForm.style.alignItems = 'center';
        uploadForm.style.gap = '1rem';
        uploadForm.style.backgroundColor = '#fff8dc';
        uploadForm.style.padding = '3rem';
        uploadForm.style.borderRadius = '1rem';
        uploadForm.style.boxShadow = '1px 2px 10px 10px rgba(0, 0, 0, 0.1)';
        uploadForm.style.fontSize = '1.4rem';
    }

    // Style inputs and button inside #upload
    const inputs = document.querySelectorAll('#upload input, #upload button');
    inputs.forEach(el => {
        el.style.fontSize = '1.3rem';
        el.style.padding = '1rem 1.5rem';
        el.style.borderRadius = '0.5rem';
        el.style.border = '1px solid #ccc';
        el.style.width = '100%';
        el.style.maxWidth = '500vw';
    });

    // Style the button separately
    const button = document.querySelector('#upload button');
    if (button) {
        button.style.backgroundColor = '#f0a500';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.cursor = 'pointer';
        button.style.transition = 'background-color 0.3s ease';

        button.onmouseenter = function() {  
            button.style.backgroundColor = '#d18c00';
        };

        button.onmouseleave = function() {
            button.style.backgroundColor = '#f0a500';
        };

        button.onclick = function(e) {
            uploadImages();
        }

        const pageContent = document.querySelector('.page-content');
        if (pageContent) {
            pageContent.style.filter = 'blur(1.5px)';
        }
    }
}

// Show images for a given box and remember which box is selected
function showImages(boxId) {
    selectedBoxId = boxId;
    console.log("Entered showImages");
    document.getElementById("container").style.display = "none";
    document.getElementById("imageLayout").style.display = "flex";
    document.getElementById("gallery").style.display = "flex";
    loadImages(boxId);
}

function hideOverlay() {
    document.getElementById("imageOverlay").style.display = "none";
    document.getElementById("imageLayout").style.display = "none";
}

function uploadImages() {
    uploadSuccessful = true;
    disallowDrag = false;
    const files = document.getElementById("fileInput").files;
    const dateInput = document.getElementById("dateInput").value;

    if (!dateInput) {
        alert("Please select a date.");
        return;
    }
    if (files.length === 0) {
        alert("Please select image files to upload.");
        return;
    }

    const gallery = document.getElementById("gallery");
    let uploadCount = 0;
    
    for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("image", files[i]);
        formData.append("date", dateInput);

        fetch("https://backend-afc4.onrender.com/upload", {
            method: "POST",
            body: formData,
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                uploadCount++;
                const img = document.createElement("img");
                img.src = data.url;
                img.style.width = "150px";
                gallery.appendChild(img);
            } else {
                alert("Upload failed: " + data.message);
                uploadSuccessful = false;
            }

            if (uploadCount === files.length) {
                alert("All images uploaded!");
            }
        })
        .catch((err) => {
            console.error("❌ Upload error:", err);
            alert("Upload failed. Check the console for details.");
        });
    }

    if (uploadSuccessful) {
        const container = document.getElementById("container");
        const newBox = document.createElement("div");
        newBox.className = "box";
        newBox.id = `box${boxCounter}`;


        // Show date instead of box ID
        const formattedDate = new Date(dateInput).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        newBox.textContent = formattedDate;

        newBox.onclick = () => showImages(newBox.id);

        // Insert at start for newest first
        container.insertBefore(newBox, container.firstChild);
        boxCounter++;

        if (formContainer) {
            formContainer.style.display = "none";
        }
        const pageContent = document.querySelector('.page-content');
        if (pageContent) {
            pageContent.style.filter = 'none';
        }
    }
}

function loadImages(boxId) {
    fetch(`https://backend-afc4.onrender.com/images/${boxId}`)
        .then((res) => res.json())
        .then((data) => {
            if (!data.success || !Array.isArray(data.images)) {
                alert("Failed to load images");
                return;
            }

            const gallery = document.getElementById("gallery");
            gallery.innerHTML = "";

            data.images.forEach((img) => {
                const imageElem = document.createElement("img");
                imageElem.src = img.url;
                if (window.matchMedia("(max-width: 768px)").matches) {
                    imageElem.style.height = "25vh";
                    imageElem.style.width = "17.5vh";
                } else {
                    imageElem.style.height = "70vh";
                    imageElem.style.width = "50vh";
                }
                imageElem.style.margin = "0 3vw 10vw 0";
                gallery.appendChild(imageElem);
                imageElem.onclick = function(){
                    imageElem.style.maxWidth= "90vw";  /* never exceed 90% of screen width */
                    imageElem.style.maxHeight= "90vh"; /* never exceed 90% of screen height */
                    imageElem.style.width= "auto";      /* scale proportionally */
                    imageElem.style.height= "auto";
                    imageElem.style.borderRadius= "1rem";
                    const gallery = document.getElementById("gallery");
                    gallery.childNodes.forEach((child) =>{
                        if(child != imageElem) 
                        child.style.display = "none";
                    });
                    gallery.style.justifyContent = "center";
                    gallery.style.alignItems = "center";
                    const button = document.getElementById("exitBtn");
                    button.style.display = "none";

                    const restoreImages = (event) => {
                        if (!imageElem.contains(event.target)) {
                            gallery.childNodes.forEach((child) => {
                                child.style.display = "block";
                            });
                            gallery.style.justifyContent = "start";
                            gallery.style.alignItems = "flex-start";
                            document.removeEventListener("click", restoreImages);
                            button.style.display = "block";
                            if (window.matchMedia("(max-width: 768px)").matches) {
                                imageElem.style.height = "20vh";
                                imageElem.style.width = "12.5vh";
                            } else {
                                imageElem.style.height = "70vh";
                                imageElem.style.width = "50vh";
                            }
                        }
                    };
                    document.addEventListener("click", restoreImages);


                }
            });

            console.log(`📥 Loaded ${data.images.length} images for box ${boxId}`);
        })
        .catch((err) => {
            console.error("❌ Failed to load images:", err);
            alert("Upload error: " + err.message);
        });
}



document.getElementById('backToBoxes').onclick = () => {
    // Hide gallery
    const gallery = document.getElementById('gallery');
    if (gallery) gallery.style.display = 'none';

    // Show boxes container
    const container = document.getElementById('container');
    if (container) container.style.display = 'flex'; // or block, depending on your layout
};








