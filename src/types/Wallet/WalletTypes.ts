export interface CreateWalletRequest {
  password: string;
  name?: string;
}

export interface CreateWalletResponse {
  success: true;
  data: {
    wallet_id: string;
    public_address: string;
    created_at: string;
  };
}

export interface WalletKeypair {
  publicAddress: string;
  privateKey: Uint8Array;
}

export interface EncryptedWalletData {
  encryptedPrivateKey: string;
  salt: string;
  passwordHash: string;
}

export interface StoredWallet {
  id: string;
  name: string;
  publicAddress: string;
  encryptedPrivateKey: string;
  salt: string;
  passwordHash: string;
  createdAt: Date;
}
