// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Crash Lab Simulation Passport
/// @notice Anchors a minimal cryptographic record for an off-chain simulation report.
/// @dev A Passport proves a report existed at a given time. It is not a universal safety claim.
contract SimulationPassport {
    enum Status {
        Unknown,
        Vulnerable,
        Remediated,
        Unresolved
    }

    struct Passport {
        address protocol;
        bytes32 sourceHash;
        bytes32 reportHash;
        Status status;
        uint64 timestamp;
        bytes32 toolVersion;
        address publisher;
    }

    address public owner;
    mapping(address => bool) public publishers;
    mapping(bytes32 => Passport) private passports;

    error NotOwner();
    error NotPublisher();
    error InvalidOwner();
    error InvalidPublisher();
    error InvalidSimulationId();
    error InvalidProtocol();
    error InvalidHash();
    error InvalidStatus();
    error PassportAlreadyExists();

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event PublisherUpdated(address indexed publisher, bool authorized);
    event PassportPublished(
        bytes32 indexed simulationId,
        address indexed protocol,
        bytes32 indexed reportHash,
        bytes32 sourceHash,
        Status status,
        uint64 timestamp,
        bytes32 toolVersion,
        address publisher
    );

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyPublisher() {
        if (!publishers[msg.sender]) revert NotPublisher();
        _;
    }

    constructor() {
        owner = msg.sender;
        publishers[msg.sender] = true;
        emit OwnershipTransferred(address(0), msg.sender);
        emit PublisherUpdated(msg.sender, true);
    }

    function setPublisher(address publisher, bool authorized) external onlyOwner {
        if (publisher == address(0)) revert InvalidPublisher();
        publishers[publisher] = authorized;
        emit PublisherUpdated(publisher, authorized);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidOwner();
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }

    function publish(
        bytes32 simulationId,
        address protocol,
        bytes32 sourceHash,
        bytes32 reportHash,
        Status status,
        bytes32 toolVersion
    ) external onlyPublisher {
        if (simulationId == bytes32(0)) revert InvalidSimulationId();
        if (protocol == address(0)) revert InvalidProtocol();
        if (sourceHash == bytes32(0) || reportHash == bytes32(0)) revert InvalidHash();
        if (status == Status.Unknown) revert InvalidStatus();
        if (passports[simulationId].timestamp != 0) revert PassportAlreadyExists();

        uint64 publishedAt = uint64(block.timestamp);
        passports[simulationId] = Passport({
            protocol: protocol,
            sourceHash: sourceHash,
            reportHash: reportHash,
            status: status,
            timestamp: publishedAt,
            toolVersion: toolVersion,
            publisher: msg.sender
        });

        emit PassportPublished(
            simulationId,
            protocol,
            reportHash,
            sourceHash,
            status,
            publishedAt,
            toolVersion,
            msg.sender
        );
    }

    function getPassport(bytes32 simulationId) external view returns (Passport memory) {
        return passports[simulationId];
    }

    function exists(bytes32 simulationId) external view returns (bool) {
        return passports[simulationId].timestamp != 0;
    }
}

