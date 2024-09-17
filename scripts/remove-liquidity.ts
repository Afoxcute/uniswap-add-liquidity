import { ethers } from 'ethers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Uniswap V2 Router address (Ethereum mainnet)
const UNISWAP_V2_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

// Uniswap V2 Router ABI (only the functions we need)
const UNISWAP_V2_ROUTER_ABI = [
  'function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB)',
  'function removeLiquidityETH(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external returns (uint amountToken, uint amountETH)'
];

async function removeLiquidity(
  tokenA: string,
  tokenB: string,
  liquidity: string,
  amountAMin: string,
  amountBMin: string,
  isETH: boolean
) {
  // Connect to the Ethereum network
  const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  // Create a contract instance
  const router = new ethers.Contract(UNISWAP_V2_ROUTER_ADDRESS, UNISWAP_V2_ROUTER_ABI, wallet);

  // Set the deadline 20 minutes from now
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

  try {
    let tx;
    if (isETH) {
      // Remove liquidity with ETH
      tx = await router.removeLiquidityETH(
        tokenA,
        liquidity,
        amountAMin,
        amountBMin,
        wallet.address,
        deadline,
        { gasLimit: 300000 }
      );
    } else {
      // Remove liquidity with two ERC20 tokens
      tx = await router.removeLiquidity(
        tokenA,
        tokenB,
        liquidity,
        amountAMin,
        amountBMin,
        wallet.address,
        deadline,
        { gasLimit: 300000 }
      );
    }

    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.transactionHash);
    console.log('Gas used:', receipt.gasUsed.toString());
  } catch (error) {
    console.error('Error removing liquidity:', error);
  }
}

// Example usage
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const DAI_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

// Remove liquidity from WETH-DAI pair
removeLiquidity(
  WETH_ADDRESS,
  DAI_ADDRESS,
  ethers.utils.parseUnits('1', 18).toString(), // 1 LP token
  ethers.utils.parseUnits('0.1', 18).toString(), // Minimum 0.1 WETH
  ethers.utils.parseUnits('100', 18).toString(), // Minimum 100 DAI
  false
);

// Remove liquidity from ETH-DAI pair
removeLiquidity(
  DAI_ADDRESS,
  WETH_ADDRESS, // This parameter is ignored for ETH pairs
  ethers.utils.parseUnits('1', 18).toString(), // 1 LP token
  ethers.utils.parseUnits('100', 18).toString(), // Minimum 100 DAI
  ethers.utils.parseUnits('0.1', 18).toString(), // Minimum 0.1 ETH
  true
);