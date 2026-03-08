# EPIC-009: Token Ecosystem (T1/LEOX)

**Status**: gated
**Owner**: Researcher
**Created**: 2026-03-08
**Gate**: POST-PILOT — requires Sprint 4 exit criteria + at least 1 brand pilot active

## Description

T1 token integration: ERC-20 deployment, LEOX migration portal, paymaster for gasless transactions, staking, and governance module.

## Tasks

- [ ] T1Token.sol: ERC-20 on Base, fixed 1B supply
- [ ] MigrationPortal.sol: LEOX->T1 swap with KYC, anti-whale vesting
- [ ] StakingAccess.sol: Stake T1 to unlock premium tiers
- [ ] DiscountManager.sol: On-chain discount logic (5-15%)
- [ ] BuybackBurn.sol: DEX buy + burn
- [ ] TreasuryDAO.sol: Multi-sig treasury
- [ ] Migration portal web UI (KYC + wallet connect + swap)
- [ ] Backend T1 payment integration (mint, transfer, certify)
- [ ] GalileoPaymaster: ERC-4337 gas abstraction
- [ ] On-chain governance module

## Acceptance Criteria

- T1 deployed on Base
- LEOX migration portal live
- T1 accepted as payment in Galileo API
- Paymaster sponsors gas in T1
