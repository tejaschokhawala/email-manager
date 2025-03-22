import { describe, it, expect } from "vitest";
import { getDomain, groupByCompany, isValidEmail } from "../emailUtils";
import type { Recipient } from "../../types/types";

describe("Email Utilities", () => {
  describe("getDomain", () => {
    it("extracts domain from email correctly", () => {
      expect(getDomain("test@example.com")).toBe("example.com");
      expect(getDomain("user@gmail.com")).toBe("gmail.com");
      expect(getDomain("info@company.co.uk")).toBe("company.co.uk");
    });
  });

  describe("isValidEmail", () => {
    it("validates correct email formats", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name@gmail.com")).toBe(true);
      expect(isValidEmail("info+tag@company.co.uk")).toBe(true);
    });

    it("rejects invalid email formats", () => {
      expect(isValidEmail("test")).toBe(false);
      expect(isValidEmail("test@")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail("test@example")).toBe(false);
      expect(isValidEmail("test example.com")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });
  });

  describe("groupByCompany", () => {
    it("groups recipients by company domain", () => {
      const recipients: Recipient[] = [
        { email: "user1@example.com", isSelected: false },
        { email: "user2@example.com", isSelected: true },
        { email: "person@different.org", isSelected: false },
        { email: "another@example.com", isSelected: true },
      ];

      const grouped = groupByCompany(recipients);

      expect(grouped.length).toBe(2);

      const exampleGroup = grouped.find((g) => g.domain === "example.com");
      expect(exampleGroup).toBeDefined();
      expect(exampleGroup?.emails.length).toBe(3);

      const differentGroup = grouped.find((g) => g.domain === "different.org");
      expect(differentGroup).toBeDefined();
      expect(differentGroup?.emails.length).toBe(1);
    });

    it("handles empty recipients array", () => {
      const grouped = groupByCompany([]);
      expect(grouped.length).toBe(0);
    });
  });
});
