// ======================================
// MPower - Sign Up
// ======================================
// ===============================
// DOM Elements
// ===============================
const roleButtons = document.querySelectorAll(".role-btn");
const formContainer = document.getElementById("formContainer");
const MANAGEMENT_PASSWORD = "Ricky_pass1";
let selectedRole = "restaurant";
// ===============================
// Form Templates
// ===============================
const forms = {
restaurant: `
    <form id="signupForm" class="signup-form">

        <div class="input-group">
            <label>Restaurant Name</label>
            <input
                type="text"
                id="name"
                required>
        </div>

        <div class="input-group">
            <label>Business Email</label>
            <input
                type="email"
                id="email"
                required>
        </div>

        <div class="input-group">
            <label>Restaurant Address</label>
            <input
                type="text"
                id="address"
                required>
        </div>

        <div class="input-group">
            <label>Password</label>
            <input
                type="password"
                id="password"
                required>
        </div>

        <div class="input-group">
            <label>Confirm Password</label>
            <input
                type="password"
                id="confirmPassword"
                required>
        </div>

        <button type="submit">
            Create Account
        </button>

    </form>
`,

charity: `
    <form id="signupForm" class="signup-form">

        <div class="input-group">
            <label>Organization Name</label>
            <input
                type="text"
                id="name"
                required>
        </div>

        <div class="input-group">
            <label>Email Address</label>
            <input
                type="email"
                id="email"
                required>
        </div>

        <div class="input-group">
            <label>Location</label>
            <input
                type="text"
                id="address"
                required>
        </div>

        <div class="input-group">
            <label>Password</label>
            <input
                type="password"
                id="password"
                required>
        </div>

        <div class="input-group">
            <label>Confirm Password</label>
            <input
                type="password"
                id="confirmPassword"
                required>
        </div>

        <button type="submit">
            Create Account
        </button>

    </form>
`,

volunteer: `
    <form id="signupForm" class="signup-form">

        <div class="input-group">
            <label>Full Name</label>
            <input
                type="text"
                id="name"
                required>
        </div>

        <div class="input-group">
            <label>Email Address</label>
            <input
                type="email"
                id="email"
                required>
        </div>

        <div class="input-group">
            <label>Phone Number</label>
            <input
                type="text"
                id="phone"
                required>
        </div>

        <div class="input-group">
            <label>Password</label>
            <input
                type="password"
                id="password"
                required>
        </div>

        <div class="input-group">
            <label>Confirm Password</label>
            <input
                type="password"
                id="confirmPassword"
                required>
        </div>

        <button type="submit">
            Create Account
        </button>

    </form>
`,

admin: `
    <form id="signupForm" class="signup-form">

        <div class="input-group">
            <label>Admin Name</label>
            <input
                type="text"
                id="name"
                required>
        </div>

        <div class="input-group">
            <label>Work Email</label>
            <input
                type="email"
                id="email"
                required>
        </div>

        <div class="input-group">
            <label>Admin Office / Location</label>
            <input
                type="text"
                id="address"
                required>
        </div>

        <div class="input-group">
            <label>Management Verification Password</label>
            <input
                type="password"
                id="managementPassword"
                placeholder="Enter management password"
                required>
        </div>

        <div class="input-group">
            <label>Password</label>
            <input
                type="password"
                id="password"
                required>
        </div>

        <div class="input-group">
            <label>Confirm Password</label>
            <input
                type="password"
                id="confirmPassword"
                required>
        </div>

        <button type="submit">
            Create Admin Account
        </button>

    </form>
`
};
// ===============================
// Load Form
// ===============================
function loadForm(role) {
selectedRole = role;

formContainer.innerHTML = forms[role];

setupForm();
}
loadForm("restaurant");
// ===============================
// Role Buttons
// ===============================
roleButtons.forEach(button => {
button.addEventListener("click", () => {

    roleButtons.forEach(btn => {

        btn.classList.remove("active");

    });

    button.classList.add("active");

    loadForm(button.dataset.role);

});
});
// ===============================
// Form Logic
// ===============================
async function setupForm() {
const form =
    document.getElementById("signupForm");


form.addEventListener(
    "submit",
    async function(event){

        event.preventDefault();


        const name =
            document.getElementById("name")
            .value
            .trim();


        const email =
            document.getElementById("email")
            .value
            .trim()
            .toLowerCase();


        const password =
            document.getElementById("password")
            .value;


        const confirmPassword =
            document.getElementById("confirmPassword")
            .value;


        const address =
            document.getElementById("address");


        const phone =
            document.getElementById("phone");


        const submitButton =
            form.querySelector("button");



        if(
            !name ||
            !email ||
            !password ||
            !confirmPassword
        ){

            showMessage(
                "Please fill in all required fields.",
                "warning",
                "Missing Information"
            );

            return;

        }



        if(password !== confirmPassword){

            showMessage(
                "The passwords you entered do not match.",
                "error",
                "Password Error"
            );

            return;

        }



        if(password.length < 8){

            showMessage(
                "Password must contain at least 8 characters.",
                "warning",
                "Weak Password"
            );

            return;

        }



        if(!/[A-Z]/.test(password)){

            showMessage(
                "Password needs at least one uppercase letter.",
                "warning",
                "Uppercase Required"
            );

            return;

        }



        if(!/[a-z]/.test(password)){

            showMessage(
                "Password needs at least one lowercase letter.",
                "warning",
                "Lowercase Required"
            );

            return;

        }



        if(!/[0-9]/.test(password)){

            showMessage(
                "Password needs at least one number.",
                "warning",
                "Number Required"
            );

            return;

        }



        // ======================================
        // CREATE ACCOUNT THROUGH BACKEND
        // ======================================

        submitButton.disabled = true;

        submitButton.textContent =
            "Creating Account...";


        const userData = {

            name,

            email,

            password,

            role: selectedRole,

            address:
                address
                    ? address.value.trim()
                    : "",

            phone:
                phone
                    ? phone.value.trim()
                    : "",

            managementPassword:
                selectedRole === "admin"
                    ? managementPassword?.value.trim() || ""
                    : ""

        };


        try {

            const response =
                await fetch(
                    `${window.MPOWER_API_BASE_URL}/auth/signup`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                userData
                            )

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                showMessage(
                    data.message ||
                    "Unable to create your account.",
                    "error",
                    "Signup Failed"
                );

                submitButton.disabled = false;

                submitButton.textContent =
                    "Create Account";

                return;

            }


            // ==================================
            // SUCCESS
            // ==================================

            showMessage(
                "Your MPower account has been created successfully.",
                "success",
                "Account Created"
            );


            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 1500);


        } catch (error) {

            console.error(
                "Signup request failed:",
                error
            );


            showMessage(
                "Could not connect to the MPower server. Please try again.",
                "error",
                "Connection Error"
            );


            submitButton.disabled = false;

            submitButton.textContent =
                "Create Account";

        }

    }

);
}