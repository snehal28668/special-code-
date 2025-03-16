// Global variables
let model;
let images = [];
let imageElements = [];


async function loadModel() {
    model = await mobilenet.load();
    console.log("Model Loaded");
}


async function classifyImage(imageElement) {
    const image = await tf.browser.fromPixels(imageElement);
    const predictions = await model.classify(image);
    image.dispose();
    return predictions;
}


document.getElementById("imageInput").addEventListener("change", handleFileInput);


function handleFileInput(event) {
    const files = event.target.files;
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = ''; 
    images = []; 
    imageElements = []; 

    for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgElement = document.createElement("img");
            imgElement.src = e.target.result;
            imgElement.width = 100; // Resize for preview
            imgElement.onload = () => {
                gallery.appendChild(imgElement);
                images.push(files[i]);
                imageElements.push(imgElement);
            };
        };
        reader.readAsDataURL(files[i]);
    }
}


async function organizeIntoFolders() {
    const folders = {};

  
    for (let i = 0; i < imageElements.length; i++) {
        const image = imageElements[i];
        const predictions = await classifyImage(image);

        const predictedClass = predictions[0].className;

        if (!folders[predictedClass]) {
            folders[predictedClass] = [];
        }
        folders[predictedClass].push(image);
    }

    // Display organized folders
    const foldersDiv = document.getElementById("folders");
    foldersDiv.innerHTML = ''; // Clear previous folders

    Object.keys(folders).forEach(className => {
        const folderDiv = document.createElement("div");
        const folderTitle = document.createElement("h2");
        folderTitle.textContent = className;
        folderDiv.appendChild(folderTitle);

        folders[className].forEach(img => {
            folderDiv.appendChild(img);
        });

        foldersDiv.appendChild(folderDiv);
    });
}

// Check for duplicate images (based on class)
async function checkForDuplicates() {
    const seenClasses = new Map();
    const duplicateImages = [];

    // Loop through each image and classify it
    for (let i = 0; i < imageElements.length; i++) {
        const image = imageElements[i];
        const predictions = await classifyImage(image);

        const predictedClass = predictions[0].className;

        // Check if the class already exists, indicating a duplicate
        if (seenClasses.has(predictedClass)) {
            duplicateImages.push(image);
        } else {
            seenClasses.set(predictedClass, true);
        }
    }

    // Highlight duplicate images with a red border
    duplicateImages.forEach(img => {
        img.style.border = "2px solid red"; // Mark duplicates with red border
    });

    // Notify the user about the number of duplicates
    alert(`${duplicateImages.length} duplicate(s) found.`);
}

// Initial model load
loadModel();



