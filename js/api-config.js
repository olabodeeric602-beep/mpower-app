"use strict";

// Set MPOWER_API_BASE_URL before loading page controllers for a separate API host.
window.MPOWER_API_BASE_URL =
    window.MPOWER_API_BASE_URL ||
    (window.location.protocol === "file:"
        ? "http://localhost:5000/api"
        : "/api");
