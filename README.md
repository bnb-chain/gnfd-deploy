# Gnfd-Deploy

GNFD Deploy is a command-line tool designed to simplify the process of uploading files or folders to the BNB Greenfield storage network. Whether you're managing assets, deploying resources, or sharing data, GNFD Deploy streamlines the file upload process, making it more convenient and efficient.

## Installation

You can install GNFD Deploy globally using npm or yarn:

```bash
# npm
npm install @bnb-chain/gnfd-deploy -g
# yarn
yarn global add @bnb-chain/gnfd-deploy
```

## Environment Variables

Set the following environment variables based on the information in the [env.example](./.env.example) file:

```bash
ACCOUNT_ADDRESS="your wallet address"
ACCOUNT_PRIVATE_KEY="your private key"
BUCKET_NAME=testcli1

# greenfield network info is required:
GREENFIELD_RPC_URL=https://gnfd-testnet-fullnode-tendermint-ap.bnbchain.org
GREENFIELD_CHAIN_ID=5600
...
```

## Usage

```bash
> gnfd -h

Usage: gnfd-deploy [path] [options]

Zero-Config CLI to Deploy Static Websites to BNB Greenfield

Arguments:
  path           a relative file or directory local path.

Options:
  -V, --version  output the version number
  -d, --debug    use debug mode to see full error.
  -h, --help     display help for command
```

### Upload a file or folder

```bash
> gnfd your-local-path

[INFO]: Start upload file: /tmp/test.txt
[INFO]: Checking a bucketName for testcli1
[INFO]: The bucketName testcli1 already exist. skipped
[INFO]: Checking an object for test.txt
[INFO]: Creating an object for test.txt
[INFO]: Object created successfully: xxx
[INFO]: Upload Info: {
  address: '0xffffxxxxx',
  bucketName: 'testcli1',
  bucketTx: 'skipped',
  endpoint: 'https://gnfd-testnet-sp3.nodereal.io',
  primarySpAddress: '0x5FFf5A6c94b182fB965B40C7B9F30199b969eD2f'
}
[INFO]: File upload completed => baseUrl: https://gnfd-testnet-sp3.nodereal.io/view/testcli1/test.txt
```

## Contributing

If you want to contribute to GNFD Deploy or have suggestions, feel free to open an issue or submit a pull request.

## License

This project is licensed under the LGPL-3.0 License - see the [LICENSE.md](./LICENSE) file for details.

## DISCLAIMER

The software and related documentation are under active development, all subject to potential future change without notification and not ready for production use. The code and security audit have not been fully completed and not ready for any bug bounty. We advise you to be careful and experiment on the network at your own risk. Stay safe out there.
