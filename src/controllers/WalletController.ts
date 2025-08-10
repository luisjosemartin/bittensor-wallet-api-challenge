import { Response } from "#/types/Response";
import { Request } from "#/types/Request";
import { WalletService } from "#/services/WalletService";
import { CreateWalletRequest } from "#/types/Wallet/WalletTypes";
import { auditLogger } from "#/providers/Logger/AuditLogger";

export class WalletController {
  private readonly walletService: WalletService;

  constructor(walletService = new WalletService()) {
    this.walletService = walletService;
  }

  /**
   * POST /wallets
   */
  public createWallet = async (req: Request, res: Response) => {
    const { password, name } = req.body as CreateWalletRequest;

    try {
      const walletResponse = await this.walletService.createWallet({
        password,
        name
      });

      await auditLogger.logWalletCreation(req, true, walletResponse.data.wallet_id);

      res.status(201).json(walletResponse);
    } catch (error) {
      await auditLogger.logWalletCreation(req, false, undefined, error instanceof Error ? error.message : 'Unknown error');

      throw error;
    }
  };
}
