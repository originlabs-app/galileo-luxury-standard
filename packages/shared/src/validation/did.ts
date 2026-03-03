/**
 * DID generation and validation for Galileo product identifiers.
 *
 * DID format: did:galileo:01:{gtin}:21:{serial}
 * GS1 Digital Link: https://id.galileoprotocol.io/01/{gtin}/21/{serial}
 *
 * @module validation/did
 */

const DID_REGEX =
  /^did:galileo:01:(\d{13,14}):21:(.+)$/;

/**
 * Generates a Galileo DID from a GTIN and serial number.
 *
 * @param gtin - The GTIN (13 or 14 digits).
 * @param serial - The serial number.
 * @returns The DID string in format `did:galileo:01:{gtin}:21:{serial}`.
 */
export function generateDid(gtin: string, serial: string): string {
  return `did:galileo:01:${gtin}:21:${serial}`;
}

/**
 * Generates a GS1 Digital Link URL from a GTIN and serial number.
 *
 * @param gtin - The GTIN (13 or 14 digits).
 * @param serial - The serial number.
 * @returns The URL string in format `https://id.galileoprotocol.io/01/{gtin}/21/{serial}`.
 */
export function generateDigitalLinkUrl(gtin: string, serial: string): string {
  return `https://id.galileoprotocol.io/01/${gtin}/21/${serial}`;
}

/**
 * Validates a Galileo DID string format.
 *
 * Expected format: did:galileo:01:{gtin}:21:{serial}
 * where {gtin} is 13 or 14 numeric digits and {serial} is non-empty.
 *
 * @param did - The DID string to validate.
 * @returns `true` if the DID matches the expected format, `false` otherwise.
 */
export function validateDid(did: string): boolean {
  return DID_REGEX.test(did);
}
