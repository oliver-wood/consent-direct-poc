var Migrations = artifacts.require("./Migrations.sol");
var ConsentDirect = artifacts.require("./ConsentDirect.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(ConsentDirect);
};
