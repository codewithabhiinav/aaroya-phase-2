# Aarogya Emergency QR Scribe — Scan to Save

**Voice-First Emergency Handover System**

Developed by **Team HealthNova** | K.R. Mangalam University (KRMU), School of Medical and Allied Sciences (SOMC)

> ⚠️ **Hackathon Prototype** — Not clinically validated. Uses synthetic data only. Do not use with real patient information.

## Overview

Aarogya Emergency QR Scribe transforms emergency voice/text notes into structured, paramedic-verified handover records accessible through unique QR codes. The system enables:

1. **Capture** — Voice or text input of emergency observations
2. **Structure** — AI-assisted structured note generation
3. **Verify** — Paramedic reviews and confirms accuracy
4. **Generate QR** — Unique QR code links to the record
5. **Scan** — Doctor accesses record via QR link on any device

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v6
- **QR Generation:** qrcode
- **PDF Export:** jsPDF
- **Icons:** Lucide React
- **Voice Input:** Browser Web Speech API
- **Storage:** Local Storage (Demo Mode) / Supabase (when configured)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Copy `.env.example` to `.env` and configure as needed:

```bash
cp .env.example .env
```

**No environment variables are required for demo mode.** The application works entirely with local storage when no credentials are configured.

See `.env.example` for available configuration options.

## Features

### Current (Phase 1)
- ✅ Voice/text capture via Web Speech API
- ✅ Deterministic AI structured draft generation
- ✅ Human verification workflow
- ✅ Unique QR code generation per case
- ✅ Doctor-facing browser record page
- ✅ Case history with search and filter
- ✅ PDF export and print functionality
- ✅ Demo mode with synthetic data
- ✅ Local storage persistence
- ✅ Responsive mobile-first design

### Planned (Phase 2-4)
See the in-app Roadmap page for future development plans.

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

The `vercel.json` file handles SPA routing automatically.

### Netlify

```bash
npm run build
# Deploy the dist/ folder
```

Add a `_redirects` file in the `public/` directory:
```
/*    /index.html   200
```

### Any Static Host

Build the project and serve the `dist/` directory. Ensure all routes fall back to `index.html` for SPA routing.

### QR Code Base URL

QR codes use `window.location.origin` by default. When deployed to a custom domain, QR links will automatically use the deployed URL. For explicit configuration, set `VITE_BASE_URL` in your environment.

## Data Model

```typescript
interface EmergencyCase {
  id: string;              // Internal UUID
  publicToken: string;     // Public access token for QR links
  createdAt: string;       // ISO timestamp
  status: 'draft' | 'awaiting_verification' | 'verified';
  patientLabel: string;    // Anonymous identifier
  age: string;
  sex: string;
  emergencyCategory: string;
  chiefComplaint: string;
  symptoms: string;
  vitals: Vitals;          // BP, HR, RR, SpO2, Temp, GCS
  allergies: string;
  medicalHistory: string;
  medications: string;
  interventions: string;
  originalTranscript: string;
  aiDraft: string;         // JSON string of structured draft
  verifiedAt: string;
  isDemo: boolean;
}
```

## Supabase Setup (Optional)

To use Supabase instead of local storage:

1. Create a Supabase project
2. Set environment variables:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Create the `emergency_cases` table with appropriate RLS policies
4. Update `src/store.ts` to use Supabase client

**Never expose service-role keys in frontend code.**

## Security Notes

- This prototype uses browser local storage — NOT suitable for real patient data
- QR links have no server-side authorization in demo mode
- Production deployment requires: authentication, authorization, encryption, audit logging
- Never commit API keys or service-role credentials to version control

## Testing

### End-to-End Workflows

**Test A — Case Creation:**
1. Navigate to Dashboard → Create New Case
2. Fill in patient observations
3. Save as Draft
4. Refresh browser — draft persists

**Test B — AI Scribe:**
1. Open a draft case → Scribe page
2. Type or record a transcript
3. Click "Generate Structured Note"
4. Verify fields are extracted correctly
5. Confirm original transcript is preserved

**Test C — Verification:**
1. Navigate to Verify page
2. Edit any field in the AI draft
3. Click "Verify and Save Record"
4. Status changes to "Verified"
5. Edit a field again — verification is invalidated

**Test D — QR Code:**
1. From verified case, generate QR
2. Open QR link in new tab
3. Confirm correct case appears
4. Test invalid URL — shows error page

**Test E — Doctor View:**
1. Open record on mobile-sized screen
2. Verify all details match
3. Copy handover summary
4. Download PDF
5. Print record

**Test F — Case History:**
1. Search by case ID
2. Filter by status
3. Open a record
4. Delete a demo case
5. Confirm it no longer appears

## License

Hackathon prototype — Team HealthNova, KRMU SOMC
