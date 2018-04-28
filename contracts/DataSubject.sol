pragma solidity ^0.4.21;
pragma experimental ABIEncoderV2;

import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";

contract DataSubject is Ownable {

    function DataSubject() public {
        owner = msg.sender;
    }



    // This will fire when a data subject gives consent to a question.
    event ConsentGiven(address indexed owner, address indexed questionAddress);

    // This event will fire when a data subject revokes consent to a question.
    event ConsentRevoked(address indexed owner, address indexed questionAddress);

    // Adapted a design pattern for storing growing arrays, from
    // https://ethereum.stackexchange.com/questions/13167/are-there-well-solved-and-simple-storage-patterns-for-solidity
    struct QuestionStruct {
        address dataProcessor; // address of the SC of the DataProcessor
        uint listPointer;
    }

    // Checks that the item in the array is actually set
    function isQuestion (address questionAddress) public view returns(bool isIndeed) {
        if (questionList.length == 0) {
            return false;
        }
        return (questionList[questionStructs[questionAddress].listPointer] == questionAddress);
    }

    // Get the count of questions stored. The UI will need this to render the questions
    function getQuestionCount() public view returns(uint questionCount) {
        return questionList.length;
    }

    // return the questions answered by this person
    function getAllConsent() public view onlyOwner returns(QuestionStruct[]) {
        QuestionStruct[] memory qs = new QuestionStruct[](questionList.length);
        for (uint i = 0; i<questionList.length; i++) {
            qs[i] = questionStructs[questionList[i]];
        }
        return qs;
    }

    // return the questions answered by this person
    function getOneConsent() public view onlyOwner returns(QuestionStruct) {
        return questionStructs[questionList[0]];
    }

    // Add consent given to a question
    function giveConsent(address questionAddress, address dataProcessor) public returns(bool success) {
        require(!isQuestion(questionAddress));
        questionStructs[questionAddress].dataProcessor = dataProcessor;
        questionStructs[questionAddress].listPointer = questionList.push(questionAddress) - 1;
        emit ConsentGiven(owner, questionAddress);
        return true;
    }

    /*
    // There is no requirement to update a question's consent. That's handled by Revoke and the associated event
    function updateQuestion(address questionAddress, address dataProcessor, address questionData) public returns(bool success) {
        require(isQuestion(questionAddress));
        questionStructs[questionAddress].questionData = questionData;
        return true;
    }
    */

    // Revoke consent by removing the entry
    function revokeConsent(address questionAddress) public returns(bool success) {
        require(isQuestion(questionAddress));
        uint rowToDelete = questionStructs[questionAddress].listPointer;
        address keyToMove = questionList[questionList.length-1];
        questionList[rowToDelete] = keyToMove;
        questionStructs[keyToMove].listPointer = rowToDelete;
        questionList.length--;
        emit ConsentRevoked(owner, questionAddress);
        return true;
    }

    // The address field is the unique identifier of each question. This maps to
    // a simple structure which stores the DataProcessor SC address and the
    // index of its position in the array. Gas Costs not known.
    mapping(address => QuestionStruct) private questionStructs;
    address[] private questionList; //

}
