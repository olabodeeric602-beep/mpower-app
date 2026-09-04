// ======================================
// MPower - Notifications System
// Shared Notification Manager
// ======================================


// ======================================
// CURRENT USER
// ======================================

const notificationUser =
    JSON.parse(
        localStorage.getItem("currentUser")
    );


// ======================================
// STORAGE KEY
// ======================================

const NOTIFICATIONS_KEY =
    "notifications";


// ======================================
// LOAD NOTIFICATIONS
// ======================================

function getNotifications() {

    try {

        return JSON.parse(
            localStorage.getItem(
                NOTIFICATIONS_KEY
            )
        ) || [];

    }

    catch (error) {

        console.error(
            "Could not load notifications:",
            error
        );

        return [];

    }

}


// ======================================
// SAVE NOTIFICATIONS
// ======================================

function saveNotifications(
    notifications
) {

    localStorage.setItem(
        NOTIFICATIONS_KEY,
        JSON.stringify(notifications)
    );

}


// ======================================
// CREATE NOTIFICATION
// ======================================

function createNotification({

    userId,
    role,
    type,
    title,
    message,
    relatedId = null,
    relatedType = null

}) {

    if (
        userId === undefined ||
        userId === null
    ) {

        console.warn(
            "Notification requires a userId."
        );

        return null;

    }


    const notifications =
        getNotifications();


    const notification = {

        id:
            Date.now() +
            Math.floor(
                Math.random() * 1000
            ),

        userId:
            Number(userId),

        role:
            role || "",

        type:
            type || "general",

        title:
            title || "MPower Notification",

        message:
            message || "",

        relatedId:
            relatedId !== null
                ? Number(relatedId)
                : null,

        relatedType:
            relatedType || null,

        read:
            false,

        createdAt:
            new Date().toISOString()

    };


    notifications.unshift(
        notification
    );


    saveNotifications(
        notifications
    );


    // Refresh notification UI
    window.dispatchEvent(
        new CustomEvent(
            "mpowerNotificationsUpdated"
        )
    );


    return notification;

}


// ======================================
// GET CURRENT USER NOTIFICATIONS
// ======================================

function getMyNotifications() {

    if (!notificationUser) {

        return [];

    }


    return getNotifications()
        .filter(
            notification => {

                return (
                    Number(
                        notification.userId
                    ) ===
                    Number(
                        notificationUser.id
                    )
                );

            }
        );

}


// ======================================
// GET UNREAD NOTIFICATIONS
// ======================================

function getUnreadNotifications() {

    return getMyNotifications()
        .filter(
            notification =>
                notification.read !== true
        );

}


// ======================================
// GET UNREAD COUNT
// ======================================

function getUnreadNotificationCount() {

    return getUnreadNotifications()
        .length;

}


// ======================================
// MARK NOTIFICATION AS READ
// ======================================

function markNotificationAsRead(
    notificationId
) {

    const notifications =
        getNotifications();


    const index =
        notifications.findIndex(
            notification =>

                Number(
                    notification.id
                ) ===
                Number(
                    notificationId
                )

                &&

                Number(
                    notification.userId
                ) ===
                Number(
                    notificationUser?.id
                )
        );


    if (index === -1) {

        return;

    }


    notifications[index] = {

        ...notifications[index],

        read: true,

        readAt:
            new Date().toISOString()

    };


    saveNotifications(
        notifications
    );


    refreshNotificationUI();

}


// ======================================
// MARK ALL AS READ
// ======================================

function markAllNotificationsAsRead() {

    if (!notificationUser) {

        return;

    }


    const notifications =
        getNotifications();


    const now =
        new Date().toISOString();


    const updated =
        notifications.map(
            notification => {

                if (
                    Number(
                        notification.userId
                    ) !==
                    Number(
                        notificationUser.id
                    )
                ) {

                    return notification;

                }


                return {

                    ...notification,

                    read: true,

                    readAt:
                        notification.readAt ||
                        now

                };

            }
        );


    saveNotifications(
        updated
    );


    refreshNotificationUI();

}


// ======================================
// DELETE NOTIFICATION
// ======================================

function deleteNotification(
    notificationId
) {

    if (!notificationUser) {

        return;

    }


    const notifications =
        getNotifications();


    const updated =
        notifications.filter(
            notification => {

                return !(
                    Number(
                        notification.id
                    ) ===
                    Number(
                        notificationId
                    )

                    &&

                    Number(
                        notification.userId
                    ) ===
                    Number(
                        notificationUser.id
                    )
                );

            }
        );


    saveNotifications(
        updated
    );


    refreshNotificationUI();

}


// ======================================
// DELETE ALL MY NOTIFICATIONS
// ======================================

function clearMyNotifications() {

    if (!notificationUser) {

        return;

    }


    const notifications =
        getNotifications();


    const updated =
        notifications.filter(
            notification => {

                return (
                    Number(
                        notification.userId
                    ) !==
                    Number(
                        notificationUser.id
                    )
                );

            }
        );


    saveNotifications(
        updated
    );


    refreshNotificationUI();

}


// ======================================
// FORMAT NOTIFICATION TIME
// ======================================

function formatNotificationTime(
    dateValue
) {

    if (!dateValue) {

        return "Unknown time";

    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Unknown time";

    }


    const now =
        new Date();


    const difference =
        now.getTime() -
        date.getTime();


    const seconds =
        Math.floor(
            difference / 1000
        );


    if (seconds < 60) {

        return "Just now";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    if (minutes < 60) {

        return `${minutes}m ago`;

    }


    const hours =
        Math.floor(
            minutes / 60
        );


    if (hours < 24) {

        return `${hours}h ago`;

    }


    const days =
        Math.floor(
            hours / 24
        );


    if (days < 7) {

        return `${days}d ago`;

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
// NOTIFICATION ICON
// ======================================

function getNotificationIcon(
    type
) {

    switch (type) {

        case "new_request":
            return '<i class="fa-solid fa-envelope-open-text"></i>';

        case "request_accepted":
            return '<i class="fa-solid fa-circle-check"></i>';

        case "request_rejected":
            return '<i class="fa-solid fa-circle-xmark"></i>';

        case "volunteer_assigned":
            return '<i class="fa-solid fa-truck-fast"></i>';

        case "delivery_accepted":
            return '<i class="fa-solid fa-truck-fast"></i>';

        case "food_picked_up":
            return '<i class="fa-solid fa-box-open"></i>';

        case "awaiting_confirmation":
            return '<i class="fa-solid fa-building-user"></i>';

        case "receipt_confirmed":
            return '<i class="fa-solid fa-party-horn"></i>';

        case "delivery_completed":
            return '<i class="fa-solid fa-circle-check"></i>';

        default:
            return '<i class="fa-solid fa-bell"></i>';

    }

}


// ======================================
// NOTIFICATION HTML
// ======================================

function createNotificationElement(
    notification
) {

    const item =
        document.createElement(
            "article"
        );


    item.className =
        "notification-item";


    if (
        notification.read !== true
    ) {

        item.classList.add(
            "unread"
        );

    }


    item.dataset.id =
        notification.id;


    item.innerHTML = `

        <div class="notification-icon">

            ${getNotificationIcon(
                notification.type
            )}

        </div>


        <div class="notification-content">

            <strong>

                ${escapeNotificationHTML(
                    notification.title
                )}

            </strong>


            <p>

                ${escapeNotificationHTML(
                    notification.message
                )}

            </p>


            <span class="notification-time">

                ${formatNotificationTime(
                    notification.createdAt
                )}

            </span>

        </div>


        ${
            notification.read !== true

                ?

                `

                <span
                    class="notification-unread-dot">

                </span>

                `

                :

                ""

        }

    `;


    item.addEventListener(
        "click",
        function () {

            if (
                notification.read !== true
            ) {

                markNotificationAsRead(
                    notification.id
                );

            }

        }
    );


    return item;

}


// ======================================
// ESCAPE HTML
// ======================================

function escapeNotificationHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ======================================
// CREATE NOTIFICATION UI
// ======================================

function createNotificationUI() {

    if (!notificationUser) {

        return;

    }


    // Prevent duplicates

    if (
        document.getElementById(
            "mpowerNotificationWrapper"
        )
    ) {

        return;

    }


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.id =
        "mpowerNotificationWrapper";


    wrapper.innerHTML = `

        <button
            type="button"
            id="mpowerNotificationButton"
            class="mpower-notification-button"
            aria-label="Notifications">

            🔔

            <span
                id="mpowerNotificationCount"
                class="mpower-notification-count hidden">

                0

            </span>

        </button>


        <div
            id="mpowerNotificationPanel"
            class="mpower-notification-panel hidden">


            <div class="notification-panel-header">

                <div>

                    <span class="notification-panel-label">
                        MPower
                    </span>

                    <h3>
                        Notifications
                    </h3>

                </div>


                <button
                    type="button"
                    id="markAllNotificationsRead">

                    Mark all as read

                </button>

            </div>


            <div
                id="mpowerNotificationList"
                class="notification-list">

            </div>


            <div
                id="mpowerNotificationEmpty"
                class="notification-empty hidden">

                <div>
                    🔔
                </div>

                <strong>
                    You're all caught up
                </strong>

                <p>
                    No new notifications right now.
                </p>

            </div>

        </div>

    `;


    document.body.appendChild(
        wrapper
    );


    const button =
        document.getElementById(
            "mpowerNotificationButton"
        );


    const panel =
        document.getElementById(
            "mpowerNotificationPanel"
        );


    const markAllButton =
        document.getElementById(
            "markAllNotificationsRead"
        );


    button.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            panel.classList.toggle(
                "hidden"
            );

        }
    );


    markAllButton.addEventListener(
        "click",
        function () {

            markAllNotificationsAsRead();

        }
    );


    document.addEventListener(
        "click",
        function (event) {

            if (
                !wrapper.contains(
                    event.target
                )
            ) {

                panel.classList.add(
                    "hidden"
                );

            }

        }
    );


    refreshNotificationUI();

}


// ======================================
// REFRESH NOTIFICATION UI
// ======================================

function refreshNotificationUI() {

    const list =
        document.getElementById(
            "mpowerNotificationList"
        );


    const count =
        document.getElementById(
            "mpowerNotificationCount"
        );


    const empty =
        document.getElementById(
            "mpowerNotificationEmpty"
        );


    if (
        !list ||
        !count ||
        !empty
    ) {

        return;

    }


    const notifications =
        getMyNotifications();


    const unread =
        getUnreadNotificationCount();


    list.innerHTML =
        "";


    // ==================================
    // COUNT
    // ==================================

    if (unread > 0) {

        count.textContent =
            unread > 99
                ? "99+"
                : unread;


        count.classList.remove(
            "hidden"
        );

    }

    else {

        count.textContent =
            "0";


        count.classList.add(
            "hidden"
        );

    }


    // ==================================
    // EMPTY STATE
    // ==================================

    if (
        notifications.length === 0
    ) {

        empty.classList.remove(
            "hidden"
        );

        return;

    }


    empty.classList.add(
        "hidden"
    );


    // ==================================
    // DISPLAY
    // ==================================

    notifications
        .slice(0, 20)
        .forEach(
            notification => {

                list.appendChild(
                    createNotificationElement(
                        notification
                    )
                );

            }
        );

}


// ======================================
// LISTEN FOR LOCAL STORAGE CHANGES
// ======================================

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            NOTIFICATIONS_KEY
        ) {

            refreshNotificationUI();

        }

    }
);


// ======================================
// LISTEN FOR INTERNAL UPDATES
// ======================================

window.addEventListener(
    "mpowerNotificationsUpdated",
    function () {

        refreshNotificationUI();

    }
);


// ======================================
// INITIALIZE
// ======================================

if (notificationUser) {

    createNotificationUI();

}


console.log(
    "MPower Notifications initialized."
);