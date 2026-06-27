// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {IdentityRegistry} from "../src/IdentityRegistry.sol";

contract IdentityRegistryTest is Test {
    IdentityRegistry registry;
    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    function setUp() public {
        registry = new IdentityRegistry();
    }

    function test_registerIdentity() public {
        vm.prank(alice);
        registry.registerIdentity("alice_eth");

        assertEq(registry.getXHandle(alice), "alice_eth");
        assertTrue(registry.isRegistered(alice));
    }

    function test_revert_doubleRegisterSameWallet() public {
        vm.prank(alice);
        registry.registerIdentity("alice_eth");

        vm.prank(alice);
        vm.expectRevert(IdentityRegistry.AlreadyRegistered.selector);
        registry.registerIdentity("alice_again");
    }

    function test_revert_handleTakenCaseInsensitive() public {
        vm.prank(alice);
        registry.registerIdentity("AliceEth");

        vm.prank(bob);
        vm.expectRevert(IdentityRegistry.HandleTaken.selector);
        registry.registerIdentity("aliceeth");
    }

    function test_revert_emptyHandle() public {
        vm.prank(alice);
        vm.expectRevert(IdentityRegistry.EmptyHandle.selector);
        registry.registerIdentity("");
    }
}
