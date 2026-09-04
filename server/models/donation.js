"use strict";

const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
    {

        // ======================================
        // DONOR INFORMATION
        // ======================================

        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        ownerName: {
            type: String,
            required: true,
            trim: true
        },

        ownerRole: {
            type: String,
            required: true,
            enum: ["restaurant"]
        },


        // ======================================
        // FOOD INFORMATION
        // ======================================

        foodName: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 0
        },

        unit: {
            type: String,
            required: true,
            trim: true
        },


        // ======================================
        // LOCATION
        // ======================================

        location: {
            type: String,
            required: true,
            trim: true
        },

        latitude: {
            type: Number,
            default: null
        },

        longitude: {
            type: Number,
            default: null
        },


        // ======================================
        // DONATION DETAILS
        // ======================================

        expiry: {
            type: String,
            required: true
        },

        contact: {
            type: String,
            required: true,
            trim: true
        },

        notes: {
            type: String,
            default: "",
            trim: true
        },

        image: {
            type: String,
            default: ""
        },


        // ======================================
        // DONATION STATUS
        // ======================================

        status: {
            type: String,

            enum: [
                "Available",
                "Requested",
                "Accepted",
                "Picked Up",
                "In Transit",
                "Delivered",
                "Completed"
            ],

            default: "Available"
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
        }

    },

    // ======================================
    // AUTOMATIC TIMESTAMPS
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
        "Donation",
        donationSchema
    );