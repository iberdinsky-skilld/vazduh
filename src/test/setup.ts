// jest-dom matchers: toBeInTheDocument, toHaveTextContent, ...
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Without `globals: true` Testing Library cannot register this itself, and
// the DOM would leak from one test into the next.
afterEach(() => cleanup());
