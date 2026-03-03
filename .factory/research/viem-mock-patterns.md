# Viem Mock Patterns for Galileo Protocol

## Setup: Base Sepolia Client

```typescript
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'

// Public client (read-only)
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org')
})

// Wallet client (write)
const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`
const account = privateKeyToAccount(privateKey)
const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http()
})
```

## Graceful Degradation Pattern

```typescript
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'

let walletClient = null
let publicClient = null
let chainEnabled = false

const privateKey = process.env.DEPLOYER_PRIVATE_KEY

if (privateKey && privateKey.startsWith('0x')) {
  const account = privateKeyToAccount(privateKey as `0x${string}`)
  publicClient = createPublicClient({ chain: baseSepolia, transport: http() })
  walletClient = createWalletClient({ account, chain: baseSepolia, transport: http() })
  chainEnabled = true
  console.log('Blockchain features enabled on Base Sepolia')
} else {
  console.warn('⚠️ DEPLOYER_PRIVATE_KEY missing. Chain features disabled (mock mode).')
}
```

## Mocking Viem in Vitest

```typescript
import { vi, describe, it, expect } from 'vitest'

vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal<typeof import('viem')>()
  return {
    ...actual,
    createPublicClient: vi.fn(() => ({
      readContract: vi.fn().mockResolvedValue('mocked'),
    })),
    createWalletClient: vi.fn(() => ({
      writeContract: vi.fn().mockResolvedValue('0xMockedTxHash'),
    })),
  }
})

vi.mock('viem/accounts', () => ({
  privateKeyToAccount: vi.fn(() => ({ address: '0xMockedAddress' })),
}))
```

## QR Code Generation (qrcode package)

```typescript
import QRCode from 'qrcode'

async function generateQRBuffer(text: string, size: number = 300): Promise<Buffer> {
  return QRCode.toBuffer(text, {
    type: 'png',
    errorCorrectionLevel: 'H',
    margin: 1,
    width: size
  })
}

// Fastify route:
// reply.type('image/png').send(buffer)
```
