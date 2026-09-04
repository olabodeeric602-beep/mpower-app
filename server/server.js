"use strict";

const dns = require("dns");
const path = require("path");

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const requestRoutes =
    require("./routes/requests");

require("dotenv").config({
    path: path.join(__dirname, ".env")
});

const authRoutes = require("./routes/auth");
const donationRoutes = require("./routes/donations");

const frontendRoot = path.join(__dirname, "..");


// ======================================
// CREATE EXPRESS APP
// ======================================

const app = express();
app.locals.dbConnected = false;


// ======================================
// MIDDLEWARE
// ======================================

const allowedOrigins =
    (process.env.FRONTEND_ORIGIN || "")
        .split(",")
        .map(origin => origin.trim())
        .filter(Boolean);

app.use(cors({
    origin(origin, callback) {

        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error("Origin is not allowed by CORS."));

    }
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.static(frontendRoot, { index: "Index.html" }));

app.get("/", (req, res) => {
    res.sendFile(path.join(frontendRoot, "Index.html"));
});

app.use("/api/auth", authRoutes);

app.use("/api/donations", donationRoutes);
app.use("/api/requests", requestRoutes);

// ======================================
// MONGODB
// ======================================

const mongoURI =
    process.env.MONGODB_URI;


// ======================================
// CONNECT TO MONGODB
// ======================================

async function connectDatabase() {

    if (!mongoURI) {

        console.error(
            "❌ MONGODB_URI is missing. Set it in the server .env file."
        );

        return false;

    }

    try {

        await mongoose.connect(
            mongoURI,
            {
                serverSelectionTimeoutMS: 2000
            }
        );

        app.locals.dbConnected = true;

        console.log(
            "✅ MPower connected to MongoDB"
        );

        return true;

    } catch (error) {

        app.locals.dbConnected = false;

        console.error(
            "❌ MongoDB connection failed:"
        );

        console.error(error);

        return false;

    }

}


// ======================================
// TEST API
// ======================================

app.get(
    "/api/test",
    (req, res) => {

        res.json({

            success: true,

            message:
                "MPower API is working!"

        });

    }
);


// ======================================
// DATABASE TEST
// ======================================

app.get(
    "/api/database-test",
    async (req, res) => {

        if (
            !app.locals.dbConnected ||
            mongoose.connection.readyState !== 1
        ) {

            return res.status(503).json({

                success: false,

                message:
                    "Database is unavailable. Check MongoDB Atlas access and whitelist settings."

            });

        }

        try {

            const collections =
                await mongoose
                    .connection
                    .db
                    .listCollections()
                    .toArray();


            res.json({

                success: true,

                message:
                    "MPower is connected to MongoDB! 🎉",

                collections:
                    collections.map(
                        collection =>
                            collection.name
                    )

            });

        } catch (error) {

            console.error(
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Database test failed."

            });

        }

    }
);


// ======================================
// SERVER START
// ======================================

const PORT =
    process.env.PORT || 5000;


async function startServer() {

    connectDatabase();

    app.listen(
        PORT,
        () => {

            console.log(
                `🚀 MPower backend running on port ${PORT}`
            );

            console.log(
                `http://localhost:${PORT}`
            );

        }
    );

}

if (require.main === module) {
    startServer();
}

module.exports = {
    app,
    startServer
};