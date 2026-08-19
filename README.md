# 🏛️ Grand Horizon Event Center - Booking & Registration System

A high-performance, mobile-responsive single-page web application designed to streamline the scheduling, reservation, and management of hall time slots at the **Grand Horizon Event Center**.

---

## 📋 Table of Contents

- [Executive Summary](#-executive-summary)
- [Target Personas](#-target-personas)
- [Key Features](#-key-features)
  - [Planner View (Client Facing)](#-planner-view-client-facing)
  - [Admin Dashboard (Internal Management)](#-admin-dashboard-internal-management)
- [System Architecture & Tech Stack](#-system-architecture--tech-stack)
- [State Engine & Conflict Resolution](#-state-engine--conflict-resolution)
- [Project Directory Structure](#-project-directory-structure)
- [Quick Start Guide](#-quick-start-guide)
- [Future Enhancements Roadmap](#-future-enhancements-roadmap)
- [License](#-license)

---

## 🌟 Executive Summary

The Grand Horizon Event Center Booking & Registration System eliminates scheduling friction, double bookings, and manual paperwork by providing real-time visibility into daily hall availability. It empowers **Event Planners** to explore open slots and submit inquiries instantly, while giving **Facility Administrators** full approval and management control with real-time KPI metrics.

---

## 👥 Target Personas

| Persona | Role | Key Goals | Key Pain Points Solved |
| :--- | :--- | :--- | :--- |
| **Event Planner / Client** | Corporate event organizer, wedding planner, workshop coordinator | View open time slots, submit booking requests, and track approval status in real-time. | Eliminates lack of schedule visibility and phone/email confirmation delays. |
| **Facility Administrator** | Event center manager, operations lead | Evaluate incoming requests, prevent slot conflicts, manage bookings, and analyze metrics. | Replaces manual spreadsheet tracking, paperwork, and double-booking risks. |

---

## ✨ Key Features

### 📅 Planner View (Client Facing)

- **Multi-day Selector Tab Bar**: Easily switch between days (Monday through Sunday) with live "Free Slots" counters per day.
- **Dynamic 5-Slot Daily Grid**: Standardized daily time slots:
  - 🌅 **Morning**: `08:00 AM - 11:00 AM` (`s1`)
  - ☀️ **Midday**: `11:30 AM - 02:30 PM` (`s2`)
  - 🌤️ **Afternoon**: `03:00 PM - 06:00 PM` (`s3`)
  - 🌆 **Late Afternoon**: `06:30 PM - 09:30 PM` (`s4`)
  - 🌙 **Evening**: `10:00 PM - 01:00 AM` (`s5`)
- **Visual Status Cards**:
  - 🟢 **Available (Emerald)**: Displays active *"Book This Slot"* action button.
  - 🟡 **Pending Approval (Amber)**: Displays event title, organizer, and *"Awaiting Admin Review"* indicator.
  - ⬛ **Slot Unavailable (Slate/Dark)**: Displays confirmed reservation status for approved bookings.
- **Booking Request Modal**: Captures required fields (*Event Title*, *Organizer Name*) and optional fields (*Category*, *Guests*, *Notes*) with client-side validation.
- **Reservation Tracker**: Modal window giving clients live approval status across all submitted inquiries.

### 🛡️ Admin Dashboard (Internal Management)

- **Real-Time KPI Metrics**: Metric summary displaying live counts of *Total Inquiries*, *Pending Review*, *Approved Slots*, and *Cancelled/Rejected*.
- **Header Pending Badge**: Pulsing badge in the top navigation header showing count of items awaiting review.
- **Request Management Table**: Data table listing Event Title, Organizer, Day & Time Slot, Category, Guest Count, Status, and Timestamps.
- **One-Click Actions**:
  - **Pending**: `Approve` or `Reject`.
  - **Approved**: `Cancel Booking` (returns slot to Available).
  - **Cancelled**: `Re-approve` (with conflict check) or `Delete Record`.
- **Search & Filter Controls**: Live status pills (*All*, *Pending*, *Approved*, *Cancelled*) and instant text search box (matching titles, organizers, categories, or days).
- **Reset Demo Data**: One-click restoration of initial seed data state.

---

## 🏗️ System Architecture & Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | HTML5, ES6+ JavaScript | Pure vanilla single-page architecture |
| **Styling & Design System** | Tailwind CSS (CDN) | Modern responsive grid & flexbox utility design |
| **Icons & Fonts** | FontAwesome 6, Google Fonts (Inter) | Modern typography & vector iconography |
| **Data Persistence** | `localStorage` + JSON Seed Fallback | `StorageService` layer in `js/data.js` |
| **Local Static Web Server** | PowerShell HTTP Web Server | `server.ps1` serving static assets on port `8000` |

---

## ⚙️ State Engine & Conflict Resolution

The system guarantees **0% schedule overlaps or double-booking conflicts**:

1. **Standardized Slot IDs**: Each time slot is uniquely identified by `[Day]-[SlotId]` (e.g., `Monday-s1`, `Friday-s5`).
2. **State Transition Flows**:
   - **Submission & Approval Flow**:
     ```
     [User Submits Request] ──► [Status: Pending (Amber)] ──► [Admin Approves] ──► [Status: Approved (Slot Unavailable)]
     ```
   - **Cancellation & Re-availability Flow**:
     ```
     [Admin Cancels Request] ──► [Status: Cancelled (Rose)] ──► [Slot Automatically Returns to Available (Green)]
     ```
3. **Re-approval Guard**: When an admin attempts to re-approve a cancelled booking, the state engine validates that no other active (`approved` or `pending`) request claims that slot.

---

## 📁 Project Directory Structure

```
5PRD/
├── 5PRD.md            # Product Requirement Document (PRD)
├── README.md          # Project documentation & reference guide
├── index.html         # SPA container with glassmorphism modals & components
├── server.ps1         # PowerShell static HTTP server script
├── css/
│   └── styles.css     # Custom glassmorphism, animations, scrollbars
└── js/
    ├── data.js        # Standard time slots, seed dataset, StorageService
    └── app.js         # State controller, renderers, handlers, conflict logic
```

---

## 🚀 Quick Start Guide

### Option 1: Run via PowerShell Local Web Server (Recommended)

Run the included PowerShell server script:

```powershell
powershell -ExecutionPolicy Bypass -File server.ps1
```

Then open your browser at:
👉 **[http://localhost:8000/](http://localhost:8000/)**

### Option 2: Open HTML File Directly

Double-click [`index.html`](file:///c:/Users/User/Desktop/5PRD/index.html) or open it directly in any web browser (Chrome, Edge, Firefox, Safari).

---

## 🔮 Future Enhancements Roadmap (Phase 2)

- ✉️ **Email / SMS Notifications**: Automated alerts to clients upon admin approval or cancellation.
- ⚡ **Real-time Conflict Auto-Detection**: Instant websocket/event-driven slot locking.
- 📅 **Calendar Export**: Download `.ics` calendar invites for approved bookings.
- 🏛️ **Multi-Hall Facility Support**: Expand to manage multiple halls/ballrooms within the venue.

---

## 📄 License

Created for Grand Horizon Event Center. All rights reserved.
