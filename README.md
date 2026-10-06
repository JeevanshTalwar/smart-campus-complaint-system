# Smart Campus Complaint System 🏛️

A centralized, full-stack, enterprise-grade web platform for reporting, tracking, triaging, resolving, and analyzing campus physical infrastructure issues in real time.

Built for students to easily report problems with photo proof and precise location tags, while equipping university facility management authorities with technician dispatch tools, audit timeline tracking, rule-based duplicate detection, and deep Recharts analytics.

---

## ⚡ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router v6
- **Visualization**: Recharts (Trends, Category breakdowns, Problematic Locations, Priority and Status distributions)
- **Icons**: Lucide React
- **Backend**: Node.js v22+ / v24, Express, TypeScript, Multer (Local file uploads)
- **Database**: Local SQLite via Node.js built-in `node:sqlite` (`DatabaseSync`) — zero external native build tools, zero external DB configuration required!
- **Authentication**: JWT token authentication with bcrypt password hashing and role-based access control (`STUDENT` vs `ADMIN`).

---

## 🚀 Key Features

### 🎓 Student Experience
- **Simple Authentication**: Student registration and sign-in with 1-click Demo Fill.
- **Student Dashboard**: Live KPI cards (Total, In Progress, Resolved, Pending) and recent activity feed.
- **Report Incident / Create Complaint**:
  - Structured categories (*Electrical, Wi-Fi / Internet, Classroom, Cleanliness, Water, Hostel, Laboratory, Security, Other*).
  - Priority levels (*Low, Medium, High, Critical*).
  - Campus building and room/pillar location tagging.
  - Detailed description and on-site photo upload with drag & drop, file type & size validation (up to 5MB), and preview.
- **Rule-Based Duplicate Detection**:
  - Deterministic algorithm comparing category, location, room numbers, and keyword overlap against active unresolved complaints.
  - Warns students before submitting: *"Similar complaint already exists at this location"* with options to view the existing ticket or submit anyway.
- **My Complaints Tracking**: Search, filter by category/priority/status, sort, and view complaint status badges.
- **Transparent Audit Timeline**: Full chronological history of technician assignments, status updates, and interactive comment thread.

### 🛡️ Facility Authority & Admin Experience
- **Operational Command Center**: Real-time KPI summaries, critical hazard alert banner, triage queue, and quick actions.
- **Manage All Complaints**: Full table with multi-filter search, instant assignment modal to designated maintenance wings, and status modification.
- **Resolution Verification**: Formal completion workflows requiring work summary notes and resolution proof photos.
- **Executive Campus Analytics**:
  - Filing trends over time (AreaChart)
  - Category volume vs resolution rates (BarChart)
  - Problematic campus hubs ranking (Horizontal BarChart)
  - Priority breakdown and critical hazard ratios (Donut / PieChart)
  - Lifecycle status distribution (Donut / PieChart)
  - Category SLA turnaround metrics table

---

## 🔑 Demo Accounts

The database is **automatically seeded** with realistic demo accounts and 18+ rich complaints with audit logs and sample photos:

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Student** | `student@demo.com` | `student123` | Student Dashboard, Report Issue, My Complaints |
| **Admin** | `admin@demo.com` | `admin123` | Command Center, Manage Complaints, Analytics |

> *Tip: You can also use the 1-click "Quick Demo Fill" buttons directly on the Login and Landing pages.*

---

## 📦 Project Structure

```text
smart-campus-complaint-system/
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── README.md
├── test-e2e.ts                 # Full end-to-end automated test suite
├── server/
│   ├── index.ts                # Express application & static file delivery
│   ├── db.ts                   # SQLite DatabaseSync initialization & seed data
│   ├── types.ts                # Shared types
│   ├── middleware/
│   │   └── auth.ts             # JWT authentication & role-based route protection
│   ├── routes/
│   │   ├── auth.ts             # Register, Login, Me endpoints
│   │   ├── complaints.ts       # CRUD, Duplicate Detection, Image upload, Assign, Status
│   │   └── analytics.ts        # Aggregated KPI and SLA charts data
│   ├── data/                   # SQLite database storage (campus.db)
│   └── uploads/                # Local storage for reported and resolution images
└── src/
    ├── main.tsx                # React entry point
    ├── App.tsx                 # Router & Protected Route guards
    ├── index.css               # Tailwind styling & animations
    ├── types/                  # TypeScript frontend interfaces
    ├── services/
    │   └── api.ts              # API client with token management
    ├── context/
    │   ├── AuthContext.tsx     # User session management
    │   └── ToastContext.tsx    # Toast notification system
    ├── components/
    │   ├── Navbar.tsx
    │   ├── Sidebar.tsx
    │   ├── Layout.tsx
    │   ├── StatCard.tsx
    │   ├── StatusBadge.tsx
    │   ├── PriorityBadge.tsx
    │   ├── Modal.tsx
    │   ├── ConfirmDialog.tsx
    │   ├── EmptyState.tsx
    │   ├── LoadingSpinner.tsx
    │   ├── ImageUpload.tsx
    │   └── DuplicateWarningModal.tsx
    └── pages/
        ├── LandingPage.tsx
        ├── LoginPage.tsx
        ├── RegisterPage.tsx
        ├── student/
        │   ├── StudentDashboard.tsx
        │   ├── CreateComplaint.tsx
        │   ├── MyComplaints.tsx
        │   └── ProfilePage.tsx
        ├── admin/
        │   ├── AdminDashboard.tsx
        │   ├── ManageComplaints.tsx
        │   └── AnalyticsPage.tsx
        └── shared/
            ├── ComplaintDetails.tsx
            └── NotFoundPage.tsx
```

---

## 🛠️ Quick Installation & Running

### Prerequisites
- Node.js version 22.5.0 or newer (tested on Node v24)
- npm version 10+

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Full Application (Single Command)
```bash
npm run dev
```
This concurrently starts:
- **Backend API Server**: `http://localhost:3001`
- **Vite Web Frontend**: `http://localhost:5173` (with `/api` and `/uploads` proxy to port 3001)

### 3. Production Build & Server
```bash
npm run build
npm start
```
Starts the unified production server on `http://localhost:3001` serving both the API and optimized frontend bundle.

### 4. Run Automated End-to-End Tests
```bash
npx tsx test-e2e.ts
```
Executes automated tests covering authentication, student workflows, admin workflows, duplicate checks, file uploads, role security, and analytics.
