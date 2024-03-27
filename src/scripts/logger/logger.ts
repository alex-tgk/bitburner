export type LogLevel = 'MESSAGE' | 'INFO' | 'ERROR' | 'SUCCESS' | 'WARN'

/**
 * Logs a message with a specified log level.
 *
 * @param ns - The namespace object.
 * @param message - The message to be logged. It can be a string or an object.
 * @param type - The log level. Defaults to 'INFO'.
 * @param broadcast - Specifies whether to broadcast the log message. Defaults to true.
 */
export const log = (
  ns: NS,
  message: string | object,
  type: LogLevel = 'INFO',
  broadcast = false,
) => {
  const timestamp = new Date().toLocaleTimeString()
  const logCommand = broadcast ? ns.tprint : ns.print

  const output = [] as string[]
  if (typeof message === 'string') {
    output.push(formatLogMessage(timestamp, type, message))
  } else if (typeof message === 'object') {
    const serialized = JSON.stringify(message, null, 2)
    output.push(
      ...[
        formatLogMessage(timestamp, type, `Serializing object:`),
        ...serialized
          .split('\n')
          .map((line) => formatLogMessage(timestamp, type, line)),
      ],
    )
  }

  for (const line of output) {
    logCommand(line)
  }

  /* try {
    ns.write('log.txt', output.join(''), 'a')
  } catch (e) {
    ns.tprint(`Error writing to log: ${e}`)
  } */
}

const formatLogMessage = (timestamp: string, type: string, message: string) =>
  `${type}:\t(${timestamp})\t${message}\n`
