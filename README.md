# Uniswap V2 Router Mainnet Forking

This repository demonstrates how to use [Hardhat](https://hardhat.org/) to fork the Ethereum mainnet and interact with Uniswap V2 Router functions. It includes scripts for adding/removing liquidity, swapping tokens, and testing various Uniswap V2 Router functionalities in a local forked environment.

## Features

- **Mainnet Forking**: Fork the Ethereum mainnet to test Uniswap V2 Router interactions locally.
- **Uniswap V2 Router Functions**: Examples for:
  - Adding and removing liquidity.
  - Swapping tokens (exact tokens for tokens, tokens for ETH, etc.).
  - Supporting fee-on-transfer tokens.
- **Impersonated Accounts**: Use Hardhat's `impersonateAccount` to simulate transactions from any Ethereum address.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)
- [Hardhat](https://hardhat.org/)

## Setup

1. **Clone the Repository**:
   ```bash
   $ git clone https://github.com/your-username/uniswap-v2-router-forking.git
   cd uniswap-v2-router-forking
   ```

## Install Dependencies:

```shell
  $ yarn install
```

**Or**

```shell
$ npm install
```

## Configuration hardhat variables

```shell
$ npx hardhat vars set ALCHEMY_API_KEY
✔ Enter value: ********************************
```

## Scripts

```bash
npx hardhat run scripts/filename.ts
```

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.
