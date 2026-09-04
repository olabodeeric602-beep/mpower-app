"use strict";

// ======================================
// MPower - Request Food
// API VERSION
// ======================================


// ======================================
// API CONFIGURATION
// ======================================

const API_BASE_URL = window.MPOWER_API_BASE_URL;


// ======================================
// AUTHENTICATION
// ======================================

const requestUser = JSON.parse(
    localStorage.getItem("currentUser")
);

const authToken =
    localStorage.getItem("token");


if (!requestUser || !authToken) {

    window.location.href = "login.html";

    throw new Error(
        "User is not authenticated."
    );

}


// ======================================
// CHARITY ROLE PROTECTION
// ======================================

if (
    requestUser.role !== "charity"
) {

    window.location.href = "profile.html";

    throw new Error(
        "Only charity accounts can request food."
    );

}


// ======================================
// DOM ELEMENTS
// ======================================

const foodGrid =
    document.getElementById("foodGrid");

const searchFood =
    document.getElementById("searchFood");

const categoryFilter =
    document.getElementById("categoryFilter");

const requestModal =
    document.getElementById("requestModal");

const closeModal =
    document.getElementById("closeModal");

const selectedFood =
    document.getElementById("selectedFood");

const requestQuantity =
    document.getElementById("requestQuantity");

const pickupDate =
    document.getElementById("pickupDate");

const requestNotes =
    document.getElementById("requestNotes");

const sendRequest =
    document.getElementById("sendRequest");


// ======================================
// STATE
// ======================================

let currentDonation = null;

let donations = [];


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

        throw new Error(
            data?.message ||
            "Something went wrong with the server request."
        );

    }


    return data;

}


// ======================================
// LOAD AVAILABLE DONATIONS
// ======================================

async function loadDonations() {

    try {

        const response =
            await apiRequest(
                "/donations"
            );


        if (
            Array.isArray(
                response?.donations
            )
        ) {

            donations =
                response.donations;

        } else {

            donations = [];

        }


        displayFoods(
            getAvailableDonations()
        );

    } catch (error) {

        console.error(
            "Load donations error:",
            error
        );


        donations = [];


        foodGrid.innerHTML = `

            <div class="empty-state">

                <h2>
                    <i class="fa-solid fa-triangle-exclamation"></i> Could Not Load Donations
                </h2>

                <p>
                    ${
                        escapeHTML(
                            error.message ||
                            "Unable to load food donations."
                        )
                    }
                </p>

            </div>

        `;

    }

}


// ======================================
// GET AVAILABLE DONATIONS
// ======================================

function getAvailableDonations() {

    return donations.filter(
        donation => {

            return (
                donation.status ===
                "Available"
            );

        }
    );

}


// ======================================
// DISPLAY DONATIONS
// ======================================

function displayFoods(
    foodList
) {

    foodGrid.innerHTML = "";


    if (
        foodList.length === 0
    ) {

        foodGrid.innerHTML = `

            <div class="empty-state">

                <h2>
                    <i class="fa-solid fa-box-open"></i> No Donations Available
                </h2>

                <p>
                    No food donations are currently
                    available for request.
                </p>

            </div>

        `;

        return;

    }


    foodList.forEach(
        food => {

            const location =
                food.location ||
                "Location unavailable";


            const image =
                food.image ||
                "../images/food-placeholder.jpg";


            const expiry =
                formatDate(
                    food.expiry
                );


            foodGrid.innerHTML += `

                <div class="food-card">

                    <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(
                            food.foodName ||
                            "Food donation"
                        )}"
                    >


                    <div class="food-info">

                        <span class="food-category">

                            ${escapeHTML(
                                food.category ||
                                "Food"
                            )}

                        </span>


                        <h2>

                            ${escapeHTML(
                                food.foodName ||
                                "Food Donation"
                            )}

                        </h2>


                        <p class="donor">

                            <i class="fa-solid fa-location-dot"></i>
                            ${escapeHTML(
                                location
                            )}

                        </p>


                        <div class="food-meta">

                            <span>

                                <i class="fa-solid fa-box-open"></i>
                                ${escapeHTML(
                                    String(
                                        food.quantity ||
                                        0
                                    )
                                )}

                                ${escapeHTML(
                                    food.unit ||
                                    ""
                                )}

                            </span>


                            <span>

                                <i class="fa-regular fa-calendar"></i>
                                Expires:
                                ${escapeHTML(
                                    expiry
                                )}

                            </span>

                        </div>


                        <button
                            type="button"
                            class="request-btn"
                            data-id="${escapeHTML(
                                String(
                                    food._id
                                )
                            )}"
                        >

                            <i class="fa-solid fa-bowl-food"></i> Request Food

                        </button>

                    </div>

                </div>

            `;

        }
    );

}


// ======================================
// FORMAT DATE
// ======================================

function formatDate(
    value
) {

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
// FIND DONATION
// ======================================

function findDonation(
    donationId
) {

    return donations.find(
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
// SEARCH + FILTER
// ======================================

if (searchFood) {

    searchFood.addEventListener(
        "input",
        filterFoods
    );

}


if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        filterFoods
    );

}


function filterFoods() {

    const search =
        searchFood.value
            .trim()
            .toLowerCase();


    const category =
        categoryFilter.value;


    const availableDonations =
        getAvailableDonations();


    const filtered =
        availableDonations.filter(
            food => {

                const foodName =
                    (
                        food.foodName ||
                        ""
                    ).toLowerCase();


                const location =
                    (
                        food.location ||
                        ""
                    ).toLowerCase();


                const donor =
                    (
                        food.ownerName ||
                        ""
                    ).toLowerCase();


                const matchesSearch =
                    foodName.includes(
                        search
                    ) ||

                    location.includes(
                        search
                    ) ||

                    donor.includes(
                        search
                    );


                const matchesCategory =
                    category === "" ||
                    food.category === category;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    displayFoods(
        filtered
    );

}


// ======================================
// OPEN REQUEST MODAL
// ======================================

if (foodGrid) {

    foodGrid.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".request-btn"
                );


            if (!button) {

                return;

            }


            const donationId =
                button.dataset.id;


            const donation =
                findDonation(
                    donationId
                );


            if (!donation) {

                showMessage(
                    "This donation could not be found.",
                    "warning",
                    "Donation Not Found"
                );

                loadDonations();

                return;

            }


            currentDonation =
                donation;


            // ==================================
            // CHECK AVAILABILITY
            // ==================================

            if (
                donation.status !==
                "Available"
            ) {

                showMessage(
                    "This donation is no longer available.",
                    "warning",
                    "Donation Unavailable"
                );

                loadDonations();

                return;

            }


            // ==================================
            // SHOW SELECTED FOOD
            // ==================================

            selectedFood.innerHTML = `

                <strong>
                    ${escapeHTML(
                        donation.foodName
                    )}
                </strong>

                <br>

                Available:
                ${escapeHTML(
                    String(
                        donation.quantity
                    )
                )}

                ${escapeHTML(
                    donation.unit
                )}

            `;


            // ==================================
            // RESET FORM
            // ==================================

            requestQuantity.value = "";

            pickupDate.value = "";

            requestNotes.value = "";


            // ==================================
            // PREVENT PAST DATES
            // ==================================

            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];


            pickupDate.min =
                today;


            // ==================================
            // MAXIMUM QUANTITY
            // ==================================

            requestQuantity.max =
                Number(
                    donation.quantity
                );


            // ==================================
            // OPEN MODAL
            // ==================================

            requestModal.classList.remove(
                "hidden"
            );

        }
    );

}


// ======================================
// CLOSE MODAL
// ======================================

if (closeModal) {

    closeModal.addEventListener(
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


function closeRequestModal() {

    if (requestModal) {

        requestModal.classList.add(
            "hidden"
        );

    }


    currentDonation =
        null;

}


// ======================================
// SUBMIT REQUEST
// ======================================

if (sendRequest) {

    sendRequest.addEventListener(
        "click",
        submitRequest
    );

}


async function submitRequest() {

    if (!currentDonation) {

        showMessage(
            "Please select a donation first.",
            "warning",
            "No Donation Selected"
        );

        return;

    }


    // ==================================
    // GET LATEST DONATION
    // ==================================

    try {

        const response =
            await apiRequest(
                `/donations/${currentDonation._id}`
            );


        const latestDonation =
            response?.donation;


        if (!latestDonation) {

            showMessage(
                "This donation could not be found.",
                "error",
                "Donation Not Found"
            );

            closeRequestModal();

            await loadDonations();

            return;

        }


        // ==================================
        // CHECK AVAILABILITY
        // ==================================

        if (
            String(latestDonation.status || "").trim().toLowerCase() !==
            "available"
        ) {

            showMessage(
                "This donation is no longer available.",
                "warning",
                "Donation Unavailable"
            );

            closeRequestModal();

            await loadDonations();

            return;

        }


        // ==================================
        // FORM VALUES
        // ==================================

        const quantity =
            Number(
                requestQuantity.value
            );


        const pickup =
            pickupDate.value;


        const notes =
            requestNotes.value.trim();


        // ==================================
        // QUANTITY VALIDATION
        // ==================================

        if (
            !requestQuantity.value ||
            !Number.isFinite(quantity) ||
            quantity <= 0
        ) {

            showMessage(
                "Please enter a valid quantity.",
                "warning",
                "Quantity Required"
            );

            return;

        }


        // ==================================
        // AVAILABLE QUANTITY
        // ==================================

        if (
            quantity >
            Number(
                latestDonation.quantity
            )
        ) {

            showMessage(
                `Only ${latestDonation.quantity} ${latestDonation.unit} are available.`,
                "warning",
                "Quantity Too High"
            );

            return;

        }


        // ==================================
        // PICKUP DATE
        // ==================================

        if (!pickup) {

            showMessage(
                "Please choose a pickup date.",
                "warning",
                "Pickup Date Required"
            );

            return;

        }


        // ==================================
        // PREVENT PAST DATE
        // ==================================

        const today =
            new Date()
                .toISOString()
                .split("T")[0];


        if (
            pickup < today
        ) {

            showMessage(
                "Pickup date cannot be in the past.",
                "warning",
                "Invalid Pickup Date"
            );

            return;

        }


        // ==================================
        // DISABLE BUTTON
        // ==================================

        sendRequest.disabled =
            true;

        sendRequest.textContent =
            "Sending...";


        // ==================================
        // CREATE REQUEST THROUGH API
        // ==================================

        const requestResponse =
            await apiRequest(
                "/requests",
                {
                    method: "POST",

                    body:
                        JSON.stringify({

                            donationId:
                                latestDonation._id,

                            quantity:
                                quantity,

                            pickupDate:
                                pickup,

                            message:
                                notes

                        })

                }
            );


        // ==================================
        // SUCCESS
        // ==================================

        closeRequestModal();


        showMessage(
            requestResponse?.message ||
            "Your food request has been submitted successfully.",
            "success",
            "Request Submitted"
        );


        // ==================================
        // REFRESH DONATIONS
        // ==================================

        await loadDonations();


        // ==================================
        // REDIRECT
        // ==================================

        setTimeout(
            function () {

                window.location.href =
                    "my-requests.html";

            },
            1200
        );


    } catch (error) {

        console.error(
            "Submit request error:",
            error
        );


        showMessage(
            error.message ||
            "Could not submit the food request.",
            "error",
            "Request Failed"
        );

    } finally {

        sendRequest.disabled =
            false;

        sendRequest.textContent =
            "Send Request";

    }

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

async function initializeRequestFood() {

    try {

        await loadDonations();

        console.log(
            "MPower Request Food initialized."
        );

        console.log(
            "Current user:",
            requestUser
        );

        console.log(
            "Available donations:",
            getAvailableDonations()
        );

    } catch (error) {

        console.error(
            "Request food initialization error:",
            error
        );

    }

}


initializeRequestFood();