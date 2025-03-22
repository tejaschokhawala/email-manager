export interface Recipient {
  email: string;
  isSelected: boolean;
}

export interface CompanyGroup {
  domain: string;
  emails: Recipient[];
  isExpanded: boolean;
}
