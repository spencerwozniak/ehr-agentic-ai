# Agentic AI Integrations  

[![Try Demo | Serelora](https://img.shields.io/badge/Try%20Demo-Serelora-e1c66d?style=flat-square&logo=https://www.serelora.com/sun.jpg&logoColor=white&labelColor=0a3d5b)](https://www.serelora.com/demo)

<img width="500" height="500" alt="serelora-desktop-app" src="https://github.com/user-attachments/assets/818aaabd-6336-4c12-8e09-c3858e9b9c6c" />
<br/>
EHR-Agnostic Agentic AI Client Desktop App

---

![Node Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square&logo=node.js)  
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)  
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=flat-square&logo=tailwindcss)  
![Electron](https://img.shields.io/badge/Electron-28-47848F?style=flat-square&logo=electron)  

---

**Universal AI Interface for Physicians**  

EHR-agnostic and clinician-first. Specialized AI agents support documentation, orders, and patient communication — without forcing a new EHR.  

## Features  

- **Multi-Agent Orchestration**  
  Drafts notes, suggests orders, and generates patient messages in parallel where safe.  

- **SMART on FHIR Embed**  
  Launch directly inside the EHR using OAuth2/OIDC.  

- **FHIR-Aware Context**  
  Ingests patient bundles and composes structured clinical prompts.  

- **Specialized Agents**  
  - **Documents** → note generation and summaries  
  - **Medications** → order suggestions and safety checks  
  - **General** → patient messages and miscellaneous tasks  

- **Observability**  
  Full trace of intents, prompts, tool invocations, and outputs for audit and compliance.  

- **Privacy & Security**  
  - PHI scoping and redaction  
  - Least-privilege data access  
  - Structured extraction and human-in-the-loop review  

- **Guardrails**  
  Tool permissioning, validation layers, and auditability baked in.  

- **Cross-Platform**  
  Available as:  
  - **Web App** (Next.js + TypeScript + Tailwind)  
  - **Desktop App** (Electron wrapper with secure preload/IPC)  

- **Rich Rendering**  
  Markdown + MDX components for tables, code snippets, and clinical blockquotes.  

---

## Tech Stack  

- **Frontend**: [Next.js](https://nextjs.org/) + TypeScript + Tailwind CSS  
- **Desktop**: Electron with secure IPC bridge
- **Healthcare Integration**: SMART on FHIR, OAuth2/OIDC
- **Observability & Logging**: Agent trace with structured output
- **Data Privacy**: PHI redaction, scoped data handling  

---

## Installation  

### Prerequisites  
- Node.js (v18+)  
- pnpm / npm / yarn  
- (Optional) Electron for desktop builds  

### Clone and Install  
```bash
git clone https://github.com/your-org/agentic-ai-integrations.git
cd agentic-ai-integrations
pnpm install   # or npm install / yarn install
```

### Run (Desktop)
```bash
pnpm dev
pnpm electron
```

## Contributing

Pull requests are welcome! Please open an issue to discuss major changes before submitting a PR.
