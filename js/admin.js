// ======================================
// MPower - Admin Dashboard
// ======================================


// ======================================
// ADMIN PROTECTION
// ======================================

const currentUser =
    JSON.parse(
        localStorage.getItem("currentUser")
    );


// Check login

if (!currentUser) {

    window.location.href =
        "login.html";

    throw new Error("Not logged in");

}


// Check admin role

if (currentUser.role !== "admin") {

    showMessage(
        "You do not have permission to access this page.",
        "error",
        "Access Denied"
    );


    setTimeout(() => {

        window.location.href =
            "profile.html";

    }, 1500);


    throw new Error("Admin access required");

}



// ======================================
// API CONFIGURATION
// ======================================

const API_BASE_URL = window.MPOWER_API_BASE_URL;

const authToken = localStorage.getItem("token");

function getUserId(user) {
    if (!user) return "";
    return String(user._id || user.id || "");
}

function isSameUser(userA, userB) {
    return getUserId(userA) === getUserId(userB);
}


// ======================================
// DOM ELEMENTS
// ======================================


const usersTableBody =
    document.getElementById("usersTableBody");


const emptyUsers =
    document.getElementById("emptyUsers");


const totalUsers =
    document.getElementById("totalUsers");


const totalRestaurants =
    document.getElementById("totalRestaurants");


const totalCharities =
    document.getElementById("totalCharities");


const totalVolunteers =
    document.getElementById("totalVolunteers");


const searchUsers =
    document.getElementById("searchUsers");


const roleFilter =
    document.getElementById("roleFilter");



    const totalDonations =
    document.getElementById("totalDonations");


const availableDonations =
    document.getElementById("availableDonations");


const claimedDonations =
    document.getElementById("claimedDonations");


const expiringDonations =
    document.getElementById("expiringDonations");

// ======================================
// EDIT MODAL
// ======================================


const editUserModal =
    document.getElementById("editUserModal");


const editUserForm =
    document.getElementById("editUserForm");


const closeEditModal =
    document.getElementById("closeEditModal");


const cancelEdit =
    document.getElementById("cancelEdit");


const editUserId =
    document.getElementById("editUserId");


const editName =
    document.getElementById("editName");


const editEmail =
    document.getElementById("editEmail");


const editRole =
    document.getElementById("editRole");


const editAddress =
    document.getElementById("editAddress");


const editPhone =
    document.getElementById("editPhone");



// ======================================
// DELETE MODAL
// ======================================


const deleteUserModal =
    document.getElementById("deleteUserModal");


const deleteUserName =
    document.getElementById("deleteUserName");


const cancelDelete =
    document.getElementById("cancelDelete");


const confirmDelete =
    document.getElementById("confirmDelete");



// ======================================
// LOGOUT
// ======================================


const logoutBtn =
    document.getElementById("logoutBtn");



// ======================================
// LOAD USERS
// ======================================


let users = [];

let allDonations = [];


// ======================================
// USER TO DELETE
// ======================================


let userToDelete = null;


// ======================================
// LOAD USERS FROM API
// ======================================

async function loadUsersFromAPI() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/auth/users`,
            {
                headers: {
                    "Authorization": `Bearer ${authToken}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        users = data.users || [];
        return users;

    } catch (error) {

        console.error("Failed to load users:", error);
        showMessage(
            "Could not load users. Please refresh.",
            "error",
            "Load Error"
        );
        return [];

    }

}


// ======================================
// LOAD DONATIONS FROM API
// ======================================

async function loadDonationsFromAPI() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/donations`,
            {
                headers: {
                    "Authorization": `Bearer ${authToken}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        allDonations = data.donations || [];
        return allDonations;

    } catch (error) {

        console.error("Failed to load donations:", error);
        showMessage(
            "Could not load donations. Please refresh.",
            "error",
            "Load Error"
        );
        return [];

    }

}
// ======================================
// UPDATE STATISTICS
// ======================================

async function updateStatistics() {

    await loadUsersFromAPI();
    await loadDonationsFromAPI();

    const donations = allDonations;



if(totalDonations){

    totalDonations.textContent =
        donations.length;

}



if(availableDonations){

    availableDonations.textContent =
        donations.filter(
            donation =>
                String(donation.status || "")
                    .trim()
                    .toLowerCase() === "available"
        ).length;

}



if(claimedDonations){

    claimedDonations.textContent =
        donations.filter(
            donation =>
                String(donation.status || "")
                    .trim()
                    .toLowerCase() !== "available"
        ).length;

}



if(expiringDonations){

    const today =
        new Date();

    today.setHours(0, 0, 0, 0);


    expiringDonations.textContent =
        donations.filter(donation=>{


            const expiry =
                new Date(`${donation.expiry}T00:00:00`);

            if (Number.isNaN(expiry.getTime())) {
                return false;
            }

            expiry.setHours(0, 0, 0, 0);


            const days =
                (expiry - today)
                /
                (1000*60*60*24);


            return days <= 3 && days >= 0;


        }).length;

}

    if(totalUsers){

        totalUsers.textContent =
            users.length;

    }


    if(totalRestaurants){

        totalRestaurants.textContent =
            users.filter(user =>
                user.role === "restaurant"
            ).length;

    }


    if(totalCharities){

        totalCharities.textContent =
            users.filter(user =>
                user.role === "charity"
            ).length;

    }


    if(totalVolunteers){

        totalVolunteers.textContent =
            users.filter(user =>
                user.role === "volunteer"
            ).length;

    }

}



// ======================================
// FORMAT ROLE
// ======================================

function formatRole(role){

    const roles = {

        restaurant:"Restaurant",

        charity:"Charity",

        volunteer:"Volunteer",

        admin:"Admin"

    };


    return roles[role] || "Unknown";

}



// ======================================
// FORMAT DATE
// ======================================

function formatDate(date){

    if(!date){

        return "N/A";

    }


    const newDate =
        new Date(date);


    if(
        Number.isNaN(
            newDate.getTime()
        )
    ){

        return "N/A";

    }


    return newDate.toLocaleDateString(
        "en-US",
        {
            year:"numeric",
            month:"short",
            day:"numeric"
        }
    );

}



// ======================================
// ESCAPE HTML
// ======================================

function escapeHTML(value){

    return String(value)

        .replace(/&/g,"&amp;")

        .replace(/</g,"&lt;")

        .replace(/>/g,"&gt;")

        .replace(/"/g,"&quot;")

        .replace(/'/g,"&#039;");

}



// ======================================
// DISPLAY USERS
// ======================================

function displayUsers(){


    if(!usersTableBody){

        return;

    }


    const searchTerm =
        searchUsers.value
        .trim()
        .toLowerCase();



    const selectedRole =
        roleFilter.value;



    const filteredUsers =
        users.filter(user => {


            const name =
                String(user.name || "")
                .toLowerCase();



            const email =
                String(user.email || "")
                .toLowerCase();



            const matchesSearch =
                name.includes(searchTerm) ||
                email.includes(searchTerm);



            const matchesRole =
                selectedRole === "" ||
                user.role === selectedRole;



            return (
                matchesSearch &&
                matchesRole
            );


        });



    usersTableBody.innerHTML = "";



    if(filteredUsers.length === 0){


        if(emptyUsers){

            emptyUsers.style.display =
                "block";

        }


        return;

    }



    if(emptyUsers){

        emptyUsers.style.display =
            "none";

    }




    filteredUsers.forEach(user => {


        const row =
            document.createElement("tr");



        const isCurrentAdmin =
            isSameUser(user, currentUser);



        row.innerHTML = `


        <td>

            <strong>
                ${escapeHTML(
                    user.name || "Unnamed"
                )}
            </strong>

        </td>


        <td>

            ${escapeHTML(
                user.email || "No email"
            )}

        </td>


        <td>

            <span class="role-badge">

                ${formatRole(user.role)}

            </span>

        </td>


        <td>

            ${escapeHTML(
                user.phone || "Not provided"
            )}

        </td>


        <td>

            ${formatDate(
                user.createdAt
            )}

        </td>


        <td>

            <div class="table-actions">


                <button
                class="edit-user-btn"
                data-id="${getUserId(user)}">

                    ✏ Edit

                </button>



                <button
                class="delete-user-btn"
                data-id="${getUserId(user)}"
                ${isCurrentAdmin ? "disabled":""}>

                    🗑 Delete

                </button>


            </div>


        </td>


        `;


        usersTableBody.appendChild(row);


    });


}
// ======================================
// OPEN EDIT MODAL
// ======================================

function openEditModal(user){

    if(
    isSameUser(user, currentUser)
){

    editRole.disabled = true;

}
else{

    editRole.disabled = false;

}

    if(!user) return;


    editUserId.value =
        getUserId(user);


    editName.value =
        user.name || "";


    editEmail.value =
        user.email || "";


    editRole.value =
        user.role || "restaurant";


    editAddress.value =
        user.address || "";


    editPhone.value =
        user.phone || "";


    editUserModal.classList.remove(
        "hidden"
    );

}



// ======================================
// CLOSE EDIT MODAL
// ======================================

function closeEditUserModal(){

    editUserModal.classList.add(
        "hidden"
    );

    editUserForm.reset();

}



// ======================================
// EDIT BUTTON
// ======================================

usersTableBody.addEventListener(
    "click",
    function(event){


        const button =
            event.target.closest(
                ".edit-user-btn"
            );


        if(!button) return;


        const id =
            String(button.dataset.id || "");



        const user =
            users.find(item =>
                getUserId(item) === id
            );

        if(!user){

            showMessage(
                "User not found.",
                "error",
                "Error"
            );

            return;

        }


        openEditModal(user);


    }
);



// ======================================
// SAVE EDIT
// ======================================

editUserForm.addEventListener(
    "submit",
    function(event){


        event.preventDefault();



        const id =
            Number(editUserId.value);



        const role =
            editRole.value;



        // Prevent removing own admin role

        if(
            id === Number(currentUser.id)
            &&
            role !== "admin"
        ){

            showMessage(
                "You cannot remove your own admin privileges.",
                "error",
                "Action Blocked"
            );

            return;

        }



        const index =
            users.findIndex(user =>
                getUserId(user) === id
            );



        if(index === -1){

            return;

        }



        users[index] = {

            ...users[index],

            name:
                editName.value.trim(),

            email:
                editEmail.value.trim().toLowerCase(),

            role,

            address:
                editAddress.value.trim(),

            phone:
                editPhone.value.trim()

        };

        // Note: User changes persist in API automatically
        // Only update the local array

        updateStatistics();

        displayUsers();


        closeEditUserModal();



        showMessage(
            "User updated successfully.",
            "success",
            "Success"
        );


    }
);



// ======================================
// CLOSE EDIT BUTTONS
// ======================================

closeEditModal.addEventListener(
    "click",
    closeEditUserModal
);


cancelEdit.addEventListener(
    "click",
    closeEditUserModal
);




// ======================================
// DELETE USER
// ======================================

usersTableBody.addEventListener(
    "click",
    function(event){


        const button =
            event.target.closest(
                ".delete-user-btn"
            );


        if(!button) return;



        const id =
            String(button.dataset.id || "");



        const user =
            users.find(item =>
                getUserId(item) === id
            );



        if(!user) return;



        if(
            isSameUser(user, currentUser)
        ){

            showMessage(
                "You cannot delete your own admin account.",
                "error",
                "Action Blocked"
            );

            return;

        }



        userToDelete = user;


        deleteUserName.textContent =
            user.name;



        deleteUserModal.classList.remove(
            "hidden"
        );


    }
);




// ======================================
// CLOSE DELETE MODAL
// ======================================

function closeDeleteModal(){

    deleteUserModal.classList.add(
        "hidden"
    );


    userToDelete = null;

}



cancelDelete.addEventListener(
    "click",
    closeDeleteModal
);




// ======================================
// CONFIRM DELETE
// ======================================

confirmDelete.addEventListener(
    "click",
    async function(){


        if(!userToDelete) return;



        const id = getUserId(userToDelete);

        try {
            const response = await fetch(
                `${API_BASE_URL}/auth/users/${encodeURIComponent(id)}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not delete this account.");
            }

            users = users.filter(user => getUserId(user) !== String(id));
            closeDeleteModal();
            await updateStatistics();
            displayUsers();

            showMessage(data.message || "User account deleted.", "success", "Deleted");

        } catch (error) {
            showMessage(error.message, "error", "Delete Failed");
        }


    }
);




// ======================================
// SEARCH
// ======================================

searchUsers.addEventListener(
    "input",
    displayUsers
);



// ======================================
// FILTER
// ======================================

roleFilter.addEventListener(
    "change",
    displayUsers
);




// ======================================
// LOGOUT
// ======================================

logoutBtn.addEventListener(
    "click",
    function(){


        const confirmLogout =
            confirm(
                "Are you sure you want to logout?"
            );



        if(!confirmLogout) return;



        localStorage.removeItem(
            "currentUser"
        );



        window.location.href =
            "login.html";


    }
);


// ======================================
// DISPLAY RECENT DONATIONS
// ======================================

function displayRecentDonations(){


    if(!recentDonationsBody){

        return;

    }

    // Use API-populated allDonations variable
    const donations = allDonations || [];

    recentDonationsBody.innerHTML = "";

    if(donations.length === 0){

        if(emptyDonations){

            emptyDonations.style.display =
                "block";

        }

        return;

    }

    if(emptyDonations){

        emptyDonations.style.display =
            "none";

    }



    // newest first

    donations
    .sort(
        (a,b)=>
        new Date(b.createdAt)
        -
        new Date(a.createdAt)
    )
    .slice(0,10)
    .forEach(donation=>{


        const row =
            document.createElement("tr");



        row.innerHTML = `


        <td>

            <strong>
            ${escapeHTML(
                donation.foodName || "Unknown"
            )}
            </strong>

        </td>



        <td>

            ${escapeHTML(
                donation.ownerName || "Unknown"
            )}

        </td>



        <td>

            ${escapeHTML(
                donation.category || "-"
            )}

        </td>



        <td>

            ${donation.quantity || 0}
            ${escapeHTML(
                donation.unit || ""
            )}

        </td>



        <td>

            ${escapeHTML(
                donation.location || "-"
            )}

        </td>



        <td>

            <span class="status-badge">

                ${escapeHTML(
                    donation.status || "Available"
                )}

            </span>

        </td>



        <td>

            ${formatDate(
                donation.createdAt
            )}

        </td>


        `;


        recentDonationsBody.appendChild(row);


    });


}


// ======================================
// INITIALIZE
// ======================================

async function initializeAdmin() {
    await updateStatistics();
    displayUsers();
    displayRecentDonations();
}

initializeAdmin();


console.log(
    "MPower Admin Dashboard initialized."
);
