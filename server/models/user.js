// ======================================
// MPower User Model
// ======================================

"use strict";

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {

        // ===============================
        // BASIC INFORMATION
        // ===============================

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            required: true,
            enum: [
                "restaurant",
                "charity",
                "volunteer",
                "admin"
            ]
        },


        // ===============================
        // CONTACT INFORMATION
        // ===============================

        address: {
            type: String,
            default: ""
        },

        phone: {
            type: String,
            default: ""
        },


        // ===============================
        // USER LOCATION
        // ===============================

        location: {

            lat: {
                type: Number,
                default: null
            },

            lng: {
                type: Number,
                default: null
            }

        },


        // ===============================
        // PROFILE IMAGE
        // ===============================

        profileImage: {
            type: String,
            default: ""
        }

    },


    // ===============================
    // TIMESTAMPS
    // ===============================

    {
        timestamps: true
    }

);


const User =
    mongoose.model(
        "User",
        userSchema
    );


module.exports = User;