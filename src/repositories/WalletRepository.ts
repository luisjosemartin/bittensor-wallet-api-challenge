import { db } from "#/providers/Database/PrismaClient";
import { StoredWallet } from "#/types/Wallet/WalletTypes";

export interface CreateWalletData {
  name: string;
  publicAddress: string;
  encryptedPrivateKey: string;
  salt: string;
  passwordHash: string;
}

export class WalletRepository {
  /**
   * Create a new wallet in the database
   */
  public async create(data: CreateWalletData): Promise<StoredWallet> {
    const wallet = await db.wallet.create({
      data: {
        name: data.name,
        publicAddress: data.publicAddress,
        encryptedPrivateKey: data.encryptedPrivateKey,
        salt: data.salt,
        passwordHash: data.passwordHash
      }
    });

    return wallet;
  }

  /**
   * Find wallet by ID
   */
  public async findById(id: string): Promise<StoredWallet | null> { // TODO: Maybe not used
    return db.wallet.findUnique({
      where: { id }
    });
  }

  /**
   * Find wallet by public address
   */
  public async findByPublicAddress(publicAddress: string): Promise<StoredWallet | null> {
    return db.wallet.findUnique({
      where: { publicAddress }
    });
  }
}
