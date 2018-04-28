
/*
var DataSubject = artifacts.require("DataSubject");
var ethers = require('ethers');
var utils = require('ethers').utils;

//var utils = require("./util.js");

var qadd = "0x5aeda56215b167893e80b4fe645ba6d5bab767df"; // dummy address at this point
var dsadd = "0x5aeda56215b167893e80b4fe645ba6d5bab767e0"; // dummy address at this point


// Using Ethers.js contract deployment
var deployTransaction = ethers.Contract.getDeployTransaction(DataSubject.bytecode, DataSubject.abi); 

// Connect to Ganache
var provider = new ethers.providers.JsonRpcProvider("http://localhost:7545");

// Create a wallet to deploy the contract with - this is the accounts[0] wallet in Ganache
var deployment_privateKey = '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3';
var deployment_wallet = new ethers.Wallet(deployment_privateKey, provider);

// Create the DataSubject's wallet
var datasubject_privateKey = '0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f';
var datasubject_wallet = new ethers.Wallet(datasubject_privateKey, provider);

var contract;


it("Has zero questions", function() {
  // Send the transaction
  return deployment_wallet.sendTransaction(deployTransaction)
    .then(transaction => {
      contract = new ethers.Contract(utils.getContractAddress(transaction), DataSubject.abi, provider);
    })
    .then(() => {
      return contract.getQuestionCount();
    })
    .then(function(len) {
      assert.equal(len, 0, "Question length wasn't 0");
    });
});

it("Gives consent to a question with address " + qadd, function() {  
  // Handle Consent Given
  contract.events.onconsentgiven = function(owner, questionAddress) {
    console.log('Owner: ' + owner);
    console.log('Question Address: ' + questionAddress);
  }

  return contract.giveConsent(deployment_wallet.address, datasubject_wallet.address)
    .then(result => {
      console.log(result);
      assert.equal(result, true, "Consent not given");
    });
    
});
*/



/*
.then(result => {
      // result is an object with the following values:
      //
      // result.tx      => transaction hash, string
      // result.logs    => array of decoded events that were triggered within this transaction
      // result.receipt => transaction receipt object, which includes gas used

      // We can loop through result.logs to see if we triggered the Transfer event.
      for (var i = 0; i < result.logs.length; i++) {
        var log = result.logs[i];

        if (log.event == "ConsentGiven") {
          console.log(log.event);
          console.log(log.args.owner.valueOf());
          console.log(log.args.questionAddress.valueOf());
          break;
        }
      }
      assert.equal(result.logs[0].event, "ConsentGiven", "Consent not given");
    })
    .then(() => {
      return dsub.isQuestion.call(qadd);
    })
    .then(ret => {
      assert.equal(ret, true, "Is Question");
    })
    .then(() => {
      return dsub.getOneConsent.call();
    })
    .then(result => {
      console.log(result);
    })
*/