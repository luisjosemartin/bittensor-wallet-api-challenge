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

  /**
   * GET /wallets/:id/balance
   */
  public getWalletBalance = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const balanceResponse = await this.walletService.getWalletBalance(id);
      await auditLogger.logBalanceQuery(req, true, id);

      res.status(200).json(balanceResponse);
    } catch (error) {
      await auditLogger.logBalanceQuery(req, false, id, error instanceof Error ? error.message : 'Unknown error');

      throw error;
    }
  };
}
