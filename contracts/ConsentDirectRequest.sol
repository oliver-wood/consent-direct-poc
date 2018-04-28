pragma solidity ^0.4.21;

import "./ConsentDirectProcessor.sol";

contract ConsentDirectRequest is ConsentDirectProcessor {

    struct ConsentRequest {
        string requestText; // Question
        bool isActive; // Can be deactivated if required
        uint listpointer;
        uint[] responses; // list of pointers to all responders
    }

    event ConsentRequestAdded(address indexed _dataProcessor, uint _id, bytes32 _crhash);

    
    function addConsentRequest(string _requestText, bool _isActive) external {
        // Check that the sender is a DataProcessor.
        DataProcessor storage dp = dataProcessorMap[msg.sender];
        require(_isDataProcessor(dp));
        
        // Make sure that this isn't already a consent request.
        bytes32 crhash = keccak256(msg.sender, _requestText);
        ConsentRequest storage cr = consentRequestMap[crhash];
        require(!_isConsentRequest(cr));

        // Add reference to array
        uint arrayid = consentRequests.push(crhash).sub(1);
        
        // Update mapping
        cr.listpointer = arrayid;
        cr.requestText = _requestText;
        cr.isActive = _isActive;
        consentRequestToDataProcessor[arrayid] = msg.sender;
        
        dataProcessorRequestCount[msg.sender].add(1);

        emit ConsentRequestAdded(msg.sender, arrayid, crhash);
    }

    function _setActive(bytes32 _crhash, bool _state) private isDataRequestOwner(_crhash) {
        ConsentRequest storage cr = consentRequestMap[_crhash];
        require(_isConsentRequest(cr));
        cr.isActive = _state;
    }

    function activateConsentRequest(bytes32 _crhash) public {
        _setActive(_crhash, true);
    }

    function deactivateConsentRequest(bytes32 _crhash) public {
        _setActive(_crhash, false);
    }

    function getConsentRequestById(uint _questionPointerId) public view returns (string, bool, uint) {
        ConsentRequest storage cr = consentRequestMap[consentRequests[_questionPointerId]];
        return (cr.requestText, cr.isActive, cr.listpointer);
    }

    function getConsentRequestByHash(bytes32 _crhash) public view returns (string, bool, uint) {
        ConsentRequest storage cr = consentRequestMap[_crhash];
        require(_isConsentRequest(cr));
        return (cr.requestText, cr.isActive, cr.listpointer);
    }

    // Get all questions for the organisation
    function getConsentRequestIds(address _dataProcessorAddress) public view returns (uint[]) {
        uint[] memory result = new uint[](dataProcessorRequestCount[_dataProcessorAddress]);
        uint counter = 0;
        for (uint i = 0; i < consentRequests.length; i++) {
            if (consentRequestToDataProcessor[i] == _dataProcessorAddress) {
                result[counter] = i;
                counter++;
            }
        }
        return result;
    }

    function getConsentRequestsLength() public view returns (uint) {
        return (consentRequests.length);
    }

    function getNextRequest(address _dataProcessorAddress, uint _start) public view returns (string, bool, uint) {
        for (uint i = _start; i < consentRequests.length; i++) {
            if (consentRequestToDataProcessor[i] == _dataProcessorAddress) {
                return getConsentRequestByHash(consentRequests[i]);
            }
        }
        string memory ret = "";
        return (ret, false, uint(0));
    }

    function _isConsentRequest(ConsentRequest storage _cr) private view returns (bool) {
        return (keccak256(_cr.requestText) != keccak256(""));
    }

    modifier isDataRequestOwner(bytes32 _crhash) {
        ConsentRequest storage cr = consentRequestMap[_crhash];
        require(consentRequestToDataProcessor[cr.listpointer] == msg.sender);
        _;
    }

    // address is keccak256(dataProcessorAddress, requesttext)
    mapping(bytes32 => ConsentRequest) public consentRequestMap;
    bytes32[] public consentRequests;

    // Map question to their organisation
    mapping(uint => address) public consentRequestToDataProcessor;

}