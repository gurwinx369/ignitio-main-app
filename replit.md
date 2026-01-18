# Ignitio Main App

## Overview
A Next.js 16 web application with animated UI components, Firebase integration, and MongoDB support.

## Project Structure
- `app/` - Next.js App Router pages and layouts
- `components/ui/` - Reusable UI components (shuffle, number-ticker, smooth-cursor)
- `features/` - Feature-specific components and context providers
- `layout/` - Layout components (Loader, Button, Profile)
- `lib/` - Utility functions and libraries
- `dbConfig/` - Database configuration

## Tech Stack
- Next.js 16.1.1 with React 19
- Tailwind CSS 4
- GSAP & Framer Motion for animations
- Firebase for authentication/backend
- Mongoose for MongoDB integration

## Development
- Run: `npm run dev` (starts on port 5000)
- Build: `npm run build`
- Start production: `npm start`

## Environment Variables
The project may require Firebase and MongoDB configuration variables.

## Recent Changes
- January 17, 2026: Initial Replit setup, configured for port 5000, added missing UI components
