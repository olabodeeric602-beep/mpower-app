// ======================================
// MPower - Login
// ======================================

"use strict";

// ===============================
// DOM Elements
// ===============================

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");


// ===============================
// Login
// ===============================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();


            const password =
                passwordInput.value;


            // ===============================
            // Basic Validation
            // ===============================

            if (!email || !password) {

                showMessage(
                    "Please enter your email and password.",
                    "warning",
                    "Missing Information"
                );

                return;
            }


            // ===============================
            // Disable Button
            // ===============================

            const submitButton =
                loginForm.querySelector(
                    "button[type='submit']"
                );

            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Logging in...";

            }


            try {

                // ===============================
                // Send Login Request
                // ===============================

                const response =
                    await fetch(
                        `${window.MPOWER_API_BASE_URL}/auth/login`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                email,

                                password

                            })

                        }
                    );


                const data =
                    await response.json();


                // ===============================
                // Login Failed
                // ===============================

                if (!response.ok) {

                    showMessage(
                        data.message ||
                        "The email or password you entered is incorrect.",
                        "error",
                        "Login Failed"
                    );


                    if (submitButton) {

                        submitButton.disabled = false;

                        submitButton.textContent =
                            "Login";

                    }

                    return;
                }


                // ===============================
                // Save JWT
                // ===============================

                localStorage.setItem(
                    "token",
                    data.token
                );


                // ===============================
                // Save Current User
                // ===============================

                const currentUser = {

                    id: data.user.id,

                    role: data.user.role,

                    name: data.user.name,

                    email: data.user.email,

                    address:
                        data.user.address || "",

                    phone:
                        data.user.phone || "",

                    location: {

                        lat: null,

                        lng: null

                    }

                };


                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(
                        currentUser
                    )
                );


                // ===============================
                // Welcome Message
                // ===============================

                showMessage(
                    `Welcome back, ${currentUser.name}!`,
                    "success",
                    "Login Successful"
                );


                // ===============================
                // Redirect
                // ===============================

                setTimeout(
                    () => {

                        if (
                            currentUser.role ===
                            "admin"
                        ) {

                            window.location.href =
                                "admin.html";

                        }

                        else {

                            window.location.href =
                                "profile.html";

                        }

                    },
                    1500
                );


            } catch (error) {

                console.error(
                    "Login request failed:",
                    error
                );


                showMessage(
                    "Could not connect to the MPower server. Please make sure the backend is running.",
                    "error",
                    "Connection Error"
                );


                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        "Login";

                }

            }

        }
    );

}