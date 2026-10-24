/**
 * The legal identity of the business behind Posta, in one place.
 *
 * This exists because the same facts were being retyped into every legal page, and they had already drifted
 * into being wrong: the privacy policy named "Purple Glow Technologies (Pty) Ltd" and support addresses at
 * purpleglow.co.za - a company that does not exist and a domain we do not own. A privacy policy naming the
 * wrong responsible party is worse than no policy, because it tells the reader the wrong entity is
 * accountable. Everything that states who we are now reads from here.
 *
 * Facts verified against the CIPC registration certificate and the SARS welcome letter:
 *   - registration 2026/809312/07 (registered 9 October 2026)
 *   - income tax number 9251471281
 *   - registered address as filed with CIPC
 * Never publish the old registration 2023/629766/07: it is deregistered.
 */
export const COMPANY = {
  /** The registered legal entity. Use in legal text and on invoices. */
  legalName: "Digital Wave Tech (Pty) Ltd",
  /** The product name customers see. */
  productName: "Posta",
  registrationNumber: "2026/809312/07",
  /** SARS income tax number. Not a VAT number: the company is not VAT registered. */
  taxNumber: "9251471281",
  vatRegistered: false,
  email: "leroy@digitalwavetech.dev",
  supportEmail: "leroy@digitalwavetech.dev",
  privacyEmail: "leroy@digitalwavetech.dev",
  website: "https://posta.digitalwavetech.dev",
  address: {
    street: "10 Tiemie Road",
    suburb: "Bryanston",
    city: "Sandton",
    province: "Gauteng",
    postalCode: "2191",
    country: "South Africa",
  },
  /** Shown on the contact page. SAST is UTC+2 and the country does not observe daylight saving. */
  supportHours: "Monday to Friday, 08:00 to 17:00 (SAST)",
  responseTime: "one business day",
} as const;

export function companyAddressLine(): string {
  const a = COMPANY.address;
  return `${a.street}, ${a.suburb}, ${a.city}, ${a.province}, ${a.postalCode}, ${a.country}`;
}

/** For the footer and legal pages: one line that identifies the entity behind the product. */
export function legalFooterLine(): string {
  return `${COMPANY.productName} is a product of ${COMPANY.legalName}, registration ${COMPANY.registrationNumber}.`;
}
