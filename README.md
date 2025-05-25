# Node.js Assessment – InsuredMine (2025)

This project is a Node.js-based backend system built to manage and process insurance-related data. It involves multiple entities like Agents, Users, Policies, and real-time server monitoring. The system interacts with MongoDB and supports features like file uploads, searching, aggregation, and scheduled tasks.

---

## 📁 Project Structure

The application is designed with the following MongoDB collections:

1. **Agent**
   - `name`

2. **User**
   - `first_name`, `dob`, `address`, `phone_number`, `state`, `zip_code`, `email`, `gender`, `userType`

3. **User's Account**
   - `account_name`

4. **Policy Category (LOB)**
   - `category_name`

5. **Policy Carrier**
   - `company_name`

6. **Policy Info**
   - `policy_number`, `policy_start_date`, `policy_end_date`, 
   - `policy_category_id`, `company_id`, `user_id`

---

## ✅ Features Implemented

### 📌 **Task 1: Core Functionality**

1. **Upload API**
   - Upload `.xlsx` or `.csv` files to MongoDB using **worker threads** for background processing.

2. **Search API**
   - Search for policy information using the **username (email)**.

3. **Aggregated Policy Info**
   - Returns an aggregation of policy data **grouped by user**.

4. **Modular Collections**
   - Data is distributed across separate collections: Agent, User, Account, LOB, Carrier, and Policy Info.

---

### ⚙️ **Task 2: Advanced Functionalities**

1. **Real-time CPU Monitoring**
   - The server continuously monitors CPU usage.
   - If CPU usage exceeds **70%**, the server is restarted automatically.

2. **Scheduled Message Service**
   - POST API to accept `message`, `day`, and `time`.
   - Inserts the message into the database **exactly at the specified date and time**.

---

## 📦 Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **Worker Threads**
- **Node-cron** (or similar for scheduling)
- **os-utils** / `os` module for CPU monitoring

---

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/manojkumar-mjkr/nodejs-assessment-insuredmine-2025.git
cd nodejs-assessment-insuredmine-2025
