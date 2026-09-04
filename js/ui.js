// ======================================
// MPower - UI Notifications
// ======================================


// ======================================
// CREATE UI
// ======================================

function createUI() {

    if (document.getElementById("mpowerNotification")) {
        return;
    }

    const notification = document.createElement("div");

    notification.id = "mpowerNotification";

    notification.innerHTML = `

        <div class="mpower-notification-box">

            <div
                class="mpower-notification-icon"
                id="mpowerNotificationIcon">
                ✓
            </div>

            <div class="mpower-notification-content">

                <h3 id="mpowerNotificationTitle">
                    Success
                </h3>

                <p id="mpowerNotificationMessage">
                    Action completed successfully.
                </p>

            </div>

            <button
                type="button"
                id="mpowerNotificationClose">
                ×
            </button>

        </div>

    `;

    document.body.appendChild(notification);


    // Close button

    document
        .getElementById("mpowerNotificationClose")
        .addEventListener("click", hideMessage);

}


// ======================================
// SHOW MESSAGE
// ======================================

function showMessage(
    message,
    type = "success",
    title = ""
) {

    createUI();

    const notification =
        document.getElementById(
            "mpowerNotification"
        );

    const icon =
        document.getElementById(
            "mpowerNotificationIcon"
        );

    const notificationTitle =
        document.getElementById(
            "mpowerNotificationTitle"
        );

    const notificationMessage =
        document.getElementById(
            "mpowerNotificationMessage"
        );


    // Remove previous types

    notification.classList.remove(
        "success",
        "error",
        "warning",
        "info"
    );


    // Add current type

    notification.classList.add(type);


    // Icons

    const icons = {

        success: "✓",

        error: "!",

        warning: "⚠",

        info: "i"

    };


    icon.textContent =
        icons[type] || "✓";


    // Titles

    const titles = {

        success: "Success",

        error: "Something went wrong",

        warning: "Warning",

        info: "Information"

    };


    notificationTitle.textContent =
        title || titles[type];


    notificationMessage.textContent =
        message;


    notification.classList.add("show");


    // Automatically disappear

    clearTimeout(
        window.mpNotificationTimer
    );


    window.mpNotificationTimer =
        setTimeout(() => {

            hideMessage();

        }, 4000);

}


// ======================================
// HIDE MESSAGE
// ======================================

function hideMessage() {

    const notification =
        document.getElementById(
            "mpowerNotification"
        );

    if (!notification) return;

    notification.classList.remove(
        "show"
    );

}


// ======================================
// CONFIRM MODAL
// ======================================

function showConfirm(
    message,
    onConfirm,
    title = "Are you sure?"
) {

    const existing =
        document.getElementById(
            "mpowerConfirmModal"
        );

    if (existing) {

        existing.remove();

    }


    const modal =
        document.createElement("div");

    modal.id =
        "mpowerConfirmModal";


    modal.innerHTML = `

        <div class="mpower-confirm-box">

            <div class="mpower-confirm-icon">
                ?
            </div>

            <h3>
                ${title}
            </h3>

            <p>
                ${message}
            </p>

            <div class="mpower-confirm-actions">

                <button
                    type="button"
                    class="mpower-cancel-btn"
                    id="mpowerCancelConfirm">

                    Cancel

                </button>

                <button
                    type="button"
                    class="mpower-confirm-btn"
                    id="mpowerAcceptConfirm">

                    Yes, Continue

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    // Cancel

    document
        .getElementById(
            "mpowerCancelConfirm"
        )
        .addEventListener(
            "click",
            () => {

                modal.remove();

            }
        );


    // Confirm

    document
        .getElementById(
            "mpowerAcceptConfirm"
        )
        .addEventListener(
            "click",
            () => {

                modal.remove();

                onConfirm();

            }
        );


    // Click outside

    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {

                modal.remove();

            }

        }
    );

}