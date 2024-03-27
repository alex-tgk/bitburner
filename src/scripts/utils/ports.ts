export enum Port {
  db = 18,
}

export const writePort = (
  ns: NS,
  port: Port,
  data: string | object,
  clear = false,
) => {
  if (port < 1 || port > 20) {
    throw new Error('Port must be between 1 and 20')
  }
  if (clear) {
    ns.clearPort(port)
  }
  ns.writePort(port, JSON.stringify(data, null, 0))
}

export const getPortData = <T>(ns: NS, port: Port, peek = true): void | T => {
  if (port < 1 || port > 20) {
    throw new Error('Port must be between 1 and 20')
  }
  const data = peek ? ns.peek(port) : ns.readPort(port)
  if (data === 'NULL PORT DATA') {
    return
  }
  const results = JSON.parse(data.toString())
  if (typeof results === 'object') {
    return results as T
  }
  if (typeof results === 'string') {
    return JSON.parse(results) as T
  }
}
