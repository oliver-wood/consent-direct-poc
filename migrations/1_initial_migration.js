const Web3 = require('web3');
const TruffleConfig = require('../truffle');

var Migrations = artifacts.require("./Migrations.sol");
var ConsentDirect = artifacts.require("./ConsentDirect.sol");

module.exports = function(deployer) {

  // On Geth we need to unlock an account to deploy the contracts with
  const config = TruffleConfig.networks["development"];
  const web3 = new Web3(new Web3.providers.HttpProvider('http://' + config.host + ':' + config.port));
  web3.eth.personal.unlockAccount(config.from, "number9dream", 36000);

  deployer.deploy(Migrations);
  deployer.deploy(ConsentDirect);
};
