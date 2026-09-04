"use strict";

// ======================================
// MPower - My Donations
// Donor Control Center
// MongoDB / API Version
// ======================================


// ======================================
// CURRENT USER
// ======================================

const currentUser = JSON.parse(
    localStorage.getItem("currentUser")
);

const authToken = localStorage.getItem("token");


if (!currentUser) {

    window.location.href = "login.html";

    throw new Error(
        "User is not authenticated."
    );

}

if (!authToken) {

    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
    throw new Error("Authentication token required.");

}


// ======================================
// RESTAURANT AUTHORIZATION
// ======================================

if (
    currentUser.role !== "restaurant"
) {

    if (
        typeof showMessage === "function"
    ) {

        showMessage(
            "Only restaurant accounts can access this page.",
            "error",
            "Access Denied"
        );

    }

    throw new Error(
        "Only restaurant accounts can access My Donations."
    );

}


// ======================================
// API URL
// ======================================

const API_URL =
    `${window.MPOWER_API_BASE_URL}/donations`;


// ======================================
// DOM ELEMENTS
// ======================================

const donationsGrid =
    document.getElementById(
        "donationsGrid"
    );


const totalCount =
    document.getElementById(
        "totalCount"
    );


const availableCount =
    document.getElementById(
        "availableCount"
    );


const requestedCount =
    document.getElementById(
        "requestedCount"
    );


const activeCount =
    document.getElementById(
        "activeCount"
    );


// ======================================
// DONATIONS
// ======================================

let myDonations = [];

let donationRequests = [];

let donationDeliveries = [];


// ======================================
// REQUESTS
// ======================================
// Get all requests from API
// ======================================

async function getRequests() {

    try {

        const response = await fetch(
            `${window.MPOWER_API_BASE_URL}/requests`,
            {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return Array.isArray(data.requests) ? data.requests : [];

    } catch (error) {

        console.error("Failed to fetch requests:", error);
        return [];

    }

}


// ======================================
// DELIVERIES
// ======================================
// Get volunteer deliveries from API
// ======================================

async function getDeliveries() {

    try {

        const response = await fetch(
            `${window.MPOWER_API_BASE_URL}/requests/volunteer/my`,
            {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return Array.isArray(data.requests) ? data.requests : [];

    } catch (error) {

        console.error("Failed to fetch deliveries:", error);
        return [];

    }

}


// ======================================
// GET DONATIONS FROM API
// ======================================

async function loadMyDonations() {

    try {

        // ==================================
        // LOADING STATE
        // ==================================

        donationsGrid.innerHTML = `

            <div class="loading-state">

                <div class="loading-icon">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                </div>

                <h2>
                    Loading Your Donations...
                </h2>

                <p>
                    Please wait while we retrieve
                    your donations.
                </p>

            </div>

        `;


        // ==================================
        // API REQUEST
        // ==================================

        const response =
            await fetch(
                `${API_URL}/my?ownerId=${encodeURIComponent(
                    currentUser.id
                )}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authToken}`
                    }
                }
            );


        if (response.status === 401) {

            localStorage.removeItem("token");
            localStorage.removeItem("currentUser");
            window.location.href = "login.html";
            throw new Error("Authentication token required.");

        }


        // ==================================
        // RESPONSE
        // ==================================

        const data =
            await response.json();


        // ==================================
        // HANDLE ERROR
        // ==================================

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load your donations."
            );

        }


        // ==================================
        // STORE DONATIONS IN MEMORY
        // ==================================

        myDonations =
            Array.isArray(
                data.donations
            )
                ? data.donations
                : [];

        [donationRequests, donationDeliveries] = await Promise.all([
            getRequests(),
            getDeliveries()
        ]);


        // ==================================
        // DISPLAY
        // ==================================

        displayDonations();


    } catch (error) {

        console.error(
            "Load donations error:",
            error
        );


        donationsGrid.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    <i class="fa-solid fa-circle-exclamation"></i>
                </div>

                <h2>
                    Unable to Load Donations
                </h2>

                <p>
                    ${
                        escapeHTML(
                            error.message ||
                            "Something went wrong while loading your donations."
                        )
                    }
                </p>

                <button
                    type="button"
                    class="empty-donate-btn"
                    id="retryDonationsBtn">

                        <i class="fa-solid fa-rotate-right"></i>
                        Try Again
        `;


        const retryButton =
            document.getElementById(
                "retryDonationsBtn"
            );


        if (retryButton) {

            retryButton.addEventListener(
                "click",
                loadMyDonations
            );

        }

    }

}


// ======================================
// GET REQUESTS FOR DONATION
// ======================================

function getDonationRequests(
    donationId
) {

    const requests = donationRequests;


    return requests.filter(
        request =>

            String(
                request.donationId
            ) ===
            String(
                donationId
            )

    );

}


// ======================================
// GET DELIVERY FOR DONATION
// ======================================

function getDonationDelivery(
    donationId
) {

    const deliveries = donationDeliveries;


    return deliveries.find(
        delivery =>

            String(
                delivery.donationId
            ) ===
            String(
                donationId
            )

    ) || null;

}


// ======================================
// NORMALIZE STATUS
// ======================================

function normalizeStatus(
    status
) {

    return String(
        status || ""
    )
        .trim()
        .toLowerCase()
        .replace(
            /_/g,
            " "
        )
        .replace(
            /-/g,
            " "
        );

}


// ======================================
// ESCAPE HTML
// ======================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
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
// DETERMINE DONATION STATUS
// ======================================

function getDonationStatus(
    donation
) {

    const requests =
        getDonationRequests(
            donation._id
        );


    const delivery =
        getDonationDelivery(
            donation._id
        );


    // ==================================
    // DELIVERY EXISTS
    // ==================================

    if (delivery) {

        const deliveryStatus =
            normalizeStatus(
                delivery.status
            );


        // --------------------------------
        // COMPLETED
        // --------------------------------

        if (
            deliveryStatus ===
            "completed"
            ||
            delivery.charityConfirmed ===
            true
        ) {

            return "Completed";

        }


        // --------------------------------
        // DELIVERED
        // --------------------------------

        if (
            deliveryStatus ===
            "delivered"
        ) {

            return "Awaiting Confirmation";

        }


        // --------------------------------
        // PICKED UP
        // --------------------------------

        if (
            deliveryStatus ===
            "picked up"
        ) {

            return "Picked Up";

        }


        // --------------------------------
        // IN TRANSIT
        // --------------------------------

        if (
            deliveryStatus ===
            "accepted"
            ||
            deliveryStatus ===
            "in transit"
        ) {

            return "In Transit";

        }

    }


    // ==================================
    // REQUEST STATUS
    // ==================================

    const hasAcceptedRequest =
        requests.some(
            request =>

                normalizeStatus(
                    request.status
                ) ===
                "accepted"

        );


    if (
        hasAcceptedRequest
    ) {

        return "Assigned";

    }


    const hasPendingRequest =
        requests.some(
            request =>

                normalizeStatus(
                    request.status
                ) ===
                "pending"

        );


    if (
        hasPendingRequest
    ) {

        return "Requested";

    }


    // ==================================
    // DONATION STATUS
    // ==================================

    const donationStatus =
        normalizeStatus(
            donation.status
        );


    if (
        donationStatus ===
        "completed"
    ) {

        return "Completed";

    }


    if (
        donationStatus ===
        "awaiting confirmation"
    ) {

        return "Awaiting Confirmation";

    }


    if (
        donationStatus ===
        "delivered"
    ) {

        return "Awaiting Confirmation";

    }


    if (
        donationStatus ===
        "picked up"
    ) {

        return "Picked Up";

    }


    if (
        donationStatus ===
        "in transit"
    ) {

        return "In Transit";

    }


    if (
        donationStatus ===
        "accepted"
    ) {

        return "Assigned";

    }


    if (
        donationStatus ===
        "assigned"
    ) {

        return "Assigned";

    }


    if (
        donationStatus ===
        "requested"
    ) {

        return "Requested";

    }


    // ==================================
    // DEFAULT
    // ==================================

    return "Available";

}


// ======================================
// STATUS CSS CLASS
// ======================================

function getStatusClass(
    status
) {

    switch (status) {

        case "Available":
            return "status-available";

        case "Requested":
            return "status-requested";

        case "Assigned":
            return "status-assigned";

        case "In Transit":
            return "status-transit";

        case "Picked Up":
            return "status-picked-up";

        case "Awaiting Confirmation":
            return "status-awaiting";

        case "Completed":
            return "status-completed";

        default:
            return "status-available";

    }

}


// ======================================
// STATUS ICON
// ======================================

function getStatusIcon(
    status
) {

    switch (status) {

        case "Available":
            return '<i class="fa-solid fa-circle-check"></i>';

        case "Requested":
            return '<i class="fa-solid fa-envelope-open-text"></i>';

        case "Assigned":
            return '<i class="fa-solid fa-user-check"></i>';

        case "In Transit":
            return '<i class="fa-solid fa-truck-fast"></i>';

        case "Picked Up":
            return '<i class="fa-solid fa-box-open"></i>';

        case "Awaiting Confirmation":
            return '<i class="fa-solid fa-hourglass-half"></i>';

        case "Completed":
            return '<i class="fa-solid fa-circle-check"></i>';

        default:
            return '<i class="fa-solid fa-circle-check"></i>';

    }

}


// ======================================
// STATUS DESCRIPTION
// ======================================

function getStatusDescription(
    status
) {

    switch (status) {

        case "Available":

            return `
                Your donation is available
                and waiting for a charity request.
            `;


        case "Requested":

            return `
                A charity has requested this
                donation. Review the request
                to decide what happens next.
            `;


        case "Assigned":

            return `
                You accepted a request for this
                donation. A volunteer can now
                handle the delivery.
            `;


        case "In Transit":

            return `
                A volunteer has accepted the
                delivery and is handling the
                food transfer.
            `;


        case "Picked Up":

            return `
                The volunteer has picked up the
                food and is taking it to the
                receiving charity.
            `;


        case "Awaiting Confirmation":

            return `
                The volunteer marked this food
                as delivered. The receiving charity
                must confirm receipt before this
                donation is completed.
            `;


        case "Completed":

            return `
                The receiving charity confirmed
                receipt. This donation has been
                successfully completed.
            `;


        default:

            return `
                This donation is being processed.
            `;

    }

}


// ======================================
// UPDATE STATISTICS
// ======================================

function updateStatistics() {

    totalCount.textContent =
        myDonations.length;


    let available = 0;

    let requested = 0;

    let active = 0;


    myDonations.forEach(
        donation => {

            const status =
                getDonationStatus(
                    donation
                );


            if (
                status ===
                "Available"
            ) {

                available++;

            }


            if (
                status ===
                "Requested"
            ) {

                requested++;

            }


            if (
                status === "Assigned" ||
                status === "In Transit" ||
                status === "Picked Up" ||
                status === "Awaiting Confirmation"
            ) {

                active++;

            }

        }
    );


    availableCount.textContent =
        available;


    requestedCount.textContent =
        requested;


    activeCount.textContent =
        active;

}


// ======================================
// FORMAT DATE
// ======================================

function formatDate(
    dateValue
) {

    if (
        !dateValue
    ) {

        return "Not provided";

    }


    const date =
        new Date(
            dateValue
        );


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
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


// ======================================
// DISPLAY DONATIONS
// ======================================

function displayDonations() {

    donationsGrid.innerHTML =
        "";


    updateStatistics();


    // ==================================
    // EMPTY STATE
    // ==================================

    if (
        myDonations.length === 0
    ) {

        donationsGrid.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    <i class="fa-solid fa-box-open"></i>
                </div>

                <h2>
                    No Donations Yet
                </h2>

                <p>
                    You haven't donated any food yet.
                    Your first donation could make a
                    real difference.
                </p>

                <a
                    href="donate.html"
                    class="empty-donate-btn">

                    <i class="fa-solid fa-heart"></i>
                    Donate Food

                </a>

            </div>

        `;

        return;

    }


    // ==================================
    // DONATION CARDS
    // ==================================

    myDonations.forEach(
        (
            donation,
            index
        ) => {

            const donationId =
                donation._id;


            const status =
                getDonationStatus(
                    donation
                );


            const statusClass =
                getStatusClass(
                    status
                );


            const statusIcon =
                getStatusIcon(
                    status
                );


            const requests =
                getDonationRequests(
                    donationId
                );


            const pendingRequests =
                requests.filter(
                    request =>

                        normalizeStatus(
                            request.status
                        ) ===
                        "pending"

                );


            const location =
                donation.location ||
                "Not provided";


            const image =
                donation.image ||
                "../images/no-image.png";


            // ==================================
            // EDIT / DELETE
            // ==================================

            const canEdit =
                status ===
                "Available";


            const canDelete =
                status ===
                "Available";


            // ==================================
            // REQUEST NOTICE
            // ==================================

            let requestNotice =
                "";


            if (
                pendingRequests.length > 0
            ) {

                requestNotice = `

                    <div class="request-notice">

                        <i class="fa-solid fa-envelope-open-text"></i>

                        <strong>
                            ${pendingRequests.length}
                        </strong>

                        pending request
                        ${
                            pendingRequests.length >
                            1
                                ? "s"
                                : ""
                        }

                        for this donation.

                    </div>

                `;

            }


            // ==================================
            // STATUS DESCRIPTION
            // ==================================

            const statusDescription =
                getStatusDescription(
                    status
                );


            // ==================================
            // ACTION BUTTONS
            // ==================================

            const actionButtons =
                getActionButtons(
                    donation,
                    status,
                    canEdit,
                    canDelete,
                    pendingRequests.length
                );


            // ==================================
            // CREATE CARD
            // ==================================

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "donation-card";


            card.style.animationDelay =
                `${index * 80}ms`;


            card.innerHTML = `

                <!-- ==========================
                     IMAGE
                =========================== -->

                <div class="donation-image">

                    <img
                        src="${escapeHTML(
                            image
                        )}"
                        alt="${escapeHTML(
                            donation.foodName ||
                            "Food donation"
                        )}"
                        onerror="
                            this.src='../images/no-image.png';
                        "
                    >


                    <span
                        class="
                            status-badge
                            ${statusClass}
                        ">

                        ${statusIcon}

                        ${escapeHTML(
                            status
                        )}

                    </span>

                </div>


                <!-- ==========================
                     CONTENT
                =========================== -->

                <div class="card-content">

                    <span class="category">

                        ${escapeHTML(
                            donation.category ||
                            "Food"
                        )}

                    </span>


                    <h2>

                        ${escapeHTML(
                            donation.foodName ||
                            "Food Donation"
                        )}

                    </h2>


                    <!-- ======================
                         INFORMATION
                    ======================= -->

                    <div class="info">

                        <p>

                            <i class="fa-solid fa-box-open"></i>

                            <strong>
                                Quantity:
                            </strong>

                            ${escapeHTML(
                                donation.quantity ||
                                0
                            )}

                            ${escapeHTML(
                                donation.unit ||
                                ""
                            )}

                        </p>


                        <p>

                            <i class="fa-solid fa-location-dot"></i>

                            <strong>
                                Location:
                            </strong>

                            ${escapeHTML(
                                location
                            )}

                        </p>


                        <p>

                            <i class="fa-solid fa-clock"></i>

                            <strong>
                                Expiry:
                            </strong>

                            ${formatDate(
                                donation.expiry
                            )}

                        </p>


                        <p>

                            <i class="fa-regular fa-calendar"></i>

                            <strong>
                                Donated:
                            </strong>

                            ${formatDate(
                                donation.createdAt
                            )}

                        </p>

                    </div>


                    <!-- ======================
                         STATUS MESSAGE
                    ======================= -->

                    <div
                        class="
                            donation-status-message
                            ${statusClass}
                        ">

                        <strong>

                            ${statusIcon}

                            ${escapeHTML(
                                status
                            )}

                        </strong>


                        <p>

                            ${statusDescription}

                        </p>

                    </div>


                    <!-- ======================
                         REQUEST NOTICE
                    ======================= -->

                    ${requestNotice}


                    <!-- ======================
                         ACTIONS
                    ======================= -->

                    <div class="card-actions">

                        ${actionButtons}

                    </div>

                </div>

            `;


            donationsGrid.appendChild(
                card
            );

        }
    );

}


// ======================================
// GENERATE ACTION BUTTONS
// ======================================

function getActionButtons(
    donation,
    status,
    canEdit,
    canDelete,
    pendingRequestCount
) {

    let buttons =
        "";


    // ==================================
    // AVAILABLE
    // ==================================

    if (
        canEdit &&
        canDelete
    ) {

        buttons += `

            <button
                type="button"
                class="edit-btn"
                data-id="${escapeHTML(
                    donation._id
                )}">

                <i class="fa-solid fa-pen-to-square"></i>
                Edit

            </button>


            <button
                type="button"
                class="delete-btn"
                data-id="${escapeHTML(
                    donation._id
                )}">

                <i class="fa-solid fa-trash-can"></i>
                Delete

            </button>

        `;

    }


    // ==================================
    // REQUESTED
    // ==================================

    else if (
        status ===
        "Requested"
    ) {

        buttons += `

            <a
                href="incoming-requests.html"
                class="requests-btn">

                <i class="fa-solid fa-inbox"></i>
                Review Requests

                ${
                    pendingRequestCount
                        ? `(${pendingRequestCount})`
                        : ""
                }

            </a>

        `;

    }


    // ==================================
    // ASSIGNED
    // ==================================

    else if (
        status ===
        "Assigned"
    ) {

        buttons += `

            <div class="action-disabled">

                <i class="fa-solid fa-user-check"></i>

                Request accepted.
                Waiting for volunteer assignment.

            </div>

        `;

    }


    // ==================================
    // IN TRANSIT
    // ==================================

    else if (
        status ===
        "In Transit"
    ) {

        buttons += `

            <div class="action-disabled">

                <i class="fa-solid fa-truck-fast"></i>

                Volunteer is handling
                this delivery.

            </div>

        `;

    }


    // ==================================
    // PICKED UP
    // ==================================

    else if (
        status ===
        "Picked Up"
    ) {

        buttons += `

            <div class="action-disabled">

                <i class="fa-solid fa-box-open"></i>

                Food has been picked up
                by the volunteer.

            </div>

        `;

    }


    // ==================================
    // AWAITING CONFIRMATION
    // ==================================

    else if (
        status ===
        "Awaiting Confirmation"
    ) {

        buttons += `

            <div class="action-disabled">

                <i class="fa-solid fa-hourglass-half"></i>

                Waiting for the charity
                to confirm receipt.

            </div>

        `;

    }


    // ==================================
    // COMPLETED
    // ==================================

    else if (
        status ===
        "Completed"
    ) {

        buttons += `

            <div class="action-completed">

                <i class="fa-solid fa-circle-check"></i>

                Donation completed successfully.

            </div>

        `;

    }


    return buttons;

}


// ======================================
// DELETE DONATION
// ======================================

async function deleteDonation(
    id
) {

    const donation =
        myDonations.find(
            item =>

                String(
                    item._id
                ) ===
                String(id)

        );


    if (!donation) {

        showMessage(
            "This donation could not be found.",
            "error",
            "Donation Not Found"
        );

        return;

    }


    const status =
        getDonationStatus(
            donation
        );


    // ==================================
    // SAFETY CHECK
    // ==================================

    if (
        status !==
        "Available"
    ) {

        showMessage(
            "This donation cannot be deleted because it is already part of the request or delivery process.",
            "warning",
            "Donation In Progress"
        );

        return;

    }


    // ==================================
    // CONFIRM
    // ==================================

    showConfirm(

        "This donation will be permanently removed from your account.",

        async function () {

            try {

                const response =
                    await fetch(
                        `${API_URL}/${encodeURIComponent(
                            id
                        )}`,
                        {

                            method:
                                "DELETE",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    ownerId:
                                        currentUser.id

                                })

                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to delete donation."
                    );

                }


                // ==================================
                // REMOVE FROM MEMORY
                // ==================================

                myDonations =
                    myDonations.filter(
                        item =>

                            String(
                                item._id
                            ) !==
                            String(id)

                    );


                displayDonations();


                showMessage(
                    "The donation has been deleted successfully.",
                    "success",
                    "Donation Deleted"
                );


            } catch (error) {

                console.error(
                    "Delete donation error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Something went wrong while deleting the donation.",
                    "error",
                    "Delete Failed"
                );

            }

        },

        "Delete Donation?"

    );

}


// ======================================
// EDIT DONATION
// ======================================

function editDonation(
    id
) {

    const donation =
        myDonations.find(
            item =>

                String(
                    item._id
                ) ===
                String(id)

        );


    if (!donation) {

        showMessage(
            "This donation could not be found.",
            "error",
            "Donation Not Found"
        );

        return;

    }


    const status =
        getDonationStatus(
            donation
        );


    // ==================================
    // SAFETY CHECK
    // ==================================

    if (
        status !==
        "Available"
    ) {

        showMessage(
            "This donation can no longer be edited because it is already being processed.",
            "warning",
            "Donation In Progress"
        );

        return;

    }


    // ==================================
    // GO TO EDIT PAGE
    // ==================================

    window.location.href =
        `donate.html?id=${encodeURIComponent(
            donation._id
        )}`;

}


// ======================================
// EVENT DELEGATION
// ======================================

donationsGrid.addEventListener(
    "click",
    function (event) {

        // ==================================
        // EDIT
        // ==================================

        const editButton =
            event.target.closest(
                ".edit-btn"
            );


        if (editButton) {

            const id =
                editButton.dataset.id;


            editDonation(
                id
            );


            return;

        }


        // ==================================
        // DELETE
        // ==================================

        const deleteButton =
            event.target.closest(
                ".delete-btn"
            );


        if (deleteButton) {

            const id =
                deleteButton.dataset.id;


            deleteDonation(
                id
            );

        }

    }
);


// ======================================
// REFRESH WHEN RETURNING TO PAGE
// ======================================

window.addEventListener(
    "focus",
    function () {

        loadMyDonations();

    }
);


// ======================================
// INITIALIZE
// ======================================

console.log(
    "MPower My Donations initialized."
);


console.log(
    "Current restaurant:",
    currentUser
);


loadMyDonations();