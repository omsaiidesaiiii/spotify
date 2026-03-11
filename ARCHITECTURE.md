# Project Sound-Wave: Architecture Document

## 1. Overview
Project Sound-Wave is a mobile-first, high-performance web application designed to mirror the premium, ad-free experience of the BlackHole music app. This document serves as the foundational source of truth for all architectural decisions, design paradigms, and state management strategies.

## 2. Tech Stack
The application is built using the following core technologies:
* **Framework:** Next.js 16 (App Router)
* **State Management:** Redux Toolkit (exclusively for global audio state management and playback queue)
* **Styling:** Tailwind CSS
* **Animations:** Framer Motion (for fluid drawer opening, page transitions, and micro-interactions)
* **Icons:** lucide-react (for unified, minimalist vector icons)

## 3. Data Fetching & Architecture
The application acts as a client consuming the unofficial JioSaavn API.
* **API Endpoint:** `saavn.sumit.co`
* **Data Flow:** 
  1. Client triggers a search or fetch request.
  2. Next.js Server Components / API Routes act as a proxy to the unofficial JioSaavn API to prevent CORS issues and hide the backend endpoint.
  3. The proxy retrieves the streaming URLs (targeting 320kbps `.mp4` / `.mp3` qualities).
  4. The URL is passed to the global Redux state, which the persistent `AudioEngine` consumes to stream the media.

## 4. Strict Design System
Visual excellence and a premium feel are non-negotiable. The design system strictly adheres to the following paradigms:

* **Theme (AMOLED Black):** The base background MUST be strictly black (`bg-black`). There are to be zero pure white backgrounds throughout the application. 
* **UI Paradigm (Glassmorphism):** Heavy use of glassmorphism is required. Elements like the floating Mini-Player and top navigation must utilize `backdrop-blur-xl` combined with semi-transparent white/gray overlays (e.g., `bg-white/5` or `bg-white/10`) to create a sense of depth and hierarchy.
* **Interactive Elements:** All interactive buttons and touch targets must be completely rounded (`rounded-full`). Icons must strictly be sourced from `lucide-react` to maintain a unified, minimalist aesthetic.
* **The 'Glow Effect':** The 'Now Playing' screen is the visual centerpiece. It must feature a dynamic "Shadow-on-Glow" effect. The album art will extract its dominant color and cast a highly blurred, matching drop shadow (`shadow-[color] blur-2xl` equivalents) underneath itself, creating an immersive, glowing aesthetic.

## 5. Component & Folder Hierarchy
The repository will follow a strictly decoupled and modular structure:

```text
/
├── app/
│   ├── (tabs)/
│   │   ├── home/
│   │   │   └── page.tsx      # Main discovery feed
│   │   ├── search/
│   │   │   └── page.tsx      # Query and explore interface
│   │   └── library/
│   │       └── page.tsx      # User's saved playlists/tracks
│   ├── layout.tsx            # Root layout (houses persistent components)
│   └── globals.css           # Tailwind directives & base styles
├── components/
│   ├── Player/
│   │   ├── AudioEngine.tsx   # Invisible HTML5 Audio wrapper handling playback logic
│   │   ├── MiniPlayer.tsx    # Persistent glassmorphic floating player
│   │   └── FullPlayer.tsx    # The 'Now Playing' screen with 'Glow Effect'
│   └── UI/
│       ├── GlassNav.tsx      # Top or bottom navigation utilizing backdrop-blur
│       └── RoundButton.tsx   # Standardized rounded-full button component
└── lib/
    └── features/
        └── music/
            ├── musicSlice.ts # Redux slice for current track, queue, playing status
            └── selectors.ts  # Memoized Redux selectors
```

## 6. Persistence & State Strategy
To ensure uninterrupted audio playback and a seamless user experience:
* **Root Layout Mounting:** The `AudioEngine` and the `MiniPlayer` components will be mounted directly in the root `layout.tsx`. 
* **Navigation:** Because Next.js App Router preserves the root layout during client-side navigation between `app/(tabs)/*` routes (Home, Search, Library), the audio element will never unmount, and playback will continue flawlessly across page transitions.
* **Redux Synchronization:** The `AudioEngine` will listen to the `musicSlice` via Redux for track changes, play/pause commands, and volume adjustments, ensuring the UI and the underlying audio element are always perfectly synchronized.

---
**Rules of Engagement:** No Next.js initialization or code generation is permitted until explicitly commanded. This document remains the definitive guide for Project Sound-Wave.
