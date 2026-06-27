// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Room-scoped ERC-20. Only the deploying Room can mint or burn.
contract CredToken is ERC20 {
    address public immutable room;

    error OnlyRoom();

    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {
        room = msg.sender;
    }

    modifier onlyRoom() {
        if (msg.sender != room) revert OnlyRoom();
        _;
    }

    function mint(address to, uint256 amount) external onlyRoom {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyRoom {
        _burn(from, amount);
    }
}
