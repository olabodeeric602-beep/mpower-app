// ======================================
// MPower - Admin Authentication
// ======================================

// ===============================
// Get Current User
// ===============================

const adminUser = JSON.parse(
    localStorage.getItem("currentUser")
);

// ===============================
// Check Login
// ===============================

if (!adminUser) {

    alert("Please log in first.");

    window.location.href = "login.html";

}


// ===============================
// Check Admin Role
// ===============================

if (
    adminUser &&
    adminUser.role !== "admin"
) {

    alert("Access denied. Admins only.");

    window.location.href = "my-donations.html";

}