pragma solidity ^0.4.21;

import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";

contract ConsentDirectProcessor is Ownable {
    using SafeMath for uint256;

    struct DataProcessor {
        string name;
        uint listPointer;
    }

    event DataProcessorAdded(address indexed _address, uint _position);
    
    // Add a DataProcessor
    function addDataProcessor(address _address, string _name) external onlyOwner {
        // Get the array pointer address
        uint lp = dataProcessors.push(_address).sub(1);
        dataProcessorMap[_address].name = _name;
        dataProcessorMap[_address].listPointer = lp;
        emit DataProcessorAdded(_address, lp);
    }

    // Get the DataProcessor details
    function getDataProcessorByAddress(address _address) public view returns (string, uint) {
        DataProcessor storage dp = dataProcessorMap[_address];
        require(_isDataProcessor(dp));
        return (dp.name, dp.listPointer);
    }


    // Check that the item in the map is actually set
    function _isDataProcessor(DataProcessor storage _dp) internal view returns (bool) {
        return (keccak256(_dp.name) != keccak256(""));
    }

    mapping(address => DataProcessor) internal dataProcessorMap;
    address[] internal dataProcessors;
    mapping (address => uint) dataProcessorRequestCount;
}