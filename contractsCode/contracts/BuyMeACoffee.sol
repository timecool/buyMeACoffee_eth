// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Deploy to 0x3dc5eB9F1b78760d322CBc5A4d81F7559459a75d
contract BuyMeACoffee {
    event NewMemo(
        address indexed from,
        uint256 time,
        string name,
        string message
    );

    struct Memo {
        address from;
        uint256 time;
        string name;
        string message;
    }

    Memo[] memos;

    address payable owner;

    constructor() {
        owner = payable(msg.sender);
    }

    /**
     * @dev buy a coffee for contract owner
     * @param _name name of the coffee buyer
     * @param _message a nice message from the coffee buyer
     */
    function buyCoffee(string memory _name, string memory _message)
        public
        payable
    {
        require(msg.value > 0, "can't buy coffee with 0 eth");

        memos.push(Memo(msg.sender, block.timestamp, _name, _message));

        emit NewMemo(msg.sender, block.timestamp, _name, _message);
    }

    /**
     * @dev send the entire balance stored on this contract to the owner
     */
    function withdrawTips() public {
        require(owner.send(address(this).balance));
    }

    /**
     * @dev retrieve all the memos received and stored on th blockchain
     */
    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }
}
