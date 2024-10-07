import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';

const USDT_MINT_ADDRESS = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'; // Solana USDT mint address

export class SolanaUSDTService {
  private connection: Connection;

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  generateAddress(): { address: string; privateKey: string } {
    const keypair = Keypair.generate();
    return {
      address: keypair.publicKey.toBase58(),
      privateKey: Buffer.from(keypair.secretKey).toString('hex'),
    };
  }

  async checkPayment(address: string, expectedAmount: string): Promise<number | boolean> {
    try {
      const publicKey = new PublicKey(address);
      const mintPublicKey = new PublicKey(USDT_MINT_ADDRESS);

      const associatedAddress = await getAssociatedTokenAddress(
        mintPublicKey,
        publicKey
      );
      console.log(associatedAddress.toString());

      try {
        const account = await getAccount(this.connection, associatedAddress);
        const balance = Number(account.amount) / 1e6; // USDT has 6 decimal places
        return balance >= parseFloat(expectedAmount);
      } catch (accountError:any) {
        if (accountError.name === 'TokenAccountNotFoundError') {
          return 0; // Token not found
        }
        throw accountError; // Re-throw if it's a different error
      }
    } catch (error) {
      console.error('Error checking payment:', error);
      return false;
    }
  }

  async getRecentBlockhash(): Promise<string> {
    const { blockhash } = await this.connection.getLatestBlockhash();
    return blockhash;
  }
}