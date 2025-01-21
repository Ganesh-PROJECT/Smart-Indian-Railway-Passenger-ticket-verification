let model, webcamStream;

async function loadModel() {
    const modelURL = "https://raw.githubusercontent.com/Ganesh-PROJECT/Smart-Indian-Railway-Passenger-ticket-verification/refs/heads/main/tm-my-image-model%20(5)/model.json"; // Replace with the actual model.json URL
    const metadataURL = "https://raw.githubusercontent.com/Ganesh-PROJECT/Smart-Indian-Railway-Passenger-ticket-verification/refs/heads/main/tm-my-image-model%20(5)/metadata.json"; // Replace with the actual metadata.json URL

    // Load the Teachable Machine model
    model = await tmImage.load(modelURL, metadataURL);
    setupWebcam();
}

function setupWebcam() {
    const webcamElement = document.getElementById("webcam");

    // Access the webcam
    navigator.mediaDevices
        .getUserMedia({ video: true }) // Request access to the webcam
        .then((stream) => {
            webcamElement.srcObject = stream; // Set webcam video stream as the video element source
            webcamElement.play(); // Start playing the video
        })
        .catch((err) => {
            console.error("Error accessing webcam: ", err);
            alert("Unable to access the camera. Please check your browser settings.");
        });
}

async function captureAndVerify() {
    const ticketID = document.getElementById("ticketID").value;
    const webcamElement = document.getElementById("webcam");
    const output = document.getElementById("output");

    if (!ticketID) {
        alert("Please enter your Ticket ID.");
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

    // Capture image from the webcam
    const canvas = document.createElement("canvas");
    canvas.width = webcamElement.videoWidth;
    canvas.height = webcamElement.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(webcamElement, 0, 0, canvas.width, canvas.height);
    const capturedImage = canvas;

    // Verify face using the Teachable Machine model
    const prediction = await model.predict(capturedImage);

    // Find the highest probability label
    const highestPrediction = prediction.reduce((prev, current) =>
        prev.probability > current.probability ? prev : current
    );

    // Match the face recognition label with the Ticket ID
    if (highestPrediction.probability > 0.8 && highestPrediction.className === ticketID) {
        output.textContent = `Ticket verified for ${passenger.name} (ID: ${ticketID}).`;
    } else {
        output.textContent = "Face verification failed. Please try again.";
    }
}

// Load the Teachable Machine model when the page loads
loadModel();
