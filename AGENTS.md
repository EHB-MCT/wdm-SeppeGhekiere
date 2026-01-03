# Agent Guidelines

## Project Structure
- Frontend: `wdm/` (React + Vite)
- Backend: `wdm/backend/` (Express + MongoDB)

## Build Commands
- Frontend (cd wdm): `npm run dev`, `npm run build`, `npm run lint`
- Backend (cd wdm/backend): `npm start`, `npm test` (no tests configured)
- Docker: `docker-compose up --build` (full stack)

## Code Style
- Frontend: PascalCase .jsx components, functional with hooks
- Backend: CommonJS require() with ES6 dotenv import
- Functions: camelCase, descriptive names
- Imports: React hooks → third-party → local components
- Error handling: try/catch with console.error and 500 status
- Auth: JWT middleware, MongoDB async/await, dotenv config

## Testing
No test framework. Add Jest/Vitest before implementing tests.

## Patterns
- Express async middleware, React useState/useEffect hooks
- Props destructuring, consistent { error: "message" } responses