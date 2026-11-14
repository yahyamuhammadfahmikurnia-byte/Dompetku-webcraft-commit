# Dompetku

**Personal Finance Management for Students**

Dompetku is a web-based personal finance application designed to help university students, particularly those living independently, manage their monthly budgets and plan their savings more effectively.

The application provides financial simulations, spending strategies, savings goals, and financial summaries through a simple, responsive interface.

**Live Website:** https://dompetku-joss.web.app  
**Repository:** https://github.com/yahyamuhammadfahmikurnia-byte/Dompetku-webcraft-commit

---

## Project Information

**Project Name:** Dompetku  
**Team Name:** [[6/11, 20.03] yahya: nama timnya apa
[7/11, 16.17] ~hasan: nama tim kita ini aja
[7/11, 16.18] yahya: yang lebih lucu dong san
[7/11, 16.20] ~hasan: "nama timnya apa"ini aja]

**Team Members**

| No. | Name |
|---|---|
| 1 | Yahya Muhammad Fahmi Kurnia |
| 2 | Hasan Izzudin |
| 3 | Faisal Adi Nurhidayah |
| 4 | Reiner Satrio Adi Saputro |

## Overview

Managing personal finances can be challenging for students with limited monthly allowances. Dompetku provides a practical way to understand spending patterns, estimate remaining budgets, and plan financial goals.

Instead of focusing only on expense tracking, the application emphasizes financial planning through interactive simulations and personalized budgeting scenarios.

## Features

| Feature | Description |
|---|---|
| Authentication | User registration, login, and password recovery using Firebase Authentication. |
| Dashboard | Financial overview based on the latest saved simulation. |
| Budget Simulator | Estimate monthly expenses, remaining balance, and potential savings. |
| Saving Strategies | Compare different spending scenarios to identify saving opportunities. |
| Savings Goals | Create, update, and manage personal savings targets. |
| Simulation History | View and manage previously saved financial simulations. |
| User Profile | Manage personal account information. |
| Responsive Design | Interface adapted for desktop and mobile devices. |

## Technology Stack

| Category | Technology |
|---|---|
| Frontend | React, JavaScript, CSS |
| Build Tool | Vite |
| Routing | React Router |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| Hosting | Firebase Hosting |
| UI/UX Design | Figma |
| Version Control | Git, GitHub |

## Project Structure

```text
Dompetku/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── BudgetChart.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── QuickSimulation.jsx
│   │   ├── SavingAssistant.jsx
│   │   ├── Sidebar.jsx
│   │   └── SummaryCard.jsx
│   ├── lib/
│   │   ├── firebase.js
│   │   └── firestore.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Profil.jsx
│   │   ├── Register.jsx
│   │   ├── Riwayat.jsx
│   │   ├── Simulator.jsx
│   │   ├── StrategiHemat.jsx
│   │   └── Target.jsx
│   ├── App.jsx
│   └── main.jsx
├── .gitignore
├── firebase.json
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

## Getting Started

### Prerequisites

Before running the application, make sure the following tools and services are available:

- Node.js and npm
- Git
- A Firebase project with Authentication and Cloud Firestore enabled

### Installation

Clone the repository:

```bash
git clone https://github.com/yahyamuhammadfahmikurnia-byte/Dompetku-webcraft-commit.git
```

Navigate to the project directory:

```bash
cd Dompetku-webcraft-commit
```

Install the dependencies:

```bash
npm install
```

### Environment Configuration

Create a `.env.local` file in the project root.

Configure the Firebase environment variables according to the configuration required by `src/lib/firebase.js`.

Enable Email/Password authentication in Firebase Authentication and configure Cloud Firestore with appropriate security rules.

Do not commit sensitive information, private keys, or service account credentials to the repository.

### Development

Start the local development server:

```bash
npm run dev
```

Open the local address displayed in the terminal.

### Production Build

Generate an optimized production build:

```bash
npm run build
```

The compiled application will be available in the `dist/` directory.

## Deployment

Dompetku is hosted using Firebase Hosting.

Build the application before deploying:

```bash
npm run build
```

Deploy the application to the configured Firebase Hosting site:

```bash
npx firebase deploy --only hosting --project dompetku-f73e4
```

**Production URL:** https://dompetku-joss.web.app

The deployment command targets the hosting site configured in `firebase.json`.

## Data Management

Dompetku uses Cloud Firestore to manage user-specific financial records.

Data is organized under each authenticated user's unique identifier (UID), including:

- **User Profile:** Personal account information.
- **Financial Simulations:** Saved budgeting calculations and financial estimates.
- **Savings Goals:** Financial targets created and managed by users.

Firestore Security Rules restrict access to records belonging to the authenticated user.

## Limitations

- Financial estimates depend on the information entered by users.
- The application does not connect directly to banking services.
- Internet connectivity is required for Firebase-backed features.
- Automatic bank transaction synchronization is not currently supported.
- Financial simulations are intended for personal budgeting assistance, not professional financial advice.

## Development and Attribution

Dompetku was developed using React and Vite, with the user interface designed through Figma.

ChatGPT (OpenAI) was used as a development assistant for code implementation, debugging, responsive design adjustments, Firebase integration guidance, and documentation.

The project uses third-party libraries and development tools under their respective licenses. Any third-party visual assets must retain appropriate attribution where required.

---

Dompetku — Personal finance planning, made simpler.