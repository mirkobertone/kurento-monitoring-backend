import { EventEmitter } from "events";

import KurentoClient from "kurento-client";

enum State {
  Running,
  Stopped
}

export class Monitor extends EventEmitter {

  private kurentoManager: KurentoClient.ServerManager;
  private state: State;

  constructor(client: KurentoClient.ServerManager) {
    super();
    this.state = State.Running;
    this.kurentoManager = client;
  }

  public async start() {
    this.loop();
  }

  stop() {
    this.state = State.Stopped;
  }

  private async loop() {
    if (this.state === State.Stopped) {
      return;
    }
    await this.getMonitoringData();
    setTimeout(() => this.loop(), Number(process.env.MONITOR_TIMEOUT) || 2000);
  }


  async getMonitoringData() {
    const pipelines = await this.kurentoManager.getPipelines();
    const mediaPipelinesInfo = await this.getMediaElementsInfo(pipelines);
    this.emit('pipelines', mediaPipelinesInfo);

    const serverInfo = await this.getServerInfo();    
    this.emit('serverInfo', serverInfo);
  }

  async getMediaElementsInfo(mediaElements: KurentoClient.MediaObject[]) {
    const result = [];
    for (let i = 0; i < mediaElements.length; i++) {
      const mediaElement = mediaElements[i];
      const name = await mediaElement.getName();
      const creationTime = await mediaElement.getCreationTime();
      const type = mediaElement.constructor.name;
      let childrens = await mediaElement.getChildren();
      if (childrens.length) {
        childrens = await this.getMediaElementsInfo(childrens);
      }
      result.push({
        name,
        childrens,
        type,
        creationTime,
        // leaked: time.isTimeBeforeNow(creationTime * 1000, LEAK_TIMEOUT),
        id: mediaElement.id
      });
    }
    return result;
  }

  async getServerInfo() {
    const info = await this.kurentoManager.getInfo();
    const usedMemory = await this.kurentoManager.getUsedMemory();
    return {
      usedMemory,
      version: info.version,
      type: info.type
    };
  }
}
