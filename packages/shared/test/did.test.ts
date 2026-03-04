import { describe, it, expect } from "vitest";
import {
  generateDid,
  generateDigitalLinkUrl,
  validateDid,
} from "../src/validation/did.js";

describe("DID generation", () => {
  it("generates correct DID format with 14-digit padded GTIN", () => {
    expect(generateDid("4006381333931", "ABC123")).toBe(
      "did:galileo:01:04006381333931:21:ABC123"
    );
  });

  it("generates DID with numeric serial and pads 13-digit GTIN", () => {
    expect(generateDid("0614141007349", "001")).toBe(
      "did:galileo:01:00614141007349:21:001"
    );
  });

  it("generates DID with GTIN-14 (no extra padding needed)", () => {
    expect(generateDid("10614141007346", "SN-2024")).toBe(
      "did:galileo:01:10614141007346:21:SN-2024"
    );
  });
});

describe("GS1 Digital Link URL generation", () => {
  it("generates correct URL format with 14-digit padded GTIN", () => {
    expect(generateDigitalLinkUrl("4006381333931", "ABC123")).toBe(
      "https://id.galileoprotocol.io/01/04006381333931/21/ABC123"
    );
  });

  it("generates URL with GTIN-14 (no extra padding needed)", () => {
    expect(generateDigitalLinkUrl("10614141007346", "SN-2024")).toBe(
      "https://id.galileoprotocol.io/01/10614141007346/21/SN-2024"
    );
  });

  it("URL-encodes serial with hash (#)", () => {
    expect(generateDigitalLinkUrl("0012345678905", "SN#1")).toBe(
      "https://id.galileoprotocol.io/01/00012345678905/21/SN%231"
    );
  });

  it("URL-encodes serial with question mark (?)", () => {
    expect(generateDigitalLinkUrl("0012345678905", "SN?1")).toBe(
      "https://id.galileoprotocol.io/01/00012345678905/21/SN%3F1"
    );
  });

  it("URL-encodes serial with slash (/)", () => {
    expect(generateDigitalLinkUrl("0012345678905", "SN/1")).toBe(
      "https://id.galileoprotocol.io/01/00012345678905/21/SN%2F1"
    );
  });

  it("URL-encodes serial with space", () => {
    expect(generateDigitalLinkUrl("0012345678905", "SN 1")).toBe(
      "https://id.galileoprotocol.io/01/00012345678905/21/SN%201"
    );
  });

  it("URL-encodes serial with multiple special chars", () => {
    expect(generateDigitalLinkUrl("0012345678905", "SN#1/2")).toBe(
      "https://id.galileoprotocol.io/01/00012345678905/21/SN%231%2F2"
    );
  });

  it("does not double-encode already safe characters", () => {
    expect(generateDigitalLinkUrl("0012345678905", "SN-001")).toBe(
      "https://id.galileoprotocol.io/01/00012345678905/21/SN-001"
    );
  });
});

describe("DID validation", () => {
  it("validates correct DID format with valid GTIN-13 check digit", () => {
    // 4006381333931 is a valid GTIN-13
    expect(validateDid("did:galileo:01:4006381333931:21:ABC123")).toBe(true);
  });

  it("validates DID with valid GTIN-14 check digit", () => {
    // 10614141007346 is a valid GTIN-14
    expect(validateDid("did:galileo:01:10614141007346:21:SN-2024")).toBe(true);
  });

  it("validates DID with valid GTIN (0012345678905)", () => {
    // 0012345678905 has valid check digit 5
    expect(validateDid("did:galileo:01:0012345678905:21:SN001")).toBe(true);
  });

  it("rejects DID with invalid GTIN check digit (0012345678999)", () => {
    // 0012345678999 has wrong check digit (should be 8, not 9)
    expect(validateDid("did:galileo:01:0012345678999:21:SN001")).toBe(false);
  });

  it("rejects DID with GTIN-13 bad check digit (4006381333932)", () => {
    // Last digit should be 1, not 2
    expect(validateDid("did:galileo:01:4006381333932:21:ABC123")).toBe(false);
  });

  it("rejects DID with GTIN-14 bad check digit (10614141007347)", () => {
    // Last digit should be 6, not 7
    expect(validateDid("did:galileo:01:10614141007347:21:SN-2024")).toBe(false);
  });

  it("rejects DID with wrong prefix", () => {
    expect(validateDid("did:other:01:4006381333931:21:ABC123")).toBe(false);
  });

  it("rejects DID with missing serial", () => {
    expect(validateDid("did:galileo:01:4006381333931")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(validateDid("")).toBe(false);
  });

  it("rejects DID with non-numeric GTIN part", () => {
    expect(validateDid("did:galileo:01:abc:21:SN")).toBe(false);
  });
});
