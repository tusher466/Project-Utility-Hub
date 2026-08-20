[README.md](https://github.com/user-attachments/files/31275862/README.md)

# ⚡ Utility Hub

<p align="center">
  <strong>A modern, browser-based counting, QR scanning, and NFC student verification workspace.</strong>
</p>

<p align="center">
  <a href="https://github.com/tusher466/Project-Utility-Hub">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub Repository">
  </a>
  <a href="https://utilityhub-three-beta.vercel.app/">
    <img src="https://img.shields.io/badge/Vercel-Live%20Deployment-000000?style=for-the-badge&logo=vercel" alt="Vercel Deployment">
  </a>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/QR%20Scanning-jsQR-111827?style=flat-square" alt="jsQR">
  <img src="https://img.shields.io/badge/Charts-Recharts-22C55E?style=flat-square" alt="Recharts">
  <img src="https://img.shields.io/badge/Animations-Motion-7C3AED?style=flat-square" alt="Motion">
  <img src="https://img.shields.io/badge/Storage-localStorage-F59E0B?style=flat-square" alt="localStorage">
</p>

---

## 📌 Overview

**Utility Hub** is a responsive, client-side productivity and campus utility application built with React, TypeScript, Vite, and Tailwind CSS.

The application combines several practical workflows in one interface:

- 🎯 Precision tally/counter management
- 📷 Live QR-code scanning
- 🖼️ QR scanning from uploaded images
- 📋 Clipboard/image-based scanning workflows
- 📡 Web NFC student-card scanning where supported
- 🎓 Student ID / smart-card verification
- 🔢 Automatic counter increments after successful scans
- 🧾 Scan and counter audit history
- 📊 Daily activity insights and charts
- 📤 CSV data export
- 🖨️ Printable NFC/student-card layouts
- 🔊 Scan feedback with sound and haptic controls
- 💾 Browser-local persistence with `localStorage`
- ⚙️ Configurable scanning and counter settings

The project is especially suited to **class attendance, event check-in, campus pass verification, tallying, laboratory access workflows, and small offline-first operational dashboards**.

---

## ✨ Why Utility Hub?

Many small operational tasks require switching between separate tools:

> Counter → QR Scanner → Attendance Record → Report → Student Verification

Utility Hub brings these workflows together.

A successful QR or NFC scan can be recorded and, when automatic incrementing is enabled, linked directly to the currently selected counter. The application also keeps an audit trail so operators can review what happened later.

### Core idea

```text
                 ┌─────────────────────────┐
                 │      Utility Hub         │
                 │  Central Workstation     │
                 └────────────┬────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │  Precision  │     │ Scan Corner │     │   History   │
   │   Counter   │     │ QR + NFC    │     │ + Insights  │
   └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
                     ┌─────────────────┐
                     │ Local Persistence│
                     │   localStorage   │
                     └─────────────────┘
```

---

## 🚀 Main Features

### 1. 🎯 Precision Counter

Create and manage multiple independent counters.

**Supported operations:**

- Increment
- Decrement
- Directly set a value
- Reset to zero
- Configure step size
- Configure target value
- Create additional counters
- Delete counters
- Select an active counter
- Track every counter change in an audit log
- Display target progress
- Prevent values from going below the configured minimum

Example use cases:

- Class attendance
- Event registration
- Visitor counting
- Inventory tallying
- Lab equipment usage
- Participant check-in
- Manual operational counting

---

### 2. 📷 QR Scanner

The Student Scan Corner provides browser-based QR scanning using the device camera.

The implementation uses **jsQR** to decode QR images from the camera stream.

Supported workflows include:

- Live camera scanning
- Front/rear camera switching
- Torch/flash control when supported
- Continuous scanning
- Image upload
- Drag-and-drop image scanning
- Clipboard/image scanning
- Scan-result preview
- Duplicate-scan protection/debounce
- Scan feedback
- Automatic counter incrementing

### QR content detection

The built-in parser recognizes:

| QR Type | Example / Detection |
|---|---|
| 🌐 URL | `https://example.com` |
| 📶 Wi-Fi | `WIFI:S:Network;T:WPA;P:Password;;` |
| ✉️ Email | `name@example.com` / `mailto:` |
| ☎️ Phone | `+880...` / `tel:` |
| 💬 SMS | `sms:` / `smsto:` |
| 📍 Geo | `geo:latitude,longitude` |
| 📝 Text | Any other unrecognized payload |

The decoded information is stored as a structured scan record.

---

### 3. 📡 NFC Student Card Scanning

Where the browser and device support the **Web NFC API**, Utility Hub can read NFC NDEF data.

The application detects NFC support and provides a dedicated NFC scanning experience.

The student-card workflow supports information such as:

- Student ID
- Student name
- Department
- Institution
- Batch
- Card type
- NFC serial number
- Status
- Issue/validity information
- Scan timestamp

Supported card categories in the application's data model include:

- Student ID
- Library Pass
- Campus Transit
- Exam Hall Pass
- Lab Access
- Custom NFC

> **Important:** Web NFC availability depends on the browser, operating system, device hardware, permissions, and secure-context requirements. A normal desktop browser may not provide NFC access even though the application itself supports the feature.

---

### 4. 🎓 Student Verification

After an NFC/student-card scan, the application can display a detailed verification modal.

The verification interface includes:

- Student identity
- Department
- Institution
- Student ID
- NFC UID/serial
- Card type
- Verification status
- Batch information
- Scan timestamp
- Current counter
- Copy-to-clipboard actions
- Printable card/report options

The UI is designed around a campus smart-card concept, making it suitable for demonstrations and campus utility workflows.

---

### 5. 🔢 Scan → Counter Automation

One of the key features is the connection between scanning and counting.

When automatic incrementing is enabled:

```text
QR/NFC Scan
     │
     ▼
Decode / Identify
     │
     ▼
Create Scan Record
     │
     ▼
Identify Active Counter
     │
     ▼
Increment Counter (+1)
     │
     ▼
Create Counter Audit Log
     │
     ▼
Show Success Feedback
```

For an NFC student card, the interface can show a student-verification message while automatically adding one count to the active counter.

---

### 6. 🧾 Scan History

Utility Hub stores scan records locally and provides a dedicated history interface.

History functionality includes:

- Search
- Type filtering
- View scan details
- Copy identifiers
- Delete individual records
- Select multiple records
- Batch deletion
- Clear scan history
- Export scan records
- View activity insights

Search can match information such as:

- Raw QR payload
- Student ID
- Student name
- Department
- Counter name
- Log reason
- Notes/context

---

### 7. 📊 Daily Insights & Analytics

The application includes a visual activity dashboard powered by **Recharts**.

Analytics can be viewed over:

- Last 7 days
- Last 14 days

The dashboard calculates:

- Total scans
- NFC scans
- QR scans
- Counter events
- Total events
- Average daily activity
- Peak activity day

Chart modes include:

- Grouped view
- Stacked view

This gives operators a quick understanding of daily activity without requiring an external analytics service.

---

### 8. 📤 CSV Export

Utility Hub can export operational data directly from the browser.

Available export scopes include:

#### Scan Records

Exports fields such as:

- Record ID
- Timestamp
- Content type
- Scan source
- Decoded payload
- Student name
- Department
- Card type
- NFC serial number
- Parsed details

#### Counter Logs

Exports:

- Log ID
- Timestamp
- Counter ID
- Counter category
- Previous value
- Delta
- New value
- Action reason
- Note/context

#### Combined Report

The application can also generate a combined CSV containing:

```text
Student Scans
      +
Counter Audit Logs
      =
Complete Operational Report
```

The CSV generator includes UTF-8 BOM handling to improve compatibility with spreadsheet software such as Microsoft Excel.

---

### 9. 🖨️ Printable Student NFC Cards

The application includes a custom browser-based print generator for student NFC cards.

Supported print formats include:

- `badge_duo`
- `single_badge`
- `full_slip`

The print layout is generated dynamically and isolated from the normal application UI.

This allows the application to produce a clean printable student-card/verification document without requiring a separate PDF generation server.

---

### 10. ⚙️ Settings

The application includes configurable operational preferences.

Available settings include:

| Setting | Purpose |
|---|---|
| Sound | Enable/disable scan sound |
| Haptic feedback | Enable/disable device vibration feedback |
| Auto increment | Automatically increment the active counter after scans |
| Debounce | Prevent rapid duplicate automatic increments |
| Vibrate on scan | Provide haptic feedback after scanning |
| Keep screen awake | Keep the workstation active when supported |
| Continuous scan | Continue scanning after a successful read |
| Default step | Default counter increment/decrement step |
| Auto print on NFC | Automatically trigger card printing after NFC scanning |

Settings are persisted in the browser.

---

## 🧠 Application Architecture

Utility Hub follows a lightweight client-side React architecture.

```text
src/
│
├── App.tsx
│   └── Main application state and workflow orchestration
│
├── components/
│   ├── Navbar.tsx
│   ├── CounterSection.tsx
│   ├── StudentScanCorner.tsx
│   ├── ScanHistorySection.tsx
│   ├── DailyInsights.tsx
│   ├── SettingsModal.tsx
│   └── StudentCardDetailsModal.tsx
│
├── utils/
│   ├── qrParser.ts
│   ├── csvExporter.ts
│   ├── printCard.ts
│   └── audio.ts
│
├── types.ts
├── index.css
└── main.tsx
```

---

## 🏗️ Project Structure

```text
Project-Utility-Hub/
│
├── assets/
│   └── .aistudio/
│
├── src/
│   │
│   ├── components/
│   │   ├── CounterSection.tsx
│   │   ├── DailyInsights.tsx
│   │   ├── Navbar.tsx
│   │   ├── QRScannerSection.tsx
│   │   ├── ScanHistorySection.tsx
│   │   ├── SettingsModal.tsx
│   │   ├── StudentCardDetailsModal.tsx
│   │   └── StudentScanCorner.tsx
│   │
│   ├── utils/
│   │   ├── audio.ts
│   │   ├── csvExporter.ts
│   │   ├── printCard.ts
│   │   └── qrParser.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
│
├── .env.example
├── .gitignore
├── bun.lock
├── index.html
├── metadata.json
├── package.json
└── README.md
```

---

## 🛠️ Technology Stack

### Frontend

| Technology | Role |
|---|---|
| **React 19** | UI and component architecture |
| **TypeScript 5.8** | Type-safe application development |
| **Vite 6** | Development server and production bundler |
| **Tailwind CSS 4** | Utility-first styling |
| **Lucide React** | Interface icons |
| **Motion** | UI transitions and animations |
| **Recharts** | Activity charts and analytics |

### Scanner & Browser APIs

| Technology | Role |
|---|---|
| **jsQR** | QR-code decoding |
| **MediaDevices / Camera API** | Live camera access |
| **Web NFC / NDEFReader** | NFC card/NDEF scanning where supported |
| **Clipboard API** | Clipboard interactions |
| **localStorage** | Client-side persistence |
| **Web vibration support** | Haptic feedback where available |
| **Browser Print API** | Student-card printing |

### Utilities

| Library / API | Purpose |
|---|---|
| `canvas-confetti` | Visual feedback effects |
| `dotenv` | Environment configuration support |
| `@google/genai` | Google Gemini SDK dependency present in the project |
| Express / tsx | Supporting runtime/tooling dependencies |

> The current application source primarily implements its operational workflows on the client side. The Gemini SDK is present as a project dependency/configuration capability, but the inspected application components do not currently make an active Gemini API call.

---

## 💾 Data Storage

Utility Hub is currently designed as a **client-side application**.

Application state is persisted using browser `localStorage`.

The following storage keys are used:

```text
count_qr_settings
count_qr_counters
count_qr_active_id
count_qr_counter_logs
count_qr_scan_records
```

### Storage limits

The application intentionally keeps only a bounded amount of history:

- Up to **100 counter logs**
- Up to **200 scan records**

This helps prevent unlimited local browser-state growth.

### Important

Because the application uses browser storage:

- Data belongs to the current browser/profile.
- Data is not automatically synchronized between devices.
- Clearing browser storage can remove saved application data.
- Private/incognito browsing may behave differently depending on the browser.
- There is currently no remote database/authentication layer in the inspected application.

For production deployments requiring centralized attendance or campus records, a backend/database should be added.

---

## 🔐 Privacy & Security

Utility Hub is designed around local browser processing and storage.

### Current characteristics

- Scan records are stored locally in the browser.
- No application database is required for the current workflow.
- Camera access is requested by the browser.
- NFC access is controlled by browser/device support and permissions.
- Exported CSV files are generated locally.
- Printing is generated locally through browser print functionality.

### Security recommendations for production

If this application is extended into a real institutional system, consider adding:

- Authentication
- Role-based access control
- Encrypted server-side storage
- HTTPS-only deployment
- Audit trails on the server
- Data retention policies
- Student privacy controls
- Access logging
- Database backups
- API validation
- Rate limiting
- Secure NFC/QR payload validation

---

## 📱 Browser & Device Requirements

### QR scanning

Camera scanning requires:

- A camera-enabled device
- Browser camera permission
- `localhost` during local development or an HTTPS deployment in production

### NFC scanning

NFC requires:

- NFC-capable hardware
- A compatible browser
- Web NFC support
- User permission
- A secure context

Web NFC is not universally available across browsers and platforms.

### Recommended testing

For the complete scanner experience, test on:

- Android + compatible Chromium-based browser
- HTTPS deployment
- Device with camera
- NFC-capable Android device for Web NFC testing

---

## ⚙️ Installation

### Prerequisites

Install:

- Node.js 18+ recommended
- npm, Bun, or another compatible package manager
- A modern browser

Check Node.js:

```bash
node --version
```

Check npm:

```bash
npm --version
```

---

## 📥 Clone the Repository

```bash
git clone https://github.com/tusher466/Project-Utility-Hub.git
cd Project-Utility-Hub
```

---

## 📦 Install Dependencies

Using npm:

```bash
npm install
```

Using Bun:

```bash
bun install
```

The repository includes a `bun.lock` file, so Bun is also a natural package-manager option.

---

## 🔑 Environment Variables

The repository includes an `.env.example` file.

Create your local environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

The example configuration contains:

```env
GEMINI_API_KEY="MY_GEMINI_API_KEY"
APP_URL="MY_APP_URL"
```

### Important

Do **not** commit real API keys or secrets to GitHub.

If the current client-side build does not require these variables for a particular workflow, you can keep them configured only when the corresponding integration is actually enabled.

---

## ▶️ Run in Development

```bash
npm run dev
```

The Vite configuration starts the development server on port `3000`.

Open:

```text
http://localhost:3000
```

You can also use:

```bash
bun run dev
```

---

## 🏭 Production Build

Create an optimized production build:

```bash
npm run build
```

The generated production files are placed in:

```text
dist/
```

---

## 🔍 Preview Production Build

After building:

```bash
npm run preview
```

---

## 🧹 Clean Build Output

The project provides:

```bash
npm run clean
```

This removes:

```text
dist/
server.js
```

---

## 🧪 Type Checking

Run TypeScript validation with:

```bash
npm run lint
```

This executes:

```bash
tsc --noEmit
```

---

## ☁️ Deploy to Vercel

Utility Hub is compatible with Vercel's Vite deployment workflow.

### Recommended setup

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Select the project root as the Vercel Root Directory.
4. Use the detected Vite framework settings.
5. Build command:

```bash
npm run build
```

6. Output directory:

```text
dist
```

7. Deploy.

### Existing deployment

The project is associated with the following Vercel project:

**Utility Hub**

https://utilityhub-three-beta.vercel.app/

### If you move the application into a subdirectory

For example:

```text
Project-Utility-Hub/
└── frontend/
    ├── package.json
    ├── src/
    └── ...
```

Update Vercel's:

```text
Settings → General → Root Directory
```

to:

```text
frontend
```

Otherwise Vercel may attempt to build from the wrong directory.

---

## 🔄 How Data Flows Through the Application

### QR workflow

```text
Camera / Image
      │
      ▼
     jsQR
      │
      ▼
Raw QR Payload
      │
      ▼
parseQRContent()
      │
      ├── URL
      ├── Wi-Fi
      ├── Email
      ├── Phone
      ├── SMS
      ├── Geo
      └── Text
      │
      ▼
ScanRecord
      │
      ├── History
      ├── CSV Export
      └── Counter Increment
```

### NFC workflow

```text
NFC Card
   │
   ▼
Web NFC / NDEFReader
   │
   ▼
NFC Payload / Card Data
   │
   ▼
Student Card Information
   │
   ├── Verification Modal
   ├── Scan History
   ├── Counter Increment
   ├── CSV Export
   └── Printable Card
```

### Counter workflow

```text
Manual Action
     │
     ├── + Increment
     ├── - Decrement
     ├── Direct Set
     └── Reset
            │
            ▼
      Counter State
            │
            ▼
       CounterLog
            │
            ▼
       Local Storage
```

---

## 🧩 Application Views

Utility Hub provides four primary application views.

### `dual`

The default workstation view combines:

```text
┌───────────────────────┬─────────────────────────┐
│                       │                         │
│   Precision Counter   │   Student Scan Corner   │
│                       │                         │
│                       │     QR + NFC            │
│                       │                         │
└───────────────────────┴─────────────────────────┘
```

### `counter`

A focused counter-management screen.

### `scanner`

A dedicated scanning workstation.

### `history`

A dedicated activity, analytics, and export workspace.

---

## 🎨 UI / UX Design

The interface uses a modern operational-dashboard style.

### Design characteristics

- Clean light workspace
- Slate-based visual system
- Indigo accent color
- Dark smart-card presentation
- Rounded cards
- Soft shadows
- Responsive layouts
- Animated transitions
- Toast notifications
- Modal workflows
- Keyboard-friendly close interactions
- Mobile-aware layouts
- Custom print stylesheet

### Typography

The project loads:

- **Outfit** — headings
- **Plus Jakarta Sans** — primary UI text
- **JetBrains Mono** — technical identifiers and telemetry

---

## 📊 Example Counter Configuration

The application starts with two sample counters:

```text
Class Attendance & Tally
Current: 1284
Target: 2000

Student Event Check-in
Current: 142
Target: 500
```

These values are initial demo data and can be modified or replaced by the operator.

---

## 🧪 Example Usage

### Scenario 1 — Class Attendance

1. Open Utility Hub.
2. Select **Class Attendance & Tally**.
3. Open **Student's Scan Corner**.
4. Enable NFC or QR scanning.
5. Scan a student card/QR code.
6. Verify the student information.
7. The active counter increments automatically when auto-increment is enabled.
8. Review the scan in History.
9. Export attendance records as CSV.

---

### Scenario 2 — Campus Event Check-in

```text
Create Counter
      ↓
"Spring Fest 2026"
      ↓
Set target
      ↓
Enable QR auto-increment
      ↓
Scan participant QR
      ↓
+1 attendee
      ↓
Review analytics
      ↓
Export CSV
```

---

### Scenario 3 — Manual Tally

1. Select a counter.
2. Choose a step size.
3. Use increment/decrement controls.
4. Make direct adjustments when required.
5. Reset the counter when a new session begins.
6. Review the counter audit log.

---

## 🧱 Component Responsibilities

### `App.tsx`

Acts as the main application controller.

Responsibilities:

- Global state
- Counter state
- Scan state
- Settings
- Local storage synchronization
- Counter updates
- Scan processing
- History management
- View switching
- Toast notifications

### `CounterSection.tsx`

Handles:

- Counter selection
- Counter creation
- Counter deletion
- Increment/decrement
- Direct value changes
- Target configuration
- Progress display
- Recent counter logs

### `StudentScanCorner.tsx`

Handles:

- QR scanning
- Camera controls
- Image scanning
- NFC detection
- NFC scanning
- Student-card workflows
- Scan feedback
- Manual student-card entry
- Scan result presentation

### `ScanHistorySection.tsx`

Handles:

- Scan history
- Counter logs
- Search
- Filters
- Selection
- Batch deletion
- Data export
- Analytics display

### `DailyInsights.tsx`

Handles:

- Daily aggregation
- QR/NFC statistics
- Counter events
- Peak-day calculation
- 7/14-day analytics
- Recharts visualizations

### `StudentCardDetailsModal.tsx`

Handles:

- Student verification display
- Card details
- Copy actions
- Printing
- Auto-close behavior

### `SettingsModal.tsx`

Handles application preferences.

### Utility modules

```text
qrParser.ts
    → QR payload classification

csvExporter.ts
    → CSV generation/download

printCard.ts
    → Printable student-card generation

audio.ts
    → Scan feedback audio
```

---

## 🔮 Future Improvements

The current architecture provides a strong foundation for expanding Utility Hub.

### Backend & Data

- [ ] Add PostgreSQL/Supabase/Firebase database
- [ ] Cloud synchronization
- [ ] Multi-device data access
- [ ] Server-side audit logs
- [ ] Automatic backups
- [ ] Data retention controls

### Authentication

- [ ] Admin login
- [ ] Operator accounts
- [ ] Role-based permissions
- [ ] Session management
- [ ] Institution-based workspaces

### Attendance

- [ ] Real student database
- [ ] Duplicate attendance prevention
- [ ] Attendance percentage
- [ ] Class/course mapping
- [ ] Semester management
- [ ] Attendance reports
- [ ] Late-entry tracking

### NFC

- [ ] Expanded NDEF payload parsing
- [ ] Institutional card integration
- [ ] Card registration
- [ ] Card lifecycle management
- [ ] Secure server-side card validation

### QR

- [ ] QR generation
- [ ] Custom QR templates
- [ ] Batch QR generation
- [ ] Signed QR payloads
- [ ] Advanced duplicate detection

### Analytics

- [ ] Monthly reports
- [ ] Custom date ranges
- [ ] PDF reports
- [ ] Exportable charts
- [ ] Attendance trends
- [ ] Operator performance metrics

### AI

The project already contains Gemini-related configuration/dependency support. A future version could use AI for:

- Natural-language attendance summaries
- Automatic report generation
- Activity anomaly detection
- Smart operational insights
- Data-query assistance
- Intelligent report explanations

---

## ⚠️ Known Limitations

1. **Browser-local storage**
   - Data is not shared between devices.
   - Clearing browser storage can remove saved records.

2. **Web NFC compatibility**
   - NFC is browser/device dependent.
   - It should not be assumed to work on every desktop or mobile browser.

3. **Camera permissions**
   - Camera access requires browser permission.
   - Production camera use should be served over HTTPS.

4. **Client-side data**
   - The current application is not a centralized institutional attendance system.
   - It should not be treated as a secure source of truth for sensitive academic records without a backend.

5. **Sample student data**
   - The application contains demonstration student/card records.
   - These should be replaced with real data only after implementing appropriate authentication and security controls.

---

## 🛡️ Production Checklist

Before using Utility Hub for real institutional data:

```text
[ ] Add authentication
[ ] Add role-based authorization
[ ] Add secure backend
[ ] Add database
[ ] Validate all QR/NFC payloads server-side
[ ] Implement duplicate attendance protection
[ ] Add audit logging
[ ] Encrypt sensitive data
[ ] Configure HTTPS
[ ] Define data retention rules
[ ] Add backup and recovery
[ ] Remove demo student records
[ ] Test NFC compatibility on target devices
[ ] Test camera permissions on target browsers
[ ] Add monitoring and error tracking
```

---

## 🤝 Contributing

Contributions are welcome.

### 1. Fork the repository

```bash
git clone https://github.com/tusher466/Project-Utility-Hub.git
```

### 2. Create a feature branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make your changes

Follow the existing TypeScript/React component structure.

### 4. Run validation

```bash
npm run lint
npm run build
```

### 5. Commit

```bash
git add .
git commit -m "feat: add your feature"
```

### 6. Push

```bash
git push origin feature/your-feature-name
```

### 7. Open a Pull Request

Describe:

- What changed
- Why it changed
- How it was tested
- Any browser/device limitations

---

## 📁 Recommended Development Conventions

When extending the project:

- Keep reusable UI inside `src/components/`.
- Keep pure helper logic inside `src/utils/`.
- Define shared interfaces in `src/types.ts`.
- Avoid placing large business logic directly inside JSX.
- Keep browser API access guarded by feature detection.
- Preserve TypeScript typing.
- Use descriptive handler names.
- Keep local-storage keys centralized if more storage areas are added.
- Test camera/NFC features on real devices.
- Run both `npm run lint` and `npm run build` before submitting changes.

---

## 📄 License

A license file is not currently included in the inspected repository.

If this project will be publicly distributed, add an explicit license such as:

- MIT
- Apache-2.0
- GPL-3.0

Do not claim a specific open-source license until the repository contains the corresponding license file.

---

## 👨‍💻 Author

**Md. Tusher Hossen**

Computer Science & Engineering Student

### Links

- GitHub: https://github.com/tusher466
- Repository: https://github.com/tusher466/Project-Utility-Hub
- Vercel Project: https://utilityhub-three-beta.vercel.app/
---

## ⭐ Project Highlights

| Area | Capability |
|---|---|
| 🎯 Counter | Multiple precision counters |
| 📷 QR | Live camera + image scanning |
| 📡 NFC | Web NFC student-card workflow |
| 🎓 Verification | Student card details and status |
| 🔄 Automation | Scan-to-counter increment |
| 🧾 History | Search, filter, delete, batch actions |
| 📊 Analytics | 7/14-day activity insights |
| 📤 Export | Scan, log, and combined CSV reports |
| 🖨️ Printing | Student NFC badge/card printing |
| ⚙️ Settings | Scanner and feedback controls |
| 💾 Persistence | Browser localStorage |
| 📱 Responsive | Desktop and mobile-oriented UI |
| ☁️ Deployment | Vite production build / Vercel compatible |

---

## 🌟 Final Note

Utility Hub is more than a simple QR reader or tally counter. Its architecture combines **counting, scanning, student verification, operational history, analytics, exporting, and printing** into a single browser-based workspace.

The current implementation is intentionally lightweight and client-side, making it easy to run and deploy. With the addition of authentication, a secure backend, and a centralized database, the same architecture can evolve into a larger **campus attendance, event management, access verification, or smart-card operations platform**.

<p align="center">
  <strong>Built with React • TypeScript • Vite • Tailwind CSS • jsQR • Web NFC • Recharts</strong>
</p>

<p align="center">
  ⭐ If you find Utility Hub useful, consider starring the repository.
</p>
