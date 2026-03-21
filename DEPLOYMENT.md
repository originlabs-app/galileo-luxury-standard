# ERC-3643 Infrastructure — Base Sepolia Deployment

Deployed **2026-03-21**. Chain: **Base Sepolia** (chain ID `84532`).
Deployer: `0xA46a59EcD84486f31Bc54A4D9d5C8241Aa998c2e`

Source of truth: [`contracts/deployments/base-sepolia.json`](contracts/deployments/base-sepolia.json)
Minting service: [`apps/api/src/services/blockchain/`](apps/api/src/services/blockchain/)

---

## Contract Addresses

| Contract | Address | Explorer |
|----------|---------|---------|
| GalileoAccessControl | `0xbDC20FA6469fDE0200d8c87CE883D2DE3cAceeE1` | [view](https://sepolia.basescan.org/address/0xbDC20FA6469fDE0200d8c87CE883D2DE3cAceeE1) |
| GalileoClaimTopicsRegistry | `0x5d3d76fcFB1927853e5B7b6B6671fDe749eA41E1` | [view](https://sepolia.basescan.org/address/0x5d3d76fcFB1927853e5B7b6B6671fDe749eA41E1) |
| GalileoTrustedIssuersRegistry | `0x78833255f0c85bB17ee317b9Af3AD39c1173E348` | [view](https://sepolia.basescan.org/address/0x78833255f0c85bB17ee317b9Af3AD39c1173E348) |
| GalileoIdentityRegistryStorage | `0x516cD7a94d402c0bc265057939f2b5eb64e1865D` | [view](https://sepolia.basescan.org/address/0x516cD7a94d402c0bc265057939f2b5eb64e1865D) |
| GalileoIdentityRegistry | `0x04B0318E368C187F9d10681fDDBBBFBC7C6b82B3` | [view](https://sepolia.basescan.org/address/0x04B0318E368C187F9d10681fDDBBBFBC7C6b82B3) |
| GalileoCompliance | `0x4Ae2336E70fc9765Ea0438Ae9563E204B0dF8D18` | [view](https://sepolia.basescan.org/address/0x4Ae2336E70fc9765Ea0438Ae9563E204B0dF8D18) |
| BrandAuthorizationModule | `0x83aA36D6c518151E37bC84732ED424B5bC31B888` | [view](https://sepolia.basescan.org/address/0x83aA36D6c518151E37bC84732ED424B5bC31B888) |
| CPOCertificationModule | `0xC91Ecdf36097D8F5E50B208550a85B0434984bd0` | [view](https://sepolia.basescan.org/address/0xC91Ecdf36097D8F5E50B208550a85B0434984bd0) |
| JurisdictionModule | `0xB8e3E1de072b231494177f9e456128F8D8F86aa6` | [view](https://sepolia.basescan.org/address/0xB8e3E1de072b231494177f9e456128F8D8F86aa6) |
| SanctionsModule | `0xB7fBf8F21A92E8fFc9D4Ec69999d06B6357f5127` | [view](https://sepolia.basescan.org/address/0xB7fBf8F21A92E8fFc9D4Ec69999d06B6357f5127) |
| ServiceCenterModule | `0xa7859F1724c3b40AF6Fd9292ca0233eb7e88e936` | [view](https://sepolia.basescan.org/address/0xa7859F1724c3b40AF6Fd9292ca0233eb7e88e936) |
| GalileoToken (example) | `0x0Eb8764115147Cea9299815ba18bc4724925Afcd` | [view](https://sepolia.basescan.org/address/0x0Eb8764115147Cea9299815ba18bc4724925Afcd) |

> The example token is a pilot deployment. Production tokens are deployed per-product by the minting service — each product gets its own `GalileoToken` contract. The infrastructure addresses above are canonical and shared across all tokens.

---

## Bridge

L1 Standard Bridge (Ethereum Sepolia → Base Sepolia): `0xfd0Bf71F60660E2f608ed56e1659C450eB113120`

Helper script: [`scripts/bridge-to-base.mjs`](scripts/bridge-to-base.mjs)

---

## Post-Deployment TODOs

These steps are required before the first product can be minted end-to-end:

- [ ] **Add trusted issuer** — register Galileo's issuer DID in `GalileoTrustedIssuersRegistry` so identity claims are accepted
- [ ] **Register brand identities** — each brand deploying products must have an on-chain identity in `GalileoIdentityRegistry`
- [ ] **Unpause tokens** — newly deployed `GalileoToken` contracts start paused; call `unpause()` after setup
- [ ] **Sanctions oracle (mainnet only)** — wire a live sanctions list feed to `SanctionsModule` before going to Base Mainnet

---

## How to Use

### Mint a product token (API)

The minting service at `apps/api/src/services/blockchain/` handles the full lifecycle:

```ts
// Deploy a new product token
await mintingService.deployProductToken({ gtin, serial, brandId });

// Issue DPP to consumer wallet
await mintingService.issueToken({ tokenAddress, recipientAddress });
```

Configuration is read from `contracts/deployments/base-sepolia.json` at startup — no hardcoded addresses in application code.

### Re-deploy infrastructure (Foundry)

```bash
cd contracts
forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY --broadcast
```

Update `contracts/deployments/base-sepolia.json` after any redeployment.
