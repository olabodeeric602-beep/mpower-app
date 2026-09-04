"use strict";

const API_BASE_URL = window.MPOWER_API_BASE_URL;
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const authToken = localStorage.getItem("token");

if (!currentUser || currentUser.role !== "volunteer" || !authToken) {
    window.location.href = "login.html";
    throw new Error("Volunteer authentication required.");
}

const activeDeliveries = document.getElementById("activeDeliveries");
const completedDeliveries = document.getElementById("completedDeliveries");
const emptyActive = document.getElementById("emptyActive");
const emptyCompleted = document.getElementById("emptyCompleted");
const activeDeliveriesCount = document.getElementById("activeDeliveriesCount");
const pickedUpCount = document.getElementById("pickedUpCount");
const deliveredCount = document.getElementById("deliveredCount");
const completedCount = document.getElementById("completedCount");
const deliveryModal = document.getElementById("deliveryModal");
const deliveryModalContent = document.getElementById("deliveryModalContent");
const closeDeliveryModal = document.getElementById("closeDeliveryModal");

let deliveries = [];

function normalizeStatus(status) {
    return String(status || "").trim().toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ");
}

function escapeHTML(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function formatDate(value) {
    if (!value) return "Not specified";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Not specified" : date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function getDonation(request) {
    return request.donationId && typeof request.donationId === "object" ? request.donationId : null;
}

function getStatusLabel(status) {
    const labels = {
        accepted: "Accepted",
        "volunteer accepted": "In Transit",
        "in transit": "In Transit",
        "picked up": "Picked Up",
        delivered: "Delivered",
        completed: "Completed"
    };
    return labels[normalizeStatus(status)] || "Accepted";
}

function getProgress(status) {
    const progress = {
        accepted: 25,
        "volunteer accepted": 25,
        "in transit": 25,
        "picked up": 50,
        delivered: 75,
        completed: 100
    };
    return progress[normalizeStatus(status)] || 25;
}

function getDeliveryData(request) {
    const donation = getDonation(request) || {};
    return {
        requestId: request._id,
        donationId: donation._id,
        status: request.status,
        foodName: donation.foodName || "Food Donation",
        category: donation.category || "Food",
        quantity: request.quantity || donation.quantity || 0,
        unit: donation.unit || "",
        location: donation.location || "Location unavailable",
        donorName: donation.ownerName || "Donor",
        requesterName: request.requesterName || "Charity",
        pickupDate: request.pickupDate,
        expiry: donation.expiry,
        contact: donation.contact,
        notes: request.message || donation.notes || ""
    };
}

async function loadDeliveries() {
    const response = await fetch(`${API_BASE_URL}/requests/volunteer/my`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
        return;
    }

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Could not load your deliveries.");

    deliveries = Array.isArray(data.requests) ? data.requests.map(getDeliveryData) : [];
    renderPage();
}

function createDeliveryCard(delivery) {
    const card = document.createElement("article");
    const status = normalizeStatus(delivery.status);
    const completed = status === "completed";
    const progress = getProgress(delivery.status);

    card.className = "delivery-card";
    card.innerHTML = `
        <div class="delivery-card-top">
            <span class="delivery-card-category">${escapeHTML(delivery.category)}</span>
            <h3>${escapeHTML(delivery.foodName)}</h3>
            <span class="delivery-id">Delivery #${escapeHTML(delivery.requestId)}</span>
            <span class="delivery-status status-${status.replace(/\s+/g, "-")}">${getStatusLabel(delivery.status)}</span>
        </div>
        <div class="delivery-card-body">
            <div class="delivery-info">
                <div class="delivery-info-item"><i class="fa-solid fa-box-open delivery-info-icon"></i><div><span>Quantity</span><strong>${escapeHTML(delivery.quantity)} ${escapeHTML(delivery.unit)}</strong></div></div>
                <div class="delivery-info-item"><i class="fa-solid fa-location-dot delivery-info-icon"></i><div><span>Pickup Location</span><strong>${escapeHTML(delivery.location)}</strong></div></div>
                <div class="delivery-info-item"><i class="fa-solid fa-store delivery-info-icon"></i><div><span>Donor</span><strong>${escapeHTML(delivery.donorName)}</strong></div></div>
                <div class="delivery-info-item"><i class="fa-solid fa-building-user delivery-info-icon"></i><div><span>Deliver To</span><strong>${escapeHTML(delivery.requesterName)}</strong></div></div>
                <div class="delivery-info-item"><i class="fa-regular fa-calendar delivery-info-icon"></i><div><span>Pickup Date</span><strong>${formatDate(delivery.pickupDate)}</strong></div></div>
            </div>
            <div class="delivery-progress"><div class="progress-label"><span>Delivery Progress</span><span>${progress}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div></div>
        </div>
        <div class="delivery-card-footer">
            ${completed ? `<span class="delivery-completed-label"><i class="fa-solid fa-circle-check"></i> Delivery Completed</span>` : `<button type="button" class="delivery-action-btn" data-delivery-id="${escapeHTML(delivery.requestId)}"><i class="fa-solid fa-route"></i> View &amp; Track Delivery</button>`}
        </div>
    `;
    return card;
}

function renderPage() {
    const active = deliveries.filter(item => normalizeStatus(item.status) !== "completed");
    const completed = deliveries.filter(item => normalizeStatus(item.status) === "completed");

    activeDeliveries.innerHTML = "";
    completedDeliveries.innerHTML = "";
    active.forEach(item => activeDeliveries.appendChild(createDeliveryCard(item)));
    completed.forEach(item => completedDeliveries.appendChild(createDeliveryCard(item)));
    emptyActive.classList.toggle("hidden", active.length > 0);
    emptyCompleted.classList.toggle("hidden", completed.length > 0);

    activeDeliveriesCount.textContent = active.length;
    pickedUpCount.textContent = deliveries.filter(item => ["picked up", "delivered", "completed"].includes(normalizeStatus(item.status))).length;
    deliveredCount.textContent = deliveries.filter(item => ["delivered", "completed"].includes(normalizeStatus(item.status))).length;
    completedCount.textContent = completed.length;
}

function openDeliveryModal(requestId) {
    const delivery = deliveries.find(item => String(item.requestId) === String(requestId));
    if (!delivery) return;

    const status = normalizeStatus(delivery.status);
    let action = "";
    if (status === "volunteer accepted" || status === "in transit") {
        action = `<button class="modal-confirm-btn" data-next-status="Picked Up" data-delivery-id="${escapeHTML(delivery.requestId)}"><i class="fa-solid fa-box-open"></i> Mark as Picked Up</button>`;
    } else if (status === "picked up") {
        action = `<button class="modal-confirm-btn" data-next-status="Delivered" data-delivery-id="${escapeHTML(delivery.requestId)}"><i class="fa-solid fa-truck-fast"></i> Mark as Delivered</button>`;
    } else if (status === "delivered") {
        action = `<div class="modal-warning"><i class="fa-solid fa-hourglass-half"></i> Awaiting charity confirmation.</div>`;
    }

    deliveryModalContent.innerHTML = `
        <div class="modal-icon"><i class="fa-solid fa-truck-fast"></i></div>
        <span class="delivery-status status-${status.replace(/\s+/g, "-")}">${getStatusLabel(delivery.status)}</span>
        <h2>${escapeHTML(delivery.foodName)}</h2>
        <p class="modal-subtitle">Track this delivery from pickup through charity confirmation.</p>
        <div class="modal-details">
            <div><span>Quantity</span><strong>${escapeHTML(delivery.quantity)} ${escapeHTML(delivery.unit)}</strong></div>
            <div><span>Pickup Location</span><strong>${escapeHTML(delivery.location)}</strong></div>
            <div><span>Donor</span><strong>${escapeHTML(delivery.donorName)}</strong></div>
            <div><span>Deliver To</span><strong>${escapeHTML(delivery.requesterName)}</strong></div>
            <div><span>Pickup Date</span><strong>${formatDate(delivery.pickupDate)}</strong></div>
            <div><span>Expiry Date</span><strong>${formatDate(delivery.expiry)}</strong></div>
        </div>
        <div class="modal-notes"><strong>Notes</strong><p>${escapeHTML(delivery.notes || "No additional notes.")}</p></div>
        ${action}
    `;
    deliveryModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

async function updateDeliveryStatus(requestId, nextStatus) {
    const response = await fetch(`${API_BASE_URL}/requests/${encodeURIComponent(requestId)}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ status: nextStatus })
    });
    const responseText = await response.text();
    let data = {};

    try {
        data = responseText ? JSON.parse(responseText) : {};
    } catch (error) {
        throw new Error(
            response.status === 404
                ? "The delivery status API is unavailable. Restart the MPower backend."
                : `The server returned an invalid response (${response.status}).`
        );
    }

    if (!response.ok) throw new Error(data.message || "Could not update delivery status.");
    closeModal();
    await loadDeliveries();
}

function closeModal() {
    deliveryModal.classList.add("hidden");
    document.body.style.overflow = "";
}

activeDeliveries.addEventListener("click", event => {
    const button = event.target.closest(".delivery-action-btn");
    if (button) openDeliveryModal(button.dataset.deliveryId);
});

completedDeliveries.addEventListener("click", event => {
    const button = event.target.closest(".delivery-action-btn");
    if (button) openDeliveryModal(button.dataset.deliveryId);
});

deliveryModalContent.addEventListener("click", event => {
    const button = event.target.closest(".modal-confirm-btn");
    if (!button) return;
    updateDeliveryStatus(button.dataset.deliveryId, button.dataset.nextStatus).catch(error => showMessage(error.message, "error", "Delivery Update Failed"));
});

closeDeliveryModal.addEventListener("click", closeModal);
deliveryModal.addEventListener("click", event => { if (event.target === deliveryModal) closeModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });

loadDeliveries().catch(error => {
    console.error("Failed to load volunteer deliveries:", error);
    showMessage(error.message, "error", "Delivery Load Error");
});
