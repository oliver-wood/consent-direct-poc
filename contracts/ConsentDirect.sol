pragma solidity ^0.4.21;

import "./ConsentDirectRequest.sol";

contract ConsentDirect is ConsentDirectRequest {

    struct ConsentResponse {
        uint consentRequestId;
        bool response; // Consent | ConsentRevoked
        bool isGenuine;
    }

    struct ConsentSubject {
        bytes32 emailhash;
        uint listpointer;
        uint[] consentResponses; // Performance over cost?]
    }

    event ConsentGiven(address indexed account, uint indexed consentRequestId);
    event ConsentRevoked(address indexed account, uint indexed consentRequestId);
    event SubjectAdded(address indexed account, bytes32 emailhash);

    // Consent Direct does this, implies that there is some level of KYC involved.
    function registerSubject(address _account, bytes32 _emailHash) public onlyOwner {
        // requires _account not already existing
        require(consentSubjectMap[msg.sender].emailhash == bytes32(0));
        ConsentSubject storage cs = consentSubjectMap[_account];
        uint arrid = consentSubjects.push(_account).sub(1);
        cs.emailhash = _emailHash;
        cs.listpointer = arrid;
        emit SubjectAdded(_account, _emailHash);
    }

    function getSenderSubject() public view returns (uint, uint, bytes32) {
        ConsentSubject storage cs = consentSubjectMap[msg.sender];
        require(cs.emailhash != bytes32(0));
        return (cs.listpointer, cs.consentResponses.length, cs.emailhash);
    }

    // User-initiated consent. But this would cost the user more gas.
    function giveConsent(uint _consentRequestId) public {
        // if (msg.sender)
        // requires msg.sender has registered account already
        // call _addConsentresponse with true
        ConsentSubject storage cs = consentSubjectMap[msg.sender];
        require(cs.emailhash != bytes32(0));
        _addConsentResponse(msg.sender, _consentRequestId, true);
    }

    
    function revokeConsent(uint _consentRequestId) public {
        ConsentSubject storage cs = consentSubjectMap[msg.sender];
        require(cs.emailhash != bytes32(0));
        _addConsentResponse(msg.sender, _consentRequestId, false);
    }

    function _addConsentResponse(address _subjectAddress, uint _consentRequestId, bool _response) private {
        
        // Add a ConsentResponse struct
        ConsentResponse memory cr = ConsentResponse(_consentRequestId, _response, true);
        
        bytes32 responseHash = keccak256(_subjectAddress, _consentRequestId);

        uint responseId = consentResponses.push(responseHash) - 1;
        consentResponseMap[responseId] = cr;

        ConsentSubject storage cs = consentSubjectMap[_subjectAddress];
        cs.consentResponses.push(responseId);
        
        ConsentRequest storage cp = consentRequestMap[consentRequests[_consentRequestId]];
        cp.responses.push(responseId);

        consentResponseToSubject[responseHash] = _subjectAddress;
        if (_response) {
            emit ConsentGiven(_subjectAddress, _consentRequestId);
        } else {
            emit ConsentRevoked(_subjectAddress, _consentRequestId);
        }
    }

    // return all the response ids for the current user
    function getSubjectConsentResponseIds() public view returns (uint[]) {
        // Get a pointer to the consentSubject object
        ConsentSubject storage cs = consentSubjectMap[msg.sender];
        return (cs.consentResponses);
    }

    function getSubjectResponsesLength() public view returns (uint) {
        ConsentSubject storage cs = consentSubjectMap[msg.sender];
        return (cs.consentResponses.length);
    }

    // Allows Web3 to iterate through the responses 
    // returns (isGenuine, lastposition, hashref, consentRequestId, response)
    function getNextSubjectResponse(uint _start) public view returns (bool, uint, bytes32, uint, bool) {
        ConsentSubject storage cs = consentSubjectMap[msg.sender];
        for (uint i = _start; i < cs.consentResponses.length; i++) {
            ConsentResponse storage cr = consentResponseMap[cs.consentResponses[i]];
            assert(cr.isGenuine);
            return (true, i, consentResponses[cs.consentResponses[i]], cr.consentRequestId, cr.response);
        }
        return (false, uint(0), bytes32(0), uint(0), false);
    }

    function getRequestResponsesLength(uint _requestId) public view returns (uint) {
        ConsentRequest storage cq = consentRequestMap[consentRequests[_requestId]];
        return (cq.responses.length);
    }

    // return all the response ids for a question
    function getRequestConsentResponseIds(uint _requestId) public view returns (uint[]) {
        // only available to the owner of the request
        require (consentRequestToDataProcessor[_requestId] == msg.sender);
        ConsentRequest storage cr = consentRequestMap[consentRequests[_requestId]];
        return cr.responses;
    }

    // Allows Web3 to iterate through the responses 
    // returns (isGenuine, lastposition, hashref, subjectaddress, response)
    function getNextRequestResponse(uint _requestId, uint _start) public view returns (bool, uint, bytes32, address, bool) {
        require (consentRequestToDataProcessor[_requestId] == msg.sender);
        ConsentRequest storage cq = consentRequestMap[consentRequests[_requestId]];
        for (uint i = _start; i < cq.responses.length; i++) {
            ConsentResponse storage cr = consentResponseMap[cq.responses[i]];
            assert(cr.isGenuine);
            return (true, i, consentResponses[cq.responses[i]], consentResponseToSubject[consentResponses[cq.responses[i]]], cr.response);
        }
        return (false, uint(0), bytes32(0), address(0), false);
    }

    // Typical pattern would be to get the ids then get each response from the id
    function getResponse(uint _responseId) public view returns (uint, address, bool) {
        address subjectAddress = consentResponseToSubject[consentResponses[_responseId]];
        return (_responseId, subjectAddress, consentResponseMap[_responseId].response);
    }

    // To reduce gas costs for end users (Data Subjects), allow them to send a signed
    // message to the DataProcessor (Organisation) giving them the ability to make the consent
    // request on behalf of the user. 
    function giveConsentWithSignedMessage(uint8 v, bytes32 r, bytes32 s, bytes32 data, uint _consentRequestId) public {
        // The data should be the same as the hash of the request id
        bytes memory prefix = "Authority given for:";
        bytes32 prefixedhash = keccak256(prefix, _consentRequestId);
        require(prefixedhash == data);

        /*
        // When signing messages using ethers.js and Gananche, the standard 
        //  of prefixing the message with "Ethereum Signed Message" does not seem
        //  to be followed.
          address signer = ecrecover(data, v, r, s);
          emit DebugAddress("Recovered signer address is: ", signer);
        */

        // Using geth and web3.eth.sign, the data that signed is prefixed under the hood, 
        //  so we have add that prefix ourselves
        bytes32 message = prefixed(data);
        address signer = ecrecover(message, v, r, s);
        emit DebugAddress("Recovered signer address is: ", signer);

        // requires signer to have registered account
        // Find the subject and add consent
        ConsentSubject storage cs = consentSubjectMap[signer];
        require(cs.emailhash != bytes32(0));
        _addConsentResponse(signer, _consentRequestId, true);
    }

    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return keccak256("\x19Ethereum Signed Message:\n32", hash);
    }

    event Debug(string message);
    event DebugAddress(string message, address _address);
    event DebugBytes32(string message, bytes32 _data);

    // Map account to Subject
    mapping(address => ConsentSubject) private consentSubjectMap;
    address[] private consentSubjects;

    mapping(uint => ConsentResponse) private consentResponseMap;
    bytes32[] private consentResponses; // Can find response by 

    // Map id of response to subject. 
    mapping(bytes32 => address) private consentResponseToSubject;
}