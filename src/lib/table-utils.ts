export function createTable(headers: string[], rows: string[][]): string {
  const headerRow = headers.join(' | ')
  const headerSeparator = headers.map(() => '---').join(' | ')
  const bodyRows = rows.map((row) => row.join(' | '))
  return [headerRow, headerSeparator, ...bodyRows].join('\n')
}
