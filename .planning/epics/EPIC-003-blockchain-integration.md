# EPIC-003: Blockchain Integration

**Status**: blocked
**Owner**: Researcher
**Created**: 2026-03-08
**Blocked by**: RPC key / deployer wallet setup

## Description

Real chain deployment on Base Sepolia, replacing mock mint with real ERC-3643 mint via deployed contracts. Includes identity registry, compliance modules, and gas benchmarks.

## Tasks

- [ ] Deploy contracts on Base Sepolia via Deploy.s.sol (all 12 contracts)
- [ ] Post-deploy: configure sanctions oracle, add trusted issuer, register identities, grant AGENT_ROLE, unpause token
- [ ] Verify all contracts on Basescan Sepolia
- [ ] Record addresses in contracts/deployments/base-sepolia.json
- [ ] Configure authenticated RPC URL in apps/api/src/plugins/chain.ts
- [ ] Document gas benchmarks for each operation
- [ ] Replace mock mint with real ERC-3643 mint via viem + deployed contracts
- [ ] Implement Identity Registry verification before mint (isVerified())
- [ ] Use GalileoToken.mint() with proper AGENT_ROLE
- [ ] Update ProductPassport with real on-chain data (txHash, tokenAddress, chainId)
- [ ] Add RPC_URL to config.ts env schema with fallback transport

## Acceptance Criteria

- Contracts deployed and verified on Base Sepolia
- Real mint creates on-chain token
- Gas benchmarks documented
- Deployment addresses committed
