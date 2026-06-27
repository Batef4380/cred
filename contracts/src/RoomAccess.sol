// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Invite-code gating for private rooms. Inherited by Room.
abstract contract RoomAccess {
    mapping(bytes32 => bool) public validInviteCodes;
    bytes32 public currentInviteCode;
    uint256 private _inviteNonce;

    event InviteCodeGenerated(bytes32 code);

    error InvalidInviteCode();

    function _isOwner(address account) internal view virtual returns (bool);

    function _onJoin(address account) internal virtual;

    function generateInviteCode() external returns (bytes32) {
        require(_isOwner(msg.sender), "not room owner");
        _inviteNonce++;
        bytes32 code = keccak256(abi.encodePacked(address(this), block.timestamp, _inviteNonce));
        validInviteCodes[code] = true;
        currentInviteCode = code;
        emit InviteCodeGenerated(code);
        return code;
    }

    function joinWithCode(bytes32 code) external {
        if (!validInviteCodes[code]) revert InvalidInviteCode();
        _onJoin(msg.sender);
    }
}
