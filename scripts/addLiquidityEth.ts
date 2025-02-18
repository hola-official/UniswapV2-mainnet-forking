import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
  const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

  const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  const theAddressIFoundWithUSDCAndDAI =
    "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  const impersonatedSigner = await ethers.getImpersonatedSigner(
    theAddressIFoundWithUSDCAndDAI
  );

  let daiContract = await ethers.getContractAt("IERC20", DAIAddress);

  let uniswapContract = await ethers.getContractAt("IUniswap", UNIRouter);

  const daiBal = await daiContract.balanceOf(impersonatedSigner.address);

  console.log(
    "impersonneted acct ether bal B4:",
    ethers.formatEther(await impersonatedSigner.provider.getBalance(impersonatedSigner.address))
  );

  console.log("impersonneted acct dai bal B4:", ethers.formatUnits(daiBal, 18));

  const amountTokenDesired = ethers.parseUnits("2000", 18);
  const amountTokenMin = ethers.parseUnits("1000", 18);

  const amountETHMin = ethers.parseUnits("0.5", 18);

  let deadline = (await helpers.time.latest()) + 500;

  console.log("-------------- Approving tokens -----------");

  await daiContract
    .connect(impersonatedSigner)
    .approve(UNIRouter, ethers.parseUnits("2500", 18));

  const allowance = await daiContract.allowance(
    impersonatedSigner.address,
    UNIRouter
  );
  console.log("Approved tokens:", ethers.formatUnits(allowance));

  console.log("------------- Tokens approved -------------");

  console.log("-------------------------- Adding liquidityEth -------------");

  const tx = await uniswapContract
    .connect(impersonatedSigner)
    .addLiquidityETH(
      DAIAddress,
      amountTokenDesired,
      amountTokenMin,
      amountETHMin,
      impersonatedSigner.address,
      deadline,
      { value: ethers.parseEther("50") }
  );

  console.log(`Transaction hash: ${tx.hash}`);

  console.log("-------------------------- liquidityEth added -------------");

  const daiBalAfter = await daiContract.balanceOf(impersonatedSigner.address);

  console.log(
    "impersonneted acct ether bal AF:",
    ethers.formatEther(
      await impersonatedSigner.provider.getBalance(impersonatedSigner.address)
    )
  );

  console.log(
    "impersonneted acct dai bal AF:",
    ethers.formatUnits(daiBalAfter, 18)
  );
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
