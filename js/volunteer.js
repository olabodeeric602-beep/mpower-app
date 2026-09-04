// ======================================
// MPower Volunteer Dashboard
// ======================================

"use strict";


// ======================================
// CURRENT USER
// ======================================

const currentUser = JSON.parse(
    localStorage.getItem("currentUser")
);


// ======================================
// AUTHENTICATION
// ======================================

if (
    !currentUser ||
    currentUser.role !== "volunteer"
) {

    if (typeof showMessage === "function") {

        showMessage(
            "Only volunteer accounts can access the volunteer dashboard.",
            "warning",
            "Access Restricted"
        );

    }

    setTimeout(() => {

        window.location.href =
            "profile.html";

    }, 1000);

    throw new Error(
        "Unauthorized volunteer dashboard access."
    );

}


// ======================================
// API CONFIGURATION
// ======================================

const API_BASE_URL = window.MPOWER_API_BASE_URL;

const authToken = localStorage.getItem("token");


// ======================================
// DOM ELEMENTS
// ======================================

const volunteerName =
    document.getElementById("volunteerName");

const availableCount =
    document.getElementById("availableCount");

const activeCount =
    document.getElementById("activeCount");

const completedCount =
    document.getElementById("completedCount");

const availableDonations =
    document.getElementById("availableDonations");

const emptyDonations =
    document.getElementById("emptyDonations");

const donationModal =
    document.getElementById("donationModal");

const donationModalContent =
    document.getElementById("donationModalContent");

const closeDonationModal =
    document.getElementById("closeDonationModal");


// ======================================
// VOLUNTEER NAME
// ======================================

if (volunteerName) {

    volunteerName.textContent =
        currentUser.name || "Volunteer";

}


// ======================================
// GET DONATIONS (FROM API)
// ======================================

async function getDonations() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/donations`,
            {
                headers: {
                    "Authorization": `Bearer ${authToken}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data.donations || [];

    } catch (error) {

        console.error("Could not fetch donations from API:", error);

        showMessage(
            "Failed to load donations. Please refresh.",
            "error",
            "Load Error"
        );

        return [];

    }

}


// ======================================
// GET REQUESTS (FROM API)
// ======================================

async function getDeliveryRequests() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/requests/volunteer/available`,
            {
                headers: {
                    "Authorization": `Bearer ${authToken}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data.requests || [];

    } catch (error) {

        console.error("Could not fetch delivery requests from API:", error);

        showMessage(
            "Failed to load delivery requests. Please refresh.",
            "error",
            "Load Error"
        );

        return [];

    }

}


// ======================================
// NORMALIZE STATUS
// ======================================

function normalizeStatus(status) {

    return String(
        status || ""
    )
        .trim()
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/-/g, " ");

}


// ======================================
// ESCAPE HTML
// ======================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ======================================
// AVAILABLE DELIVERIES
// ======================================
//
// IMPORTANT:
//
// A volunteer should see a delivery when:
//
// 1. Donation exists.
// 2. Charity request exists.
// 3. Request has been ACCEPTED by restaurant.
// 4. No volunteer has accepted it yet.
//
// Your actual LocalStorage data contains:
//
// request.status = "Accepted"
//
// Therefore we MUST look for "Accepted",
// NOT "Pending".
// ======================================

async function getAvailableDeliveries() {

    const requests = await getDeliveryRequests();

    return requests
        .map(request => {

            const donation =
                request.donationId &&
                typeof request.donationId === "object"
                    ? request.donationId
                    : null;

            if (!donation || !donation._id) {
                return null;
            }


            const requestStatus =
                normalizeStatus(
                    request.status
                );


            // ==================================
            // ONLY ACCEPTED REQUESTS
            // ==================================

            if (
                requestStatus !==
                "accepted"
            ) {

                return null;

            }


            // ==================================
            // ALREADY TAKEN BY VOLUNTEER
            // ==================================

            if (
                request.volunteerId
            ) {

                return null;

            }


            // ==================================
            // ALREADY TAKEN BY DONATION
            // ==================================

            if (
                donation.volunteerId
            ) {

                return null;

            }


            // ==================================
            // DON'T SHOW COMPLETED DELIVERIES
            // ==================================

            const donationStatus =
                normalizeStatus(
                    donation.status
                );


            if (
                donationStatus ===
                "completed"
            ) {

                return null;

            }


            // ==================================
            // RETURN COMBINED DELIVERY
            // ==================================

            return {

                ...donation,

                requestId:
                    request._id,

                requesterId:
                    request.requesterId ||
                    request.charityId ||
                    "",

                requesterName:
                    request.requesterName ||
                    request.charityName ||
                    "Charity",

                requesterRole:
                    request.requesterRole ||
                    request.charityRole ||
                    "charity",

                requesterEmail:
                    request.requesterEmail ||
                    "",

                requesterPhone:
                    request.requesterPhone ||
                    "",

                requestQuantity:
                    request.quantityRequested ||
                    request.quantity ||
                    donation.quantity,

                requestUnit:
                    request.unit ||
                    donation.unit,

                requestPickupDate:
                    request.pickupDate ||
                    request.requestPickupDate ||
                    "",

                requestNotes:
                    request.notes ||
                    "",

                deliveryStatus:
                    request.status ||
                    "Accepted"

            };

        })

        .filter(Boolean);

}


// ======================================
// GET MY ACTIVE DELIVERIES
// ======================================

async function getMyActiveDeliveries() {

    const response = await fetch(
        `${API_BASE_URL}/requests/volunteer/my`,
        {
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const requests = Array.isArray(data.requests) ? data.requests : [];

    return requests.filter(request => {
        const status = normalizeStatus(request.status);
        return status !== "completed" && status !== "delivered";
    });
}


// ======================================
// GET MY COMPLETED DELIVERIES
// ======================================

async function getMyCompletedDeliveries() {

    const response = await fetch(
        `${API_BASE_URL}/requests/volunteer/my`,
        {
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const requests = Array.isArray(data.requests) ? data.requests : [];

    return requests.filter(request =>
        normalizeStatus(request.status) === "completed"
    );

}


// ======================================
// FORMAT DATE
// ======================================

function formatDate(dateValue) {

    if (!dateValue) {

        return "Not specified";

    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return escapeHTML(
            dateValue
        );

    }


    return date.toLocaleDateString(
        "en-NG",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


// ======================================
// UPDATE STATISTICS
// ======================================

async function updateStatistics() {

    const availableDeliveries =
        await getAvailableDeliveries();


    const activeDeliveries =
        await getMyActiveDeliveries();


    const completedDeliveries =
        await getMyCompletedDeliveries();


    if (availableCount) {

        availableCount.textContent =
            availableDeliveries.length;

    }


    if (activeCount) {

        activeCount.textContent =
            activeDeliveries.length;

    }


    if (completedCount) {

        completedCount.textContent =
            completedDeliveries.length;

    }

}


// ======================================
// DISPLAY AVAILABLE DELIVERIES
// ======================================

async function displayAvailableDeliveries() {

    if (!availableDonations) {

        return;

    }


    const deliveries =
        await getAvailableDeliveries();


    availableDonations.innerHTML =
        "";


    // ==================================
    // EMPTY STATE
    // ==================================

    if (
        deliveries.length === 0
    ) {

        if (emptyDonations) {

            emptyDonations.classList.remove(
                "hidden"
            );

        }

        return;

    }


    // ==================================
    // HIDE EMPTY STATE
    // ==================================

    if (emptyDonations) {

        emptyDonations.classList.add(
            "hidden"
        );

    }


    // ==================================
    // CREATE CARDS
    // ==================================

    deliveries.forEach(
        delivery => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "donation-card";


            // ==================================
            // IMAGE
            // ==================================

            const imageHTML =
                delivery.image

                    ? `

                        <div class="donation-image">

                            <img
                                src="${escapeHTML(
                                    delivery.image
                                )}"
                                alt="${escapeHTML(
                                    delivery.foodName ||
                                    "Food donation"
                                )}"
                                onerror="
                                    this.style.display='none';
                                "
                            >

                        </div>

                    `

                    : `

                        <div class="donation-image">

                            <div class="no-image">
                                🍱
                            </div>

                        </div>

                    `;


            // ==================================
            // CARD
            // ==================================

            card.innerHTML = `

                ${imageHTML}


                <div class="donation-content">

                    <span class="donation-category">

                        ${escapeHTML(
                            delivery.category ||
                            "Food"
                        )}

                    </span>


                    <h3>

                        ${escapeHTML(
                            delivery.foodName ||
                            "Food Donation"
                        )}

                    </h3>


                    <p class="donation-quantity">

                        📦

                        ${escapeHTML(
                            String(
                                delivery.requestQuantity ||
                                delivery.quantity ||
                                ""
                            )
                        )}

                        ${escapeHTML(
                            delivery.requestUnit ||
                            delivery.unit ||
                            ""
                        )}

                    </p>


                    <p class="donation-location">

                        📍

                        ${escapeHTML(
                            delivery.location ||
                            delivery.pickupLocation ||
                            "Location not specified"
                        )}

                    </p>


                    <p class="donation-expiry">

                        ⏰ Expires:

                        ${formatDate(
                            delivery.expiry
                        )}

                    </p>


                    <p class="donation-charity">

                        🏠

                        Charity:

                        <strong>

                            ${escapeHTML(
                                delivery.requesterName ||
                                "Charity"
                            )}

                        </strong>

                    </p>


                    <button
                        type="button"
                        class="view-donation-btn"
                        data-id="${escapeHTML(
                            delivery._id ||
                            delivery.id ||
                            ""
                        )}"
                        data-request-id="${escapeHTML(
                            delivery.requestId || ""
                        )}">

                        🚚 View Delivery

                    </button>

                </div>

            `;


            availableDonations.appendChild(
                card
            );

        }
    );

}


// ======================================
// OPEN DONATION MODAL
// ======================================

async function openDonationModal(
    donationId,
    requestId
) {

    if (
        !donationModal ||
        !donationModalContent
    ) {

        return;

    }


    const deliveries =
        await getAvailableDeliveries();


    const delivery =
        deliveries.find(
            item =>

                String(item._id || item.id) ===
                String(donationId)

                &&

                (
                    !requestId ||

                    String(item.requestId) ===
                    String(requestId)
                )

        );


    if (!delivery) {

        showVolunteerMessage(
            "This delivery is no longer available.",
            "warning",
            "Delivery Unavailable"
        );

        return;

    }


    // ==================================
    // MODAL
    // ==================================

    donationModalContent.innerHTML = `

        <div class="modal-header">

            <div class="modal-donation-icon">
                🍱
            </div>


            <div>

                <span class="section-title">
                    Food Delivery
                </span>


                <h2>

                    ${escapeHTML(
                        delivery.foodName ||
                        "Food Donation"
                    )}

                </h2>

            </div>

        </div>


        <div class="modal-grid">


            <div class="modal-card">

                <span>
                    Restaurant
                </span>

                <strong>

                    ${escapeHTML(
                        delivery.ownerName ||
                        "Unknown"
                    )}

                </strong>

            </div>


            <div class="modal-card">

                <span>
                    Charity
                </span>

                <strong>

                    ${escapeHTML(
                        delivery.requesterName ||
                        "Unknown"
                    )}

                </strong>

            </div>


            <div class="modal-card">

                <span>
                    Category
                </span>

                <strong>

                    ${escapeHTML(
                        delivery.category ||
                        "Food"
                    )}

                </strong>

            </div>


            <div class="modal-card">

                <span>
                    Quantity
                </span>

                <strong>

                    ${escapeHTML(
                        String(
                            delivery.requestQuantity ||
                            delivery.quantity ||
                            ""
                        )
                    )}

                    ${escapeHTML(
                        delivery.requestUnit ||
                        delivery.unit ||
                        ""
                    )}

                </strong>

            </div>


            <div class="modal-card">

                <span>
                    Pickup Location
                </span>

                <strong>

                    ${escapeHTML(
                        delivery.location ||
                        delivery.pickupLocation ||
                        "Not specified"
                    )}

                </strong>

            </div>


            <div class="modal-card">

                <span>
                    Pickup Date
                </span>

                <strong>

                    ${formatDate(
                        delivery.requestPickupDate
                    )}

                </strong>

            </div>


            <div class="modal-card">

                <span>
                    Expiry Date
                </span>

                <strong>

                    ${formatDate(
                        delivery.expiry
                    )}

                </strong>

            </div>


            <div class="modal-card">

                <span>
                    Status
                </span>

                <strong>
                    Waiting for Volunteer
                </strong>

            </div>

        </div>


        ${
            delivery.requestNotes ||
            delivery.notes

                ? `

                    <div class="modal-section">

                        <h4>
                            📝 Notes
                        </h4>

                        <p>

                            ${escapeHTML(
                                delivery.requestNotes ||
                                delivery.notes
                            )}

                        </p>

                    </div>

                `

                : ""
        }


        <div class="modal-section">

            <h4>
                📍 Pickup Location
            </h4>

            <p>

                ${escapeHTML(
                    delivery.location ||
                    delivery.pickupLocation ||
                    "Location not specified"
                )}

            </p>

        </div>


        <button
            type="button"
            class="accept-delivery-btn"
            data-id="${escapeHTML(
                delivery._id ||
                delivery.id ||
                ""
            )}"
            data-request-id="${escapeHTML(
                delivery.requestId || ""
            )}">

            🚚 Accept Delivery

        </button>

    `;


    donationModal.classList.remove(
        "hidden"
    );


    document.body.style.overflow =
        "hidden";

}


// ======================================
// CLOSE MODAL
// ======================================

function closeDonationDetailsModal() {

    if (!donationModal) {

        return;

    }


    donationModal.classList.add(
        "hidden"
    );


    document.body.style.overflow =
        "";

}


// ======================================
// ACCEPT DELIVERY
// ======================================

async function acceptDelivery(
    donationId,
    requestId
) {

    const volunteer =
        JSON.parse(
            localStorage.getItem(
                "currentUser"
            )
        );


    // ==================================
    // AUTHENTICATION
    // ==================================

    if (
        !volunteer ||
        volunteer.role !== "volunteer"
    ) {

        showVolunteerMessage(
            "Please log in with a volunteer account.",
            "warning",
            "Access Restricted"
        );

        return;

    }


    if (!requestId) {
        showVolunteerMessage("This delivery request could not be found.", "warning", "Request Not Found");
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/requests/${encodeURIComponent(requestId)}/volunteer-accept`,
            {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${authToken}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not accept this delivery.");
        }

        closeDonationDetailsModal();
        showVolunteerMessage(data.message || "Delivery accepted successfully.", "success", "Delivery Accepted");
        await displayAvailableDeliveries();
        await updateStatistics();
        return;

    } catch (error) {
        console.error("Accept delivery error:", error);
        showVolunteerMessage(error.message, "error", "Delivery Failed");
        return;
    }


}


// ======================================
// SHOW MESSAGE
// ======================================

function showVolunteerMessage(
    message,
    type = "success",
    title = "MPower"
) {

    if (
        typeof showMessage ===
        "function"
    ) {

        showMessage(
            message,
            type,
            title
        );

        return;

    }


    alert(message);

}


// ======================================
// VIEW DELIVERY BUTTON
// ======================================

if (availableDonations) {

    availableDonations.addEventListener(
        "click",
        function(event) {

            const button =
                event.target.closest(
                    ".view-donation-btn"
                );


            if (!button) {

                return;

            }


            const donationId =
                button.dataset.id;


            const requestId =
                button.dataset.requestId ||
                "";


            openDonationModal(
                donationId,
                requestId
            );

        }
    );

}


// ======================================
// ACCEPT DELIVERY BUTTON
// ======================================

if (donationModalContent) {

    donationModalContent.addEventListener(
        "click",
        function(event) {

            const button =
                event.target.closest(
                    ".accept-delivery-btn"
                );


            if (!button) {

                return;

            }


            const donationId =
                button.dataset.id;


            const requestId =
                button.dataset.requestId ||
                "";


            acceptDelivery(
                donationId,
                requestId
            );

        }
    );

}


// ======================================
// CLOSE MODAL
// ======================================

if (closeDonationModal) {

    closeDonationModal.addEventListener(
        "click",
        closeDonationDetailsModal
    );

}


// ======================================
// CLOSE BY BACKDROP
// ======================================

if (donationModal) {

    donationModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                donationModal
            ) {

                closeDonationDetailsModal();

            }

        }
    );

}


// ======================================
// ESC KEY
// ======================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape" &&
            donationModal &&
            !donationModal.classList.contains(
                "hidden"
            )
        ) {

            closeDonationDetailsModal();

        }

    }
);


// ======================================
// STORAGE CHANGE
// ======================================

window.addEventListener(
    "storage",
    function() {

        displayAvailableDeliveries();

        updateStatistics();

    }
);


// ======================================
// INITIALIZE DASHBOARD
// ======================================

async function initializeVolunteerDashboard() {

    await displayAvailableDeliveries();

    await updateStatistics();


    console.log(
        "======================================"
    );


    console.log(
        "MPower Volunteer Dashboard initialized."
    );


    console.log(
        "Volunteer:",
        currentUser
    );


    console.log(
        "Available deliveries:",
        await getAvailableDeliveries()
    );


    console.log(
        "My active deliveries:",
        await getMyActiveDeliveries()
    );


    console.log(
        "My completed deliveries:",
        await getMyCompletedDeliveries()
    );


    console.log(
        "======================================"
    );

}


// ======================================
// START
// ======================================

initializeVolunteerDashboard();