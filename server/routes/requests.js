"use strict";

const express = require("express");
const mongoose = require("mongoose");

const Request = require("../models/request");
const Donation = require("../models/donation");

const {
    authenticateToken
} = require("./auth");

const router = express.Router();


// ======================================
// MPower - REQUEST ROUTES
// ======================================


// ======================================
// HELPER: VALIDATE OBJECT ID
// ======================================

function isValidId(id) {

    return mongoose.Types.ObjectId.isValid(id);

}


// ======================================
// HELPER: GET REQUESTER ROLE
// ======================================

function isCharity(user) {

    return user && user.role === "charity";

}


// ======================================
// HELPER: GET RESTAURANT ROLE
// ======================================

function isRestaurant(user) {

    return user && user.role === "restaurant";

}


// ======================================
// HELPER: GET VOLUNTEER ROLE
// ======================================

function isVolunteer(user) {

    return user && user.role === "volunteer";

}


// ======================================
// CREATE FOOD REQUEST
// POST /api/requests
// ======================================
//
// Charity creates a request for a donation.
//
// Status:
// Pending
//
// ======================================

router.post(
    "/",
    authenticateToken,
    async (req, res) => {

        try {

            // ==================================
            // ROLE CHECK
            // ==================================

            if (!isCharity(req.user)) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only charity accounts can create food requests."

                });

            }


            const {

                donationId,
                message,
                quantity,
                pickupDate

            } = req.body;


            // ==================================
            // REQUIRED DONATION ID
            // ==================================

            if (!donationId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Donation ID is required."

                });

            }


            // ==================================
            // VALIDATE DONATION ID
            // ==================================

            if (!isValidId(donationId)) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid donation ID."

                });

            }


            // ==================================
            // FIND DONATION
            // ==================================

            const donation =
                await Donation.findById(
                    donationId
                );


            if (!donation) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Donation not found."

                });

            }


            // ==================================
            // DONATION MUST BE AVAILABLE
            // ==================================

            if (
                String(
                    donation.status
                ).toLowerCase() !==
                "available"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This donation is no longer available."

                });

            }


            // ==================================
            // QUANTITY
            // ==================================

            const requestedQuantity =
                Number(
                    quantity ||
                    donation.quantity
                );


            if (
                !Number.isFinite(
                    requestedQuantity
                ) ||
                requestedQuantity <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Requested quantity must be greater than zero."

                });

            }


            // ==================================
            // CANNOT REQUEST MORE THAN AVAILABLE
            // ==================================

            if (
                requestedQuantity >
                Number(donation.quantity)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Requested quantity cannot exceed the available donation quantity."

                });

            }


            // ==================================
            // CHECK EXISTING ACTIVE REQUEST
            // ==================================

            const existingRequest =
                await Request.findOne({

                    donationId:
                        donation._id,

                    requesterId:
                        req.user.userId,

                    status: {
                        $in: [
                            "Pending",
                            "Accepted"
                        ]
                    }

                });


            if (existingRequest) {

                return res.status(409).json({

                    success: false,

                    message:
                        "You already have an active request for this donation.",

                    request:
                        existingRequest

                });

            }


            // ==================================
            // CREATE REQUEST
            // ==================================

            const request =
                await Request.create({

                    donationId:
                        donation._id,

                    requesterId:
                        req.user.userId,

                    requesterName:
                        req.user.name ||
                        req.user.username ||
                        "Charity",

                    requesterRole:
                        "charity",

                    message:
                        message
                            ? String(message).trim()
                            : "",

                    quantity:
                        requestedQuantity,

                    pickupDate:
                        pickupDate ||
                        null,

                    status:
                        "Pending"

                });

            donation.status =
                "Requested";

            await donation.save();


            return res.status(201).json({

                success: true,

                message:
                    "Food request created successfully.",

                request

            });

        } catch (error) {

            console.error(
                "Create request error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Something went wrong while creating the food request."

            });

        }

    }
);


// ======================================
// GET MY REQUESTS
// GET /api/requests/my
// ======================================
//
// Used by charity dashboard.
//
// ======================================

router.get(
    "/my",
    authenticateToken,
    async (req, res) => {

        try {

            if (!isCharity(req.user)) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only charity accounts can access their requests."

                });

            }


            const requests =
                await Request.find({

                    requesterId:
                        req.user.userId

                })
                .populate(
                    "donationId"
                )
                .sort({
                    createdAt: -1
                });


            return res.json({

                success: true,

                count:
                    requests.length,

                requests

            });

        } catch (error) {

            console.error(
                "Get my requests error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Something went wrong while loading your requests."

            });

        }

    }
);


// ======================================
// GET REQUESTS FOR A DONATION
// GET /api/requests/donation/:donationId
// ======================================
//
// Used by restaurant incoming requests.
//
// ======================================

router.get(
    "/donation/:donationId",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                donationId
            } = req.params;


            // ==================================
            // VALIDATE ID
            // ==================================

            if (!isValidId(donationId)) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid donation ID."

                });

            }


            // ==================================
            // FIND DONATION
            // ==================================

            const donation =
                await Donation.findById(
                    donationId
                );


            if (!donation) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Donation not found."

                });

            }


            // ==================================
            // ONLY DONATION OWNER
            // ==================================

            if (
                String(
                    donation.ownerId
                ) !==
                String(
                    req.user.userId
                )
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You are not allowed to view requests for this donation."

                });

            }


            // ==================================
            // ONLY RESTAURANT
            // ==================================

            if (!isRestaurant(req.user)) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only restaurant accounts can view incoming requests."

                });

            }


            // ==================================
            // GET REQUESTS
            // ==================================

            const requests =
                await Request.find({

                    donationId:
                        donation._id

                })
                .sort({
                    createdAt: -1
                });


            return res.json({

                success: true,

                count:
                    requests.length,

                requests

            });

        } catch (error) {

            console.error(
                "Get donation requests error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Something went wrong while loading donation requests."

            });

        }

    }
);


// ======================================
// GET SINGLE REQUEST
// GET /api/requests/:id
// ======================================

router.get(
    "/:id",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            if (!isValidId(id)) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid request ID."

                });

            }


            const request =
                await Request.findById(
                    id
                )
                .populate(
                    "donationId"
                );


            if (!request) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Request not found."

                });

            }


            const isOwner =
                String(
                    request.requesterId
                ) ===
                String(
                    req.user.userId
                );


            const donation =
                request.donationId;


            const isDonationOwner =
                donation &&
                String(
                    donation.ownerId
                ) ===
                String(
                    req.user.userId
                );


            const isAssignedVolunteer =
                request.volunteerId &&
                String(
                    request.volunteerId
                ) ===
                String(
                    req.user.userId
                );


            if (
                !isOwner &&
                !isDonationOwner &&
                !isAssignedVolunteer
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You are not allowed to view this request."

                });

            }


            return res.json({

                success: true,

                request

            });

        } catch (error) {

            console.error(
                "Get single request error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Something went wrong while loading the request."

            });

        }

    }
);


// ======================================
// ACCEPT REQUEST
// PUT /api/requests/:id/accept
// ======================================
//
// Restaurant accepts charity request.
//
// Pending
//    ↓
// Accepted
//
// The donation remains reserved and becomes
// available for a volunteer.
//
// ======================================

router.put(
    "/:id/accept",
    authenticateToken,
    async (req, res) => {

        try {

            if (!isRestaurant(req.user)) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only restaurant accounts can accept food requests."

                });

            }


            const {
                id
            } = req.params;


            if (!isValidId(id)) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid request ID."

                });

            }


            const request =
                await Request.findById(
                    id
                );


            if (!request) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Request not found."

                });

            }


            // ==================================
            // FIND DONATION
            // ==================================

            const donation =
                await Donation.findById(
                    request.donationId
                );


            if (!donation) {

                return res.status(404).json({

                    success: false,

                    message:
                        "The donation connected to this request was not found."

                });

            }


            // ==================================
            // OWNERSHIP
            // ==================================

            if (
                String(
                    donation.ownerId
                ) !==
                String(
                    req.user.userId
                )
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You can only process requests for your own donations."

                });

            }


            // ==================================
            // STATUS CHECK
            // ==================================

            if (
                String(
                    request.status
                ).toLowerCase() !==
                "pending"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This request has already been processed."

                });

            }


            // ==================================
            // DONATION STATUS CHECK
            // ==================================

            const donationStatus =
                String(donation.status).toLowerCase();

            if (
                donationStatus !== "available" &&
                donationStatus !== "requested"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This donation is no longer available."

                });

            }


            // ==================================
            // ACCEPT REQUEST
            // ==================================

            request.status =
                "Accepted";


            await request.save();


            // ==================================
            // KEEP THE DONATION HIDDEN FROM OTHER CHARITIES
            // UNTIL A VOLUNTEER accepts the delivery.
            // ==================================

            donation.status =
                "Accepted";


            await donation.save();


            return res.json({

                success: true,

                message:
                    "Food request accepted successfully.",

                request

            });

        } catch (error) {

            console.error(
                "Accept request error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Something went wrong while accepting the request."

            });

        }

    }
);


// ======================================
// REJECT REQUEST
// PUT /api/requests/:id/reject
// ======================================

router.put(
    "/:id/reject",
    authenticateToken,
    async (req, res) => {

        try {

            if (!isRestaurant(req.user)) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only restaurant accounts can reject food requests."

                });

            }


            const {
                id
            } = req.params;


            if (!isValidId(id)) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid request ID."

                });

            }


            const request =
                await Request.findById(
                    id
                );


            if (!request) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Request not found."

                });

            }


            const donation =
                await Donation.findById(
                    request.donationId
                );


            if (!donation) {

                return res.status(404).json({

                    success: false,

                    message:
                        "The donation connected to this request was not found."

                });

            }


            // ==================================
            // OWNERSHIP CHECK
            // ==================================

            if (
                String(
                    donation.ownerId
                ) !==
                String(
                    req.user.userId
                )
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You can only process requests for your own donations."

                });

            }


            // ==================================
            // STATUS CHECK
            // ==================================

            if (
                String(
                    request.status
                ).toLowerCase() !==
                "pending"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This request has already been processed."

                });

            }


            // ==================================
            // REJECT
            // ==================================

            request.status =
                "Rejected";


            await request.save();

            donation.status =
                "Available";

            await donation.save();


            return res.json({

                success: true,

                message:
                    "Food request rejected successfully.",

                request

            });

        } catch (error) {

            console.error(
                "Reject request error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Something went wrong while rejecting the request."

            });

        }

    }
);


// ======================================
// GET AVAILABLE VOLUNTEER DELIVERIES
// GET /api/requests/volunteer/available
// ======================================
//
// IMPORTANT:
// This route must be declared BEFORE
// /:id.
//
// Volunteer sees:
//
// Accepted requests
// +
// No volunteer assigned
//
// ======================================

router.get(
    "/volunteer/available",
    authenticateToken,
    async (req, res) => {

        try {

            if (!isVolunteer(req.user)) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only volunteer accounts can access available deliveries."

                });

            }


            const requests =
                await Request.find({

                    status:
                        "Accepted",

                    $or: [

                        {
                            volunteerId:
                                {
                                    $exists: false
                                }
                        },

                        {
                            volunteerId:
                                null
                        }

                    ]

                })
                .populate(
                    "donationId"
                )
                .sort({
                    createdAt: -1
                });


            // ==================================
            // REMOVE REQUESTS WHERE DONATION
            // IS NO LONGER AVAILABLE
            // ==================================

            const availableRequests =
                requests.filter(
                    request => {

                        const donation =
                            request.donationId;


                        if (!donation) {

                            return false;

                        }


                        return (
                            String(
                                donation.status
                            ).toLowerCase() ===
                            "accepted"
                        );

                    }
                );


            return res.json({

                success: true,

                count:
                    availableRequests.length,

                requests:
                    availableRequests

            });

        } catch (error) {

            console.error(
                "Get volunteer deliveries error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Something went wrong while loading available deliveries."

            });

        }

    }
);


// ======================================
// VOLUNTEER ACCEPT DELIVERY
// PUT /api/requests/:id/volunteer-accept
// ======================================
//
// Accepted
//    ↓
// Volunteer Accepted
//
// Donation:
// Available
//    ↓
// In Transit
//
// ======================================

router.put(
    "/:id/volunteer-accept",
    authenticateToken,
    async (req, res) => {

        try {

            if (!isVolunteer(req.user)) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only volunteer accounts can accept deliveries."

                });

            }


            const {
                id
            } = req.params;


            if (!isValidId(id)) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid request ID."

                });

            }


            // ==================================
            // FIND REQUEST
            // ==================================

            const request =
                await Request.findById(
                    id
                );


            if (!request) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Delivery request not found."

                });

            }


            // ==================================
            // REQUEST MUST BE ACCEPTED
            // BY RESTAURANT
            // ==================================

            if (
                String(
                    request.status
                ).toLowerCase() !==
                "accepted"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This delivery is not ready for volunteer assignment."

                });

            }


            // ==================================
            // PREVENT DOUBLE ASSIGNMENT
            // ==================================

            if (request.volunteerId) {

                return res.status(409).json({

                    success: false,

                    message:
                        "This delivery has already been accepted by another volunteer."

                });

            }


            // ==================================
            // FIND DONATION
            // ==================================

            const donation =
                await Donation.findById(
                    request.donationId
                );


            if (!donation) {

                return res.status(404).json({

                    success: false,

                    message:
                        "The donation connected to this delivery was not found."

                });

            }


            // ==================================
            // DONATION MUST STILL BE RESERVED FOR THIS DELIVERY
            // ==================================

            if (
                String(
                    donation.status
                ).toLowerCase() !==
                "accepted"
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "This donation is no longer available."

                });

            }


            // ==================================
            // ASSIGN VOLUNTEER
            // ==================================

            request.volunteerId =
                req.user.userId;


            request.volunteerName =
                req.user.name ||
                req.user.username ||
                "Volunteer";


            request.volunteerAcceptedAt =
                new Date();


            // ==================================
            // UPDATE REQUEST STATUS
            // ==================================

            request.status =
                "Volunteer Accepted";


            // ==================================
            // UPDATE DONATION
            // ==================================

            donation.status =
                "In Transit";


            // These fields are useful if the
            // Donation schema allows them.

            donation.volunteerId =
                req.user.userId;


            donation.volunteerName =
                req.user.name ||
                req.user.username ||
                "Volunteer";


            donation.volunteerAcceptedAt =
                new Date();


            // ==================================
            // SAVE
            // ==================================

            await request.save();

            await donation.save();


            // ==================================
            // RESPONSE
            // ==================================

            return res.json({

                success: true,

                message:
                    "Delivery accepted successfully. The food is now in transit.",

                request,

                donation

            });

        } catch (error) {

            console.error(
                "Volunteer accept delivery error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Something went wrong while accepting the delivery."

            });

        }

    }
);


// ======================================
// GET MY VOLUNTEER DELIVERIES
// GET /api/requests/volunteer/my
// ======================================
//
// Volunteer dashboard uses this to show
// active and completed deliveries.
//
// ======================================

router.get(
    "/volunteer/my",
    authenticateToken,
    async (req, res) => {

        try {

            if (!isVolunteer(req.user)) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only volunteer accounts can access volunteer deliveries."

                });

            }


            const requests =
                await Request.find({

                    volunteerId:
                        req.user.userId

                })
                .populate(
                    "donationId"
                )
                .sort({
                    volunteerAcceptedAt: -1
                });


            return res.json({

                success: true,

                count:
                    requests.length,

                requests

            });

        } catch (error) {

            console.error(
                "Get volunteer deliveries error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Something went wrong while loading your deliveries."

                });

        }

    }
);


// ======================================
// UPDATE DELIVERY STATUS
// PUT /api/requests/:id/status
// ======================================

router.put(
    "/:id/status",
    authenticateToken,
    async (req, res) => {

        try {

            if (!isVolunteer(req.user)) {
                return res.status(403).json({
                    success: false,
                    message: "Only volunteers can update delivery status."
                });
            }

            const { id } = req.params;
            const { status } = req.body;

            if (!isValidId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request ID."
                });
            }

            const request = await Request.findById(id);

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: "Request not found."
                });
            }

            if (
                !request.volunteerId ||
                String(request.volunteerId) !== String(req.user.userId)
            ) {
                return res.status(403).json({
                    success: false,
                    message: "You are not assigned to this delivery."
                });
            }

            const currentStatus = String(request.status).trim().toLowerCase();
            const nextStatus = String(status || "").trim().toLowerCase();
            const transitions = {
                "volunteer accepted": "picked up",
                "in transit": "picked up",
                "picked up": "delivered"
            };

            if (transitions[currentStatus] !== nextStatus) {
                return res.status(400).json({
                    success: false,
                    message: "This delivery cannot be moved to that status yet."
                });
            }

            const donation = await Donation.findById(request.donationId);

            if (!donation) {
                return res.status(404).json({
                    success: false,
                    message: "Donation not found."
                });
            }

            const timestamp = new Date();
            request.status = nextStatus === "picked up" ? "Picked Up" : "Delivered";
            donation.status = request.status;

            if (nextStatus === "picked up") {
                request.pickedUpAt = timestamp;
                donation.pickedUpAt = timestamp;
            } else {
                request.deliveredAt = timestamp;
                donation.deliveredAt = timestamp;
            }

            await request.save();
            await donation.save();

            return res.json({
                success: true,
                message: `Delivery marked as ${request.status.toLowerCase()}.`,
                request,
                donation
            });

        } catch (error) {
            console.error("Update delivery status error:", error);
            return res.status(500).json({
                success: false,
                message: "Something went wrong while updating delivery status."
            });
        }
    }
);

// ======================================
// CHARITY CONFIRMS RECEIPT
// PUT /api/requests/:id/confirm-receipt
// ======================================

router.put(
    "/:id/confirm-receipt",
    authenticateToken,
    async (req, res) => {

        try {
            if (!isCharity(req.user)) {
                return res.status(403).json({
                    success: false,
                    message: "Only charity accounts can confirm receipt."
                });
            }

            if (!isValidId(req.params.id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request ID."
                });
            }

            const request = await Request.findById(req.params.id);

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: "Request not found."
                });
            }

            if (String(request.requesterId) !== String(req.user.userId)) {
                return res.status(403).json({
                    success: false,
                    message: "You can only confirm your own delivery."
                });
            }

            if (String(request.status).trim().toLowerCase() !== "delivered") {
                return res.status(400).json({
                    success: false,
                    message: "This delivery is not ready for confirmation."
                });
            }

            const donation = await Donation.findById(request.donationId);

            if (!donation) {
                return res.status(404).json({
                    success: false,
                    message: "Donation not found."
                });
            }

            const timestamp = new Date();
            request.status = "Completed";
            request.charityConfirmedAt = timestamp;
            donation.status = "Completed";

            await request.save();
            await donation.save();

            return res.json({
                success: true,
                message: "Delivery receipt confirmed successfully.",
                request,
                donation
            });

        } catch (error) {
            console.error("Confirm receipt error:", error);
            return res.status(500).json({
                success: false,
                message: "Something went wrong while confirming receipt."
            });
        }
    }
);

// ======================================
// MARK DELIVERY AS COMPLETED
// PUT /api/requests/:id/complete
// ======================================
//
// This will be used later when the charity
// confirms receipt.
//
// For now it is protected so only the
// assigned volunteer can trigger it.
//
// ======================================

router.put(
    "/:id/complete",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            if (!isValidId(id)) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid request ID."

                });

            }


            const request =
                await Request.findById(
                    id
                );


            if (!request) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Request not found."

                });

            }


            // ==================================
            // ONLY ASSIGNED VOLUNTEER
            // ==================================

            if (
                !request.volunteerId ||
                String(
                    request.volunteerId
                ) !==
                String(
                    req.user.userId
                )
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You are not assigned to this delivery."

                });

            }


            // ==================================
            // FIND DONATION
            // ==================================

            const donation =
                await Donation.findById(
                    request.donationId
                );


            if (!donation) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Donation not found."

                });

            }


            // ==================================
            // COMPLETE
            // ==================================

            request.status =
                "Completed";


            await request.save();


            donation.status =
                "Completed";


            await donation.save();


            return res.json({

                success: true,

                message:
                    "Delivery completed successfully.",

                request,

                donation

            });

        } catch (error) {

            console.error(
                "Complete delivery error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Something went wrong while completing the delivery."

            });

        }

    }
);


// ======================================
// EXPORT ROUTER
// ======================================

module.exports =
    router;
