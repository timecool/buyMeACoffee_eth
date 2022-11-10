import { ethers } from "hardhat";


async function getBalance(address: string) {
  const balanceBigInt = await ethers.provider.getBalance(address)
  return ethers.utils.formatEther(balanceBigInt)
}

async function printBalance(addresses: any) {
  let idx = 0
  for (const address of addresses) {
    console.log(`Address ${idx} Balance:`, await getBalance(address))
    idx++
  }
}
async function printMemos(memos: any) {
  for (const memo of memos) {
    console.log(`At ${memo.time}, ${memo.name}, (${memo.from}): said: "${memo.message}"`)
  }
}

async function main() {
  const [owner, tipper, tipper2, tipper3] = await ethers.getSigners()

  const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee")
  const buyMeACoffee = await BuyMeACoffee.deploy()
  
  await buyMeACoffee.deployed();
  console.log("BuyMeACoffee deployed to ", buyMeACoffee.address)

  const address = [owner.address, tipper.address, buyMeACoffee.address]
  console.log("=== start ===")
  await printBalance(address)

  const tip = {value: ethers.utils.parseEther("1")}
  await buyMeACoffee.connect(tipper).buyCoffee("Peter","Danke für deine Arbeit",tip)
  await buyMeACoffee.connect(tipper2).buyCoffee("Klaus","Hier lass es dir schmecken",tip)
  await buyMeACoffee.connect(tipper3).buyCoffee("Kay","Killer",tip)

  console.log("=== bought coffee ===")
  await printBalance(address)

  await buyMeACoffee.connect(owner).withdrawTips()

  console.log("=== after withdrawTips ===")
  await printBalance(address)

  console.log("=== memos ===")

  const memos = await buyMeACoffee.getMemos()
  printMemos(memos)
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
