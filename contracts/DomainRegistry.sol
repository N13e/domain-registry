// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DomainRegistry {
    uint256 public constant reservationCost = 100; // 0.0000000001 Ether or 0.0000001 ETH in wei
    struct Domain {
        address controller;
        uint256 deposit;
    }

    mapping(string => Domain) private domains;
    string[] private domainNames;  // Array to store domain names

    event DomainRegistered(string domain, address indexed controller, uint256 deposit);
    event DomainReleased(string domain, address indexed controller, uint256 deposit);

    modifier isValidDomain(string memory domain) {
        require(bytes(domain).length <= 6, "Domain length exceeds maximum of 6 characters");
        require(bytes(domain)[0] != '.', "Domain cannot start with a period");
        require(domains[domain].controller == address(0), "Domain is already registered");
        _;
    }

    function registerDomain(string memory domain) external payable isValidDomain(domain) {
        require(msg.value >= reservationCost, "Insufficient deposit");

        domains[domain] = Domain({
            controller: msg.sender,
            deposit: msg.value
        });

        domainNames.push(domain);  // Add domain to the list
        emit DomainRegistered(domain, msg.sender, msg.value);
    }

    function releaseDomain(string memory domain) external {
        require(domains[domain].controller == msg.sender, "You are not the controller of this domain");

        address controller = domains[domain].controller;
        uint256 deposit = domains[domain].deposit;

        delete domains[domain];

        removeDomainFromList(domain);
        payable(controller).transfer(deposit);

        emit DomainReleased(domain, msg.sender, deposit);
    }

    function getDomainInfo(string memory domain) external view returns (Domain memory) {
        return domains[domain];
    }

    function getRegisteredDomainsCount() external view returns (uint256) {
        return domainNames.length;
    }

    function getRegisteredDomains() external view returns (string[] memory) {
        return domainNames;
    }

    function getDomainsForController(address controller) external view returns (string[] memory) {
        string[] memory controllerDomains = new string[](domainNames.length);
        uint256 count = 0;
        for (uint256 i = 0; i < domainNames.length; i++) {
            if (domains[domainNames[i]].controller == controller) {
                controllerDomains[count] = domainNames[i];
                count++;
            }
        }
        return controllerDomains;
    }

    function removeDomainFromList(string memory domain) internal {
        for (uint256 i = 0; i < domainNames.length; i++) {
            if (keccak256(abi.encodePacked(domainNames[i])) == keccak256(abi.encodePacked(domain))) {
                if (i != domainNames.length - 1) {
                    domainNames[i] = domainNames[domainNames.length - 1];
                }
                domainNames.pop();
                break;
            }
        }
    }
}
