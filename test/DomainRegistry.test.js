const { expect } = require('chai');

describe('DomainRegistry', function () {
  let DomainRegistry;
  let domainRegistry;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    DomainRegistry = await ethers.getContractFactory('DomainRegistry');
    domainRegistry = await DomainRegistry.deploy();
  });

  it('should register a domain', async function () {
    const domain = 'com';
    const reservationCost = 100; // 0.01 ETH in wei

    // Register the domain
    await expect(domainRegistry.connect(addr1).registerDomain(domain, { value: reservationCost }))
        .to.emit(domainRegistry, 'DomainRegistered')
        .withArgs(domain, addr1.address, reservationCost);

    // Check domain info
    const domainInfo = await domainRegistry.getDomainInfo(domain);
    expect(domainInfo.controller).to.equal(addr1.address);
    expect(domainInfo.deposit).to.equal(reservationCost);
    expect(domainInfo.isRegistered).to.be.true;
  });

  it('should release a domain', async function () {
    const domain = 'com';
    const reservationCost = 100; // 0.01 ETH in wei

    // Register the domain
    await domainRegistry.connect(addr1).registerDomain(domain, { value: reservationCost });

    // Release the domain
    await expect(domainRegistry.connect(addr1).releaseDomain(domain))
        .to.emit(domainRegistry, 'DomainReleased')
        .withArgs(domain, addr1.address, reservationCost);

    // Check domain info
    const domainInfo = await domainRegistry.getDomainInfo(domain);
    expect(domainInfo.controller).to.equal('0x0000000000000000000000000000000000000000');
    expect(domainInfo.deposit).to.equal(0);
    expect(domainInfo.isRegistered).to.be.false;
  });
});
