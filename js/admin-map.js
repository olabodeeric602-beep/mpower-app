// ======================================
// MPower Admin Map
// ======================================

const adminMapBox = document.getElementById("adminMap");

if (adminMapBox) {

    const map = L.map("adminMap").setView([9.0820, 8.6753], 6);

    L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "© OpenStreetMap"
        }
    ).addTo(map);

    // Fetch donations from API
    const authToken = localStorage.getItem("token");

    fetch(
        `${window.MPOWER_API_BASE_URL}/donations`,
        {
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        }
    )
    .then(response => response.json())
    .then(data => {

        const donations = data.donations || [];

        const bounds = [];

        donations.forEach(donation => {

            if (!donation.latitude || !donation.longitude) return;

            const lat = Number(donation.latitude);
            const lng = Number(donation.longitude);

            if (isNaN(lat) || isNaN(lng)) return;

            bounds.push([lat, lng]);

            L.marker([lat, lng])
                .addTo(map)
                .bindPopup(`
                    <strong>${donation.foodName}</strong><br>
                    <b>Restaurant:</b> ${donation.ownerName}<br>
                    <b>Quantity:</b> ${donation.quantity} ${donation.unit}<br>
                    <b>Status:</b> ${donation.status}<br>
                    <b>Location:</b> ${donation.location}
                `);

        });

        if (bounds.length > 0) {
            map.fitBounds(bounds, {
                padding: [40, 40]
            });
        }

    })
    .catch(error => {
        console.error("Failed to load donations for map:", error);
    });

}