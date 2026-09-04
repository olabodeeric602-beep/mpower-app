// ======================================
// MPower - Location
// ======================================

const locationButton = document.getElementById("setLocationBtn");
const locationStatusElement = document.getElementById("locationStatus");

const LOCATION_API_URL = `${window.MPOWER_API_BASE_URL}/auth`;
const authToken = localStorage.getItem("token");

const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "null"
);

if (currentUser && currentUser.location && currentUser.location.lat) {
    if (locationStatusElement) {
        locationStatusElement.textContent = "Location saved successfully";
    }
}

if (locationButton) {
    locationButton.addEventListener("click", function () {
        if (!navigator.geolocation) {
            showMessage(
                "Your browser does not support location.",
                "error",
                "Location Error"
            );
            return;
        }

        if (locationStatusElement) {
            locationStatusElement.textContent = "Getting your location...";
        }

        navigator.geolocation.getCurrentPosition(
            async function (position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                try {
                    const response = await fetch(`${LOCATION_API_URL}/location`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${authToken}`
                        },
                        body: JSON.stringify({ lat, lng })
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.message || "Failed to save location");
                    }

                    if (locationStatusElement) {
                        locationStatusElement.textContent = "Location saved successfully";
                    }

                    showMessage(
                        "Your location has been saved!",
                        "success",
                        "Location Saved"
                    );
                } catch (error) {
                    console.error("Failed to save location:", error);

                    if (locationStatusElement) {
                        locationStatusElement.textContent = "Failed to save location. Try again.";
                    }

                    showMessage(
                        error.message || "Could not save your location.",
                        "error",
                        "Location Error"
                    );
                }
            },
            function () {
                showMessage(
                    "Unable to get your location.",
                    "error",
                    "Location Failed"
                );

                if (locationStatusElement) {
                    locationStatusElement.textContent = "Location permission denied";
                }
            }
        );
    });
}