module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id,
      // from: "0x627306090abaB3A6e1400e9345bC60c78a8BEf57", // Ganache test account
      from: "0x42c3b5107df5cb714f883ecaf4896f69d2b06a67" // Geth test account
    }
  }
};
