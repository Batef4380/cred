// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Maps wallets to X (Twitter) handles, one-to-one in both directions.
contract IdentityRegistry {
    mapping(address => string) public walletToHandle;
    mapping(bytes32 => address) public handleHashToWallet;

    event IdentityRegistered(address indexed wallet, string xHandle);

    error AlreadyRegistered();
    error HandleTaken();
    error EmptyHandle();

    function registerIdentity(string calldata xHandle) external {
        if (bytes(xHandle).length == 0) revert EmptyHandle();
        if (bytes(walletToHandle[msg.sender]).length != 0) revert AlreadyRegistered();

        bytes32 handleHash = keccak256(bytes(_toLower(xHandle)));
        if (handleHashToWallet[handleHash] != address(0)) revert HandleTaken();

        walletToHandle[msg.sender] = xHandle;
        handleHashToWallet[handleHash] = msg.sender;

        emit IdentityRegistered(msg.sender, xHandle);
    }

    function getXHandle(address wallet) external view returns (string memory) {
        return walletToHandle[wallet];
    }

    function isRegistered(address wallet) external view returns (bool) {
        return bytes(walletToHandle[wallet]).length != 0;
    }

    function _toLower(string memory str) private pure returns (string memory) {
        bytes memory b = bytes(str);
        for (uint256 i = 0; i < b.length; i++) {
            if (b[i] >= 0x41 && b[i] <= 0x5A) {
                b[i] = bytes1(uint8(b[i]) + 32);
            }
        }
        return string(b);
    }
}
