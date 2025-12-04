// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title SunDevilCoin
 * @notice Simple ERC-20 used as the SDC campus currency. Admins can add/remove
 *         minters and mint new supply to student wallets.
 */
contract SunDevilCoin is ERC20, ERC20Burnable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /**
     * @param initialOwner Wallet that will receive the DEFAULT_ADMIN_ROLE +
     *        MINTER_ROLE. If set to address(0), msg.sender is used.
     * @param initialSupply Amount of SDC (in wei) to mint on deploy.
     */
    constructor(address initialOwner, uint256 initialSupply) ERC20("Sun Devil Coin", "SDC") {
        address owner = initialOwner == address(0) ? msg.sender : initialOwner;
        _grantRole(DEFAULT_ADMIN_ROLE, owner);
        _grantRole(MINTER_ROLE, owner);

        if (initialSupply > 0) {
            _mint(owner, initialSupply);
        }
    }

    /**
     * @notice Mint new SDC to a student wallet.
     * @param to Recipient wallet address.
     * @param amount Amount of SDC to mint (wei, so include decimals).
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(to != address(0), "Invalid recipient");
        _mint(to, amount);
    }

    /**
     * @notice Add or remove a minter.
     */
    function setMinter(address account, bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(account != address(0), "Invalid account");
        if (enabled) {
            _grantRole(MINTER_ROLE, account);
        } else {
            _revokeRole(MINTER_ROLE, account);
        }
    }
}
