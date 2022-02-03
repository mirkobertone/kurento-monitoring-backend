import { EventEmitter } from "events";
import KurentoClient from "kurento-client";
import _ from "lodash";
import hasher from 'node-object-hash';

enum State {
  Running,
  Stopped
}

export class Monitor extends EventEmitter {

  private kurentoManager: KurentoClient.ServerManager;
  private state: State;
  private prevHash: string;

  constructor(client: KurentoClient.ServerManager) {
    super();
    this.state = State.Running;
    this.kurentoManager = client;
    this.prevHash = "";
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
    try {
      await this.getMonitoringData();
      setTimeout(() => this.loop(), Number(process.env.MONITOR_TIMEOUT) || 2000); 
    } catch (error) {
      this.loop();
    } finally {
      
    }
  }


  async getMonitoringData() {
    try {
      const pipelines = await this.kurentoManager.getPipelines();
      const mediaPipelinesInfo = await this.getMediaElementsInfo(pipelines);
      const serverInfo = await this.getServerInfo();    
      this.emitMonitoringData({serverInfo, pipelines: mediaPipelinesInfo});
      
    } catch (error) {
      this.emit("monitor:error", error)
    }
  }

  emitMonitoringData(args: any) {
    if(this.hash(args)) {
      _.forEach(args, (value, key) => {
        console.log("emitting", value, key);
        
        this.emit(`${key}`, value);
      })
    }
  }

  hash(hashable: any) {
    const hashSortCoerce = hasher();
    const hash = hashSortCoerce.hash(hashable)
    if(hash !== this.prevHash) {
      this.prevHash = hash;
      return true;
    }
    return false;
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
