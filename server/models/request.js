"use strict";

const mongoose = require("mongoose");


// ======================================
// REQUEST SCHEMA
// ======================================

const requestSchema = new mongoose.Schema(

    {

        // ==================================
        // DONATION
        // ==================================

        donationId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "Donation",

            required: true

        },


        // ==================================
        // REQUESTER / CHARITY
        // ==================================

        requesterId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true

        },

        requesterName: {

            type: String,

            required: true,

            trim: true

        },

        requesterRole: {

            type: String,

            required: true,

            enum: ["charity"]

        },


        // ==================================
        // REQUEST INFORMATION
        // ==================================

        message: {

            type: String,

            default: "",

            trim: true

        },


        quantity: {

            type: Number,

            required: true,

            min: 1

        },

        pickupDate: {

            type: Date,

            default: null

        },

        volunteerId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            default: null

        },

        volunteerName: {

            type: String,

            default: ""

        },

        volunteerAcceptedAt: {

            type: Date,

            default: null

        },

        pickedUpAt: {
            type: Date,
            default: null
        },

        deliveredAt: {
            type: Date,
            default: null
        },

        charityConfirmedAt: {
            type: Date,
            default: null
        },


        // ==================================
        // REQUEST STATUS
        // ==================================

        status: {

            type: String,

            enum: [

                "Pending",

                "Accepted",

                "Volunteer Accepted",

                "Picked Up",

                "Delivered",

                "Rejected",

                "Cancelled",

                "Completed"

            ],

            default: "Pending"

        }

    },


    // ======================================
    // TIMESTAMPS
    // ======================================

    {

        timestamps: true

    }

);


// ======================================
// EXPORT MODEL
// ======================================

module.exports =
    mongoose.model(
        "Request",
        requestSchema
    );