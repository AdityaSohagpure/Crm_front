# Centegix CRM - Frontend Application

A high-performance Multi-Tenant Omnichannel SaaS CRM frontend built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**.

## Live Backend API
The frontend can connect to the Python backend services deployed on Render:
- **Backend API**: `https://crm-python-3ocz.onrender.com`
- **Interactive API Docs**: `https://crm-python-3ocz.onrender.com/docs`

## Features
- **Interactive Analytics Dashboard**: Conversion metrics, revenue tracking, and deal velocities.
- **Kanban Deal Pipeline**: Drag-and-drop deal management with stage tracking.
- **Leads & Contacts Management**: Omnichannel lead scoring, identity matching, and timeline history.
- **Omnichannel Comms Hub**: Real-time communication view for WhatsApp, Messenger, Instagram, and Email.
- **Quotation Generator**: Line items, discounts, PDF preview, and dynamic calculations.
- **Automation Engine**: Trigger-action rules for lead qualification and messaging workflows.
- **White-label Settings**: Multi-tenant customization and Meta Graph API channel credentials.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Vercel Deployment
This repository is pre-configured with `vercel.json` for single-page routing fallback.
Deploy by importing this repository into [Vercel](https://vercel.com) (Framework Preset: **Vite**).
