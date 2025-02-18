import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
  // Contract addresses
  const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const UNIFactory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

  const theAddressIFoundWithUSDCAndDAI =
    "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  // Setup impersonated account
  await helpers.impersonateAccount(theAddressIFoundWithUSDCAndDAI);
  const impersonatedSigner = await ethers.getSigner(
    theAddressIFoundWithUSDCAndDAI
  );

  // Get contract instances
  let usdcContract = await ethers.getContractAt("IERC20", USDCAddress);
  let daiContract = await ethers.getContractAt("IERC20", DAIAddress);
  let uniswapContract = await ethers.getContractAt("IUniswap", UNIRouter);
  let factoryContract = await ethers.getContractAt(
    "IUniswapFactory",
    UNIFactory
  );

  // Check initial balances
  const usdcBal = await usdcContract.balanceOf(impersonatedSigner.address);
  const daiBal = await daiContract.balanceOf(impersonatedSigner.address);

  console.log(
    "impersonneted acct usdc bal BA:",
    ethers.formatUnits(usdcBal, 6)
  );
  console.log(
    `impersonneted acct dai bal BA:, ${ethers.formatUnits(daiBal, 18)}\n`
  );

  // Setup amounts and deadline
  let AmtADesired = ethers.parseUnits("99000", 6);
  let AmtBDesired = ethers.parseUnits("99000", 18);
  let amountAMin = ethers.parseUnits("98000", 6);
  let amountBMin = ethers.parseUnits("98000", 18);
  let liquidityToken = ethers.parseUnits("198000", 18);
  let deadline = (await helpers.time.latest()) + 500;

  console.log("-------------- Approving tokens -----------");

  // Approve USDC
  await usdcContract
    .connect(impersonatedSigner)
    .approve(UNIRouter, liquidityToken);

  const usdcAllowance = await usdcContract.allowance(
    impersonatedSigner.address,
    UNIRouter
  );
  console.log("Approved usdc tokens:", ethers.formatUnits(usdcAllowance));

  // Approve DAI
  await daiContract
    .connect(impersonatedSigner)
    .approve(UNIRouter, liquidityToken);

  const daiAllowance = await daiContract.allowance(
    impersonatedSigner.address,
    UNIRouter
  );
  console.log("Approved dai tokens:", ethers.formatUnits(daiAllowance));

  console.log("------------- Tokens approved -------------\n");

  console.log("------------- Adding liquidity -------------");

  // Add liquidity
  const tx = await uniswapContract
    .connect(impersonatedSigner)
    .addLiquidity(
      USDCAddress,
      DAIAddress,
      AmtADesired,
      AmtBDesired,
      amountAMin,
      amountBMin,
      impersonatedSigner.address,
      deadline
    );

  console.log(`Transaction hash: ${tx.hash}`);

  console.log("---------- liquidity added -------------\n");

  // Get LP token information
  const pairAddress = await factoryContract.getPair(USDCAddress, DAIAddress);
  const lpToken = await ethers.getContractAt("IERC20", pairAddress);
  const lpBalance = await lpToken.balanceOf(impersonatedSigner.address);

  console.log("LP tokens received:", ethers.formatUnits(lpBalance, 18));

  console.log("-------------- removing liquidity -------------");

  // Approve and remove liquidity
  await lpToken.connect(impersonatedSigner).approve(UNIRouter, lpBalance);

  await uniswapContract
    .connect(impersonatedSigner)
    .removeLiquidity(
      USDCAddress,
      DAIAddress,
      lpBalance,
      amountAMin,
      amountBMin,
      impersonatedSigner.address,
      deadline
    );

  console.log("-------------- liquidity removed -------------\n");

  // Check final balances
  const usdcBalAfter = await usdcContract.balanceOf(impersonatedSigner.address);
  const daiBalAfter = await daiContract.balanceOf(impersonatedSigner.address);

  console.log(
    "impersonneted acct usdc bal AF:",
    ethers.formatUnits(usdcBalAfter, 6)
  );
  console.log(
    "impersonneted acct dai bal AF:",
    ethers.formatUnits(daiBalAfter, 18)
  );

  console.log("--------- Removing liquidity -----");
  console.log("----- liquidity Removed ------");
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
