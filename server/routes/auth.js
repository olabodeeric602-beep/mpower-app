"use strict";

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");
const Donation = require("../models/donation");
const Request = require("../models/request");

const router = express.Router();
// ======================================
// AUTHENTICATION MIDDLEWARE
// ======================================

function authenticateToken(req, res, next) {

    const authHeader =
        req.headers.authorization;

    const token =
        authHeader &&
        authHeader.split(" ")[1];

    if (!token) {

        return res.status(401).json({

            success: false,
            message: "Authentication token required."

        });

    }

    try {

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({

            success: false,
            message: "Invalid or expired token."

        });

    }

}


// ======================================
// SIGN UP
// ======================================

router.post("/signup", async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            role,
            address,
            phone,
            managementPassword
        } = req.body;

        if (!name || !email || !password || !role) {

            return res.status(400).json({
                success: false,
                message: "All required fields must be provided."
            });

        }

        const allowedRoles = [
            "restaurant",
            "charity",
            "volunteer",
            "admin"
        ];

        if (!allowedRoles.includes(role)) {

            return res.status(400).json({
                success: false,
                message: "Invalid account role."
            });

        }

        if (role === "admin") {
            if (!managementPassword || managementPassword !== "Ricky_pass1") {
                return res.status(403).json({
                    success: false,
                    message: "Incorrect management verification password."
                });
            }
        }

        const cleanEmail =
            email.toLowerCase().trim();

        const existingUser =
            await User.findOne({
                email: cleanEmail
            });

        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });

        }

        const hashedPassword =
            await bcrypt.hash(password, 12);

        const user = await User.create({

            name: name.trim(),

            email: cleanEmail,

            password: hashedPassword,

            role,

            address: address
                ? address.trim()
                : "",

            phone: phone
                ? phone.trim()
                : "",

            location: {
                lat: null,
                lng: null
            }

        });

        res.status(201).json({

            success: true,

            message:
                "MPower account created successfully.",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }

        });

    } catch (error) {

        console.error("Signup error:", error);

        res.status(500).json({

            success: false,

            message:
                "Something went wrong while creating the account."

        });

    }

});


// ======================================
// LOGIN
// ======================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required."

            });

        }


        const user =
            await User.findOne({

                email:
                    email.toLowerCase().trim()

            });


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        const token =
            jwt.sign(

                {
                    userId: user._id,
                    role: user.role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d"
                }

            );


        res.json({

            success: true,

            message:
                "Login successful.",

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                role: user.role,

                address: user.address,

                phone: user.phone

            }

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Something went wrong while logging in."

        });

    }

});
// ======================================
// GET PROFILE
// ======================================

router.get(
    "/profile",
    authenticateToken,
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.user.userId
                ).select("-password");

            if (!user) {

                return res.status(404).json({

                    success: false,
                    message: "User account not found."

                });

            }

            res.json({

                success: true,

                user: {

                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    address: user.address,
                    phone: user.phone,
                    location: user.location,
                    profileImage: user.profileImage,
                    createdAt: user.createdAt

                }

            });

        } catch (error) {

            console.error(
                "Get profile error:",
                error
            );

            res.status(500).json({

                success: false,
                message: "Could not load your profile."

            });

        }

    }
);


// ======================================
// UPDATE PROFILE
// ======================================

router.put(
    "/profile",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                name,
                email,
                address,
                phone
            } = req.body;


            if (!name || !email) {

                return res.status(400).json({

                    success: false,
                    message:
                        "Name and email are required."

                });

            }


            const cleanEmail =
                email
                    .toLowerCase()
                    .trim();


            const existingUser =
                await User.findOne({

                    email: cleanEmail,

                    _id: {
                        $ne: req.user.userId
                    }

                });


            if (existingUser) {

                return res.status(409).json({

                    success: false,
                    message:
                        "Another account is already using this email."

                });

            }


            const user =
                await User.findByIdAndUpdate(

                    req.user.userId,

                    {

                        name: name.trim(),

                        email: cleanEmail,

                        address:
                            address
                                ? address.trim()
                                : "",

                        phone:
                            phone
                                ? phone.trim()
                                : ""

                    },

                    {
                        new: true,
                        runValidators: true
                    }

                ).select("-password");


            if (!user) {

                return res.status(404).json({

                    success: false,
                    message: "User account not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Profile updated successfully.",

                user: {

                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    address: user.address,
                    phone: user.phone,
                    location: user.location,
                    profileImage: user.profileImage,
                    createdAt: user.createdAt

                }

            });

        } catch (error) {

            console.error(
                "Update profile error:",
                error
            );

            res.status(500).json({

                success: false,
                message:
                    "Could not update your profile."

            });

        }

    }
);


// ======================================
// CHANGE PASSWORD
// ======================================

router.put(
    "/password",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                currentPassword,
                newPassword
            } = req.body;


            if (
                !currentPassword ||
                !newPassword
            ) {

                return res.status(400).json({

                    success: false,
                    message:
                        "Current and new passwords are required."

                });

            }


            const user =
                await User.findById(
                    req.user.userId
                );


            if (!user) {

                return res.status(404).json({

                    success: false,
                    message:
                        "User account not found."

                });

            }


            const passwordMatch =
                await bcrypt.compare(
                    currentPassword,
                    user.password
                );


            if (!passwordMatch) {

                return res.status(401).json({

                    success: false,
                    message:
                        "The current password is incorrect."

                });

            }


            if (
                currentPassword ===
                newPassword
            ) {

                return res.status(400).json({

                    success: false,
                    message:
                        "Your new password must be different."

                });

            }


            const hashedPassword =
                await bcrypt.hash(
                    newPassword,
                    12
                );


            user.password =
                hashedPassword;


            await user.save();


            res.json({

                success: true,

                message:
                    "Password changed successfully."

            });

        } catch (error) {

            console.error(
                "Change password error:",
                error
            );

            res.status(500).json({

                success: false,
                message:
                    "Could not change your password."

            });

        }

    }
);


// ======================================
// UPDATE LOCATION
// ======================================

router.put(
    "/location",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                lat,
                lng
            } = req.body;


            if (
                typeof lat !== "number" ||
                typeof lng !== "number"
            ) {

                return res.status(400).json({

                    success: false,
                    message:
                        "Valid latitude and longitude are required."

                });

            }


            const user =
                await User.findByIdAndUpdate(

                    req.user.userId,

                    {

                        location: {
                            lat,
                            lng
                        }

                    },

                    {
                        new: true
                    }

                ).select("-password");


            if (!user) {

                return res.status(404).json({

                    success: false,
                    message:
                        "User account not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Location saved successfully.",

                location:
                    user.location

            });

        } catch (error) {

            console.error(
                "Update location error:",
                error
            );

            res.status(500).json({

                success: false,
                message:
                    "Could not save your location."

            });

        }

    }
);


// ======================================
// GET ALL USERS (ADMIN ONLY)
// GET /api/auth/users
// ======================================

router.get(
    "/users",
    authenticateToken,
    async (req, res) => {

        try {

            // Check if user is admin
            if (req.user.role !== "admin") {

                return res.status(403).json({

                    success: false,
                    message: "Access denied. Admin only."

                });

            }

            const users =
                await User.find()
                    .select("-password")
                    .sort({ createdAt: -1 });

            res.json({

                success: true,
                count: users.length,
                users

            });

        } catch (error) {

            console.error(
                "Get all users error:",
                error
            );

            res.status(500).json({

                success: false,
                message:
                    "Something went wrong while loading users."

            });

        }

    }
);

// ======================================
// UPDATE USER (ADMIN ONLY)
// PUT /api/auth/users/:id
// ======================================

router.put(
    "/users/:id",
    authenticateToken,
    async (req, res) => {

        try {

            if (req.user.role !== "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Admin only."
                });
            }

            const { id } = req.params;
            const { name, email, role, address, phone } = req.body;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID."
                });
            }

            if (!name || !email || !role) {
                return res.status(400).json({
                    success: false,
                    message: "Name, email, and role are required."
                });
            }

            const allowedRoles = [
                "restaurant",
                "charity",
                "volunteer",
                "admin"
            ];

            if (!allowedRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid account role."
                });
            }

            if (String(id) === String(req.user.userId) && role !== "admin") {
                return res.status(400).json({
                    success: false,
                    message: "You cannot remove your own admin privileges."
                });
            }

            const cleanEmail = email.toLowerCase().trim();
            const existingUser = await User.findOne({
                email: cleanEmail,
                _id: { $ne: id }
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "That email address is already in use."
                });
            }

            const user = await User.findByIdAndUpdate(
                id,
                {
                    name: name.trim(),
                    email: cleanEmail,
                    role,
                    address: String(address || "").trim(),
                    phone: String(phone || "").trim()
                },
                {
                    new: true,
                    runValidators: true
                }
            ).select("-password");

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User account not found."
                });
            }

            return res.json({
                success: true,
                message: "User information updated successfully.",
                user
            });

        } catch (error) {
            console.error("Update user error:", error);
            return res.status(500).json({
                success: false,
                message: "Something went wrong while updating the user account."
            });
        }
    }
);

// ======================================
// DELETE USER AND RELATED DATA
// DELETE /api/auth/users/:id
// ======================================

router.delete(
    "/users/:id",
    authenticateToken,
    async (req, res) => {

        try {

            if (req.user.role !== "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Admin only."
                });
            }

            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID."
                });
            }

            if (String(id) === String(req.user.userId)) {
                return res.status(400).json({
                    success: false,
                    message: "You cannot delete your own admin account."
                });
            }

            const user = await User.findById(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User account not found."
                });
            }

            const ownedDonations = await Donation.find({ ownerId: id }).select("_id");
            const donationIds = ownedDonations.map(donation => donation._id);

            await Request.deleteMany({
                $or: [
                    { requesterId: id },
                    { volunteerId: id },
                    { donationId: { $in: donationIds } }
                ]
            });

            await Donation.deleteMany({ ownerId: id });
            await User.findByIdAndDelete(id);

            return res.json({
                success: true,
                message: "User account and related information deleted successfully."
            });

        } catch (error) {
            console.error("Delete user error:", error);
            return res.status(500).json({
                success: false,
                message: "Something went wrong while deleting the user account."
            });
        }
    }
);

module.exports = router;
module.exports.authenticateToken = authenticateToken;
