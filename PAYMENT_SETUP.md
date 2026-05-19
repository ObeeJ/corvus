# Payment Setup for Corvus

Corvus supports both traditional payments via Paystack and Web3/crypto payments using stablecoins and other cryptocurrencies.

## Payment Options

### 1. Paystack (Traditional Payments)
- **Price**: $15/month (₦24,000 NGN)
- **Test Keys**: Already configured in `.env.example`
- **Production**: Replace test keys with your live Paystack keys

### 2. Crypto Payments (Web3)
- **Price**: $15/month equivalent in crypto
- **Supported Tokens**:
  - **BTC**: `bc1q69g76u457rnahajnwm8l0c8mq6dhspxzj2zp6u`
  - **ETH**: `0xb37f2f104f2b9c65406e0f7892fbe79e2a3458a1`
  - **USDT (ERC-20)**: `0xb37f2f104f2b9c65406e0f7892fbe79e2a3458a1`
  - **USDC (Base)**: `0xb37f2f104f2b9c65406e0f7892fbe79e2a3458a1`
  - **SOL**: `HdvxcDchenJhzrMF6Rz5vcdNtTyy19HrDMgXkTx7jWEc`

## Setup Instructions

### 1. Environment Variables

**`.env.example`** contains example/placeholder values for reference.
**`.env`** contains your actual secrets and should be kept private (not committed to git).

For development, you can use the provided test keys in `.env`:

```bash
# The .env file already contains test keys for development
# For production, replace the test keys with your live keys
```

Edit `.env` with your actual values:
- `PAYSTACK_SECRET_KEY`: Your Paystack secret key (test keys provided)
- `PAYSTACK_PUBLIC_KEY`: Your Paystack public key (test keys provided)
- `PUBLIC_URL`: Your public URL for webhooks (e.g., `https://yourdomain.com`)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Random secret for JWT tokens

### 2. Database Setup
Run the migrations to create the necessary tables:

```bash
# Make sure PostgreSQL is running
psql -c "CREATE DATABASE corvus;"

# Run migrations
psql -d corvus -f migrations/0001_initial.up.sql
```

### 3. Update Crypto Addresses
If you need to change the crypto receiving addresses, edit:
- `internal/billing/paystack.go` - Update the `const` addresses at the top

### 4. Running with Payments Enabled
Start the server with database support:

```bash
# Set environment variables
export DATABASE_URL="postgresql://localhost:5432/corvus?sslmode=disable"
export PAYSTACK_SECRET_KEY="your-secret-key"
export PAYSTACK_PUBLIC_KEY="your-public-key"

# Build and run
make build
./corvus serve
```

## API Endpoints

### Paystack Payment
```
POST /api/v1/billing/checkout
```
Creates a Paystack payment link for the Pro plan ($15/month).

### Crypto Payment
```
POST /api/v1/billing/crypto
```
Returns payment details for crypto payments. Request body:
```json
{
  "token": "USDC",
  "network": "base"
}
```

### Crypto Verification
```
POST /api/v1/billing/crypto/verify
```
Submit transaction hash for manual verification. Request body:
```json
{
  "reference": "crypto-userid-timestamp",
  "tx_hash": "0x..."
}
```

### Paystack Webhook
```
POST /api/v1/billing/webhook
```
Paystack sends payment success events to this endpoint.

## Testing

### Paystack Test Mode
Use the test keys in `.env` (already configured):
- Secret: `sk_test_8e671e9ab65f0e515eabb252ba7650d5dfe6e31d`
- Public: `pk_test_254464a4e4766ac78bc14af35c1bb7ff73b7d238`

**Important**: `.env.example` contains example placeholders only. `.env` contains the actual test keys for development.

### Crypto Test Mode
For development, crypto payments are marked as `pending_review` and require manual verification via the `VerifyCrypto` endpoint.

## Production Considerations

1. **Paystack Webhooks**: Configure your Paystack dashboard to send webhooks to `https://yourdomain.com/api/v1/billing/webhook`
2. **Crypto Verification**: In production, implement on-chain verification using RPC nodes or blockchain indexers
3. **Security**: Use strong JWT secrets and database passwords
4. **Monitoring**: Set up monitoring for payment failures and webhook delivery

## Troubleshooting

1. **"PAYSTACK_SECRET_KEY not set"**: Make sure environment variables are set
2. **Database connection errors**: Verify PostgreSQL is running and DATABASE_URL is correct
3. **Webhook signature failures**: Ensure Paystack webhook secret matches your environment
4. **Crypto payments not verifying**: Check that transaction hashes are valid and on the correct network