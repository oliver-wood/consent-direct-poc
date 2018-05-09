# consent-direct-poc
A simple proof-of-consent proof-of-competence in solidity and truffle.

Consent.Direct is a set of smart contracts for managing consent to GDPR-related questions, the idea being that a data processor could make use of this to hand over the management of the consent part of the data back to the data subjects. It probably isn't a great idea in the real World, but it will prove something of my ability to write Solidity contracts and the accompanying Truffle code to test it.

The state of play with this example is that I have tested the code against Ganache and Geth. This needs 5 accounts to be available and unlocked. For Ganache this is out of the box, for geth you'll need to create some accounts using, say MEW and import the keystore files to the geth folders.

The toughest part to get right has been the message signing piece which allows for a data subject to sign a message that allows a data processor to interact with the SC on the data subject's behalf. Also, web3js is not yet able to handle tuple results from smart contract calls, so I've had to create a "Next item" design pattern. I'm not certain whether this is wildly inefficient or not yet.

## Notes
* Uses the OpenZeppelin ownable and safemath library contracts;
* Uses the "inheritance" concept that I found in cryptozombies - a handy way to break contracts into chunks;
* Might be a candidate for converting into an upgradable contract in the future.

## Next steps

I am building out the UI components for this project using Nethereum (because .Net!), and React. This is starting to come together in the companion repo https://github.com/oliver-wood/consent-direct-web
