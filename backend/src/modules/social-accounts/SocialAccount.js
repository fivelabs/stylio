import { Model } from "../../core/Model.js";

export class SocialAccount extends Model {
  static table = "social_accounts";

  static async findByProvider(provider, providerUid) {
    return this.findOne({ provider, provider_uid: providerUid });
  }
}
