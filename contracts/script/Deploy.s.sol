// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {IdentityRegistry} from "../src/IdentityRegistry.sol";
import {RoomFactory} from "../src/RoomFactory.sol";
import {Room} from "../src/Room.sol";

/// @notice Deploys IdentityRegistry + RoomFactory, then seeds the "Monad Blitz" demo room.
contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        IdentityRegistry identityRegistry = new IdentityRegistry();
        // Treasury defaults to the deployer address per spec.
        RoomFactory factory = new RoomFactory(address(identityRegistry), deployer);

        address blitzRoom = factory.createRoom(
            "Monad Blitz",
            "BLITZ",
            false, // public
            1e18, // pointsPerLike
            2e18, // pointsPerComment
            3e18, // pointsPerRT
            5e18 // postSubmitCost
        );

        identityRegistry.registerIdentity("monadblitz");

        Room room = Room(blitzRoom);
        room.submitPost("https://x.com/monad/status/1");
        room.submitPost("https://x.com/monad/status/2");
        room.submitPost("https://x.com/monad/status/3");

        vm.stopBroadcast();

        console.log("Deployer:        ", deployer);
        console.log("IdentityRegistry:", address(identityRegistry));
        console.log("RoomFactory:     ", address(factory));
        console.log("Monad Blitz Room:", blitzRoom);
        console.log("Monad Blitz Token:", address(Room(blitzRoom).token()));
    }
}
