import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { randomBytes } from 'crypto';
import { 
  WalletKeypair,
  EncryptedWalletData,
  CreateWalletRequest,
  CreateWalletResponse,
  WalletBalanceResponse
} from '#/types/Wallet/WalletTypes';
import { WalletRepository } from '#/repositories/WalletRepository';
import { CryptoService } from '#/services/CryptoService';
import { BittensorBalanceService } from '#/services/BittensorBalanceService';
import { NotFoundError } from '#/errors/NotFoundError';
import { EntityConstraintError } from '#/errors/EntityConstraintError';
import { ServiceUnavailableError } from '#/errors/ServiceUnavailableError';

export class WalletService {
  private readonly walletRepository: WalletRepository;
  private readonly cryptoService: CryptoService;
  private readonly bitensorBalanceService: BittensorBalanceService;

  constructor(
    walletRepository = new WalletRepository(), 
    cryptoService = new CryptoService(),
    bitensorBalanceService = new BittensorBalanceService()
  ) {
    this.walletRepository = walletRepository;
    this.cryptoService = cryptoService;
    this.bitensorBalanceService = bitensorBalanceService;
  }

  /**
   * Generate a new Bittensor keypair in SS58 format
   */
  public async generateKeypair(): Promise<WalletKeypair> {
    // Not sure this is the correct approach
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

  /**
   * Get wallet balance from Bittensor network
   */
  public async getWalletBalance(walletId: string): Promise<WalletBalanceResponse> {
    // Find wallet in database
    const wallet = await this.walletRepository.findById(walletId);
    if (!wallet) throw new NotFoundError(`Wallet with ID ${walletId}`);
    
    if (!this.bitensorBalanceService.validateAddress(wallet.publicAddress))
      throw new EntityConstraintError('Address', `Invalid format: ${wallet.publicAddress}`);

    const isHealthy = await this.bitensorBalanceService.isNetworkHealthy();
    if (!isHealthy) 
      throw new ServiceUnavailableError('Bittensor network is currently unavailable');

    const balanceInfo = await this.bitensorBalanceService.fetchBalance(wallet.publicAddress);
    
    return {
      success: true,
      data: {
        wallet_id: walletId,
        balance: balanceInfo.free,
        currency: balanceInfo.symbol,
        last_updated: new Date().toISOString()
      }
    };
  }
}
