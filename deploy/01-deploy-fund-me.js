const { network } = require("hardhat")
const {verify} = require('../utils/verify')
const {networkConfig, developmentChains} = require("../helper-harhat-config")

module.exports = async({getNamedAccounts,deployments, getChainId})=>{
    const {deploy, log, get} = deployments
    const {deployer} = await getNamedAccounts()
    // const chainId = network.config.chainId 
    const chainId = await getChainId()

    // if chainId is X, then use address Y
    // if chainId is Z, then use address A
    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress 
    // if deploy onto local network
    if(developmentChains.includes(network.name)){
        const ethUsdAggregatorDeployment = await get('MockV3Aggregator') // the name of the contract we just deployed
        ethUsdPriceFeedAddress = ethUsdAggregatorDeployment.address
    }
    // else deploy to the test network or main network
    else {
        ethUsdPriceFeedAddress = networkConfig[chainId]['ethUsdPriceFeed']
    }

    // if the contract doesn't exist, then we deploy a minimal verion of it for our local testing(mock)


    // what happen when we want to change chains?
    // when going for localhost or hardhat network we want to use a mock
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe",{
        from:deployer,
        log:true,
        waitConfirmations:network.config.blockConfirmations || 1,
        args:args // arguments sent to the constructor, in this case: priceFeedPrice( network specific)
    })

    // verify the contract if deploy contract to testnet or mainnet
    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        await verify(fundMe.address, args)
    }

    log('deployed successfully---------------------------')


}

module.exports.tags = ['all','fundme']