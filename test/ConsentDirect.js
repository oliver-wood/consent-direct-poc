const leftPad = require('left-pad');

var ConsentDirect = artifacts.require("ConsentDirect");


/*
// Testdata with Ganache accounts
var testdata = {
    "deployer": {
        "pk": "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3",
        "address": "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
        "name": "Consent.Direct"
    },
    "processor1" : {
        "pk": "0x0dbbe8e4ae425a6d2687f1a7e3ba17bc98c673636790f1b8ad91193c05875ef1",
        "address": "0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef",
        "name": "Hamsters Trust Charity",
        "questions": [
            {
                "text": "Please may we email you the latest updates?"
            },
            {
                "text": "Please can we contact you by post?"
            }            
        ]
    }
    ,
    "processor2" : {
        "pk": "0xc88b703fb08cbea894b6aeff5a544fb92e78a18e19814cd85da83b71f772aa6c",
        "address": "0x821aEa9a577a9b44299B9c15c88cf3087F3b5544",
        "name": "John's Crypto Hideout",
        "questions": [
            {
                "text": "Please may we email you?"
            },
            {
                "text": "Please can we stay in touch by SMS or phone call?"
            }
        ]
    }
    ,
    "subject1" : {
        "pk": "0x659cbb0e2411a44db63778987b1e22153c086a95eb6b18bdf89de078917abc63",
        "address": "0x2932b7a2355d6fecc4b5c0b6bd44cc31df247a2e",
        "email": "oliver@bitetos.com"
    },
    "subject2": {
        "pk": "0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f",
        "address": "0xf17f52151ebef6c7334fad080c5704d77216b732",
        "email": "plato@platoscarriage.com"
    }
}
*/

// Geth Wallets
var testdata = {
    "deployer": {
        "pk": "0xd030a3603b9875f08a10849997edd3d9a375075ae0b2397e734b3b33a7872a61",
        "address": "0x42c3b5107df5cb714f883ecaf4896f69d2b06a67",
        "name": "Consent.Direct"
    },
    "processor1" : {
        "pk": "0x1226b9d15e4af26f89bed5ec8a5f0ae92e47cfd976631296a35adae28174b666",
        "address": "0xb0277a8121441fcd0d4f9aa45e11a8c53b9cbfc7",
        "name": "Hamsters Trust Charity",
        "questions": [
            {
                "text": "Please may we email you the latest updates?"
            },
            {
                "text": "Please can we contact you by post?"
            }            
        ]
    }
    ,
    "processor2" : {
        "pk": "0x2cc8c82b509671bd83e92e79f5d235851ea60e2064edbc3b8859a89bb5fc3eb6",
        "address": "0x6d65dea4846bdbc12ee458c607bc078161689607",
        "name": "John's Crypto Hideout",
        "questions": [
            {
                "text": "Please may we email you?"
            },
            {
                "text": "Please can we stay in touch by SMS or phone call?"
            }
        ]
    }
    ,
    "subject1" : {
        "pk": "0x9b971856ca79accd487491fa06706ff7af9a6691b73c7a9f4d7073b87cdaad54",
        "address": "0xce9b7ec8aa8dbb2708d8650255362457d05598dd",
        "email": "oliver@bitetos.com"
    },
    "subject2": {
        "pk": "0xea4596148dee5d4e585814f0b02808c2901e8d76fb87046e77c708d2c497f1a6",
        "address": "0x38844a3cc6856b27c61deafb7f792ad542b2a7d8",
        "email": "plato@platoscarriage.com"
    }
}
web3.personal.unlockAccount(testdata.deployer.address, "number9dream", 600);
web3.personal.unlockAccount(testdata.processor1.address, "number9dream", 600);
web3.personal.unlockAccount(testdata.processor2.address, "number9dream", 600);
web3.personal.unlockAccount(testdata.subject1.address, "number9dream", 600);
web3.personal.unlockAccount(testdata.subject2.address, "number9dream", 600);
// -- End Geth accounts

web3.eth.defaultAccount = testdata.deployer.address;
var cdcontract;
var dpaddedEvent;

contract("ConsentDirect", function () {
    it("Should register two data processors", function() {
        return ConsentDirect.deployed()
        .then(function(instance) {
            cdcontract = instance;
            console.log(`       - Contract deployed to address: ${cdcontract.address}`);

            return cdcontract.addDataProcessor(testdata.processor1.address, testdata.processor1.name, {from: testdata.deployer.address} );
        })
        .then(result => {
            console.log('       - Data Processor Added');
            // We can loop through result.logs to see if we triggered the Transfer event.
            for (var i = 0; i < result.logs.length; i++) {
                var log = result.logs[i];
                console.log(`       - Event emitted ${log.event}`);
                if (log.event == "DataProcessorAdded") {
                    console.log(`       -- Address: ${log.args._address.valueOf()}`);
                    console.log(`       -- Position: ${log.args._position.valueOf()}`);
                    break;
                }
            }
            return cdcontract.getDataProcessorByAddress.call(testdata.processor1.address);
        })
        .then(dpvalues => {
            console.log(`       - Retrieved Data Processor "${dpvalues[0]}" at position ${dpvalues[1]}`);
            assert.equal(dpvalues[0], testdata.processor1.name, "Name not returned correctly");
        })
        .then(() => {
            return cdcontract.addDataProcessor(testdata.processor2.address, testdata.processor2.name, {from: testdata.deployer.address} );
        })
        .then(result => {
            return cdcontract.getDataProcessorByAddress.call(testdata.processor2.address);
        })
        .then(dpvalues => {
            console.log(`       - Retrieved Data Processor "${dpvalues[0]}" at position ${dpvalues[1]}`);
            assert.equal(dpvalues[0], testdata.processor2.name, "Name not returned correctly");
        })
    });

    it("Can store consent request and activate", function() {
        let requestid = -1;
        let requestText = testdata.processor1.questions[0].text;
        let requestHash = keccak256(testdata.processor1.address, requestText);

        return cdcontract.addConsentRequest(requestText, false, {from: testdata.processor1.address})
        .then(result => {
            console.log('       - Consent Request Added');
            // We can loop through result.logs to see if we triggered the Transfer event.
            for (var i = 0; i < result.logs.length; i++) {
                var log = result.logs[i];
                console.log(`       - Event emitted ${log.event}`);
                if (log.event == "ConsentRequestAdded") {
                    console.log(`       -- Data Processor: ${log.args._dataProcessor.valueOf()}`);
                    console.log(`       -- ID: ${log.args._id.valueOf()}`);
                    console.log(`       -- Hash: ${log.args._crhash.valueOf()}`);
                    requestid = log.args._id.valueOf();
                    break;
                }
            }
            assert.notEqual(requestid, -1, "Request ID not set");
            
            return cdcontract.getConsentRequestById.call(requestid)
        })
        .then(reqvalues => {
            console.log(`       - Got Consent Request id ${reqvalues[2]} with text "${reqvalues[0]}". Is Active? ${reqvalues[1]}`);
            console.log(`       - Trying to activate question based on hash ${requestHash}`);
            return cdcontract.activateConsentRequest(requestHash, {from: testdata.processor1.address});
        })
        .then(() => {
            return cdcontract.getConsentRequestById.call(requestid);
        })
        .then(reqvalues => {
            console.log(`       - Got Consent Request id ${reqvalues[2]} with text "${reqvalues[0]}". Is Active? ${reqvalues[1]}`);
            assert.equal(reqvalues[1], true, "Not activated")
        })
        .then(() => {
            requestid = -1;
            requestText = testdata.processor1.questions[1].text;
            requestHash = keccak256(testdata.processor1.address, requestText);
            return cdcontract.addConsentRequest(requestText, true, {from: testdata.processor1.address})
        })
        .then(result => {
            return cdcontract.getConsentRequestByHash.call(requestHash);
        })
        .then(reqvalues => {
            console.log(`       - Got Consent Request id ${reqvalues[2]} with text "${reqvalues[0]}". Is Active? ${reqvalues[1]}`);
            assert.equal(reqvalues[1], true, "Not activated")
        })
        .then(() => {
            return cdcontract.addConsentRequest(testdata.processor2.questions[0].text, true, {from: testdata.processor2.address});
        })
        .then(() => {
            return cdcontract.addConsentRequest(testdata.processor2.questions[1].text, true, {from: testdata.processor2.address});
        })
    });

    it("Can retrieve all consent requests for data processor 1", function() {
        return cdcontract.getConsentRequestsLength.call()
        .then(len => {
            console.log(`       - There are ${len} consent request questions`);
        })
        .then(() => {
            let params = {
                add: testdata.processor1.address,
                ret: [],
                startat: 0,
                count: 10
            };
            return recursePromise(getNextConsentRequest, params)
            .then(promise => { 
                return params.ret; 
            })
            .then(ret => {
                console.log(`       -- Consent Requests for data processor 1: ${JSON.stringify(ret)}`);
                testdata.processor1.consentRequestQuestions = ret;
                assert.equal(ret.length, 2, "Didn't return all the Consent Requests");
            })
        })
    });

    it("Can retrieve all consent requests for data processor 2", function() {
        return cdcontract.getConsentRequestsLength.call()
        .then(len => {
            console.log(`       - There are ${len} consent request questions`);
        })
        .then(() => {
            let params = {
                add: testdata.processor2.address,
                ret: [],
                startat: 0,
                count: 10
            };
            return recursePromise(getNextConsentRequest, params)
            .then(promise => { 
                return params.ret; 
            })
            .then(ret => {
                console.log(`       -- Consent Requests for data processor 2: ${JSON.stringify(ret)}`);
                testdata.processor2.consentRequestQuestions = ret;
                assert.equal(ret.length, 2, "Didn't return all the Consent Requests");
            })
        })
    });

    it("Can register a Consent Direct data subject - end user", function() {
        return cdcontract.registerSubject(testdata.subject1.address, keccak256(testdata.subject1.email), {from: testdata.deployer.address})
        .then(result => {
            console.log('     - Consent Subject Added');
            let account = "";
            let hash = "";
            // We can loop through result.logs to see if we triggered the Transfer event.
            for (var i = 0; i < result.logs.length; i++) {
                var log = result.logs[i];
                console.log(`       - Event emitted ${log.event}`);
                if (log.event == "SubjectAdded") {
                    console.log(`       -- Address: ${log.args.account.valueOf()}`);
                    console.log(`       -- Emailhash: ${log.args.emailhash.valueOf()}`);
                    account = log.args.account.valueOf();
                    hash = log.args.emailhash.valueOf();
                    break;
                }
            }
            assert.equal(account, testdata.subject1.address, "Subject not added");
        })
        .then(() => {
            return cdcontract.getSenderSubject.call({from: testdata.subject1.address});
        })
        .then(results => {
            console.log(`       - Got subject id ${results[0]}, with ${results[1]} responses, email hash "${results[2]}"`);
            return cdcontract.registerSubject(testdata.subject2.address, keccak256(testdata.subject2.email), {from: testdata.deployer.address});
        })
        .then(result => {
            console.log('     - Consent Subject Added');
            let account = "";
            let hash = "";
            // We can loop through result.logs to see if we triggered the Transfer event.
            for (var i = 0; i < result.logs.length; i++) {
                var log = result.logs[i];
                console.log(`       - Event emitted ${log.event}`);
                if (log.event == "SubjectAdded") {
                    console.log(`       -- Address: ${log.args.account.valueOf()}`);
                    console.log(`       -- Emailhash: ${log.args.emailhash.valueOf()}`);
                    account = log.args.account.valueOf();
                    hash = log.args.emailhash.valueOf();
                    break;
                }
            }
            assert.equal(account, testdata.subject2.address, "Subject not added");
        })
        .then(() => {
            return cdcontract.getSenderSubject.call({from: testdata.subject2.address});
        })
        .then(results => {
            console.log(`       - Got subject id ${results[0]}, with ${results[1]} responses, email hash "${results[2]}"`);
        })
    });

    it("Can allow a subject to give consent directly - end user", function() {
        console.log(`       - Subject 1 ${testdata.subject1.address} is giving consent to question ${testdata.processor1.consentRequestQuestions[0].id} "${testdata.processor1.consentRequestQuestions[0].question}"`);
        return cdcontract.giveConsent(testdata.processor1.consentRequestQuestions[0].id, {from: testdata.subject1.address})
        .then(result => {
            console.log('     - Consent response added');
            let account = "";
            let consentRequestId = "";
            // We can loop through result.logs to see if we triggered the Transfer event.
            for (var i = 0; i < result.logs.length; i++) {
                var log = result.logs[i];
                console.log(`       - Event emitted ${log.event}`);
                if (log.event == "ConsentGiven") {
                    console.log(`       -- By: ${log.args.account.valueOf()}`);
                    console.log(`       -- For: ${log.args.consentRequestId.valueOf()}`);
                    account = log.args.account.valueOf();
                    consentRequestId = log.args.consentRequestId.valueOf();
                    break;
                }
            }
            assert.equal(account, testdata.subject1.address, "Consent not given by correct subject");
            assert.equal(consentRequestId, testdata.processor1.consentRequestQuestions[0].id, "Consent not given to correct question");
        })
    });

    it("Can allow a subject to give authority to consent to data processor", function() {
        console.log(`       - Subject 2 ${testdata.subject2.address} is giving authorty to dataproc 2 ${testdata.processor2.address} to register consent for question ${testdata.processor2.consentRequestQuestions[0].id} "${testdata.processor2.consentRequestQuestions[0].question}"`);
        return Promise.resolve()
        .then(() => {
            let msgtosign = `Authority given for:${testdata.processor2.consentRequestQuestions[0].id}`;
            let msghash = keccak256('Authority given for:', parseInt(testdata.processor2.consentRequestQuestions[0].id));
            console.log(`        - Hashed message to sign: ${msghash}`);
            
            /*
            // With Ethers.js and Ganache, reliably signing the keccak256 of the message and passing that same hash to 
            // seems to be acceptable
            const signingKey = new ethers.SigningKey(testdata.subject2.pk);
            const sig = signingKey.signDigest(msghash);
            let v1 = sig.recoveryParam + 27;
            let r1 = sig.r;
            let s1 = sig.s;
            console.log(`        -- Signed using Ethers.js - r: ${r1}; s: ${s1}; v: ${sig.recoveryParam} / ${v1}`);
            */

            // web3.js signing using geth seems to include the message prefix
            //  \x19Ethereum Signed Message:\n32${msghash}`);
            // Remember the "32" is the length of the message, which is always 32 if we're dealing with a hash!
            let signature = web3.eth.sign(testdata.subject2.address, msghash);

            // Now, hack the signed message up into its constituent parts
            signature = signature.substr(2); //remove 0x
            const r = '0x' + signature.slice(0, 64);
            const s = '0x' + signature.slice(64, 128);
            const v = '0x' + signature.slice(128, 130);
            let v_decimal = web3.toDecimal(v);
            // This seems to be a problem in testrpc/ganache where the v is being returned as 0 or 1
            // Signing against geth returns a value of 28
            v_decimal = v_decimal >= 27 && v_decimal <= 28 ? v_decimal : v_decimal+27;
            console.log(`        -- Signed using Web3js - r: ${r}; s: ${s}; v: ${v} / ${v_decimal}`);
                        
            return cdcontract.giveConsentWithSignedMessage(v, r, s, msghash, testdata.processor2.consentRequestQuestions[0].id, {from: testdata.processor2.address });
        })
        .then(result => {
            console.log('     - Consent response added by authority ${result}');
            let account = "";
            let consentRequestId = "";
            // We can loop through result.logs to see if we triggered the Transfer event.
            for (var i = 0; i < result.logs.length; i++) {
                var log = result.logs[i];
                console.log(`       - Event emitted ${log.event}`);
                if (log.event == "DebugAddress") {
                    console.log(`       -- ${log.args.message.valueOf()} ${log.args._address.valueOf()}`);
                }
                if (log.event == "ConsentGiven") {
                    console.log(`       -- By: ${log.args.account.valueOf()}`);
                    console.log(`       -- For: ${log.args.consentRequestId.valueOf()}`);
                    account = log.args.account.valueOf();
                    consentRequestId = log.args.consentRequestId.valueOf();
                    break;
                }
            }
            assert.equal(account, testdata.subject2.address, "Consent not given by correct subject");
            assert.equal(consentRequestId, testdata.processor2.consentRequestQuestions[0].id, "Consent not given to correct question");
        })
    });

    it("Can allow a subject to revoke consent ", function() {
        let question = testdata.processor1.consentRequestQuestions[1];
        console.log(`       - Subject 1 ${testdata.subject1.address} is revoking consent to question ${testdata.processor1.consentRequestQuestions[0].id} "${testdata.processor1.consentRequestQuestions[0].question}"`);
        return cdcontract.revokeConsent(testdata.processor1.consentRequestQuestions[0].id, {from: testdata.subject1.address})
        .then(result => {
            console.log('     - Consent response added');
            let account = "";
            let consentRequestId = "";
            // We can loop through result.logs to see if we triggered the Transfer event.
            for (var i = 0; i < result.logs.length; i++) {
                var log = result.logs[i];
                console.log(`       - Event emitted ${log.event}`);
                if (log.event == "ConsentRevoked") {
                    console.log(`       -- By: ${log.args.account.valueOf()}`);
                    console.log(`       -- For: ${log.args.consentRequestId.valueOf()}`);
                    account = log.args.account.valueOf();
                    consentRequestId = log.args.consentRequestId.valueOf();
                    break;
                }
            }
            assert.equal(account, testdata.subject1.address, "Consent not revoked by correct subject");
            assert.equal(consentRequestId, testdata.processor1.consentRequestQuestions[0].id, "Consent not revoked to correct question");
        })
    });

    it("Can retrieve all consent responses for Subject 1", function() {
        var qs = 0;
        return cdcontract.getSubjectResponsesLength.call({from: testdata.subject1.address})
        .then(len => {
            qs = len;
            console.log(`       - There are ${qs} consent responses`);
        })
        .then(() => {
            let params = {
                add: testdata.subject1.address,
                ret: [],
                startat: 0,
                count: 10
            };
            return recursePromise(getNextSubjectResponse, params)
            .then(promise => { 
                return params.ret; 
            })
            .then(ret => {
                console.log(`       -- Consent responses for subject 1: ${JSON.stringify(ret)}`);
                testdata.subject1.consentResponses = ret;
                assert.equal(ret.length, qs, "Didn't return all the Consent responses");
            })
        })
    });

    it("Can retrieve all consent responses for Question 1", function() {
        var qs = 0;
        return cdcontract.getSubjectResponsesLength.call({from: testdata.subject1.address})
        .then(len => {
            qs = len;
            console.log(`       - There are ${qs} consent responses`);
        })
        .then(() => {
            let params = {
                add: testdata.subject1.address,
                ret: [],
                startat: 0,
                count: 10
            };
            return recursePromise(getNextSubjectResponse, params)
            .then(promise => { 
                return params.ret; 
            })
            .then(ret => {
                console.log(`       -- Consent responses for subject 1: ${JSON.stringify(ret)}`);
                testdata.subject1.consentResponses = ret;
                assert.equal(ret.length, qs, "Didn't return all the Consent responses");
            })
        })
    });
});



function messageHash(msg) {
	return web3.sha3('\x19Ethereum Signed Message:\n' + msg.length + msg);
}

// Recursive function to keep getting Consent Request Questions for a data processor
function getNextConsentRequest(params) {
    if (params.count === 0) {
        return (0);
    }
    var promise = Promise.resolve()
    .then(function() {
        // console.log(`       --- getting next with params: ${JSON.stringify(params)}`);
        return cdcontract.getNextRequest.call(params.add, params.startat);
    })
    .then(reqvalues => {
        // console.log(`       --- getNext request: ${JSON.stringify(reqvalues)}`);
        if (reqvalues[0] === "") {
            return (0);
        } else {
            params.ret.push({ 
                "id": reqvalues[2],
                "question": reqvalues[0], 
                "isactive": reqvalues[1]
            });
            params.startat = parseInt(reqvalues[2])+1;
            params.count--;
            return( getNextConsentRequest(params) ); // RECURSE!    
        }
    });
    return (promise);
}

// Recursive function to keep getting Consent Response Questions for a data processor
function getNextSubjectResponse(params) {
    if (params.count === 0) {
        return (0);
    }
    var promise = Promise.resolve()
    .then(function() {
        // console.log(`       --- getting next with params: ${JSON.stringify(params)}`);
        return cdcontract.getNextSubjectResponse.call(params.startat, { from: params.add });
    })
    .then(reqvalues => {
        // console.log(`       --- getNext request: ${JSON.stringify(reqvalues)}`);
        if (reqvalues[0] === false) {
            return (0);
        } else {
            params.ret.push({ 
                "genuine": reqvalues[0],
                "local id": reqvalues[1],
                "hashref": reqvalues[2], 
                "req id": reqvalues[3],
                "consented?": reqvalues[4]
            });
            params.startat = parseInt(reqvalues[1])+1;
            params.count--;
            return( getNextSubjectResponse(params) ); // RECURSE!    
        }
    });
    return (promise);
}

// This allows a specified function to be called as a promise, where the target function recurses
function recursePromise(recursionfunction, params) {
    var promise = Promise.resolve()
    .then(() => { 
        console.log(`       -- Recursing ${recursionfunction.name}()`);
        return { params };
    })
    .then(
        vals => { return recursionfunction(params); }           
    )
    return (promise);
}

// Useful library to hash arguments in the same way as solidity
// Will be deprecated when web3.utils is supported
function keccak256(...args) {
  args = args.map(arg => {
    if (typeof arg === 'string') {
      if (arg.substring(0, 2) === '0x') {
          return arg.slice(2)
      } else {
          return web3.toHex(arg).slice(2)
      }
    }
    if (typeof arg === 'number') {
      return leftPad((arg).toString(16), 64, 0)
    } else {
      return ''
    }
  })
  args = args.join('');
  return web3.sha3(args, { encoding: 'hex' })
}
