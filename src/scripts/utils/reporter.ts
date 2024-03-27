import { getDb } from '/scripts/storage/db-store'

export const createDbReport = async (ns: NS) => {
  const db = await getDb(ns)

  const headers = ['Server', 'Money', 'Max Money', 'Security']
  const rows = db.hosts.map((host) => [
    host.name,
    host.moneyAvailable.toString(),
    host.maxMoney.toString(),
    host.securityLevel.toString(),
  ])
  return createTable([headers, ...rows])
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createTable = (data: any[][]): string => {
  // Find the maximum length of each column
  const columnLengths: number[] = []
  data.forEach((row) => {
    row.forEach((cell, columnIndex) => {
      if (
        !columnLengths[columnIndex] ||
        cell.length > columnLengths[columnIndex]
      ) {
        columnLengths[columnIndex] = cell.length
      }
    })
  })

  // Generate the horizontal line
  const horizontalLine =
    '+' + columnLengths.map((length) => '-'.repeat(length + 2)).join('+') + '+'

  // Generate the rows
  let table = horizontalLine + '\n'
  data.forEach((row) => {
    table += '|'
    row.forEach((cell, columnIndex) => {
      table += ` ${cell.toString()}${' '.repeat(columnLengths[columnIndex] - cell.length)} |`
    })
    table += '\n' + horizontalLine + '\n'
  })

  return table
}
