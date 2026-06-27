// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Room} from "./Room.sol";

/// @notice Deploys Room (+ its CredToken) instances. Room creation is free.
contract RoomFactory {
    address public immutable identityRegistry;
    address public immutable treasury;

    address[] public rooms;

    event RoomCreated(
        address indexed room,
        address indexed token,
        address indexed creator,
        string name,
        string symbol,
        bool isPrivate
    );

    constructor(address _identityRegistry, address _treasury) {
        identityRegistry = _identityRegistry;
        treasury = _treasury;
    }

    function createRoom(
        string calldata name,
        string calldata symbol,
        bool isPrivate,
        uint256 pointsPerLike,
        uint256 pointsPerComment,
        uint256 pointsPerRT,
        uint256 postSubmitCost
    ) external returns (address) {
        Room room = new Room(
            name,
            symbol,
            isPrivate,
            pointsPerLike,
            pointsPerComment,
            pointsPerRT,
            postSubmitCost,
            msg.sender,
            identityRegistry,
            treasury
        );

        rooms.push(address(room));

        emit RoomCreated(address(room), address(room.token()), msg.sender, name, symbol, isPrivate);

        return address(room);
    }

    function getRooms() external view returns (address[] memory) {
        return rooms;
    }

    function getRoomCount() external view returns (uint256) {
        return rooms.length;
    }
}
