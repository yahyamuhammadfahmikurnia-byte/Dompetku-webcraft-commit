# Dompetku

<<<<<<< HEAD
## Contributors

**Project:** Dompetku  
**Team:** [Team Name]

|Yahya Muhammad Fahmi Kurnia| 
|Hasan Izzudin|
|Faisal Adi Nurhidayah|
|Reiner Satrio Adi Saputro|

**Personal Finance Management for Students**

Dompetku is a web-based personal finance application designed to help university students, particularly those living independently, manage their monthly budgets and plan their savings more effectively.

The application provides financial simulations, spending strategies, savings goals, and financial summaries through a simple, responsive interface.

**Live Website:** https://dompetku-joss.web.app  
**Repository:** https://github.com/yahyamuhammadfahmikurnia-byte/Dompetku-webcraft-commit

---

## Overview

=======
**Personal Finance Management for Students**

Dompetku is a web-based personal finance application designed to help university students, particularly those living independently, manage their monthly budgets and plan their savings more effectively.

The application provides financial simulations, spending strategies, savings goals, and financial summaries through a simple, responsive interface.

**Live Website:** https://dompetku-joss.web.app  
**Repository:** https://github.com/yahyamuhammadfahmikurnia-byte/Dompetku-webcraft-commit

---

## Overview

>>>>>>> b5cba140dbc32ec266f0a3a890bea45908269ea9
Managing personal finances can be challenging for students with limited monthly allowances. Dompetku provides a practical way to understand spending patterns, estimate remaining budgets, and plan financial goals.

Instead of focusing only on expense tracking, the application emphasizes financial planning through interactive simulations and personalized budgeting scenarios.

## Features

| Feature | Description |
|---|---|
| Authentication | Secure registration, login, and password recovery using Firebase Authentication. |
| Dashboard | Overview of financial conditions based on the latest simulation. |
| Budget Simulator | Estimate monthly expenses, remaining balance, and potential savings. |
| Saving Strategies | Compare alternative spending scenarios to identify saving opportunities. |
| Savings Goals | Create, update, and manage personal savings targets. |
| Simulation History | Access, review, and delete previously saved simulations. |
| User Profile | Manage account information and personal preferences. |
| Responsive Interface | Optimized layouts for desktop and mobile devices. |

## Technology Stack

| Category | Technology |
|---|---|
| Frontend | React, JavaScript, CSS |
| Development | Vite |
| Routing | React Router |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| Deployment | Firebase Hosting |
| UI/UX Design | Figma |
| Version Control | Git, GitHub |

## Project Structure

```text
src/
├── assets/
├── components/
│   ├── BudgetChart.jsx
│   ├── ProtectedRoute.jsx
│   ├── QuickSimulation.jsx
│   ├── SavingAssistant.jsx
│   ├── Sidebar.jsx
│   └── SummaryCard.jsx
├── lib/
│   ├── firebase.js
│   └── firestore.js
├── pages/
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   ├── Profil.jsx
│   ├── Register.jsx
│   ├── Riwayat.jsx
│   ├── Simulator.jsx
│   ├── StrategiHemat.jsx
│   └── Target.jsx
├── App.jsx
└── main.jsx
```

## Getting Started

### Prerequisites

- Node.js and npm
- Firebase project with Authentication and Cloud Firestore enabled
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/yahyamuhammadfahmikurnia-byte/Dompetku-webcraft-commit.git
cd Dompetku-webcraft-commit
```

Install dependencies:

```bash
npm install
```

### Environment Configuration

Create a `.env.local` file in the project root and configure the Firebase environment variables required by `src/lib/firebase.js`.

Enable Email/Password authentication in Firebase Authentication and configure Cloud Firestore with appropriate security rules.

Environment files are excluded from version control. Do not commit private keys, service account credentials, or other sensitive information.

### Development

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

### Production Build

```bash
npm run build
```

The production-ready files will be generated in the `dist/` directory.

## Deployment

Dompetku is deployed using Firebase Hosting.

To build and deploy the application:

```bash
npm run build
npx firebase deploy --only hosting --project dompetku-f73e4
```

**Production URL:** https://dompetku-f73e4.web.app

## Data Management

Dompetku uses Cloud Firestore to store user-specific financial information.

The database separates user data using Firebase Authentication user IDs, with records organized into user profiles, simulations, and savings goals.

Data access is restricted through Firestore security rules to prevent users from accessing another account's financial records.

## Limitations

- Financial calculations are based on information provided by users.
- Budget simulations are estimates and do not represent actual bank account balances.
- Internet connectivity is required for Firebase-backed functionality.
- Automated bank synchronization and transaction tracking are not currently supported.

## Development and Attribution

This project was developed using React and Vite, with interface design prepared in Figma.

ChatGPT was used as a development assistant for code implementation, debugging, responsive layout adjustments, Firebase integration guidance, and documentation.

Third-party assets and dependencies remain subject to their respective licenses.

## Contributors

**Project:** Dompetku  
**Team:** [Team Name]

| Name | Student ID |
|---|---|
| [Full Name] | [Student ID] |
| [Full Name] | [Student ID] |
| [Full Name] | [Student ID] |

---

Dompetku — Personal finance planning, made simpler.
