// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {IdentityRegistry} from "../src/IdentityRegistry.sol";
import {RoomFactory} from "../src/RoomFactory.sol";
import {Room} from "../src/Room.sol";
import {CredToken} from "../src/CredToken.sol";

contract RoomTest is Test {
    IdentityRegistry identityRegistry;
    RoomFactory factory;
    Room room;
    CredToken token;

    address treasury = address(0x7E5);
    address owner;
    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    uint8 constant LIKE = 1;
    uint8 constant COMMENT = 2;
    uint8 constant RETWEET = 3;

    function setUp() public {
        owner = address(0x0A);
        identityRegistry = new IdentityRegistry();
        factory = new RoomFactory(address(identityRegistry), treasury);

        vm.prank(owner);
        identityRegistry.registerIdentity("owner_eth");

        vm.prank(owner);
        address roomAddr = factory.createRoom("Monad Blitz", "BLITZ", false, 1e18, 2e18, 3e18, 5e18);
        room = Room(roomAddr);
        token = room.token();

        vm.prank(alice);
        identityRegistry.registerIdentity("alice_eth");
        vm.prank(bob);
        identityRegistry.registerIdentity("bob_eth");
    }

    function test_ownerGetsStarterGrant() public view {
        assertEq(token.balanceOf(owner), 5e18 * 20);
    }

    function test_joinPublicRoom() public {
        vm.prank(alice);
        room.joinRoom();
        assertTrue(room.isMember(alice));
        assertEq(room.getMemberCount(), 2);
    }

    function test_revert_joinRequiresIdentity() public {
        address eve = address(0xE5E);
        vm.prank(eve);
        vm.expectRevert(Room.NotRegistered.selector);
        room.joinRoom();
    }

    function test_submitPost_burnsCost() public {
        vm.prank(owner);
        room.submitPost("https://x.com/test/1");

        assertEq(token.balanceOf(owner), 5e18 * 20 - 5e18);
        Room.Post[] memory posts = room.getPosts();
        assertEq(posts.length, 1);
        assertEq(posts[0].author, owner);
    }

    function test_submitEngagement_mintsPoints() public {
        vm.prank(owner);
        room.submitPost("https://x.com/test/1");

        vm.prank(alice);
        room.joinRoom();

        vm.prank(alice);
        room.submitEngagement(0, LIKE, "");
        assertEq(token.balanceOf(alice), 1e18);

        vm.prank(alice);
        room.submitEngagement(0, COMMENT, "https://x.com/alice/c1");
        assertEq(token.balanceOf(alice), 1e18 + 2e18);
    }

    function test_revert_engagementRequiresProofForCommentAndRT() public {
        vm.prank(owner);
        room.submitPost("https://x.com/test/1");

        vm.prank(alice);
        room.joinRoom();

        vm.prank(alice);
        vm.expectRevert(Room.ProofRequired.selector);
        room.submitEngagement(0, COMMENT, "");
    }

    function test_revert_doubleEngagementSameType() public {
        vm.prank(owner);
        room.submitPost("https://x.com/test/1");

        vm.prank(alice);
        room.joinRoom();

        vm.prank(alice);
        room.submitEngagement(0, LIKE, "");

        vm.prank(alice);
        vm.expectRevert(Room.AlreadyEngaged.selector);
        room.submitEngagement(0, LIKE, "");
    }

    function test_boostAndClaim() public {
        vm.prank(owner);
        room.submitPost("https://x.com/test/1");

        vm.prank(alice);
        room.joinRoom();
        vm.prank(bob);
        room.joinRoom();

        vm.prank(alice);
        room.submitEngagement(0, LIKE, ""); // alice: 1e18 pts
        vm.prank(bob);
        room.submitEngagement(0, RETWEET, "https://x.com/bob/rt1"); // bob: 3e18 pts

        // owner boosts with 50e18 (owner has 95e18 after the post cost)
        vm.prank(owner);
        room.boostPost(0, 50e18);

        uint256 ownerBalAfterBoost = token.balanceOf(owner);
        assertEq(ownerBalAfterBoost, 5e18 * 20 - 5e18 - 50e18);

        Room.Post[] memory posts = room.getPosts();
        assertEq(posts[0].boostPool, 47.5e18); // 95% of 50e18
        assertTrue(posts[0].boosted);
        assertEq(token.balanceOf(treasury), 2.5e18); // 5% fee

        // total points = 4e18, alice has 1/4, bob has 3/4
        vm.prank(alice);
        room.claimBoostReward(0);
        assertEq(token.balanceOf(alice), 1e18 + (47.5e18 * 1e18) / 4e18);

        vm.prank(bob);
        room.claimBoostReward(0);
        assertEq(token.balanceOf(bob), 3e18 + (47.5e18 * 3e18) / 4e18);

        // double claim reverts
        vm.prank(alice);
        vm.expectRevert(Room.AlreadyClaimed.selector);
        room.claimBoostReward(0);
    }

    function test_penalize_burnsPostPoints() public {
        vm.prank(owner);
        room.submitPost("https://x.com/test/1");

        vm.prank(alice);
        room.joinRoom();
        vm.prank(alice);
        room.submitEngagement(0, RETWEET, "https://x.com/alice/rt1");
        assertEq(token.balanceOf(alice), 3e18);

        vm.prank(owner);
        room.penalize(alice, 0);
        assertEq(token.balanceOf(alice), 0);
        assertEq(room.userPostPoints(0, alice), 0);
    }

    function test_revert_penalizeOnlyOwner() public {
        vm.prank(owner);
        room.submitPost("https://x.com/test/1");
        vm.prank(alice);
        room.joinRoom();
        vm.prank(alice);
        room.submitEngagement(0, LIKE, "");

        vm.prank(bob);
        vm.expectRevert(Room.NotOwner.selector);
        room.penalize(alice, 0);
    }

    function test_leaderboard_sortedDescending() public {
        vm.prank(alice);
        room.joinRoom();
        vm.prank(bob);
        room.joinRoom();

        vm.prank(owner);
        room.submitPost("https://x.com/test/1");

        vm.prank(alice);
        room.submitEngagement(0, LIKE, ""); // 1e18
        vm.prank(bob);
        room.submitEngagement(0, RETWEET, "https://x.com/bob/rt"); // 3e18

        (address[] memory addrs, uint256[] memory bals) = room.getLeaderboard(3);
        assertEq(addrs.length, 3);
        assertEq(addrs[0], owner); // starter grant minus post cost still highest
        assertEq(bals[0], 5e18 * 20 - 5e18);
        assertEq(addrs[1], bob);
        assertEq(bals[1], 3e18);
        assertEq(addrs[2], alice);
        assertEq(bals[2], 1e18);
    }

    function test_privateRoom_inviteCodeFlow() public {
        vm.prank(owner);
        address privAddr = factory.createRoom("Secret Room", "SECRET", true, 1e18, 2e18, 3e18, 5e18);
        Room privRoom = Room(privAddr);

        vm.prank(alice);
        vm.expectRevert(Room.PrivateRoom.selector);
        privRoom.joinRoom();

        vm.prank(owner);
        bytes32 code = privRoom.generateInviteCode();

        vm.prank(alice);
        privRoom.joinWithCode(code);
        assertTrue(privRoom.isMember(alice));
    }

    function test_revert_generateInviteCodeOnlyOwner() public {
        vm.prank(owner);
        address privAddr = factory.createRoom("Secret Room", "SECRET", true, 1e18, 2e18, 3e18, 5e18);
        Room privRoom = Room(privAddr);

        vm.prank(alice);
        vm.expectRevert(bytes("not room owner"));
        privRoom.generateInviteCode();
    }
}
