var Migrations = artifacts.require("./Migrations.sol");
var DataSubject = artifacts.require("./DataSubject.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(DataSubject);
};
