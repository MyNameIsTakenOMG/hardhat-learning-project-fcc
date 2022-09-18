const { network } = require("hardhat");
const { developmentChains, DECIMALS, INITIAL_ANSWER } = require("../helper-harhat-config")

module.exports = async({getNamedAccounts,getChainId,deployments})=>{
    const {deploy, log} = deployments
    const chainId = await getChainId()
    console.log('chain: ',chainId);
    const {deployer} = await getNamedAccounts()

    // if(developmentChains.includes(chainId)){
    if(developmentChains.includes(network.name)){
        console.log('network name: ',network.name)
        log('local network detected, deploying...')
        await deploy('MockV3Aggregator',{
            from:deployer,
            log:true,
            args:[DECIMALS, INITIAL_ANSWER]
        })
        log('mock deployed successfully-------------------------')
    }
}

module.exports.tags = ['all','mocks']