"use strict";

// ======================================
// MPower - Incoming Requests
// API VERSION
// ======================================


// ======================================
// API CONFIGURATION
// ======================================

const API_BASE_URL = window.MPOWER_API_BASE_URL;


// ======================================
// AUTHENTICATION
// ======================================

const incomingUser = JSON.parse(
    localStorage.getItem("currentUser")
);


const authToken =
    localStorage.getItem("token");


if (!incomingUser || !authToken) {

    window.location.href = "login.html";

    throw new Error(
        "User is not authenticated."
    );

}


// ======================================
// DONOR ROLE PROTECTION
// ======================================

if (
    incomingUser.role === "volunteer"
) {

    window.location.href = "profile.html";

    throw new Error(
        "Volunteers cannot access incoming requests."
    );

}


// ======================================
// DOM ELEMENTS
// ======================================

const incomingRequests =
    document.getElementById(
        "incomingRequests"
    );

const emptyRequests =
    document.getElementById(
        "emptyRequests"
    );

const pendingCount =
    document.getElementById(
        "pendingCount"
    );

const acceptedCount =
    document.getElementById(
        "acceptedCount"
    );

const deliveryCount =
    document.getElementById(
        "deliveryCount"
    );

const completedCount =
    document.getElementById(
        "completedCount"
    );

const requestModal =
    document.getElementById(
        "requestModal"
    );

const requestModalBody =
    document.getElementById(
        "requestModalBody"
    );

const closeRequestModalBtn =
    document.getElementById(
        "closeRequestModal"
    );

const filterButtons =
    document.querySelectorAll(
        ".filter-btn"
    );


// ======================================
// STATE
// ======================================

let activeFilter = "all";

let incomingRequestsData = [];

let myDonations = [];


// ======================================
// API HELPER
// ======================================

async function apiRequest(
    endpoint,
    options = {}
) {

    const headers = {

        "Content-Type":
            "application/json",

        ...(options.headers || {})

    };


    if (authToken) {

        headers.Authorization =
            `Bearer ${authToken}`;

    }


    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,
                headers
            }
        );


    let data = null;


    try {

        data =
            await response.json();

    } catch (error) {

        data = null;

    }


    if (!response.ok) {

        const message =
            data?.message ||
            "Something went wrong with the server request.";

        throw new Error(
            message
        );

    }


    return data;

}


// ======================================
// GET MY DONATIONS
// ======================================

async function loadMyDonations() {

    try {

        const response =
            await apiRequest(
                "/donations/my"
            );


        if (
            Array.isArray(
                response?.donations
            )
        ) {

            myDonations =
                response.donations;

            return;

        }


        myDonations = [];

    } catch (error) {

        console.error(
            "Load donations error:",
            error
        );

        myDonations = [];

        /*
         * If your donations route does not yet
         * have /my, we can add it next.
         */

        throw error;

    }

}


// ======================================
// GET INCOMING REQUESTS
// ======================================

async function loadIncomingRequests() {

    try {

        myDonations =
            await getMyDonationsFromAPI();


        if (!myDonations.length) {

            incomingRequestsData = [];

            displayRequests();

            updateStatistics();

            return;

        }


        const allRequests = [];


        /*
         * Each donation can have multiple
         * incoming requests.
         */

        for (
            const donation
            of myDonations
        ) {

            if (!donation._id) {

                continue;

            }


            try {

                const response =
                    await apiRequest(
                        `/requests/donation/${donation._id}`
                    );


                if (
                    Array.isArray(
                        response?.requests
                    )
                ) {

                    response.requests.forEach(
                        request => {

                            allRequests.push(
                                request
                            );

                        }
                    );

                }

            } catch (error) {

                console.error(
                    `Could not load requests for donation ${donation._id}:`,
                    error
                );

            }

        }


        incomingRequestsData =
            allRequests;


        displayRequests();

        updateStatistics();

    } catch (error) {

        console.error(
            "Load incoming requests error:",
            error
        );


        incomingRequestsData = [];


        incomingRequests.innerHTML = "";


        emptyRequests.classList.remove(
            "hidden"
        );


        emptyRequests.querySelector(
            "h3"
        ).textContent =
            "Could Not Load Requests";


        emptyRequests.querySelector(
            "p"
        ).textContent =
            error.message ||
            "Unable to load incoming requests.";

    }

}


// ======================================
// GET MY DONATIONS FROM API
// ======================================

async function getMyDonationsFromAPI() {

    /*
     * Your donations route should expose:
     *
     * GET /api/donations/my
     *
     * with the JWT token.
     */


    const response =
        await apiRequest(
            "/donations/my"
        );


    if (
        !Array.isArray(
            response?.donations
        )
    ) {

        return [];

    }


    return response.donations;

}


// ======================================
// GET RELATED DONATION
// ======================================

function getDonationForRequest(
    request
) {

    if (!request) {

        return null;

    }


    const donationId =
        request.donationId?._id ||
        request.donationId;


    if (!donationId) {

        return null;

    }


    return myDonations.find(
        donation =>
            String(
                donation._id
            ) ===
            String(
                donationId
            )
    ) || null;

}


// ======================================
// FORMAT DATE
// ======================================

function formatDate(value) {

    if (!value) {

        return "Not specified";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Not specified";

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
// NORMALIZE STATUS
// ======================================

function normalizeStatus(status) {

    return String(
        status || "Pending"
    )
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

}


// ======================================
// STATUS LABEL
// ======================================

function statusLabel(status) {

    if (!status) {

        return "Pending";

    }


    return String(status)
        .replace(/-/g, " ")
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );

}


// ======================================
// REQUESTER NAME
// ======================================

function getRequesterName(request) {

    return (
        request.requesterName ||
        request.requester?.name ||
        "MPower User"
    );

}


// ======================================
// REQUESTER ROLE
// ======================================

function getRequesterRole(request) {

    return (
        request.requesterRole ||
        request.requester?.role ||
        "Requester"
    );

}


// ======================================
// PICKUP LOCATION
// ======================================

function getPickupLocation(
    request,
    donation
) {

    return (
        request.pickupLocation ||
        request.location ||
        donation?.location ||
        "Not specified"
    );

}


// ======================================
// UPDATE STATISTICS
// ======================================

function updateStatistics() {

    const requests =
        incomingRequestsData;


    const pending =
        requests.filter(
            request =>
                normalizeStatus(
                    request.status
                ) === "pending"
        );


    const accepted =
        requests.filter(
            request =>
                normalizeStatus(
                    request.status
                ) === "accepted"
        );


    const inDelivery =
        requests.filter(
            request => {

                const status =
                    normalizeStatus(
                        request.status
                    );


                return (
                    status === "in-delivery" ||
                    status === "indelivery" ||
                    status === "in_delivery"
                );

            }
        );


    const completed =
        requests.filter(
            request =>
                normalizeStatus(
                    request.status
                ) === "completed"
        );


    pendingCount.textContent =
        pending.length;

    acceptedCount.textContent =
        accepted.length;

    deliveryCount.textContent =
        inDelivery.length;

    completedCount.textContent =
        completed.length;

}


// ======================================
// DISPLAY REQUESTS
// ======================================

function displayRequests() {

    let requests =
        [...incomingRequestsData];


    if (
        activeFilter !== "all"
    ) {

        requests =
            requests.filter(
                request =>
                    normalizeStatus(
                        request.status
                    ) === activeFilter
            );

    }


    incomingRequests.innerHTML = "";


    if (!requests.length) {

        emptyRequests.classList.remove(
            "hidden"
        );

        return;

    }


    emptyRequests.classList.add(
        "hidden"
    );


    requests.forEach(
        request => {

            const donation =
                getDonationForRequest(
                    request
                );


            const status =
                normalizeStatus(
                    request.status
                );


            const requesterName =
                getRequesterName(
                    request
                );


            const requesterRole =
                getRequesterRole(
                    request
                );


            const quantity =
                request.quantity ??
                0;


            const unit =
                donation?.unit ||
                request.unit ||
                "";


            const pickupLocation =
                getPickupLocation(
                    request,
                    donation
                );


            const createdAt =
                request.createdAt ||
                request.requestedAt;


            const initials =
                requesterName
                    .split(" ")
                    .map(
                        word =>
                            word.charAt(0)
                    )
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();


            const requestId =
                request._id;


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "incoming-request-card";


            card.dataset.id =
                requestId;


            card.innerHTML = `

                <div class="incoming-card-header">

                    <div>

                        <span class="food-category">

                            ${escapeHTML(
                                donation?.category ||
                                "Food"
                            )}

                        </span>

                        <h3>

                            ${escapeHTML(
                                donation?.foodName ||
                                "Food Request"
                            )}

                        </h3>

                    </div>


                    <span
                        class="request-status status-${escapeHTML(
                            status
                        )}">

                        ${escapeHTML(
                            statusLabel(status)
                        )}

                    </span>

                </div>


                <div class="incoming-card-body">


                    <div class="requester-box">

                        <div class="requester-avatar">

                            ${escapeHTML(
                                initials
                            )}

                        </div>


                        <div>

                            <span>
                                Requested by
                            </span>

                            <strong>

                                ${escapeHTML(
                                    requesterName
                                )}

                            </strong>

                            <small style="
                                display:block;
                                margin-top:3px;
                                color:#888;
                                text-transform:capitalize;
                            ">

                                ${escapeHTML(
                                    requesterRole
                                )}

                            </small>

                        </div>

                    </div>


                    <div class="request-info-grid">


                        <div class="info-box">

                            <span>
                                Quantity
                            </span>

                            <strong>

                                ${escapeHTML(
                                    String(quantity)
                                )}

                                ${escapeHTML(
                                    String(unit)
                                )}

                            </strong>

                        </div>


                        <div class="info-box">

                            <span>
                                Pickup
                            </span>

                            <strong>

                                ${escapeHTML(
                                    pickupLocation
                                )}

                            </strong>

                        </div>


                        <div class="info-box">

                            <span>
                                Food Expires
                            </span>

                            <strong>

                                ${formatDate(
                                    donation?.expiry
                                )}

                            </strong>

                        </div>


                        <div class="info-box">

                            <span>
                                Requested
                            </span>

                            <strong>

                                ${formatDate(
                                    createdAt
                                )}

                            </strong>

                        </div>


                    </div>


                    ${
                        request.message

                        ?

                        `

                        <div class="request-note">

                            <strong>
                                Requester's Note
                            </strong>

                            <p>

                                ${escapeHTML(
                                    request.message
                                )}

                            </p>

                        </div>

                        `

                        :

                        ""

                    }


                </div>


                <div class="incoming-card-footer">


                    <span class="request-date">

                        Request #${escapeHTML(
                            String(
                                requestId ||
                                "N/A"
                            )
                        )}

                    </span>


                    <div class="card-actions">


                        <button
                            type="button"
                            class="action-btn view-btn"
                            data-action="view"
                            data-id="${escapeHTML(
                                String(requestId)
                            )}">

                            View

                        </button>


                        ${
                            status === "pending"

                            ?

                            `

                            <button
                                type="button"
                                class="action-btn reject-btn"
                                data-action="reject"
                                data-id="${escapeHTML(
                                    String(requestId)
                                )}">

                                Reject

                            </button>


                            <button
                                type="button"
                                class="action-btn accept-btn"
                                data-action="accept"
                                data-id="${escapeHTML(
                                    String(requestId)
                                )}">

                                Accept

                            </button>

                            `

                            :

                            ""

                        }


                    </div>


                </div>

            `;


            incomingRequests.appendChild(
                card
            );

        }
    );

}


// ======================================
// ESCAPE HTML
// ======================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


// ======================================
// FIND REQUEST
// ======================================

function findRequest(
    requestId
) {

    return incomingRequestsData.find(
        request =>
            String(
                request._id
            ) ===
            String(
                requestId
            )
    );

}


// ======================================
// ACCEPT REQUEST
// ======================================

async function acceptRequest(
    requestId
) {

    const request =
        findRequest(
            requestId
        );


    if (!request) {

        showMessage(
            "This request could not be found.",
            "error",
            "Request Not Found"
        );

        return;

    }


    if (
        normalizeStatus(
            request.status
        ) !== "pending"
    ) {

        showMessage(
            "This request has already been processed.",
            "warning",
            "Request Already Processed"
        );

        return;

    }


    const donation =
        getDonationForRequest(
            request
        );


    if (!donation) {

        showMessage(
            "The donation connected to this request could not be found.",
            "error",
            "Donation Not Found"
        );

        return;

    }


    try {

        const response =
            await apiRequest(
                `/requests/${request._id}/accept`,
                {
                    method: "PUT",

                    body:
                        JSON.stringify({

                            ownerId:
                                incomingUser.id

                        })

                }
            );


        if (
            response?.request
        ) {

            const index =
                incomingRequestsData.findIndex(
                    item =>
                        String(
                            item._id
                        ) ===
                        String(
                            request._id
                        )
                );


            if (index !== -1) {

                incomingRequestsData[index] =
                    response.request;

            }

        }


        closeRequestModal();


        showMessage(
            "The food request has been accepted. The donation is now reserved for the requester.",
            "success",
            "Request Accepted"
        );


        await loadIncomingRequests();

    } catch (error) {

        console.error(
            "Accept request error:",
            error
        );


        showMessage(
            error.message ||
            "Could not accept this request.",
            "error",
            "Accept Request Failed"
        );

    }

}


// ======================================
// REJECT REQUEST
// ======================================

async function rejectRequest(
    requestId
) {

    const request =
        findRequest(
            requestId
        );


    if (!request) {

        showMessage(
            "This request could not be found.",
            "error",
            "Request Not Found"
        );

        return;

    }


    if (
        normalizeStatus(
            request.status
        ) !== "pending"
    ) {

        showMessage(
            "This request has already been processed.",
            "warning",
            "Request Already Processed"
        );

        return;

    }


    try {

        const response =
            await apiRequest(
                `/requests/${request._id}/reject`,
                {
                    method: "PUT",

                    body:
                        JSON.stringify({

                            ownerId:
                                incomingUser.id

                        })

                }
            );


        if (
            response?.request
        ) {

            const index =
                incomingRequestsData.findIndex(
                    item =>
                        String(
                            item._id
                        ) ===
                        String(
                            request._id
                        )
                );


            if (index !== -1) {

                incomingRequestsData[index] =
                    response.request;

            }

        }


        closeRequestModal();


        showMessage(
            "The request has been rejected.",
            "success",
            "Request Rejected"
        );


        await loadIncomingRequests();

    } catch (error) {

        console.error(
            "Reject request error:",
            error
        );


        showMessage(
            error.message ||
            "Could not reject this request.",
            "error",
            "Reject Request Failed"
        );

    }

}


// ======================================
// OPEN REQUEST MODAL
// ======================================

function openRequestModal(
    requestId
) {

    const request =
        findRequest(
            requestId
        );


    if (!request) {

        return;

    }


    const donation =
        getDonationForRequest(
            request
        );


    const requesterName =
        getRequesterName(
            request
        );


    const requesterRole =
        getRequesterRole(
            request
        );


    const quantity =
        request.quantity ??
        0;


    const unit =
        donation?.unit ||
        request.unit ||
        "";


    const location =
        getPickupLocation(
            request,
            donation
        );


    const status =
        normalizeStatus(
            request.status
        );


    requestModalBody.innerHTML = `

        <div class="modal-icon">
            <i class="fa-solid fa-box-open"></i>
        </div>


        <span class="modal-category">

            ${escapeHTML(
                donation?.category ||
                "Food"
            )}

        </span>


        <h2>

            ${escapeHTML(
                donation?.foodName ||
                "Food Request"
            )}

        </h2>


        <div class="modal-details">


            <div class="modal-detail">

                <span>
                    Requested By
                </span>

                <strong>

                    ${escapeHTML(
                        requesterName
                    )}

                </strong>

            </div>


            <div class="modal-detail">

                <span>
                    Role
                </span>

                <strong>

                    ${escapeHTML(
                        requesterRole
                    )}

                </strong>

            </div>


            <div class="modal-detail">

                <span>
                    Quantity
                </span>

                <strong>

                    ${escapeHTML(
                        String(quantity)
                    )}

                    ${escapeHTML(
                        String(unit)
                    )}

                </strong>

            </div>


            <div class="modal-detail">

                <span>
                    Pickup Location
                </span>

                <strong>

                    ${escapeHTML(
                        location
                    )}

                </strong>

            </div>


            <div class="modal-detail">

                <span>
                    Food Expiry
                </span>

                <strong>

                    ${formatDate(
                        donation?.expiry
                    )}

                </strong>

            </div>


            <div class="modal-detail">

                <span>
                    Request Status
                </span>

                <strong>

                    ${escapeHTML(
                        statusLabel(status)
                    )}

                </strong>

            </div>


        </div>


        ${
            request.message

            ?

            `

            <div class="modal-note">

                <strong>
                    Requester's Note
                </strong>

                <p>

                    ${escapeHTML(
                        request.message
                    )}

                </p>

            </div>

            `

            :

            ""

        }


        ${
            status === "pending"

            ?

            `

            <div class="modal-actions">

                <button
                    type="button"
                    class="modal-action modal-reject"
                    id="modalRejectRequest">

                    Reject Request

                </button>


                <button
                    type="button"
                    class="modal-action modal-accept"
                    id="modalAcceptRequest">

                    Accept Request

                </button>

            </div>

            `

            :

            ""

        }

    `;


    requestModal.classList.remove(
        "hidden"
    );


    const modalAccept =
        document.getElementById(
            "modalAcceptRequest"
        );


    const modalReject =
        document.getElementById(
            "modalRejectRequest"
        );


    if (modalAccept) {

        modalAccept.addEventListener(
            "click",
            function () {

                closeRequestModal();

                confirmAccept(
                    request._id
                );

            }
        );

    }


    if (modalReject) {

        modalReject.addEventListener(
            "click",
            function () {

                closeRequestModal();

                confirmReject(
                    request._id
                );

            }
        );

    }

}


// ======================================
// CONFIRM ACCEPT
// ======================================

function confirmAccept(
    requestId
) {

    if (
        typeof showConfirm ===
        "function"
    ) {

        showConfirm(
            "Accepting this request will reserve the donation for this requester.",

            function () {

                acceptRequest(
                    requestId
                );

            },

            "Accept Food Request?"

        );

        return;

    }


    acceptRequest(
        requestId
    );

}


// ======================================
// CONFIRM REJECT
// ======================================

function confirmReject(
    requestId
) {

    if (
        typeof showConfirm ===
        "function"
    ) {

        showConfirm(
            "The requester will no longer be able to claim this donation through this request.",

            function () {

                rejectRequest(
                    requestId
                );

            },

            "Reject Food Request?"

        );

        return;

    }


    rejectRequest(
        requestId
    );

}


// ======================================
// EVENT DELEGATION
// ======================================

if (incomingRequests) {

    incomingRequests.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {

                return;

            }


            const action =
                button.dataset.action;


            const requestId =
                button.dataset.id;


            if (
                action === "view"
            ) {

                openRequestModal(
                    requestId
                );

            }


            if (
                action === "accept"
            ) {

                confirmAccept(
                    requestId
                );

            }


            if (
                action === "reject"
            ) {

                confirmReject(
                    requestId
                );

            }

        }
    );

}


// ======================================
// FILTERS
// ======================================

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                filterButtons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                this.classList.add(
                    "active"
                );


                activeFilter =
                    this.dataset.filter;


                displayRequests();

            }
        );

    }
);


// ======================================
// CLOSE MODAL
// ======================================

function closeRequestModal() {

    if (!requestModal) {

        return;

    }


    requestModal.classList.add(
        "hidden"
    );

}


if (closeRequestModalBtn) {

    closeRequestModalBtn.addEventListener(
        "click",
        closeRequestModal
    );

}


if (requestModal) {

    requestModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                requestModal
            ) {

                closeRequestModal();

            }

        }
    );

}


// ======================================
// ESC KEY
// ======================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            requestModal &&
            !requestModal.classList.contains(
                "hidden"
            )
        ) {

            closeRequestModal();

        }

    }
);


// ======================================
// INITIALIZE
// ======================================

async function initializeIncomingRequests() {

    try {

        await loadIncomingRequests();

        console.log(
            "MPower Incoming Requests initialized."
        );

        console.log(
            "Current user:",
            incomingUser
        );

        console.log(
            "Incoming requests:",
            incomingRequestsData
        );

    } catch (error) {

        console.error(
            "Incoming requests initialization error:",
            error
        );

    }

}


initializeIncomingRequests();