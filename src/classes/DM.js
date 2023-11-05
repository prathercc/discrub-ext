import Channel from "./Channel";

class DM extends Channel {
  constructor(json = {}) {
    super(json);
    const { recipients, owner_id, icon } = json;
    this.recipients = recipients;
    this.owner_id = owner_id;
    this.icon = icon;
  }

  isDm() {
    return true;
  }
}
export default DM;
