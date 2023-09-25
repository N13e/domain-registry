// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract DomainRegistry {
    uint256 public constant reservationCost = 100; // 0.01 ETH in wei

    struct Domain {
        address controller;
        uint256 deposit;
        bool isRegistered;
    }

    mapping(string => Domain) private domains;

    event DomainRegistered(string domain, address indexed controller, uint256 deposit);
    event DomainReleased(string domain, address indexed controller, uint256 deposit);

    modifier isValidDomain(string memory domain) {
        require(bytes(domain).length <= 6, "Domain length exceeds maximum of 6 characters");
        require(bytes(domain)[0] != '.', "Domain cannot start with a period");
        require(domains[domain].isRegistered == false, "Domain is already registered");
        _;
    }

    function registerDomain(string memory domain) external payable isValidDomain(domain) {
        require(msg.value >= reservationCost, "Insufficient deposit");

        domains[domain] = Domain({
            controller: msg.sender,
            deposit: msg.value,
            isRegistered: true
        });

        emit DomainRegistered(domain, msg.sender, msg.value);
    }

    function releaseDomain(string memory domain) external {
        require(domains[domain].controller == msg.sender, "You are not the controller of this domain");

        address controller = domains[domain].controller;
        uint256 deposit = domains[domain].deposit;

        domains[domain] = Domain({
            controller: address(0),
            deposit: 0,
            isRegistered: false
        });

        payable(controller).transfer(deposit);

        emit DomainReleased(domain, msg.sender, deposit);
    }

    function getDomainInfo(string memory domain) external view returns (address controller, uint256 deposit, bool isRegistered) {
        return (domains[domain].controller, domains[domain].deposit, domains[domain].isRegistered);
    }
}
