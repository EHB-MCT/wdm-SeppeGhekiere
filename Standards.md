# React Coding Standards

This document outlines the core principles and rules for writing clean, predictable, and maintainable React code, based on the official React documentation.

## 1. Purity of Components and Hooks

### Components Must Be Idempotent

A component should always produce the same JSX given the same inputs (props, state, and context).

- **BAD:** Calculating a value that changes on every render, like `new Date()`.
  ```jsx
  function Clock() {
  	// 🔴 This will be different every time the component renders!
  	const time = new Date();
  	return <span>{time.toLocaleString()}</span>;
  }
  ```
- **GOOD:** Move non-idempotent calculations into an Effect or an event handler to keep the render function pure.

### Side Effects Must Run Outside of Render

A "side effect" is any code with an observable effect outside of the component's render scope (e.g., data fetching, DOM manipulation). These should not run during the render phase.

- **GOOD:** Use `useEffect` for side effects that synchronize with component state, or use event handlers for effects triggered by user actions.

## 2. Immutability

### Props Are Read-Only

Never mutate props directly. If you need to transform a prop's value, create a new variable.

- **BAD:** Modifying a prop object directly.
  ```jsx
  function Post({ item }) {
  	// 🔴 Bad: Never mutate props directly
  	item.url = new URL(item.url, base);
  	return <Link url={item.url}>{item.title}</Link>;
  }
  ```
- **GOOD:** Create a new variable or object if you need to transform a prop's value.
  ```jsx
  function Post({ item }) {
  	// ✅ Good: Make a copy instead
  	const url = new URL(item.url, base);
  	return <Link url={url}>{item.title}</Link>;
  }
  ```

### State Must Be Updated with Setters

State variables managed by `useState` are immutable. You must use the setter function provided by the hook to trigger a re-render with the new state value.

- **BAD:** Mutating a state variable directly.
  ```jsx
  function Counter() {
  	const [count, setCount] = useState(0);
  	function handleClick() {
  		// 🔴 Bad: Never mutate state directly
  		count = count + 1;
  	}
  	return <button onClick={handleClick}>...</button>;
  }
  ```
- **GOOD:** Use the state setter function to request a state update.
  ```jsx
  function Counter() {
  	const [count, setCount] = useState(0);
  	function handleClick() {
  		// ✅ Good: Use the setter function returned by useState
  		setCount(count + 1);
  	}
  	return <button onClick={handleClick}>...</button>;
  }
  ```

## 3. Naming Conventions

- **Components & Files:** Use `PascalCase` (e.g., `MyComponent.jsx`).
- **Variables & Functions:** Use `camelCase` (e.g., `let myVariable`, `function doSomething()`).
- **Custom Hooks:** Start with `use` and follow with `PascalCase` (e.g., `useUserData`).
- **Event Handlers:** Start with `handle` followed by the event name (e.g., `handleClick`, `onInputChange`).

## 4. Component Design

- **Keep Components Small:** Decompose large components into smaller, focused, and reusable ones. A component should ideally do one thing.
- **Destructure Props:** Always destructure props in the component signature for better readability and clarity.

  ```jsx
  // GOOD
  function Greeting({ name, avatar }) { ... }

  // BAD
  function Greeting(props) {
    const { name, avatar } = props;
    // or worse: props.name, props.avatar
    ...
  }
  ```

## 5. Rules of Hooks

- **Call Hooks at the Top Level:** Only call Hooks from the top level of a React functional component or a custom Hook.
- **No Hooks in Loops or Conditions:** Do not call Hooks inside loops, conditional statements, or nested functions. This ensures Hooks are called in the same order on every render.

## 6. Debugging

- **React DevTools:** Use the browser extension to inspect the component tree, view props and state, and profile performance.
- **Strict Mode:** Wrap your application in `<React.StrictMode>` in `main.jsx`. It activates additional checks and warnings for potential problems in your components.
- **Linting:** Pay close attention to ESLint warnings in your editor and console. They often catch bugs before they happen.

## 7. File Structure

A consistent file structure helps keep the project organized and scalable. We recommend organizing files by feature.

- **`public/`**: All static assets like images, fonts, and 3D models go here.
- **`src/`**: Contains all the application's source code.
  - **`src/components/`**: For shared, reusable components (e.g., `Button`, `Modal`).
  - **`src/features/`** or **`src/scenes/`**: Group all files related to a specific feature or scene in one folder. This includes components, hooks, and styles.
    ```
    src/
    └── features/
        └── UserProfile/
            ├── UserProfile.jsx
            ├── Avatar.jsx
            └── useUserProfile.js
    ```
  - **`src/hooks/`**: For custom hooks that are shared across multiple features.
  - **`src/lib/`**: For utility functions and helpers (e.g., data formatting, math calculations).
  - **`src/main.jsx`**: The main application entry point.
