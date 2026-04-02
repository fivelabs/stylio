import { Model } from "../../../core/Model.js";

export class GoogleIntegration extends Model {
  static table = "google_integrations";

  static findByTenant(tenantId) {
    return this.findOne({ tenant_id: tenantId });
  }

  static findByChannelId(channelId) {
    return this.findOne({ watch_channel_id: channelId });
  }
}
