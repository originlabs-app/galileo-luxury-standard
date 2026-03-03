import { describe, it, expect } from "vitest";
import {
  generateDid,
  generateDigitalLinkUrl,
  validateDid,
} from "../src/validation/did.js";

describe("DID generation", () => {
  it("generates correct DID format", () => {
    expect(generateDid("4006381333931", "ABC123")).toBe(
      "did:galileo:01:4006381333931:21:ABC123"
    );
  });

  it("generates DID with numeric serial", () => {
    expect(generateDid("0614141007349", "001")).toBe(
      "did:galileo:01:0614141007349:21:001"
    );
  });

  it("generates DID with GTIN-14", () => {
    expect(generateDid("10614141007346", "SN-2024")).toBe(
      "did:galileo:01:10614141007346:21:SN-2024"
    );
  });
});

describe("GS1 Digital Link URL generation", () => {
  it("generates correct URL format", () => {
    expect(generateDigitalLinkUrl("4006381333931", "ABC123")).toBe(
      "https://id.galileoprotocol.io/01/4006381333931/21/ABC123"
    );
  });

  it("generates URL with GTIN-14", () => {
    expect(generateDigitalLinkUrl("10614141007346", "SN-2024")).toBe(
      "https://id.galileoprotocol.io/01/10614141007346/21/SN-2024"
    );
  });
});

describe("DID validation", () => {
  it("validates correct DID format", () => {
    expect(validateDid("did:galileo:01:4006381333931:21:ABC123")).toBe(true);
  });

  it("validates DID with GTIN-14", () => {
    expect(validateDid("did:galileo:01:10614141007346:21:SN-2024")).toBe(true);
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
