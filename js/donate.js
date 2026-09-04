"use strict";

// ======================================
// MPower - Donate Food
// Frontend Donation Controller
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

    showMessage(
        "Your session expired. Please log in again.",
        "error",
        "Session Expired"
    );

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
            "Only restaurant accounts can create food donations.",
            "error",
            "Access Denied"
        );

    } else {

        alert(
            "Only restaurant accounts can create food donations."
        );

    }

    throw new Error(
        "Only restaurant accounts can create donations."
    );

}


// ======================================
// DOM ELEMENTS
// ======================================

const donationForm =
    document.getElementById("donationForm");

const foodName =
    document.getElementById("foodName");

const category =
    document.getElementById("category");

const quantity =
    document.getElementById("quantity");

const unit =
    document.getElementById("unit");

const locationInput =
    document.getElementById("location");

const latitude =
    document.getElementById("latitude");

const longitude =
    document.getElementById("longitude");

const expiry =
    document.getElementById("expiry");

const image =
    document.getElementById("image");

const contact =
    document.getElementById("contact");

const notes =
    document.getElementById("notes");

const previewImage =
    document.getElementById("previewImage");

const previewText =
    document.getElementById("previewText");

const submitButton =
    donationForm.querySelector(".submit-btn");


// ======================================
// API URL
// ======================================

const API_URL =
    `${window.MPOWER_API_BASE_URL}/donations`;


// ======================================
// IMAGE DATA
// ======================================

let imageData = "";


// ======================================
// EDIT MODE
// ======================================

let editingDonation = null;


// ======================================
// SET MINIMUM EXPIRY DATE
// ======================================

function setMinimumExpiryDate() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    expiry.min =
        `${year}-${month}-${day}`;

}


setMinimumExpiryDate();


// ======================================
// ESCAPE HTML
// ======================================

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ======================================
// IMAGE PREVIEW
// ======================================

image.addEventListener(
    "change",
    function () {

        const file =
            image.files[0];


        if (!file) {

            imageData = "";

            previewImage.src = "";

            previewImage.style.display =
                "none";

            previewText.textContent =
                "No image selected";

            return;

        }


        // ==================================
        // CHECK IMAGE TYPE
        // ==================================

        if (
            !file.type.startsWith("image/")
        ) {

            image.value = "";

            imageData = "";

            previewImage.src = "";

            previewImage.style.display =
                "none";

            previewText.textContent =
                "No image selected";

            showMessage(
                "Please select a valid image file.",
                "error",
                "Invalid Image"
            );

            return;

        }


        // ==================================
        // READ IMAGE
        // ==================================

        const reader =
            new FileReader();


        reader.onload =
            function (event) {

                imageData =
                    event.target.result;


                previewImage.src =
                    imageData;


                previewImage.style.display =
                    "block";


                previewText.textContent =
                    file.name;

            };


        reader.onerror =
            function () {

                imageData = "";

                showMessage(
                    "Unable to read the selected image.",
                    "error",
                    "Image Error"
                );

            };


        reader.readAsDataURL(
            file
        );

    }
);


// ======================================
// SAFE API RESPONSE
// ======================================

async function getAPIResponse(response) {

    const text =
        await response.text();


    let data;


    try {

        data =
            JSON.parse(text);

    } catch (error) {

        console.error(
            "Non-JSON server response:",
            text
        );


        throw new Error(
            `Server returned a non-JSON response (${response.status}).`
        );

    }


    return data;

}


// ======================================
// FORM SUBMISSION
// ======================================

donationForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // ==================================
        // BASIC VALIDATION
        // ==================================

        const foodNameValue =
            foodName.value.trim();

        const categoryValue =
            category.value.trim();

        const quantityValue =
            Number(
                quantity.value
            );

        const unitValue =
            unit.value.trim();

        const locationValue =
            locationInput.value.trim();

        const expiryValue =
            expiry.value;

        const contactValue =
            contact.value.trim();

        const notesValue =
            notes.value.trim();


        // ==================================
        // REQUIRED FIELDS
        // ==================================

        if (
            !foodNameValue ||
            !categoryValue ||
            !quantityValue ||
            !unitValue ||
            !locationValue ||
            !expiryValue ||
            !contactValue
        ) {

            showMessage(
                "Please complete all required donation fields.",
                "error",
                "Missing Information"
            );

            return;

        }


        // ==================================
        // QUANTITY VALIDATION
        // ==================================

        if (
            !Number.isFinite(quantityValue) ||
            quantityValue <= 0
        ) {

            showMessage(
                "Quantity must be greater than zero.",
                "error",
                "Invalid Quantity"
            );

            return;

        }


        // ==================================
        // EXPIRY VALIDATION
        // ==================================

        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );


        const expiryDate =
            new Date(
                `${expiryValue}T00:00:00`
            );


        if (
            Number.isNaN(
                expiryDate.getTime()
            )
        ) {

            showMessage(
                "Please provide a valid expiry date.",
                "error",
                "Invalid Expiry Date"
            );

            return;

        }


        if (
            expiryDate < today
        ) {

            showMessage(
                "The expiry date cannot be in the past.",
                "error",
                "Invalid Expiry Date"
            );

            return;

        }


        // ==================================
        // USER ID VALIDATION
        // ==================================

        if (
            !currentUser.id
        ) {

            showMessage(
                "Your account information is incomplete. Please log in again.",
                "error",
                "Authentication Error"
            );

            return;

        }


        // ==================================
        // SUBMIT BUTTON
        // ==================================

        submitButton.disabled =
            true;


        submitButton.textContent =
            editingDonation
                ? "Updating Donation..."
                : "Submitting Donation...";


        try {

            // ==================================
            // DONATION DATA
            // ==================================

            const donationData = {

                ownerId:
                    currentUser.id,

                ownerName:
                    currentUser.name,

                ownerRole:
                    currentUser.role,

                foodName:
                    foodNameValue,

                category:
                    categoryValue,

                quantity:
                    quantityValue,

                unit:
                    unitValue,

                location:
                    locationValue,

                latitude:
                    latitude &&
                    latitude.value !== ""
                        ? Number(
                            latitude.value
                        )
                        : null,

                longitude:
                    longitude &&
                    longitude.value !== ""
                        ? Number(
                            longitude.value
                        )
                        : null,

                expiry:
                    expiryValue,

                contact:
                    contactValue,

                notes:
                    notesValue,

                image:
                    imageData || ""

            };


            // ==================================
            // API METHOD
            // ==================================

            const method =
                editingDonation
                    ? "PUT"
                    : "POST";


            // ==================================
            // API URL
            // ==================================

            const url =
                editingDonation
                    ? `${API_URL}/${encodeURIComponent(
                        editingDonation._id
                    )}`
                    : API_URL;


            console.log(
                "Donation API method:",
                method
            );

            console.log(
                "Donation API URL:",
                url
            );

            console.log(
                "Donation payload:",
                {
                    ...donationData,
                    image:
                        donationData.image
                            ? "[image data]"
                            : ""
                }
            );


            // ==================================
            // SEND TO BACKEND
            // ==================================

            const response =
                await fetch(
                    url,
                    {

                        method,

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${authToken}`

                        },

                        body:
                            JSON.stringify(
                                donationData
                            )

                    }
                );


            console.log(
                "Donation API status:",
                response.status
            );


            // ==================================
            // READ RESPONSE
            // ==================================

            const data =
                await getAPIResponse(
                    response
                );


            console.log(
                "Donation API response:",
                data
            );


            // ==================================
            // HANDLE ERROR
            // ==================================

            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to save donation."
                );

            }


            // ==================================
            // SUCCESS
            // ==================================

            showMessage(
                editingDonation
                    ? "Your donation has been updated successfully."
                    : "Your food donation has been submitted successfully.",
                "success",
                editingDonation
                    ? "Donation Updated"
                    : "Donation Submitted"
            );


            // ==================================
            // CLEAR EDIT MODE
            // ==================================

            editingDonation =
                null;


            // ==================================
            // RESET FORM
            // ==================================

            donationForm.reset();


            imageData =
                "";


            previewImage.src =
                "";


            previewImage.style.display =
                "none";


            previewText.textContent =
                "No image selected";


            setMinimumExpiryDate();


            // ==================================
            // REDIRECT
            // ==================================

            setTimeout(
                function () {

                    window.location.href =
                        "my-donations.html";

                },
                1200
            );


        } catch (error) {

            console.error(
                "Donation submission error:",
                error
            );


            showMessage(
                error.message ||
                "Something went wrong while submitting the donation.",
                "error",
                "Donation Failed"
            );


        } finally {

            submitButton.disabled =
                false;


            submitButton.textContent =
                editingDonation
                    ? "Update Donation"
                    : "Donate Food";

        }

    }
);


// ======================================
// LOAD DONATION FOR EDITING
// ======================================

async function loadDonationForEditing(
    donationId
) {

    if (!donationId) {

        return;

    }


    try {

        // ==================================
        // LOADING BUTTON
        // ==================================

        submitButton.disabled =
            true;

        submitButton.textContent =
            "Loading Donation...";


        // ==================================
        // REQUEST DONATION
        // ==================================

        const response =
            await fetch(
                `${API_URL}/${encodeURIComponent(
                    donationId
                )}`
            );


        const data =
            await getAPIResponse(
                response
            );


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load donation."
            );

        }


        const donation =
            data.donation;


        if (!donation) {

            throw new Error(
                "Donation data was not returned by the server."
            );

        }


        // ==================================
        // OWNERSHIP CHECK
        // ==================================

        if (
            String(
                donation.ownerId
            ) !==
            String(
                currentUser.id
            )
        ) {

            throw new Error(
                "You are not allowed to edit this donation."
            );

        }


        // ==================================
        // STATUS CHECK
        // ==================================

        if (
            String(
                donation.status || ""
            )
                .trim()
                .toLowerCase() !==
            "available"
        ) {

            throw new Error(
                "This donation can no longer be edited because it is already being processed."
            );

        }


        editingDonation =
            donation;


        // ==================================
        // POPULATE FORM
        // ==================================

        foodName.value =
            donation.foodName || "";


        category.value =
            donation.category || "";


        quantity.value =
            donation.quantity ?? "";


        unit.value =
            donation.unit || "";


        locationInput.value =
            donation.location || "";


        if (latitude) {

            latitude.value =
                donation.latitude ??
                "";

        }


        if (longitude) {

            longitude.value =
                donation.longitude ??
                "";

        }


        expiry.value =
            donation.expiry
                ? String(
                    donation.expiry
                ).substring(
                    0,
                    10
                )
                : "";


        contact.value =
            donation.contact || "";


        notes.value =
            donation.notes || "";


        // ==================================
        // EXISTING IMAGE
        // ==================================

        if (
            donation.image
        ) {

            imageData =
                donation.image;


            previewImage.src =
                donation.image;


            previewImage.style.display =
                "block";


            previewText.textContent =
                "Current donation image";

        } else {

            imageData =
                "";

            previewImage.src =
                "";

            previewImage.style.display =
                "none";

            previewText.textContent =
                "No image selected";

        }


        // ==================================
        // BUTTON
        // ==================================

        submitButton.disabled =
            false;

        submitButton.textContent =
            "Update Donation";


    } catch (error) {

        console.error(
            "Load donation error:",
            error
        );


        editingDonation =
            null;


        submitButton.disabled =
            false;

        submitButton.textContent =
            "Donate Food";


        showMessage(
            error.message ||
            "Unable to load this donation.",
            "error",
            "Unable to Load Donation"
        );

    }

}


// ======================================
// GET EDIT ID FROM URL
// ======================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const donationId =
    urlParams.get(
        "id"
    );


if (
    donationId
) {

    loadDonationForEditing(
        donationId
    );

}


// ======================================
// INITIALIZE
// ======================================

console.log(
    "MPower Donate.js initialized."
);


console.log(
    "Current restaurant:",
    {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role
    }
);