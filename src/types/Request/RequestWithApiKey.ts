import { Request } from "#/types/Request";
import { ApiKey } from "#/types/ApiKey/ApiKeyTypes";

export interface RequestWithApiKey extends Request {
  apiKey?: ApiKey;
}
