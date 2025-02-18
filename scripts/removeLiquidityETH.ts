import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
  // Contract addresses
  const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const UNIFactory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  const WETHAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

  const theAddressIFoundWithUSDCAndDAI =
    "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  // Setup impersonated account
  const impersonatedSigner = await ethers.getImpersonatedSigner(
    theAddressIFoundWithUSDCAndDAI
  );

  // Get contract instances
  const daiContract = await ethers.getContractAt("IERC20", DAIAddress);
  const uniswapContract = await ethers.getContractAt("IUniswap", UNIRouter);
  const factoryContract = await ethers.getContractAt(
    "IUniswapFactory",
    UNIFactory
  );

  // Check initial balances
  const initialEthBal = await impersonatedSigner.provider.getBalance(
    impersonatedSigner.address
  );
  const initialDaiBal = await daiContract.balanceOf(impersonatedSigner.address);

  console.log(
    "Impersonated account ETH balance before:",
    ethers.formatEther(initialEthBal)
  );
  console.log(
    "Impersonated account DAI balance before:",
    ethers.formatUnits(initialDaiBal, 18)
  );

  // Setup amounts and deadline
  const amountTokenDesired = ethers.parseUnits("2000", 18);
  const amountTokenMin = ethers.parseUnits("1000", 18);
  const amountETHMin = ethers.parseUnits("0.5", 18);
  const deadline = (await helpers.time.latest()) + 500;

  // Approve DAI tokens for the Uniswap router
  console.log("------------ Approving DAI tokens -----------");
  const approveTx = await daiContract
    .connect(impersonatedSigner)
    .approve(UNIRouter, ethers.parseUnits("2500", 18));

  console.log(`Transaction hash: ${approveTx.hash}`);

  // Check allowance
  const allowance = await daiContract.allowance(
    impersonatedSigner.address,
    UNIRouter
  );
  console.log("Approved DAI tokens:", ethers.formatUnits(allowance, 18));

  console.log("------------- DAI tokens approved -------------\n");

  // Add liquidity to the pool
  console.log("------------- Adding liquidity ETH -------------");
  const addLiquidityTx = await uniswapContract
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

  console.log(`Transaction hash: ${addLiquidityTx.hash}`);

  // Check final balances
  const EthBalAfterAddingLp = await impersonatedSigner.provider.getBalance(
    impersonatedSigner.address
  );
  const DaiBalAfterAddingLp = await daiContract.balanceOf(
    impersonatedSigner.address
  );

  console.log(
    "ETH balance after add liquidity:",
    ethers.formatEther(EthBalAfterAddingLp)
  );
  console.log(
    "DAI balance after add liquidity:",
    ethers.formatUnits(DaiBalAfterAddingLp, 18)
  );

  console.log("---------------- Liquidity ETH added -------------\n");

  // Check LP token balance after adding liquidity
  const pairAddress = await factoryContract.getPair(DAIAddress, WETHAddress);
  const lpToken = await ethers.getContractAt("IERC20", pairAddress);
  const lpBalance = await lpToken.balanceOf(impersonatedSigner.address);
  console.log("LP tokens available:", ethers.formatUnits(lpBalance, 18));

  // Approve LP tokens for the Uniswap router
  console.log("------------ Approving LP tokens -----------");
  const approveLpTx = await lpToken
    .connect(impersonatedSigner)
    .approve(UNIRouter, lpBalance);

  console.log(`Transaction hash: ${approveLpTx.hash}`);

  console.log("------------- LP tokens approved -------------\n");

  // Remove liquidity from the pool
  console.log("-------------- Removing liquidity -------------");
  const removeLiquidityTx = await uniswapContract
    .connect(impersonatedSigner)
    .removeLiquidityETH(
      DAIAddress,
      lpBalance,
      amountTokenMin,
      amountETHMin,
      impersonatedSigner.address,
      deadline
    );
  console.log(`Transaction hash: ${removeLiquidityTx.hash}`);

  console.log("-------------- Liquidity removed -------------\n");

  // Check final balances
  const finalEthBal = await impersonatedSigner.provider.getBalance(
    impersonatedSigner.address
  );
  const finalDaiBal = await daiContract.balanceOf(impersonatedSigner.address);

  console.log("ETH balance after removing:", ethers.formatEther(finalEthBal));
  console.log(
    "DAI balance after removing:",
    ethers.formatUnits(finalDaiBal, 18)
  );
};

main().catch((error) => {
  console.error("Error in main function:", error);
  process.exitCode = 1;
});
