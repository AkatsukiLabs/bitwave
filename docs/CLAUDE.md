# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BITWAVE is a retro gaming platform that combines classic mini-games with Starknet blockchain rewards. Players insert coins (tokens) to play retro games, earn VESU rewards while playing, and compete for high scores. Features a beautiful dark-themed UI with orange/gold accents optimized for mobile-first experience.

## Tech Stack

- **Framework**: React 18.3.1 + TypeScript 5.8.3
- **Build Tool**: Vite 5.4.19 with SWC plugin for faster builds
- **UI Library**: shadcn/ui components built on Radix UI
- **Styling**: Tailwind CSS 3.4.17 with custom design system
- **Routing**: React Router DOM 6.30.1
- **State Management**: TanStack Query 5.83.0 (formerly React Query)
- **Forms**: React Hook Form 7.61.1 + Zod 3.25.76 validation
- **Theme**: next-themes 0.3.0 for dark mode support
- **Blockchain**: Starknet integration (to be implemented)
- **Auth**: Social OAuth (Google/Apple) - to be implemented

## Available Commands

### Development
```bash
npm install           # Install dependencies (first time setup)
npm run dev           # Start dev server on http://localhost:8080
```

### Build & Preview
```bash
npm run build         # Production build
npm run build:dev     # Development mode build
npm run preview       # Preview production build
```

### Code Quality
```bash
npm run lint          # Run ESLint on all TypeScript files
```

## Project Structure

```
bitwave/
├── src/
│   ├── App.tsx                    # Main app with router and providers
│   ├── main.tsx                   # Application entry point
│   ├── index.css                  # Global styles with CSS variables
│   ├── components/
│   │   ├── Layout.tsx             # App layout with header + bottom nav
│   │   └── ui/                    # shadcn/ui components (48 components)
│   ├── pages/
│   │   ├── Home.tsx               # Game grid homepage
│   │   ├── Store.tsx              # Token purchase page
│   │   ├── Profile.tsx            # User wallet & rewards
│   │   ├── HowItWorks.tsx         # 3-step explanation page
│   │   ├── Auth.tsx               # Login with Google/Apple
│   │   └── NotFound.tsx           # 404 page
│   ├── hooks/
│   │   ├── use-mobile.tsx         # Mobile detection hook
│   │   └── use-toast.ts           # Toast notification hook
│   ├── lib/
│   │   └── utils.ts               # Utility functions (cn, clsx)
│   └── assets/                    # Game images, icons, logos
├── public/                        # Static assets
├── components.json                # shadcn/ui configuration
├── tailwind.config.ts             # Tailwind with BITWAVE theme colors
├── vite.config.ts                 # Vite config with path aliases
├── eslint.config.js               # ESLint configuration
└── tsconfig.json                  # TypeScript configuration
```

## Application Architecture

### Routing Structure
- **Auth Route** (`/auth`): Standalone login page without layout
- **Main Routes** (with Layout wrapper):
  - `/` - Home: Grid of retro game cards
  - `/store` - Store: Token purchase with Starknet
  - `/profile` - Profile: Wallet info, VESU rewards, deposit/withdraw
  - `/how-it-works` - Info: 3-step explanation of platform
  - `*` - NotFound: 404 catch-all

### Layout Component
- **Header**: BITWAVE logo (center), coin balance display (right)
- **Main Content**: Page content with bottom padding for nav
- **Bottom Navigation**: Fixed nav bar with Home, Store, Profile icons
- Active route highlighting with `bitwave-orange` color

### Design System

#### Custom Colors (Tailwind)
```typescript
bitwave: {
  orange: "hsl(var(--bitwave-orange))",  // Primary accent
  gold: "hsl(var(--bitwave-gold))",      // Secondary accent
  dark: "hsl(var(--bitwave-dark))",      // Background variant
  card: "hsl(var(--bitwave-card))",      // Card background
}
```

#### CSS Variables (index.css)
All color values defined as HSL in `:root` for light/dark themes.

#### Component Library
48 shadcn/ui components available in `src/components/ui/`:
- Accordion, AlertDialog, Avatar, Badge, Button, Card, Carousel
- Checkbox, Dialog, Dropdown, Form, Input, Label, Select, Switch
- Table, Tabs, Toast, Tooltip, and many more

### State Management
- **TanStack Query**: Server state, caching, async operations
- **React Router**: Navigation state via `useLocation`, `useNavigate`
- **Future**: Will need global state for wallet connection, user session

### Path Aliases
```typescript
"@/*" -> "src/*"
```
Always use `@/` imports for cleaner code:
```typescript
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

## Key Features & Implementation Status

### Implemented
- ✅ Full page routing with React Router
- ✅ Responsive Layout with bottom navigation
- ✅ Dark theme UI with custom BITWAVE colors
- ✅ shadcn/ui component library integration
- ✅ Mobile-first responsive design
- ✅ Static game card displays

### To Be Implemented
- ⏳ Starknet wallet integration
- ⏳ Social OAuth (Google/Apple)
- ⏳ Token purchase functionality
- ⏳ VESU rewards claiming
- ⏳ Actual game integration/embedding
- ⏳ Real-time coin balance updates
- ⏳ User profile data persistence

## Development Guidelines

### Adding New Pages
1. Create page component in `src/pages/`
2. Add route in `src/App.tsx` inside Layout wrapper
3. Add to bottom nav if needed in `src/components/Layout.tsx`

### Adding New Components
1. For UI components: Use shadcn CLI
   ```bash
   npx shadcn@latest add [component-name]
   ```
2. For custom components: Create in `src/components/`
3. Always use TypeScript interfaces for props

### Using shadcn/ui Components
```bash
# Add individual components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog

# Components are added to src/components/ui/
```

### Styling Conventions
- Use Tailwind utility classes
- Use `cn()` helper for conditional classes
- Follow mobile-first responsive design
- Use BITWAVE custom colors for brand consistency:
  - `text-bitwave-orange` for primary accent
  - `bg-bitwave-card` for card backgrounds
  - `text-bitwave-gold` for secondary accent

### TypeScript Best Practices
- Define interfaces for all component props
- Use type imports: `import type { Config } from "tailwindcss"`
- Leverage Zod for form validation schemas
- Use React Hook Form for complex forms

### Asset Management
- Game images: `.jpg` format in `src/assets/`
- Icons/logos: `.png` format in `src/assets/`
- Import assets directly: `import logo from "@/assets/logo.png"`
- Use descriptive filenames: `mario-donkey-kong.jpg`, `coin-icon.png`

## Starknet Integration (Future)

When implementing blockchain features:
1. Install Starknet packages (starknet.js, get-starknet, etc.)
2. Create wallet context provider
3. Add wallet connect/disconnect functionality
4. Implement token balance reading
5. Build transaction signing for purchases
6. Integrate VESU protocol for rewards

## Testing

Currently no test configuration. When adding tests:
1. Consider Vitest for unit tests (Vite ecosystem)
2. Consider Testing Library for component tests
3. Add test scripts to package.json
4. Create test files alongside components: `Component.test.tsx`

## Common Tasks

### Updating Game Grid
Edit `src/pages/Home.tsx` - game cards are hardcoded.

### Modifying Navigation
Edit `src/components/Layout.tsx` for header, nav, or coin display.

### Changing Theme Colors
Update CSS variables in `src/index.css` and `tailwind.config.ts`.

### Adding Form Pages
Use React Hook Form + Zod pattern:
```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
```

## Performance Considerations

- Vite + SWC provides fast HMR and builds
- Use React.lazy() for code splitting large pages
- Optimize images (use WebP where possible)
- TanStack Query handles caching automatically
- Component tagger only runs in development mode

## Known Issues

- Unused variables allowed (ESLint rule disabled)
- No actual game implementation yet
- Wallet connection not implemented
- Social auth not implemented
- Coin balance is hardcoded (see Layout.tsx:26)

## Package Manager

Multiple lockfiles present (npm, pnpm, bun). Prefer **npm** as shown in README examples.