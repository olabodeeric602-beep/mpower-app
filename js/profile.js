// ======================================
// MPower - Premium 3D Profile
// Backend + MongoDB + JWT
// ======================================

"use strict";


// ======================================
// API
// ======================================

const API_URL =
    `${window.MPOWER_API_BASE_URL}/auth`;


// ======================================
// DOM ELEMENTS
// ======================================

const profileForm =
    document.getElementById("profileForm");

const profileImage =
    document.getElementById("profileImage");

const profileImageInput =
    document.getElementById("profileImageInput");

const profileName =
    document.getElementById("profileName");

const profileRole =
    document.getElementById("profileRole");

const nameInput =
    document.getElementById("name");

const emailInput =
    document.getElementById("email");

const addressInput =
    document.getElementById("address");

const phoneInput =
    document.getElementById("phone");

const accountRole =
    document.getElementById("accountRole");

const accountRoleDetail =
    document.getElementById("accountRoleDetail");

const accountRoleValue =
    document.getElementById("accountRoleValue");

const accountId =
    document.getElementById("accountId");

const accountIdDetail =
    document.getElementById("accountIdDetail");

const createdAt =
    document.getElementById("createdAt");

const logoutBtn =
    document.getElementById("logoutBtn");

const profileNavigation =
    document.getElementById("profileNavigation");


// ======================================
// CHANGE PASSWORD DOM
// ======================================

const changePasswordForm =
    document.getElementById(
        "changePasswordForm"
    );

const currentPasswordInput =
    document.getElementById(
        "currentPassword"
    );

const newPasswordInput =
    document.getElementById(
        "newPassword"
    );

const confirmPasswordInput =
    document.getElementById(
        "confirmPassword"
    );

const passwordStrengthBar =
    document.getElementById(
        "passwordStrengthBar"
    );

const passwordStrengthText =
    document.getElementById(
        "passwordStrengthText"
    );

const passwordMatchMessage =
    document.getElementById(
        "passwordMatchMessage"
    );

const lengthRequirement =
    document.getElementById(
        "lengthRequirement"
    );

const uppercaseRequirement =
    document.getElementById(
        "uppercaseRequirement"
    );

const lowercaseRequirement =
    document.getElementById(
        "lowercaseRequirement"
    );

const numberRequirement =
    document.getElementById(
        "numberRequirement"
    );


// ======================================
// LOCATION DOM
// ======================================

const setLocationBtn =
    document.getElementById(
        "setLocationBtn"
    );

const locationStatus =
    document.getElementById(
        "locationStatus"
    );


// ======================================
// LOGGED-IN USER
// ======================================

let loggedInUser =
    JSON.parse(
        localStorage.getItem(
            "currentUser"
        )
    );


// ======================================
// JWT TOKEN
// ======================================

const token =
    localStorage.getItem("token");


// ======================================
// AUTHENTICATION CHECK
// ======================================

if (!token) {

    window.location.href =
        "login.html";

}


// ======================================
// API HEADERS
// ======================================

function getAuthHeaders() {

    return {

        "Content-Type":
            "application/json",

        "Authorization":
            `Bearer ${token}`

    };

}


// ======================================
// ROLE NAME
// ======================================

function getRoleName(role) {

    const roles = {

        admin:
            "Administrator",

        restaurant:
            "Restaurant Partner",

        charity:
            "Charity Partner",

        volunteer:
            "Volunteer"

    };

    return (
        roles[role] ||
        "MPower User"
    );

}


// ======================================
// ROLE NAVIGATION
// ======================================

function generateRoleNavigation() {

    if (
        !profileNavigation ||
        !loggedInUser
    ) {

        return;

    }


    const role =
        loggedInUser.role;


    let navigation = [];


    // ==================================
    // RESTAURANT
    // ==================================

    if (
        role === "restaurant"
    ) {

        navigation = [

            {
                icon: '<i class="fa-solid fa-hand-holding-heart"></i>',
                title: "Donate Food",
                url: "donate.html"
            },

            {
                icon: '<i class="fa-solid fa-box-open"></i>',
                title: "My Donations",
                url: "my-donations.html"
            },

            {
                icon: '<i class="fa-solid fa-chart-line"></i>',
                title: "Donation Activity",
                url: "my-donations.html"
            }

        ];

    }


    // ==================================
    // CHARITY
    // ==================================

    else if (
        role === "charity"
    ) {

        navigation = [

            {
                icon: '<i class="fa-solid fa-magnifying-glass"></i>',
                title: "Request Food",
                url: "request.html"
            },

            {
                icon: '<i class="fa-solid fa-clipboard-list"></i>',
                title: "My Requests",
                url: "my-requests.html"
            },

            {
                icon: '<i class="fa-solid fa-bowl-food"></i>',
                title: "Available Food",
                url: "request.html"
            }

        ];

    }


    // ==================================
    // VOLUNTEER
    // ==================================

    else if (
        role === "volunteer"
    ) {

        navigation = [

            {
                icon: '<i class="fa-solid fa-truck-fast"></i>',
                title: "Volunteer Dashboard",
                url: "volunteer.html"
            },

            {
                icon: '<i class="fa-solid fa-box-open"></i>',
                title: "Available Deliveries",
                url: "volunteer.html"
            },

            {
                icon: '<i class="fa-solid fa-map-location-dot"></i>',
                title: "My Deliveries",
                url: "my-deliveries.html"
            },

            {
                icon: '<i class="fa-solid fa-seedling"></i>',
                title: "My Impact",
                url: "volunteer.html"
            }

        ];

    }


    // ==================================
    // ADMIN
    // ==================================

    else if (
        role === "admin"
    ) {

        navigation = [

            {
                icon: '<i class="fa-solid fa-gear"></i>',
                title: "Admin Dashboard",
                url: "admin.html"
            }

        ];

    }


    // ==================================
    // DEFAULT
    // ==================================

    else {

        navigation = [

            {
                icon: '<i class="fa-solid fa-house"></i>',
                title: "MPower Home",
                url: "../index.html"
            }

        ];

    }


    profileNavigation.innerHTML =
        navigation
            .map(item => {

                return `

                    <a
                        href="${item.url}"
                        class="profile-nav-btn">

                        ${item.icon}

                        &nbsp;

                        ${item.title}

                    </a>

                `;

            })
            .join("");

}


// ======================================
// LOAD PROFILE FROM BACKEND
// ======================================

async function loadProfile() {

    try {

        const response =
            await fetch(
                `${API_URL}/profile`,
                {

                    method: "GET",

                    headers:
                        getAuthHeaders()

                }
            );


        const data =
            await response.json();


        // ==================================
        // TOKEN INVALID
        // ==================================

        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "currentUser"
            );

            window.location.href =
                "login.html";

            return;

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Could not load profile."
            );

        }


        // ==================================
        // UPDATE CURRENT USER
        // ==================================

        loggedInUser =
            data.user;


        localStorage.setItem(
            "currentUser",
            JSON.stringify(
                loggedInUser
            )
        );


        // ==================================
        // FORM
        // ==================================

        if (nameInput) {

            nameInput.value =
                loggedInUser.name || "";

        }


        if (emailInput) {

            emailInput.value =
                loggedInUser.email || "";

        }


        if (addressInput) {

            addressInput.value =
                loggedInUser.address || "";

        }


        if (phoneInput) {

            phoneInput.value =
                loggedInUser.phone || "";

        }


        // ==================================
        // HEADER
        // ==================================

        if (profileName) {

            profileName.textContent =
                loggedInUser.name ||
                "My Profile";

        }


        const roleName =
            getRoleName(
                loggedInUser.role
            );


        if (profileRole) {

            profileRole.textContent =
                roleName;

        }


        if (accountRole) {

            accountRole.textContent =
                roleName;

        }

        if (accountRoleDetail) {

            accountRoleDetail.textContent =
                roleName;

        }

        if (accountRoleValue) {

            accountRoleValue.textContent =
                roleName;

        }


        if (accountId) {

            accountId.textContent =
                loggedInUser.id ||
                "—";

        }

        if (accountIdDetail) {

            accountIdDetail.textContent =
                loggedInUser.id ||
                "—";

        }


        // ==================================
        // CREATION DATE
        // ==================================

        if (
            createdAt &&
            loggedInUser.createdAt
        ) {

            const date =
                new Date(
                    loggedInUser.createdAt
                );


            if (
                !Number.isNaN(
                    date.getTime()
                )
            ) {

                createdAt.textContent =
                    date.toLocaleDateString(
                        undefined,
                        {

                            year: "numeric",

                            month: "long",

                            day: "numeric"

                        }
                    );

            }

        }


        // ==================================
        // PROFILE IMAGE
        // ==================================

        if (profileImage) {

            if (
                loggedInUser.profileImage
            ) {

                profileImage.src =
                    loggedInUser.profileImage;

            }

            else {

                profileImage.src =
                    "../images/default-profile.png";

            }

        }


        // ==================================
        // LOCATION
        // ==================================

        if (
            locationStatus &&
            loggedInUser.location &&
            loggedInUser.location.lat !== null &&
            loggedInUser.location.lng !== null
        ) {

            locationStatus.textContent =
                "Location saved successfully";

        }


    } catch (error) {

        console.error(
            "Load profile error:",
            error
        );


        showMessage(
            "Could not load your profile.",
            "error",
            "Profile Error"
        );

    }

}


// ======================================
// SAVE PROFILE
// ======================================

if (profileForm) {

    profileForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                nameInput.value.trim();

            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();

            const address =
                addressInput.value.trim();

            const phone =
                phoneInput.value.trim();


            // ==================================
            // VALIDATION
            // ==================================

            if (!name) {

                showMessage(
                    "Please enter your name.",
                    "warning",
                    "Name Required"
                );

                return;

            }


            if (!email) {

                showMessage(
                    "Please enter your email address.",
                    "warning",
                    "Email Required"
                );

                return;

            }


            const submitButton =
                profileForm.querySelector(
                    "button[type='submit']"
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Saving...";

            }


            try {

                // ==================================
                // SEND TO BACKEND
                // ==================================

                const response =
                    await fetch(
                        `${API_URL}/profile`,
                        {

                            method: "PUT",

                            headers:
                                getAuthHeaders(),

                            body:
                                JSON.stringify({

                                    name,

                                    email,

                                    address,

                                    phone

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    showMessage(
                        data.message ||
                        "Could not update your profile.",
                        "error",
                        "Update Failed"
                    );

                    return;

                }


                // ==================================
                // UPDATE LOCAL USER SESSION
                // ==================================

                loggedInUser =
                    data.user;


                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(
                        loggedInUser
                    )
                );


                // ==================================
                // UPDATE UI
                // ==================================

                if (profileName) {

                    profileName.textContent =
                        loggedInUser.name;

                }


                if (profileRole) {

                    profileRole.textContent =
                        getRoleName(
                            loggedInUser.role
                        );

                }


                showMessage(
                    "Your profile has been updated successfully.",
                    "success",
                    "Profile Updated"
                );


            } catch (error) {

                console.error(
                    "Profile update error:",
                    error
                );


                showMessage(
                    "Could not connect to the MPower server.",
                    "error",
                    "Connection Error"
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Save Changes";

                }

            }

        }
    );

}


// ======================================
// PROFILE IMAGE
// ======================================

if (profileImageInput) {

    profileImageInput.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];


            if (!file) {

                return;

            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                showMessage(
                    "Please choose a valid image file.",
                    "warning",
                    "Invalid Image"
                );

                this.value = "";

                return;

            }


            if (
                file.size >
                2 * 1024 * 1024
            ) {

                showMessage(
                    "Please choose an image smaller than 2MB.",
                    "warning",
                    "Image Too Large"
                );

                this.value = "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                async function (event) {

                    const imageData =
                        event.target.result;


                    if (profileImage) {

                        profileImage.src =
                            imageData;

                    }


                    /*
                     * Temporary:
                     * We preview the image locally.
                     *
                     * Actual database image upload
                     * will be added with proper
                     * image storage later.
                     */

                    showMessage(
                        "Image preview updated. Database image storage will be added next.",
                        "success",
                        "Photo Preview"
                    );

                };


            reader.onerror =
                function () {

                    showMessage(
                        "We could not process that image.",
                        "error",
                        "Upload Failed"
                    );

                };


            reader.readAsDataURL(file);

        }
    );

}


// ======================================
// PASSWORD STRENGTH
// ======================================

function getPasswordStrength(
    password
) {

    let score = 0;


    if (
        password.length >= 8
    ) {

        score++;

    }


    if (
        /[A-Z]/.test(password)
    ) {

        score++;

    }


    if (
        /[a-z]/.test(password)
    ) {

        score++;

    }


    if (
        /[0-9]/.test(password)
    ) {

        score++;

    }


    return score;

}


// ======================================
// PASSWORD REQUIREMENTS
// ======================================

function updatePasswordRequirements(
    password
) {

    if (
        !lengthRequirement ||
        !uppercaseRequirement ||
        !lowercaseRequirement ||
        !numberRequirement
    ) {

        return;

    }


    lengthRequirement.classList.toggle(
        "valid",
        password.length >= 8
    );

    uppercaseRequirement.classList.toggle(
        "valid",
        /[A-Z]/.test(password)
    );

    lowercaseRequirement.classList.toggle(
        "valid",
        /[a-z]/.test(password)
    );

    numberRequirement.classList.toggle(
        "valid",
        /[0-9]/.test(password)
    );

}


// ======================================
// PASSWORD STRENGTH DISPLAY
// ======================================

function updatePasswordStrength() {

    if (
        !newPasswordInput ||
        !passwordStrengthBar ||
        !passwordStrengthText
    ) {

        return;

    }


    const password =
        newPasswordInput.value;


    updatePasswordRequirements(
        password
    );


    if (!password) {

        passwordStrengthBar.style.width =
            "0%";

        passwordStrengthText.textContent =
            "Password strength";

        return;

    }


    const strength =
        getPasswordStrength(
            password
        );


    if (strength === 1) {

        passwordStrengthBar.style.width =
            "25%";

        passwordStrengthText.textContent =
            "Weak";

    }

    else if (strength === 2) {

        passwordStrengthBar.style.width =
            "50%";

        passwordStrengthText.textContent =
            "Fair";

    }

    else if (strength === 3) {

        passwordStrengthBar.style.width =
            "75%";

        passwordStrengthText.textContent =
            "Good";

    }

    else {

        passwordStrengthBar.style.width =
            "100%";

        passwordStrengthText.textContent =
            "Strong";

    }

}


// ======================================
// PASSWORD MATCH
// ======================================

function updatePasswordMatch() {

    if (
        !confirmPasswordInput ||
        !passwordMatchMessage ||
        !newPasswordInput
    ) {

        return;

    }


    const password =
        newPasswordInput.value;

    const confirmation =
        confirmPasswordInput.value;


    if (!confirmation) {

        passwordMatchMessage.textContent =
            "";

        passwordMatchMessage.className =
            "";

        return;

    }


    if (
        password ===
        confirmation
    ) {

        passwordMatchMessage.textContent =
            "✓ Passwords match";

        passwordMatchMessage.className =
            "password-match-valid";

    }

    else {

        passwordMatchMessage.textContent =
            "Passwords do not match";

        passwordMatchMessage.className =
            "password-match-invalid";

    }

}


// ======================================
// PASSWORD VISIBILITY
// ======================================

document
    .querySelectorAll(
        ".toggle-password"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const targetId =
                    this.dataset.target;


                const input =
                    document.getElementById(
                        targetId
                    );


                if (!input) {

                    return;

                }


                if (
                    input.type ===
                    "password"
                ) {

                    input.type =
                        "text";

                    this.innerHTML =
                        '<i class="fa-regular fa-eye-slash"></i>';

                    this.setAttribute(
                        "aria-label",
                        "Hide password"
                    );

                }

                else {

                    input.type =
                        "password";

                    this.innerHTML =
                        '<i class="fa-regular fa-eye"></i>';

                    this.setAttribute(
                        "aria-label",
                        "Show password"
                    );

                }

            }
        );

    });


// ======================================
// PASSWORD LISTENERS
// ======================================

if (newPasswordInput) {

    newPasswordInput.addEventListener(
        "input",
        updatePasswordStrength
    );

}


if (confirmPasswordInput) {

    confirmPasswordInput.addEventListener(
        "input",
        updatePasswordMatch
    );

}


// ======================================
// CHANGE PASSWORD
// ======================================

if (changePasswordForm) {

    changePasswordForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const currentPassword =
                currentPasswordInput.value;

            const newPassword =
                newPasswordInput.value;

            const confirmPassword =
                confirmPasswordInput.value;


            // ==================================
            // VALIDATION
            // ==================================

            if (!currentPassword) {

                showMessage(
                    "Please enter your current password.",
                    "warning",
                    "Current Password Required"
                );

                return;

            }


            if (
                newPassword.length < 8
            ) {

                showMessage(
                    "Your new password must contain at least 8 characters.",
                    "warning",
                    "Password Too Short"
                );

                return;

            }


            if (
                !/[A-Z]/.test(
                    newPassword
                )
            ) {

                showMessage(
                    "Your password needs at least one uppercase letter.",
                    "warning",
                    "Uppercase Letter Required"
                );

                return;

            }


            if (
                !/[a-z]/.test(
                    newPassword
                )
            ) {

                showMessage(
                    "Your password needs at least one lowercase letter.",
                    "warning",
                    "Lowercase Letter Required"
                );

                return;

            }


            if (
                !/[0-9]/.test(
                    newPassword
                )
            ) {

                showMessage(
                    "Your password needs at least one number.",
                    "warning",
                    "Number Required"
                );

                return;

            }


            if (
                newPassword !==
                confirmPassword
            ) {

                showMessage(
                    "The new passwords do not match.",
                    "warning",
                    "Passwords Do Not Match"
                );

                return;

            }


            if (
                currentPassword ===
                newPassword
            ) {

                showMessage(
                    "Your new password must be different from your current password.",
                    "warning",
                    "Choose a New Password"
                );

                return;

            }


            const submitButton =
                changePasswordForm.querySelector(
                    "button[type='submit']"
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Changing Password...";

            }


            try {

                // ==================================
                // SEND PASSWORD CHANGE
                // ==================================

                const response =
                    await fetch(
                        `${API_URL}/password`,
                        {

                            method: "PUT",

                            headers:
                                getAuthHeaders(),

                            body:
                                JSON.stringify({

                                    currentPassword,

                                    newPassword

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    showMessage(
                        data.message ||
                        "Could not change your password.",
                        "error",
                        "Password Update Failed"
                    );

                    return;

                }


                // ==================================
                // RESET
                // ==================================

                changePasswordForm.reset();

                updatePasswordStrength();

                updatePasswordMatch();


                showMessage(
                    "Your password has been changed successfully.",
                    "success",
                    "Password Updated"
                );


            } catch (error) {

                console.error(
                    "Password update error:",
                    error
                );


                showMessage(
                    "Could not connect to the MPower server.",
                    "error",
                    "Connection Error"
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Change Password";

                }

            }

        }
    );

}


// ======================================
// LOCATION
// ======================================

if (setLocationBtn) {

    setLocationBtn.addEventListener(
        "click",
        function () {

            if (
                !navigator.geolocation
            ) {

                showMessage(
                    "Your browser does not support location.",
                    "warning",
                    "Location Error"
                );

                return;

            }


            setLocationBtn.disabled =
                true;

            setLocationBtn.textContent =
                "Getting Location...";


            navigator.geolocation.getCurrentPosition(

                async function (position) {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;


                    try {

                        const response =
                            await fetch(
                                `${API_URL}/location`,
                                {

                                    method: "PUT",

                                    headers:
                                        getAuthHeaders(),

                                    body:
                                        JSON.stringify({

                                            lat:
                                                latitude,

                                            lng:
                                                longitude

                                        })

                                }
                            );


                        const data =
                            await response.json();


                        if (!response.ok) {

                            throw new Error(
                                data.message ||
                                "Could not save location."
                            );

                        }


                        // ==================================
                        // UPDATE SESSION
                        // ==================================

                        loggedInUser.location =
                            data.location;


                        localStorage.setItem(
                            "currentUser",
                            JSON.stringify(
                                loggedInUser
                            )
                        );


                        if (locationStatus) {

                            locationStatus.textContent =
                                "Location saved successfully";

                        }


                        showMessage(
                            "Your location has been saved.",
                            "success",
                            "Location Updated"
                        );


                    } catch (error) {

                        console.error(
                            "Location update error:",
                            error
                        );


                        showMessage(
                            "Could not save your location.",
                            "error",
                            "Location Error"
                        );

                    }


                    setLocationBtn.disabled =
                        false;

                    setLocationBtn.textContent =
                        "Set My Location";

                },


                function () {

                    showMessage(
                        "Please allow location permission.",
                        "warning",
                        "Permission Needed"
                    );


                    setLocationBtn.disabled =
                        false;

                    setLocationBtn.textContent =
                        "Set My Location";

                }

            );

        }
    );

}


// ======================================
// LOGOUT MODAL
// ======================================

const logoutModal =
    document.getElementById(
        "logoutModal"
    );

const closeLogoutModal =
    document.getElementById(
        "closeLogoutModal"
    );

const cancelLogout =
    document.getElementById(
        "cancelLogout"
    );

const confirmLogout =
    document.getElementById(
        "confirmLogout"
    );


// ======================================
// OPEN LOGOUT MODAL
// ======================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            if (!logoutModal) {

                return;

            }

            logoutModal.classList.remove(
                "hidden"
            );

        }
    );

}


// ======================================
// CLOSE LOGOUT MODAL
// ======================================

function closeLogoutConfirmation() {

    if (!logoutModal) {

        return;

    }

    logoutModal.classList.add(
        "hidden"
    );

}


if (closeLogoutModal) {

    closeLogoutModal.addEventListener(
        "click",
        closeLogoutConfirmation
    );

}


if (cancelLogout) {

    cancelLogout.addEventListener(
        "click",
        closeLogoutConfirmation
    );

}


if (logoutModal) {

    logoutModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                logoutModal
            ) {

                closeLogoutConfirmation();

            }

        }
    );

}


// ======================================
// CONFIRM LOGOUT
// ======================================

if (confirmLogout) {

    confirmLogout.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "currentUser"
            );

            localStorage.removeItem(
                "token"
            );

            window.location.href =
                "login.html";

        }
    );

}


// ======================================
// INITIALIZE
// ======================================

generateRoleNavigation();

setupScrollReveal();

setup3DTilt();

loadProfile();


// ======================================
// SCROLL REVEAL
// ======================================

function setupScrollReveal() {

    const elements =
        document.querySelectorAll(
            ".profile-header, .profile-card, .logout-container"
        );


    if (!elements.length) {

        return;

    }


    const observer =
        new IntersectionObserver(

            function (entries) {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "reveal-visible"
                            );

                        }

                    }
                );

            },

            {
                threshold: 0.15
            }

        );


    elements.forEach(
        element => {

            observer.observe(
                element
            );

        }
    );

}


// ======================================
// 3D MOUSE TILT
// ======================================

function setup3DTilt() {

    const cards =
        document.querySelectorAll(
            ".profile-header, .profile-card"
        );


    cards.forEach(card => {

        card.addEventListener(
            "mousemove",
            function (event) {

                if (
                    window.innerWidth <
                    800
                ) {

                    return;

                }


                const rect =
                    card.getBoundingClientRect();


                const x =
                    event.clientX -
                    rect.left;

                const y =
                    event.clientY -
                    rect.top;


                const centerX =
                    rect.width / 2;

                const centerY =
                    rect.height / 2;


                const rotateY =
                    (
                        (x - centerX) /
                        centerX
                    ) * 2.5;


                const rotateX =
                    (
                        (centerY - y) /
                        centerY
                    ) * 2.5;


                card.style.transform = `

                    perspective(1200px)

                    rotateX(${rotateX}deg)

                    rotateY(${rotateY}deg)

                    translateY(-3px)

                `;

            }
        );


        card.addEventListener(
            "mouseleave",
            function () {

                card.style.transform =
                    "";

            }
        );

    });

}


// ======================================
// DEBUG
// ======================================

console.log(
    "MPower Backend Profile initialized."
);

console.log(
    "Current User:",
    loggedInUser
);