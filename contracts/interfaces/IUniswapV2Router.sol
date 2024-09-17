// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
interface IUniswapV2Router {
    function removeLiquidity(
  address tokenA,
  address tokenB,
  uint liquidity,
  uint amountAMin,
  uint amountBMin,
  address to,
  uint deadline
) external returns (uint amountA, uint amountB);
}