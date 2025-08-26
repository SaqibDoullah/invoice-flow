# InvoiceFlow

InvoiceFlow is a production-ready Invoice Generator web app built with Next.js, Firebase, and Tailwind CSS. It allows users to securely manage their invoices with features like creation, editing, PDF export, and status tracking, all while being optimized for Firebase's free tier.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Firebase CLI](https://firebase.google.com/docs/cli) for deployment

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install NPM packages:**
    ```bash
    npm install
    ```

3.  **Set up Firebase:**
    - Create a new project on the [Firebase Console](https://console.firebase.google.com/).
    - Add a new Web App to your project.
    - Copy the Firebase configuration object.

4.  **Configure environment variables:**
    Create a `.env.local` file in the root of your project and add your Firebase configuration.

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

5.  **Set up Firestore:**
    - In the Firebase Console, go to **Firestore Database** and **create a database**.
    - Start in **production mode**. Select a location closest to you.
    - Go to the **Rules** tab and paste the following rules, then click **Publish**:
      ```
      rules_version = '2';
      service cloud.firestore {
        match /databases/{database}/documents {
          // Users can only read and write their own documents
          match /users/{userId} {
             allow read, write: if request.auth != null && request.auth.uid == userId;
          }
          match /invoices/{invoiceId} {
            allow read, update, delete: if request.auth != null && resource.data.ownerId == request.auth.uid;
            allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
          }
        }
      }
      ```
    - **CRITICAL:** Go to the **Indexes** tab and create a **composite index**. Firestore will likely provide a link in the browser's developer console to create this automatically when you first run the app. If not, create it manually with these settings:
        - **Collection ID:** `invoices`
        - **Fields to index:** 
            1. `ownerId` (Ascending)
            2. `createdAt` (Descending)
        - **Query scope:** Collection

6.  **Enable Firebase Authentication:**
    - In the Firebase Console, go to **Authentication**.
    - On the **Sign-in method** tab, enable the **Email/Password** provider.

### Running the Development Server

To run the app in development mode, execute:

```bash
npm run dev
```

Open [http://localhost:9003](http://localhost:9003) to view it in the browser.

## Deployment

To deploy the application to Firebase Hosting:

1.  **Login to Firebase:**
    ```bash
    firebase login
    ```

2.  **Initialize Firebase (if not already done):**
    ```bash
    firebase init hosting
    ```
    - Select your Firebase project.
    - Set your public directory to `out`.
    - Configure as a single-page app (rewrite all urls to /index.html): **No**.
    - Set up automatic builds and deploys with GitHub: **No**.

3.  **Build the application:**
    ```bash
    npm run build
    ```
    This will create an `out` directory with the static assets of your Next.js application.

4.  **Deploy to Firebase Hosting:**
    ```bash
    firebase deploy --only hosting
    ```

After deployment, Firebase CLI will provide you with the URL to your live application.
