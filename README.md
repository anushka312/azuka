
# Azuka 🌙

### A cycle-aware fitness and wellness decision system.
![G__hEBwbEAUIID4](https://github.com/user-attachments/assets/e06cc00c-37a3-45d2-81bf-b4a1d3d40669)

Azuka is not just another tracking app; it is a **daily decision system** designed to align female fitness with biological reality. Most systems fail women by expecting physiological consistency. Azuka replaces rigid planning with **biological awareness**, adapting workouts, nutrition, and recovery based on real-time hormonal and lifestyle signals.

---

## 🚀 Core Functionalities

### 1. Daily Readiness Engine

Evaluates cycle phase, symptoms, sleep, and stress to determine a daily "state."

* **Actionable Guidance:** Decides whether to push, maintain, or recover.
* **Dynamic Framing:** Adjusts mental and physical goals based on current hormonal capacity.

### 2. Adaptive Workout & Nutrition Planning

* **Smart Scheduling:** A 7-day plan that shifts with the menstrual cycle and automatically recalibrates for missed sessions.
* **Food Vision:** Camera-based macro estimation and phase-aligned meal suggestions.
* **Craving Decoder:** Contextualizes cravings through the lens of blood sugar and cycle patterns.

### 3. Intelligent Recovery

* **Streak Protection:** Re-plans automatically to avoid "broken streak" psychology.
* **Ingredient-Based Recipes:** Generates meals based on on-hand ingredients that support current hormone needs.

---

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React Native, Expo |
| **Backend** | Node.js, Express |
| **Database** | MongoDB |
| **Intelligence** | Gemini-2.5-Flash (LLM) |
| **Architecture** | Agent-Based Decision System |

---

## 💻 Getting Started

You will need two terminal windows to run the full stack simultaneously.

### 1. Prerequisites

* Node.js (v16 or higher)
* npm or yarn
* Expo Go app (for mobile testing)

### 2. Start the Backend Server

```bash
cd backend
npm install  # Run only once to install dependencies
npm run dev

```

*The server will start on `http://localhost:5000*`

### 3. Start the Frontend Application

```bash
cd frontend
npm install  # Run only once to install dependencies
npx expo start -c

```

### 📱 Running the App

* **Physical Device:** Scan the QR code in the terminal using the **Expo Go** app.
* **Android:** Press `a` to run on an emulator.
* **iOS:** Press `i` to run on a simulator.

---

## 🧠 The "Agentic" Approach

Unlike standard apps that use simple `if/then` logic, Azuka utilizes an **Agent-Based Decision System**. This modular architecture processes multi-source inputs—biometrics, cycle data, and habit history—to generate context-aware recommendations that feel personal, not programmed.

---
