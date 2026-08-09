// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20Like {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @notice Deliberately vulnerable vault for the Crash Lab testnet MVP.
/// @dev Direct donations can manipulate the share price and round later deposits to zero shares.
contract VulnerableVault {
    IERC20Like public immutable asset;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    event Deposit(address indexed caller, address indexed receiver, uint256 assets, uint256 shares);
    event Redeem(address indexed caller, address indexed receiver, uint256 assets, uint256 shares);

    constructor(address asset_) {
        asset = IERC20Like(asset_);
    }

    function totalAssets() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    function deposit(uint256 assets, address receiver) external returns (uint256 shares) {
        uint256 supply = totalSupply;
        uint256 assetsBefore = totalAssets();
        shares = supply == 0 ? assets : (assets * supply) / assetsBefore;

        require(asset.transferFrom(msg.sender, address(this), assets), "transfer failed");
        // Intentionally permits zero-share deposits for the testnet vulnerability demonstration.
        totalSupply = supply + shares;
        balanceOf[receiver] += shares;
        emit Deposit(msg.sender, receiver, assets, shares);
    }

    function redeem(uint256 shares, address receiver) external returns (uint256 assets) {
        require(balanceOf[msg.sender] >= shares, "shares");
        uint256 supply = totalSupply;
        assets = (shares * totalAssets()) / supply;
        balanceOf[msg.sender] -= shares;
        totalSupply = supply - shares;
        require(asset.transfer(receiver, assets), "transfer failed");
        emit Redeem(msg.sender, receiver, assets, shares);
    }
}

