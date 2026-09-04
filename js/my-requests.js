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

const incomingUser =
JSON.parse(
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
// ROLE PROTECTION
// ======================================

if (incomingUser.role === "volunteer") {

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
"requestsGrid"
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
    ...(options.body
        ? {
            "Content-Type":
                "application/json"
        }
        : {}),

    ...(options.headers || {})
};


if (authToken) {

    headers.Authorization =
        `Bearer ${authToken}`;

}


let response;


try {

    response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers
        }
    );

} catch (error) {

    console.error(
        "Network error:",
        error
    );

    throw new Error(
        "Unable to connect to the MPower server."
    );

}


let data = null;


try {

    data = await response.json();

} catch (error) {

    data = null;

}


// ==================================
// SESSION EXPIRED
// ==================================

if (response.status === 401) {

    localStorage.removeItem("token");

    localStorage.removeItem("currentUser");

    window.location.href =
        "login.html";

    throw new Error(
        "Your session has expired. Please log in again."
    );

}


// ==================================
// SERVER ERROR
// ==================================

if (!response.ok) {

    throw new Error(
        data?.message ||
        "Something went wrong with the server request."
    );

}


return data;


}

// ======================================
// GET MY DONATIONS
// ======================================

async function getMyDonationsFromAPI() {


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
// LOAD MY DONATIONS
// ======================================

async function loadMyDonations() {


myDonations =
    await getMyDonationsFromAPI();

}

// ======================================
// LOAD INCOMING REQUESTS
// ======================================

async function loadIncomingRequests() {


try {

    // Charity users load their own requests directly. The donations/my
    // endpoint belongs to restaurant accounts and must not be used here.
    if (incomingUser.role === "charity") {

        const response =
            await apiRequest(
                "/requests/my"
            );

        incomingRequestsData =
            Array.isArray(response?.requests)
                ? response.requests
                : [];

        displayRequests();
        updateStatistics();

        return;

    }

    // ==================================
    // LOAD DONATIONS OWNED BY USER
    // ==================================

    await loadMyDonations();


    incomingRequestsData = [];


    // ==================================
    // NO DONATIONS
    // ==================================

    if (!myDonations.length) {

        displayRequests();

        updateStatistics();

        return;

    }


    // ==================================
    // LOAD REQUESTS
    // ==================================

    const requestPromises =
        myDonations
            .filter(
                donation =>
                    donation?._id
            )
            .map(
                async donation => {

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

                            return response.requests;

                        }


                        return [];

                    } catch (error) {

                        console.error(
                            `Could not load requests for donation ${donation._id}:`,
                            error
                        );

                        return [];

                    }

                }
            );


    const requestGroups =
        await Promise.all(
            requestPromises
        );


    // ==================================
    // FLATTEN REQUESTS
    // ==================================

    incomingRequestsData =
        requestGroups.flat();


    // ==================================
    // REMOVE DUPLICATES
    // ==================================

    const uniqueRequests =
        new Map();


    incomingRequestsData.forEach(
        request => {

            const id =
                getRequestId(request);


            if (id) {

                uniqueRequests.set(
                    String(id),
                    request
                );

            }

        }
    );


    incomingRequestsData =
        Array.from(
            uniqueRequests.values()
        );


    // ==================================
    // UPDATE UI
    // ==================================

    displayRequests();

    updateStatistics();

} catch (error) {

    console.error(
        "Load incoming requests error:",
        error
    );


    incomingRequestsData = [];

    updateStatistics();


    if (incomingRequests) {

        incomingRequests.innerHTML = "";

    }


    if (emptyRequests) {

        emptyRequests.classList.remove(
            "hidden"
        );


        const heading =
            emptyRequests.querySelector(
                "h3"
            );


        const paragraph =
            emptyRequests.querySelector(
                "p"
            );


        if (heading) {

            heading.textContent =
                "Could Not Load Requests";

        }


        if (paragraph) {

            paragraph.textContent =
                error.message ||
                "Unable to load incoming requests.";

        }

    }

}


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


let donationId =
    request.donationId;


if (
    donationId &&
    typeof donationId === "object"
) {

    if (donationId._id) {

        return donationId;

    }

    donationId =
        donationId._id;

}


if (!donationId) {


        const populatedDonation = donationId;
    return null;

}

        return populatedDonation;


return (
    myDonations.find(
        donation =>
            String(
                donation._id
            ) ===
            String(
                donationId
            )
    ) || null
);

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
    .replace(/[\s_]+/g, "-");

}

// ======================================
// STATUS LABEL
// ======================================

function statusLabel(status) {

if (!status) {

    return "Pending";

}


    if (normalizeStatus(status) === "delivered") {

        return "Awaiting Charity Confirmation";

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

function getRequesterName(
request
) {


return (
    request?.requesterName ||
    request?.requester?.name ||
    "MPower User"
);


}

// ======================================
// REQUESTER ROLE
// ======================================

function getRequesterRole(
request
) {

return (
    request?.requesterRole ||
    request?.requester?.role ||
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
    request?.pickupLocation ||
    request?.location ||
    donation?.pickupLocation ||
    donation?.location ||
    "Not specified"
);

}

// ======================================
// REQUEST ID
// ======================================

function getRequestId(
request
) {


return (
    request?._id ||
    request?.id ||
    null
);


}

// ======================================
// REQUEST QUANTITY
// ======================================

function getRequestQuantity(
request
) {


return (
    request?.quantity ??
    request?.quantityRequested ??
    0
);

}

// ======================================
// REQUEST MESSAGE
// ======================================

function getRequestMessage(
request
) {

return (
    request?.message ||
    request?.notes ||
    ""
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
                status === "indelivery"
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


if (pendingCount) {

    pendingCount.textContent =
        pending.length;

}


if (acceptedCount) {

    acceptedCount.textContent =
        accepted.length;

}


if (deliveryCount) {

    deliveryCount.textContent =
        inDelivery.length;

}


if (completedCount) {

    completedCount.textContent =
        completed.length;

}

}

// ======================================
// DISPLAY REQUESTS
// ======================================

function displayRequests() {
if (!incomingRequests) {

    return;

}


let requests =
    [...incomingRequestsData];


// ==================================
// FILTER
// ==================================

if (
    activeFilter !== "all"
) {

    requests =
        requests.filter(
            request =>
                normalizeStatus(
                    request.status
                ) ===
                activeFilter
        );

}


incomingRequests.innerHTML =
    "";


// ==================================
// EMPTY STATE
// ==================================

if (!requests.length) {

    if (emptyRequests) {

        emptyRequests.classList.remove(
            "hidden"
        );


        const heading =
            emptyRequests.querySelector(
                "h3"
            );


        const paragraph =
            emptyRequests.querySelector(
                "p"
            );


        if (heading) {

            heading.textContent =
                "No Incoming Requests";

        }


        if (paragraph) {

            paragraph.textContent =
                activeFilter === "all"
                    ? "You don't have any incoming food requests yet."
                    : "You don't have any food requests matching this filter yet.";

        }

    }


    return;

}


if (emptyRequests) {

    emptyRequests.classList.add(
        "hidden"
    );

}


// ==================================
// CREATE REQUEST CARDS
// ==================================

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
            getRequestQuantity(
                request
            );


        const unit =
            request?.unit ||
            donation?.unit ||
            "";


        const pickupLocation =
            getPickupLocation(
                request,
                donation
            );


        const createdAt =
            request?.createdAt ||
            request?.requestedAt;


        const requesterInitials =
            requesterName
                .trim()
                .split(/\s+/)
                .map(
                    word =>
                        word.charAt(0)
                )
                .slice(0, 2)
                .join("")
                .toUpperCase();


        const requestId =
            getRequestId(
                request
            );


        const foodName =
            donation?.foodName ||
            request?.foodName ||
            "Food Request";


        const category =
            donation?.category ||
            request?.category ||
            "Food";


        const expiry =
            donation?.expiry ||
            request?.expiry;


        const message =
            getRequestMessage(
                request
            );


        const card =
            document.createElement(
                "article"
            );


        card.className =
            "incoming-request-card";


        card.dataset.id =
            requestId || "";


        card.innerHTML = `

            <div class="incoming-card-header">

                <div>

                    <span class="food-category">

                        ${escapeHTML(
                            category
                        )}

                    </span>

                    <h3>

                        ${escapeHTML(
                            foodName
                        )}

                    </h3>

                </div>


                <span
                    class="request-status status-${escapeHTML(
                        status
                    )}"
                >

                    ${escapeHTML(
                        statusLabel(status)
                    )}

                </span>

            </div>


            <div class="incoming-card-body">

                <div class="requester-box">

                    <div class="requester-avatar">

                        ${escapeHTML(
                            requesterInitials ||
                            "MP"
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


                        <small
                            style="
                                display:block;
                                margin-top:3px;
                                color:#888;
                                text-transform:capitalize;
                            "
                        >

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

                            ${unit
                                ? ` ${escapeHTML(
                                    String(unit)
                                )}`
                                : ""
                            }

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
                                expiry
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
                    message
                        ? `

                            <div class="request-note">

                                <strong>
                                    Requester's Note
                                </strong>

                                <p>

                                    ${escapeHTML(
                                        message
                                    )}

                                </p>

                            </div>

                        `
                        : ""
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


                ${
                    incomingUser.role === "restaurant"
                        ? `
                            <div class="card-actions">

                                <button
                                    type="button"
                                    class="action-btn view-btn"
                                    data-action="view"
                                    data-id="${escapeHTML(
                                        String(
                                            requestId || ""
                                        )
                                    )}"
                                >

                                    View

                                </button>

                                ${
                                    status === "pending"
                                        ? `

                                <button
                                    type="button"
                                    class="action-btn reject-btn"
                                    data-action="reject"
                                    data-id="${escapeHTML(
                                        String(
                                            requestId || ""
                                        )
                                    )}"
                                >

                                    Reject

                                </button>


                                <button
                                    type="button"
                                    class="action-btn accept-btn"
                                    data-action="accept"
                                    data-id="${escapeHTML(
                                        String(
                                            requestId || ""
                                        )
                                    )}"
                                >

                                    Accept

                                </button>

                            `
                                        : ""
                                }

                            </div>
                        `
                        : normalizeStatus(request.status) === "delivered"
                            ? `
                                <div class="card-actions">
                                    <button type="button" class="action-btn accept-btn" data-action="confirm-receipt" data-id="${escapeHTML(String(requestId || ""))}">
                                        <i class="fa-solid fa-circle-check"></i> Confirm Receipt
                                    </button>
                                </div>
                            `
                            : ""
                }

            </div>

        `;


        incomingRequests.appendChild(
            card
        );

    }
);


}

async function confirmReceipt(requestId) {

    try {
        const response = await apiRequest(
            `/requests/${encodeURIComponent(requestId)}/confirm-receipt`,
            { method: "PUT" }
        );

        showMessage(
            response?.message || "Delivery receipt confirmed.",
            "success",
            "Receipt Confirmed"
        );

        await loadIncomingRequests();

    } catch (error) {
        showMessage(error.message || "Could not confirm receipt.", "error", "Confirmation Failed");
    }

}

// ======================================
// ESCAPE HTML
// ======================================

function escapeHTML(
value
) {

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

return (
    incomingRequestsData.find(
        request =>
            String(
                getRequestId(
                    request
                )
            ) ===
            String(
                requestId
            )
    ) || null
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


try {

    const response =
        await apiRequest(
            `/requests/${requestId}/accept`,
            {
                method: "PUT"
            }
        );


    if (response?.request) {

        const index =
            incomingRequestsData.findIndex(
                item =>
                    String(
                        getRequestId(
                            item
                        )
                    ) ===
                    String(
                        requestId
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
            `/requests/${requestId}/reject`,
            {
                method: "PUT"
            }
        );


    if (response?.request) {

        const index =
            incomingRequestsData.findIndex(
                item =>
                    String(
                        getRequestId(
                            item
                        )
                    ) ===
                    String(
                        requestId
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


if (
    !request ||
    !requestModal ||
    !requestModalBody
) {

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
    getRequestQuantity(
        request
    );


const unit =
    request?.unit ||
    donation?.unit ||
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


const foodName =
    donation?.foodName ||
    request?.foodName ||
    "Food Request";


const category =
    donation?.category ||
    request?.category ||
    "Food";


const expiry =
    donation?.expiry ||
    request?.expiry;


const message =
    getRequestMessage(
        request
    );


requestModalBody.innerHTML = `

    <div class="modal-icon">
        <i class="fa-solid fa-box-open"></i>
    </div>


    <span class="modal-category">

        ${escapeHTML(
            category
        )}

    </span>


    <h2>

        ${escapeHTML(
            foodName
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

                ${
                    unit
                        ? ` ${escapeHTML(
                            String(unit)
                        )}`
                        : ""
                }

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
                    expiry
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
        message
            ? `

                <div class="modal-note">

                    <strong>
                        Requester's Note
                    </strong>


                    <p>

                        ${escapeHTML(
                            message
                        )}

                    </p>

                </div>

            `
            : ""
    }


    ${
        status === "pending"
            ? `

                <div class="modal-actions">

                    <button
                        type="button"
                        class="modal-action modal-reject"
                        id="modalRejectRequest"
                    >

                        Reject Request

                    </button>


                    <button
                        type="button"
                        class="modal-action modal-accept"
                        id="modalAcceptRequest"
                    >

                        Accept Request

                    </button>

                </div>

            `
            : ""
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
                requestId
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
                requestId
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


        if (!requestId) {

            return;

        }


        if (action === "view") {

            openRequestModal(
                requestId
            );

        }


        if (action === "accept") {

            confirmAccept(
                requestId
            );

        }


        if (action === "reject") {

            confirmReject(
                requestId
            );

        }

        if (action === "confirm-receipt") {

            confirmReceipt(requestId);

        }

    }
);

}

// ======================================
// FILTER BUTTONS
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
                this.dataset.filter ||
                "all";


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
console.log(
    "Loading MPower Incoming Requests..."
);


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
        "My donations:",
        myDonations
    );

    console.log(
        "Incoming requests:",
        incomingRequestsData
    );

} catch (error) {

    console.error(
        "Incoming requests initialization failed:",
        error
    );

}

}

initializeIncomingRequests();
