import { Response } from "#/types/Response";
import { Request } from "#/types/Request";
import { WalletService } from "#/services/WalletService";
import { CreateWalletRequest } from "#/types/Wallet/WalletTypes";

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

    const walletResponse = await this.walletService.createWallet({
      password,
      name
    });

    res.status(201).json(walletResponse);
  };
}
