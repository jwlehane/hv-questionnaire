# HV CEO Peer Group - AI Readiness Questionnaire

This project is a web application designed to assess and visualize the AI readiness of companies within the Hudson Valley CEO Peer Group. It includes a questionnaire for data collection, a dashboard for aggregated results, and an overview of strategic AI implementation.

## Features

*   **AI Readiness Questionnaire:** Collects data on current AI usage, adoption scale, barriers, and strategic questions.
*   **Results Viewer:** Authenticated users can view individual questionnaire responses.
*   **Dashboard:** Authenticated users can view aggregated data and insights using Chart.js.
*   **AI Overview:** Provides guidance on business drivers, key considerations, and a 10-step launch plan for Generative AI.
*   **Login Audit Log:** Tracks user logins for the results pages.

## Technologies Used

*   **Frontend:** HTML, CSS, JavaScript
*   **Styling:** Custom CSS with Google Fonts (Inter, Playfair Display)
*   **Charting:** Chart.js
*   **Backend/Database/Authentication:** Google Firebase (Firestore, Authentication, Hosting)

## Setup and Deployment

This project relies heavily on Firebase. To set up and deploy your own instance:

1.  **Firebase Project:** Create a new Firebase project in the Firebase Console.
2.  **Firebase Configuration:** Update the `firebaseConfig` object in `questionnaire.html`, `results.html`, `dashboard.html`, and `log.html` with your project's configuration details.
3.  **Firestore Rules:** Deploy the `firestore.rules` file from this project to your Firebase project to ensure proper data security.
4.  **Firebase Hosting:** Deploy the project using Firebase Hosting. The `firebase.json` file is configured to serve the static assets.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone YOUR_REPOSITORY_URL
    cd hv-questionnaire
    ```
2.  **Open `main.html`:** You can open `main.html` directly in your browser to navigate the application locally, or deploy it via Firebase Hosting for full functionality.

---

**Note:** This `README.md` provides a general overview. For detailed Firebase setup, refer to the official Firebase documentation.
