// ======================================
// MPower - Authentication Guard
// ======================================

(function () {

    const loggedInUser = JSON.parse(
        localStorage.getItem("currentUser")
    );

    if (!loggedInUser) {
        showMessage(
            `You are not logged in. Please log in to access this page.👀`

        );

        window.location.href = "login.html";

    }

})();