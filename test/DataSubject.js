
var DataSubject = artifacts.require("DataSubject");
var utils = require("./util.js");

var qadd = "0x5aeda56215b167893e80b4fe645ba6d5bab767df"; // dummy address at this point
var dsadd = "0x5aeda56215b167893e80b4fe645ba6d5bab767e0"; // dummy address at this point


contract('DataSubject', function () {

  it("Should have a zero length of questions", function() {
    return DataSubject.deployed()
      .then(inst => {
        return inst.getQuestionCount.call();
      })
      .then(len => {
        assert.equal(len, 0, "Question length wasn't 0")
      });
  });

  it("Should be able to give consent to a question with address " + qadd, function() {
    var dsub;
    return DataSubject.deployed()
      .then(inst => {
        dsub = inst;
        return dsub.giveConsent(qadd, dsadd);
      })
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
  });
});
