export const PortChannels = {
  DispatchChannel: 1,
  DispatchResponseChannel: 2,
} as const
export type PortChannel = (typeof PortChannels)[keyof typeof PortChannels]

export const DispatchActions = {
  hack: 'hack',
  weaken: 'weaken',
  grow: 'grow',
  skip: 'skip',
} as const
export type DispatchAction =
  (typeof DispatchActions)[keyof typeof DispatchActions]

export type DispatchPayload =
  | {
      action: 'hack'
      data: {
        target: string
        threads: number
        source?: string
        delay?: number
      }
    }
  | {
      action: 'weaken'
      data: {
        target: string
        threads: number
        source?: string
        delay?: number
      }
    }
  | {
      action: 'grow'
      data: {
        target: string
        threads: number
        source?: string
        delay?: number
      }
    }
  | {
      action: 'skip'
      data: {
        target: string
      }
    }

export class DispatchController {
  private ns: NS
  private dispatchPort: number
  constructor(ns: NS) {
    this.ns = ns
    this.dispatchPort = PortChannels.DispatchChannel
  }
  public dispatch(payload: DispatchPayload) {
    try {
      const { action, data } = payload
      this.sendToPort(this.dispatchPort, action, data)
      this.logDispatchCommand(payload)
    } catch {
      this.ns.print(`Failed to dispatch command: ${JSON.stringify(payload)}`)
    }
  }
  private sendToPort<T>(
    portNumber: number,
    action: DispatchAction,
    data: T,
  ): ReturnType<NS['writePort']> {
    return this.ns.writePort(
      portNumber,
      JSON.stringify({
        action,
        data,
      }),
    )
  }
  private logDispatchCommand(payload: DispatchPayload) {
    this.ns.write('logs/dispatch-command-log.txt', JSON.stringify(payload), 'a')
  }
}
