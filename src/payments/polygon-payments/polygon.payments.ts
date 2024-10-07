import { ethers } from 'ethers';

const USDT_CONTRACT_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'; // Polygon USDT contract
// const testnet_usdt="0xE444179b1DA5883f546fDE866b2CF87b44348C05"
const USDT_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

export class PolygonUSDTService {
  private provider: ethers.Provider;
  private contract: ethers.Contract;

  constructor(rpcUrl: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, this.provider);
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
      const balanceInUSDT = ethers.formatUnits(balance, 6); // USDT has 6 decimal places
      console.log(balanceInUSDT)
      return parseFloat(balanceInUSDT) >= parseFloat(expectedAmount);
    } catch (error) {
      console.error('Error checking payment:', error);
      return false;
    }
  }

  async getGasPrice(): Promise<string> {  
    const feeData = await this.provider.getFeeData();
    return ethers.formatUnits(feeData.gasPrice ?? 0, 'gwei');
  }
}