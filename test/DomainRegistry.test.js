describe('DomainRegistry', function () {
  it("DomainRegistry", async () => {
    const c = await ethers.deployContract("DomainRegistry");
    const result = await c.target;
    console.log(`\nresult: ${result}\n`);
  });
});
