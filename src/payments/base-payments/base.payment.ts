import { ethers } from 'ethers';

const USDC_CONTRACT_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base USDC contract
const USDC_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

export class BaseUSDCService {
  private provider: ethers.Provider;
  private contract: ethers.Contract;

  constructor(rpcUrl: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contract = new ethers.Contract(USDC_CONTRACT_ADDRESS, USDC_ABI, this.provider);
  }

  generateAddress(): { address: string; privateKey: string } {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  }

  async checkPayment(address: string, expectedAmount: string): Promise<boolean> {
    try {
      const balance = await this.contract.balanceOf(address);
      const balanceInUSDC = ethers.formatUnits(balance, 6); // USDC has 6 decimal places
      console.log(`Balance: ${balanceInUSDC} USDC`);
      return parseFloat(balanceInUSDC) >= parseFloat(expectedAmount);
    } catch (error) {
      console.error('Error checking payment:', error);
      return false;
    }
  }

  async getGasPrice(): Promise<string> {
    const feeData = await this.provider.getFeeData();
    return ethers.formatUnits(feeData.gasPrice ?? 0, 'gwei');
  }

  async estimateGas(from: string, to: string, amount: string): Promise<string> {
    const amountWei = ethers.parseUnits(amount, 6);
    const gasEstimate = await this.contract.transfer.estimateGas(to, amountWei, { from });
    return gasEstimate.toString();
  }
}
