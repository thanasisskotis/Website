let boxCounter = 1;  // To assign unique IDs to new boxes
let selectedBoxId = boxCounter; // Which box is active (to upload/fetch images)
let dragged = false;
var disallowDrag = false; 
const formContainer = document.querySelector('.form-container');


const container = document.getElementById('container');

container.onmousedown = function(e) { 
    const formContainer = document.querySelector('.form-container');
    if (formContainer){
        if(disallowDrag == false) {
            Drag(e.clientX);
        }
    }
};

container.onmouseleave = function() {
    document.onclick = function() {
        formContainer.style.display = 'none';
    };
};

const createBox = document.getElementById("createBox");
createBox.onclick = preventClickIfDragged( () => { 
    giveBoxId(); 
});

function preventClickIfDragged( callback) {
    return function(e) {
        if (dragged) {
            e.preventDefault();
            e.stopImmediatePropagation();
            dragged = false;
            return;
        }
        callback();
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
    loadImages(boxId);
    // Show overlay or gallery
    document.getElementById("gallery").style.display = "flex";
}

// Hide overlay (optional for your design)
function hideOverlay() {
    document.getElementById("imageOverlay").style.display = "none";
    document.getElementById("gallery").style.display = "none";
}

// Upload images from input to the selected box
function uploadImages() {

    disallowDrag = false;
    const files = document.getElementById("fileInput").files;
    const dateInput = document.getElementById("dateInput").value;

    /*if (!selectedBoxId) {
        alert("Please select or create a box first.");
        return;
    }*/

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
        formData.append("boxId", selectedBoxId);
        formData.append("date", dateInput);  // ⬅️ Attach selected date

        fetch("https://your-backend-name.onrender.com/upload", {
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
                    img.style.margin = "5px";
                    gallery.appendChild(img);
                } else {
                    alert("Upload failed: " + data.message);
                }

                if (uploadCount === files.length) {
                    alert("All images uploaded!");
                }

            })
            .catch((err) => {
                alert("Upload error: " + err.message);
            });
    
    }
    if(true){
        // Optional: Dynamically create a box (if you're not selecting from existing)
                const container = document.getElementById("container");

                const newBox = document.createElement("div");
                newBox.className = "box";
                newBox.id = `box${boxCounter}`;
                newBox.textContent = `Box ${boxCounter}`;
                newBox.onclick = () => showImages(newBox.id);

                if (boxCounter <= 1) {
                // If 0 or 1 child, insert at the start (before first child)
                container.insertBefore(newBox, container.firstChild);
                } else {
                // Insert before the last child (second to last position)
                container.insertBefore(newBox, container.children[boxCounter - 1]);
                }
                boxCounter++;

                const formContainer = document.querySelector('.form-container');
                if (formContainer) {
                    formContainer.style.display= "none";
                }

                const pageContent = document.querySelector('.page-content');
                if (pageContent) {
                    pageContent.style.filter = 'none';
                }
    }
}


// Fetch and show images for a given box id
function loadImages(boxId) {
    fetch(`https://your-backend-name.onrender.com/images/${boxId}`)
        .then((res) => res.json())
        .then((data) => {
        if (!Array.isArray(data)) {
            alert("Failed to load images");
            return;
        }
        const gallery = document.getElementById("gallery");
        gallery.innerHTML = ""; // Clear existing

        document
        data.forEach((img) => {
            const imageElem = document.createElement("img");
            imageElem.src = img.url;
            imageElem.style.width = "150px";
            imageElem.style.margin = "5px";
            gallery.appendChild(imageElem);
        });
        })
        .catch(console.error);
}
