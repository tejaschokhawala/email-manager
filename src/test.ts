// src/test-setup.ts

import { vi } from "vitest";
import { config } from "@vue/test-utils";

// Mock the toast service
vi.mock("vue-toastification", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
}));

// Mock Ant Design components that might be difficult to test
config.global.stubs = {
  "a-divider": true,
  "a-tag": true,
  "a-row": true,
  "a-col": true,
  "a-card": true,
  "a-button": true,
};

// Set a global timeout for async tests
vi.setConfig({ testTimeout: 10000 });
