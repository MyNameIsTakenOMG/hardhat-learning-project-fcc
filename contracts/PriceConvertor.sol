// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";


library PriceConvertor {

    function getPrice(AggregatorV3Interface priceFeed) internal  view returns(uint ){
        // ABI
        // address 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e);
        (,int256 answer,,,) = priceFeed.latestRoundData();
        // eg. answer = 3000.00000000   (eth -- USD)s
        return uint(answer*1e10);
    }

    function getConvertionRate(uint256 ethAmount, AggregatorV3Interface priceFeed) internal  view returns(uint){
        uint ethPrice = getPrice(priceFeed);
        uint ethAmountInUsd = (ethPrice* ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}