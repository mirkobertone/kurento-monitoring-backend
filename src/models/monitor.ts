import { EventEmitter } from "events";
import KurentoClient from "kurento-client";
import _ from "lodash";
import hasher from 'node-object-hash';
import { Socket } from "socket.io";
import KurentoService from "../services/kurento.service";

enum State {
  Running,
  Stopped
}

export class Monitor {

  private url: string;
  private kurentoManager: KurentoClient.ServerManager;
  private clients: Socket[] ;
  private state: State;
  private prevHash: string;

  constructor(url: string) {
    this.clients = [];
    this.url = url;
    this.state = State.Running;
    this.prevHash = "";
  }

  async init(url: string) {
    try {
      const connection = await KurentoService.connect(url);
      this.kurentoManager = await connection.getServerManager();
      this.url = url;
    } catch (error) {
      console.log("[ERROR_MONITORING_INIT]", error);
      throw error;
    }
  }

  addClient(client: Socket) {
    this.clients.push(client)
    this.prevHash = "";
  }

  removeClient(client: Socket) {
    _.remove(this.clients, c => c.id === client.id)
  }

  broadcast(signal: string, data: object) {
    _.forEach(this.clients, c => {
      console.log("emitting", signal + data, "to", c.id);
      c.emit(signal, data);
    })
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

      this.emitMonitoringData({ 
        serverInfo: {
          url: this.url,
          serverInfo
        }, 
        pipelines: {
          url: this.url,
          pipelines: mediaPipelinesInfo
        }
      });
      
    } catch (error) {
      this.broadcast("app:error", error.message)
      // this.emit("monitor:error", error)
    }
  }

  emitMonitoringData(args: any) {
    if(this.hash(args)) {
      _.forEach(args, (value, key) => {
        
        // this.emit(`${key}`, value);
        this.broadcast(`${key}`, value);
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
  
  getClients(): number {
    return this.clients.length;
  }
}
