"use strict";

const express = require("express");
const mongoose = require("mongoose");
const Donation = require("../models/donation");

const {
    authenticateToken
} = require("./auth");

const router = express.Router();


// ======================================
// CREATE DONATION
// POST /api/donations
// ======================================

router.post(
    "/",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                ownerName,
                ownerRole,
                foodName,
                category,
                quantity,
                unit,
                location,
                latitude,
                longitude,
                expiry,
                contact,
                notes,
                image
            } = req.body;


            // ==================================
            // OWNER FROM AUTHENTICATED TOKEN
            // ==================================

            const ownerId =
                req.user.userId;

            const authenticatedRole =
                req.user.role;


            // ==================================
            // REQUIRED FIELDS
            // ==================================

            if (
                !ownerName ||
                !ownerRole ||
                !foodName ||
                !category ||
                quantity === undefined ||
                !unit ||
                !location ||
                !expiry ||
                !contact
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please provide all required donation information."

                });

            }


            // ==================================
            // OWNER ID VALIDATION
            // ==================================

            if (
                !mongoose.Types.ObjectId.isValid(
                    ownerId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid authenticated user ID."

                });

            }


            // ==================================
            // ROLE VALIDATION
            // ==================================

            if (
                authenticatedRole !== "restaurant"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only restaurant accounts can create donations."

                });

            }


            // ==================================
            // ROLE CONSISTENCY CHECK
            // ==================================

            if (
                ownerRole !== authenticatedRole
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Invalid donation owner role."

                });

            }


            // ==================================
            // QUANTITY VALIDATION
            // ==================================

            if (
                Number(quantity) <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Quantity must be greater than zero."

                });

            }


            // ==================================
            // CREATE DONATION
            // ==================================

            const donation =
                await Donation.create({

                    ownerId,

                    ownerName:
                        ownerName.trim(),

                    ownerRole:
                        authenticatedRole,

                    foodName:
                        foodName.trim(),

                    category:
                        category.trim(),

                    quantity:
                        Number(quantity),

                    unit:
                        unit.trim(),

                    location:
                        location.trim(),

                    latitude:
                        latitude !== null &&
                        latitude !== undefined &&
                        latitude !== ""
                            ? Number(latitude)
                            : null,

                    longitude:
                        longitude !== null &&
                        longitude !== undefined &&
                        longitude !== ""
                            ? Number(longitude)
                            : null,

                    expiry,

                    contact:
                        contact.trim(),

                    notes:
                        notes
                            ? notes.trim()
                            : "",

                    image:
                        image || "",

                    status:
                        "Available"

                });


            return res.status(201).json({

                success: true,

                message:
                    "Donation created successfully.",

                donation

            });

        } catch (error) {

            console.error(
                "Create donation error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Something went wrong while creating the donation."

            });

        }

    }
);


// ======================================
// GET MY DONATIONS
// GET /api/donations/my
// ======================================

router.get(
    "/my",
    authenticateToken,
    async (req, res) => {

        try {

            const ownerId =
                req.user.userId;


            // ==================================
            // OWNER ID VALIDATION
            // ==================================

            if (
                !mongoose.Types.ObjectId.isValid(
                    ownerId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid authenticated user ID."

                });

            }


            // ==================================
            // ONLY RESTAURANTS
            // ==================================

            if (
                req.user.role !== "restaurant"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only restaurant accounts can access donations."

                });

            }


            // ==================================
            // FIND DONATIONS
            // ==================================

            const donations =
                await Donation.find({

                    ownerId

                })
                .sort({
                    createdAt: -1
                });


            return res.json({

                success: true,

                count:
                    donations.length,

                donations

            });

        } catch (error) {

            console.error(
                "Get my donations error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Something went wrong while loading your donations."

            });

        }

    }
);


// ======================================
// GET SINGLE DONATION
// GET /api/donations/:id
// ======================================

router.get(
    "/:id",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            const ownerId =
                req.user.userId;


            // ==================================
            // ID VALIDATION
            // ==================================

            if (
                !mongoose.Types.ObjectId.isValid(
                    id
                )
            ) {

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
                    id
                );


            if (!donation) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Donation not found."

                });

            }


            // Owners can view any of their donations. Recipient roles can
            // inspect only currently available donations before requesting.
            const isOwner =
                donation.ownerId.toString() === ownerId.toString();

            const canViewAvailableDonation =
                String(donation.status).trim().toLowerCase() === "available";

            if (!isOwner && !canViewAvailableDonation) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You are not allowed to view this donation."

                });

            }


            return res.json({

                success: true,

                donation

            });

        } catch (error) {

            console.error(
                "Get donation error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Something went wrong while loading the donation."

            });

        }

    }
);


// ======================================
// GET AVAILABLE DONATIONS
// GET /api/donations
// ======================================
//
// Used by charity/request-food page.
//
// Returns donations that are currently
// available for charities to request.
//
// ======================================

router.get(
    "/",
    authenticateToken,
    async (req, res) => {

        try {

            const donations =
                await Donation.find(
                    req.user.role === "admin"
                        ? {}
                        : { status: "Available" }
                )
                .sort({
                    createdAt: -1
                });


            return res.json({

                success: true,

                count:
                    donations.length,

                donations

            });

        } catch (error) {

            console.error(
                "Get available donations error:",
                error
            );
 

            return res.status(500).json({

                success: false,

                message:
                    "Something went wrong while loading available donations."

            });
        return req.status;  


       
        }
    }
);


// ======================================
// UPDATE DONATION
// PUT /api/donations/:id
// ======================================

router.put(
    "/:id",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            const {
                foodName,
                category,
                quantity,
                unit,
                location,
                latitude,
                longitude,
                expiry,
                contact,
                notes,
                image
            } = req.body;


            const ownerId =
                req.user.userId;


            // ==================================
            // ID VALIDATION
            // ==================================

            if (
                !mongoose.Types.ObjectId.isValid(
                    id
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid donation ID."

                });

            }


            // ==================================
            // ROLE CHECK
            // ==================================

            if (
                req.user.role !== "restaurant"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only restaurant accounts can update donations."

                });

            }


            // ==================================
            // FIND DONATION
            // ==================================

            const donation =
                await Donation.findById(
                    id
                );


            if (!donation) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Donation not found."

                });

            }

// ==================================
            // OWNERSHIP CHECK
            // ==================================

            if (
                donation.ownerId.toString() !==
                ownerId.toString()
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You are not allowed to modify this donation."

                });

            }


            // ==================================
            // STATUS CHECK
            // ==================================

            if (
                donation.status !==
                "Available"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This donation can no longer be edited because it is already being processed."

                });

            }


            // ==================================
            // REQUIRED FIELDS
            // ==================================

            if (
                !foodName ||
                !category ||
                quantity === undefined ||
                !unit ||
                !location ||
                !expiry ||
                !contact
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please provide all required donation information."

                });

            }


            // ==================================
            // QUANTITY VALIDATION
            // ==================================

            if (
                Number(quantity) <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Quantity must be greater than zero."

                });

            }


            // ==================================
            // UPDATE FIELDS
            // ==================================

            donation.foodName =
                foodName.trim();

            donation.category =
                category.trim();

            donation.quantity =
                Number(quantity);

            donation.unit =
                unit.trim();

            donation.location =
                location.trim();

            donation.latitude =
                latitude !== null &&
                latitude !== undefined &&
                latitude !== ""
                    ? Number(latitude)
                    : null;

            donation.longitude =
                longitude !== null &&
                longitude !== undefined &&
                longitude !== ""
                    ? Number(longitude)
                    : null;

            donation.expiry =
                expiry;

            donation.contact =
                contact.trim();

            donation.notes =
                notes
                    ? notes.trim()
                    : "";


            if (
                image !== undefined
            ) {

                donation.image =
                    image || "";

            }


            // ==================================
            // SAVE
            // ==================================

            await donation.save();


            return res.json({

                success: true,

                message:
                    "Donation updated successfully.",

                donation

            });

        } catch (error) {

            console.error(
                "Update donation error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Something went wrong while updating the donation."

            });

        }

    }
);


// ======================================
// DELETE DONATION
// DELETE /api/donations/:id
// ======================================

router.delete(
    "/:id",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            const ownerId =
                req.user.userId;


            // ==================================
            // ID VALIDATION
            // ==================================

            if (
                !mongoose.Types.ObjectId.isValid(
                    id
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid donation ID."

                });

            }


            // ==================================
            // ROLE CHECK
            // ==================================

            if (
                req.user.role !== "restaurant"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only restaurant accounts can delete donations."

                });

            }


            // ==================================
            // FIND DONATION
            // ==================================

            const donation =
                await Donation.findById(
                    id
                );


            if (!donation) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Donation not found."

                });

            }


            // ==================================
            // OWNERSHIP CHECK
            // ==================================

            if (
                donation.ownerId.toString() !==
                ownerId.toString()
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You are not allowed to delete this donation."

                });

            }


            // ==================================
            // STATUS CHECK
            // ==================================

            if (
                donation.status !==
                "Available"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This donation cannot be deleted because it is already being processed."

                });

            }


            // ==================================
            // DELETE
            // ==================================

            await Donation.findByIdAndDelete(
                id
            );


            return res.json({

                success: true,

                message:
                    "Donation deleted successfully."

            });

        } catch (error) {

            console.error(
                "Delete donation error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Something went wrong while deleting the donation."

            });

        }

    }
);

console.log("Donations.js is loaded and ready for action")
module.exports = router;