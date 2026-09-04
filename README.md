# MPower 🌱

## Food Rescue and Redistribution Platform

MPower is a web-based platform designed to help reduce food waste by connecting organizations with surplus food to charities and organizations that can redistribute that food to people who need it.

The platform provides a structured system for managing food donations, food requests, volunteers, and deliveries.

---

## 📌 The Problem

A significant amount of usable food can be wasted by restaurants and other food organizations.

At the same time, charities and communities may need access to food resources.

One of the challenges is the lack of an organized system that connects organizations with surplus food to charities that need it and helps coordinate the delivery process.

MPower was created to provide a digital solution to this problem.

---

## 💡 Our Solution

MPower connects three major groups:

### 🍽️ Donors

Donors such as restaurants can:

* Create food donations
* Add food details
* Specify quantity and unit
* Add a pickup location
* Provide an expiry date
* Add contact information
* Upload food images
* Edit their donations
* Delete available donations
* Monitor donation status

### ❤️ Charities

Charities can:

* View available food donations
* Search for donations
* Filter donations by category
* Request available food
* Specify the quantity they need
* Select a pickup date
* Add request notes
* Track their requests
* Confirm receipt of delivered donations

### 🚚 Volunteers

Volunteers help coordinate food deliveries.

They can:

* View active deliveries
* Manage assigned deliveries
* Update delivery progress
* Track delivery status
* Help move donations from donors to charities

---

# 🔄 MPower Workflow

The main workflow of MPower is:

```text
Restaurant / Donor
        │
        │ Creates Donation
        ▼
   Food Available
        │
        │ Charity Requests Food
        ▼
   Food Request
        │
        │ Volunteer Handles Delivery
        ▼
  Delivery In Progress
        │
        │ Food Delivered
        ▼
 Charity Confirms Receipt
        │
        ▼
    Completed
```

---

# ✨ Main Features

## 🔐 Authentication

MPower uses user authentication and different user roles.

Supported roles include:

* Restaurant
* Charity
* Volunteer
* Administrator

Each role has access to functionality relevant to its responsibilities.

---

## 🍱 Food Donation Management

Restaurants can create food donations containing information such as:

* Food name
* Category
* Quantity
* Unit
* Location
* Expiry date
* Contact information
* Notes
* Food image

Donations are given a status so that the system can determine whether they are still available or already being processed.

---

## 🔎 Food Search and Filtering

Charities can search available donations by information such as:

* Food name
* Location
* Donor

They can also filter donations by category.

---

## 📋 Food Requests

A charity can select an available donation and submit a request.

The charity can specify:

* Requested quantity
* Pickup date
* Additional notes

The system validates the request before sending it to the backend.

---

## 🚚 Delivery Tracking

Volunteers help coordinate requested food donations.

The delivery process can progress through different stages, allowing users to understand what is happening with a donation.

Example statuses include:

```text
Assigned
   ↓
Picked Up
   ↓
In Transit
   ↓
Delivered
   ↓
Completed
```

---

## ✅ Receipt Confirmation

After a delivery reaches the charity, the charity can confirm that the food has been received.

The system can then mark the request, delivery, and donation as completed.

---

# 👥 User Roles

| Role          | Responsibility                        |
| ------------- | ------------------------------------- |
| Restaurant    | Creates and manages food donations    |
| Charity       | Requests and receives food donations  |
| Volunteer     | Helps coordinate and track deliveries |
| Administrator | Manages the platform                  |

---

# 🛠️ Technologies

MPower is developed using web technologies including:

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Development

* Visual Studio Code
* Git
* GitHub

---

# 📁 Project Structure

The exact structure may vary depending on the current version of the project.

A typical structure is:

```text
MPower/
│
├── client/
│   ├── html/
│   ├── css/
│   ├── js/
│   └── images/
│
├── server/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── package.json
├── package-lock.json
└── README.md
```

---

# 🚀 Running the Project Locally

## 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

## 2. Open the project

```bash
cd MPower
```

## 3. Install dependencies

```bash
npm install
```

## 4. Start the server

Use the command configured in the project's `package.json`.

For example:

```bash
npm start
```

or:

```bash
npm run dev
```

---

# 🌐 Live Project

**Live Website:**

[PASTE YOUR LIVE DEPLOYMENT LINK HERE]

---

# 💻 GitHub Repository

**Public GitHub Repository:**

[PASTE YOUR PUBLIC GITHUB REPOSITORY LINK HERE]

---

# 🎯 Project Objectives

The main objectives of MPower are to:

1. Help reduce unnecessary food waste.
2. Connect food donors with charities.
3. Make food donation management easier.
4. Improve the organization of food requests.
5. Help coordinate food deliveries.
6. Provide visibility into donation and delivery status.
7. Demonstrate how technology can be used to address a real-world social problem.

---

# 🌍 Potential Impact

MPower has the potential to contribute to reducing food waste by making it easier for organizations with surplus food to connect with charities.

The platform can also improve the organization and transparency of the redistribution process by allowing users to manage donations, requests, and deliveries through one system.

Potential benefits include:

* Reduced food waste
* Better coordination between organizations
* Easier access to available food donations
* Improved delivery management
* Better visibility of donation status
* Encouragement of food redistribution

---

# 🔮 Future Improvements

Future versions of MPower could include:

* Real-time maps
* Location-based donor and charity matching
* Push notifications
* Email notifications
* Automated donation matching
* Advanced analytics
* Improved administrator controls
* Mobile application
* Real-time delivery tracking

---

# 🏆 NDLC Competition 2026

**Competition:** NDLC Competition 2026

**Stage:** Stage 3

**Project:** MPower

**Developer:** Eric Olabode

**Project Type:** Software / Web Application

---

# 📄 Project Links

| Resource          | Link                       |
| ----------------- | -------------------------- |
| GitHub Repository | YOUR_GITHUB_REPOSITORY_URL |
| Live Website      | YOUR_LIVE_PROJECT_URL      |

---

# 👨‍💻 Developer

**Eric Olabode**

MPower was developed as a software solution for the NDLC Competition 2026 to demonstrate how technology can be applied to address food waste and improve food redistribution.
