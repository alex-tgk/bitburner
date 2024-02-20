import { DispatchAction, PortChannels } from '/controller/dispatch-controller'

export interface ResponsePayload {
  target: string
  action: DispatchAction
  response: string
  data?: Object | string
}

export class ResponseController {
  private ns: NS
  private responsePort: number
  constructor(ns: NS, responsePort: number) {
    this.ns = ns
    this.responsePort = responsePort
  }
  public startListenerService() {
    while (true) {
      const message = this.ns.readPort(this.responsePort)
      if (message === 'NULL PORT DATA') {
        continue
      }
      this.logResponse(message)
    }
  }
  public static writeResponseMessage<T>(ns: NS, message: T) {
    return ns.writePort(
      PortChannels.DispatchResponseChannel,
      JSON.stringify(message),
    )
  }
  private logResponse<T>(response: T) {
    this.ns.print(`${JSON.stringify(response)}`)
    this.ns.write('logs/response-log.txt', `${JSON.stringify(response)}\n`, 'a')
  }
}
