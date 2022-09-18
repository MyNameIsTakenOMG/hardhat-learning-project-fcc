const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-harhat-config")

!developmentChains.includes(network.name) 
? describe.skip
: describe("FundMe", async function(){
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1")
    beforeEach(async function(){
        // deploy fundme contract using hardhat deploy
        // const accounts = await ethers.getSigners()
        // const accountOne = accounts[0]

        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(['all'])
        fundMe = await ethers.getContract("FundMe",deployer)
        mockV3Aggregator = await ethers.getContract('MockV3Aggregator',deployer)
    })
    
    describe('constructor',async function(){
        it('sets aggregator address correctly',async()=>{
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })
    describe('fund',async()=>{
        it('fails if you dont send enough ETH',async()=>{
            await expect(fundMe.fund()).to.be.reverted
        })
        it('updates if enough ETH',async()=>{
            await fundMe.fund({value:sendValue})
            const response = await fundMe.getAddressToAmountFunded(deployer) 
            console.log('response: ',response)
            assert.equal(response.toString(),sendValue.toString())
        })
        it('add funder to funders',async()=>{
            await fundMe.fund({value:sendValue})
            const response = await fundMe.getFunder(0)
            assert.equal(response, deployer)
        })
    })
    describe('withdraw',async()=>{
        beforeEach(async()=>{
            await fundMe.fund({value:sendValue})
        })

        it('withdraw ETH from a single deployer',async()=>{
            // arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
            // act
            const transactionResponse = await fundMe.withdraw() 
            const transactionReceipt = await transactionResponse.wait(1)
            // gas cost
            const {gasUsed,effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice) 

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

            // assert
            assert.equal(endingFundMeBalance,0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
        })

        it('withdraw from multiple funders',async()=>{
            // arrange
            const accounts = await ethers.getSigners()
            for(let i = 0; i < 6; i++){
                const fundMeConnectedContract = await fundMe.connect(accounts[i])
                await fundMeConnectedContract.fund({value:sendValue})
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            // act

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            // gas cost
            const {gasUsed,effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice) 

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

            // assert
            assert.equal(endingFundMeBalance,0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())

            await expect(fundMe.getFunder(0)).to.be.reverted

            for(let i = 0; i < 6; i++) {
                assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address),0)
            }
        })
        it('only allows the owner to withdraw',async()=>{
            // arrange
            const accounts = await ethers.getSigners()
            const hackerConnectedContract = await fundMe.connect(accounts[1])
            // act and assert
            await expect(hackerConnectedContract.withdraw()).to.be.reverted
        })
    })
    describe('cheaperWithdraw',async()=>{
        beforeEach(async()=>{
            await fundMe.fund({value:sendValue})
        })

        it('cheaperWithdraw ETH from a single deployer',async()=>{
            // arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
            // act
            const transactionResponse = await fundMe.cheaperWithdraw() 
            const transactionReceipt = await transactionResponse.wait(1)
            // gas cost
            const {gasUsed,effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice) 

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

            // assert
            assert.equal(endingFundMeBalance,0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
        })

        it('cheaperWithdraw from multiple funders',async()=>{
            // arrange
            const accounts = await ethers.getSigners()
            for(let i = 0; i < 6; i++){
                const fundMeConnectedContract = await fundMe.connect(accounts[i])
                await fundMeConnectedContract.fund({value:sendValue})
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            // act

            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            // gas cost
            const {gasUsed,effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice) 

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

            // assert
            assert.equal(endingFundMeBalance,0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())

            await expect(fundMe.getFunder(0)).to.be.reverted

            for(let i = 0; i < 6; i++) {
                assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address),0)
            }
        })
        it('only allows the owner to cheaperWithdraw',async()=>{
            // arrange
            const accounts = await ethers.getSigners()
            const hackerConnectedContract = await fundMe.connect(accounts[1])
            // act and assert
            await expect(hackerConnectedContract.cheaperWithdraw()).to.be.reverted
        })
    })
})