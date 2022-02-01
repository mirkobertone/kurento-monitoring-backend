import KurentoClient from "kurento-client";


class KurentoController {

	public async connect(url = "ws://0.0.0.0:8888/kurento") {
    try {
      console.log("Trying to connect to KMS", url);
      const client = await KurentoClient(url, { failAfter: 1 });
      console.log("Connected to KMS", url);
      return client;
    } catch (error) {
      console.log("Can't connect to KMS", error);
      throw error;
    }
  }

  public async getServerManager(kurentoConnection: KurentoClient.ClientInstance) {
    return await kurentoConnection.getServerManager();
  }
};

export default new KurentoController();


