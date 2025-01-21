let model;

async function loadModel() {
    const modelURL = "https://YOUR_GITHUB_REPOSITORY_URL/model.json"; // Replace with the actual model.json URL
    const metadataURL = "https://YOUR_GITHUB_REPOSITORY_URL/metadata.json"; // Replace with the actual metadata.json URL

    // Load the Teachable Machine model
    model = await tmImage.load(modelURL, metadataURL);
}

async function verifyTicket() {
    const ticketID = document.getElementById("ticketID").value;
    const photoInput = document.getElementById("photoInput").files[0];
    const output = document.getElementById("output");

    if (!ticketID || !photoInput) {
        alert("Please provide both Ticket ID and a photo.");
        return;
    }

    output.textContent = "Verifying...";

    // Fetch the ID database from GitHub
    const databaseUrl = "https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPOSITORY/main/database.json"; // Replace with the actual database.json URL
    const response = await fetch(databaseUrl);
    const database = await response.json();

    // Verify Ticket ID in the database
    const passenger = database.find((entry) => entry.id === ticketID);
    if (!passenger) {
        output.textContent = "Invalid Ticket ID. Verification failed.";
        return;
    }

    // Read the uploaded image for face verification
    const img = new Image();
    const reader = new FileReader();
    reader.onload = async (event) => {
        img.src = event.target.result;

        img.onload = async () => {
            const prediction = await model.predict(img);

            // Find the highest probability label
            const highestPrediction = prediction.reduce((prev, current) =>
                prev.probability > current.probability ? prev : current
            );

            // Match the face recognition label with the Ticket ID
            if (highestPrediction.probability > 0.8 && highestPrediction.className === ticketID) {
                output.textContent = `Ticket verified for ${passenger.name} (ID: ${ticketID}).`;
            } else {
                output.textContent = "Face verification failed. Please check your photo.";
            }
        };
    };
    reader.readAsDataURL(photoInput);
}

// Load the Teachable Machine model when the page loads
loadModel();
