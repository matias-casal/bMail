# BMail - High Fidelity Email Client Replica

A high-fidelity replica of BMail email client built with React and TypeScript, focusing on matching exact behavioral details and quirks.

## Overview

This project is a precise recreation of BMail that includes all its subtle behavioral differences compared to standard email clients. The implementation prioritizes behavioral accuracy over visual similarity, though the UI closely matches the original.

## Tech Stack

- **React** with TypeScript
- **Vite** for build tooling
- **Context API** for state management
- **CSS Modules** for styling
- In-memory data storage (no persistence)

## Key Features

- Deterministic dataset that resets to the same state
- Frozen time (March 14th, 2030 @ 3:14 PM)
- Full email client functionality: inbox, sent, drafts, spam, trash
- Thread/conversation view
- Star and archive functionality
- Compose and reply capabilities

## Behavioral Specifications

BMail includes 9+ specific behavioral differences from standard email clients:

1. **Star First Email Instead of Last**: Stars the first email in new conversations (not the last)
2. **Allow Last Email Collapse**: Allows collapsing the last email in thread view
3. **Hide Spam Button in Trash**: Hides spam button when viewing trash
4. **Show Total Count Instead of Unread**: Shows total message count instead of unread count
5. **Show Spam in All Mail**: Includes spam messages in "All Mail" view
6. **Remove Star on Trash**: Automatically removes stars when moving to trash
7. **Use "You" Instead of "Me"**: Displays "you" instead of "me" for the current user
8. **Close Thread When Unstarred in Starred View**: Auto-closes thread when unstarring in starred view
9. **Star Propagation**: Starring any message in a thread stars the entire thread in inbox view

## Installation

```bash
# Clone the repository
git clone git@github.com:matias-casal/bMail.git
cd bMail

# Install dependencies
npm install

# Run development server
npm run dev
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## Project Structure

```
src/
├── components/          # React components
│   ├── App.tsx
│   ├── Layout.tsx
│   ├── Sidebar.tsx
│   ├── EmailList.tsx
│   ├── ThreadView.tsx
│   └── ...
├── context/            # Context providers
│   ├── ConfigContext.tsx
│   └── EmailContext.tsx
├── services/           # Business logic
│   ├── emailService.ts
│   └── userService.ts
├── types/              # TypeScript type definitions
└── styles/             # Global styles and CSS modules
```

## Code Quality

- Fully typed with TypeScript
- Consistent code style enforced by ESLint
- Component-based architecture
- Separation of concerns (UI, state, business logic)

## Notes

- Data resets on page refresh (by design)
- No backend or database required
- All timestamps are frozen to maintain consistency
- Behavioral accuracy is prioritized over visual perfection

## License

This project was developed as a technical assessment for Matrices AI.
