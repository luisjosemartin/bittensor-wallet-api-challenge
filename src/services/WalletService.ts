import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { randomBytes } from 'crypto';
import { 
  WalletKeypair,
  EncryptedWalletData,
  CreateWalletRequest,
  CreateWalletResponse
} from '#/types/Wallet/WalletTypes';
import { WalletRepository } from '#/repositories/WalletRepository';
import { CryptoService } from '#/services/CryptoService';

export class WalletService {
  private readonly walletRepository: WalletRepository;
  private readonly cryptoService: CryptoService;

  constructor(walletRepository = new WalletRepository(), cryptoService = new CryptoService()) {
    this.walletRepository = walletRepository;
    this.cryptoService = cryptoService;
  }

  /**
   * Generate a new Bittensor keypair in SS58 format
   */
  public async generateKeypair(): Promise<WalletKeypair> {
    // Not sure this is the correct approach TBH
    await cryptoWaitReady();
    const keyring = new Keyring({ type: 'sr25519', ss58Format: 42 });
    const seed = randomBytes(32);
    const pair = keyring.addFromSeed(seed);

    return {
      publicAddress: pair.address,
      privateKey: seed // Use the original seed as the private key
    };
  }

  /**
   * Encrypt private key using password-based encryption
   */
  private async encryptPrivateKey(privateKey: Uint8Array, password: string): Promise<EncryptedWalletData> {
    const encrypted = await this.cryptoService.encryptData(privateKey, password);
    
    return {
      encryptedPrivateKey: encrypted.encryptedData,
      salt: encrypted.salt,
      passwordHash: encrypted.passwordHash
    };
  }

  /**
   * Create a new wallet
   */
  public async createWallet(request: CreateWalletRequest): Promise<CreateWalletResponse> {
    const keypair = await this.generateKeypair();
    const encryptedData = await this.encryptPrivateKey(keypair.privateKey, request.password);

    const wallet = await this.walletRepository.create({
      name: request.name || 'New wallet',
      publicAddress: keypair.publicAddress,
      encryptedPrivateKey: encryptedData.encryptedPrivateKey,
      salt: encryptedData.salt,
      passwordHash: encryptedData.passwordHash
    });
    
    return {
      success: true,
      data: {
        wallet_id: wallet.id,
        public_address: wallet.publicAddress,
        created_at: wallet.createdAt.toISOString()
      }
    };
  }
}
