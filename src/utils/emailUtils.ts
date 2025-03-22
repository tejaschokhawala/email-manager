import type { CompanyGroup, Recipient } from "../types/types";

export const getDomain = (email: string): string => {
  return email.split("@")[1];
};

export const groupByCompany = (recipients: Recipient[]): CompanyGroup[] => {
  const groups: Record<string, Recipient[]> = {};

  recipients.forEach((recipient) => {
    const domain = getDomain(recipient.email);
    if (!groups[domain]) {
      groups[domain] = [];
    }
    groups[domain].push(recipient);
  });

  return Object.entries(groups).map(([domain, emails]) => ({
    domain,
    emails,
    isExpanded: false,
  }));
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
