const { expect } = require('chai');

describe('DomainRegistry', function () {
  let DomainRegistry;
  let domainRegistry;
  let owner;
  let addr1;
  const domain = 'com';
  const domain2 = 'net';
  const nonexistentDomain = 'nonexistent';
  const reservationCost = ethers.parseUnits("100000000000000000", "wei");
  const insufficientCost = ethers.parseUnits("50000000000000000", "wei");

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    DomainRegistry = await ethers.getContractFactory('DomainRegistry');
    domainRegistry = await DomainRegistry.deploy();
  });

  it('should register a domain', async function () {
    // Register the domain
    await expect(domainRegistry.connect(addr1).registerDomain(domain, { value: reservationCost }))
        .to.emit(domainRegistry, 'DomainRegistered')
        .withArgs(domain, addr1.address, reservationCost);

    // Check domain info
    const domainInfo = await domainRegistry.getDomainInfo(domain);
    expect(domainInfo.controller).to.equal(addr1.address);
    expect(domainInfo.deposit).to.equal(reservationCost);
  });

  it('should release a domain', async function () {
    // Register the domain
    await domainRegistry.connect(addr1).registerDomain(domain, { value: reservationCost });

    // Release the domain
    await expect(domainRegistry.connect(addr1).releaseDomain(domain))
        .to.emit(domainRegistry, 'DomainReleased')
        .withArgs(domain, addr1.address, reservationCost);

    // Check domain info
    const domainInfo = await domainRegistry.getDomainInfo(domain);
    expect(domainInfo.controller).to.equal(ethers.ZeroAddress);
    expect(domainInfo.deposit).to.equal(0);
  });

  it('should not allow registering an already registered domain', async function () {
    // Register the domain
    await domainRegistry.connect(addr1).registerDomain(domain, { value: reservationCost });

    // Try to register the domain again
    await expect(domainRegistry.connect(addr1).registerDomain(domain, { value: reservationCost }))
        .to.be.revertedWith('Domain is already registered');
  });

  it('should not allow registering a domain with insufficient deposit', async function () {
    // Try to register the domain with insufficient deposit
    await expect(domainRegistry.connect(addr1).registerDomain(domain, { value: insufficientCost }))
        .to.be.revertedWith('Insufficient deposit');
  });

  it('should not allow releasing a domain by a non-controller address', async function () {
    // Register the domain
    await domainRegistry.connect(addr1).registerDomain(domain, { value: reservationCost });

    // Try to release the domain from a different address
    await expect(domainRegistry.connect(owner).releaseDomain(domain))
        .to.be.revertedWith('You are not the controller of this domain');
  });

  it('should return zeroed information for a non-existing domain', async function () {
    // Get information for a non-existing domain
    const domainInfo = await domainRegistry.getDomainInfo(nonexistentDomain);

    expect(domainInfo.controller).to.equal(ethers.ZeroAddress);
    expect(domainInfo.deposit).to.equal(0);
  });

  it('should return the count of registered domains', async function () {
    const initialCount = await domainRegistry.getRegisteredDomainsCount();

    // Register a domain
    await domainRegistry.connect(addr1).registerDomain(domain, { value: reservationCost });

    const updatedCount = await domainRegistry.getRegisteredDomainsCount();

    // Convert initialCount and updatedCount to JavaScript numbers for comparison
    const initialCountNumber = Number(initialCount);
    const updatedCountNumber = Number(updatedCount);

    // Check that the count increased by 1
    expect(updatedCountNumber).to.equal(initialCountNumber + 1);
  });

  it('should return the list of registered domains', async function () {
    // Register some domains
    await domainRegistry.connect(addr1).registerDomain(domain, { value: reservationCost });
    await domainRegistry.connect(addr1).registerDomain(domain2, { value: reservationCost });

    const registeredDomains = await domainRegistry.getRegisteredDomains();

    // Check if the registered domains are in the list
    expect(registeredDomains).to.include(domain);
    expect(registeredDomains).to.include(domain2);
  });

});
