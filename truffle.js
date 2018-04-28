module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id,
      // from: "0x627306090abaB3A6e1400e9345bC60c78a8BEf57", // Ganache test account
      from: "0x413F1a40a696388FAEE90EaA70F3cc7A1C8BCeCF" // Geth test account
    }
  }
};
