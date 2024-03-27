export interface ScriptInformation {
  name: string
  memoryRequired: number
  path: string
}

const createScriptList = (ns: NS, scripts: string[]) => {
  return scripts.map((script) => {
    const memoryRequired = ns.getScriptRam(script, 'home')
    // Remove the leading filepath / and the .js extension,
    // and capitalize the first letter of each word, denoted by hypens in the file name
    // no regex
    const name = pathToTitle(script)
    return { name, memoryRequired, path: script }
  })
}

export const selfRegisterScript = (ns: NS): void => {
  const script = ns.getScriptName()
  const scriptPaths = ns.read('script-db.txt').split('\n')
  if (scriptPaths.includes(script)) {
    return
  }
  ns.write('script-db.txt', `${script}\n`, 'a')
  const updatedScriptPaths = ns.read('script-db.txt').split('\n')
  const newScriptList = []
  for (const script of updatedScriptPaths) {
    if (ns.fileExists(script)) {
      newScriptList.push(script)
    }
  }
  ns.write('script-db.txt', newScriptList.join('\n'), 'w')
}

export const getAllScripts = (ns: NS): ScriptInformation[] => {
  try {
    const scriptDb = ns
      .read('script-db.txt')
      .split('\n')
      .filter((l) => l.length > 0)
      .filter((script) => ns.fileExists(script))
    return createScriptList(ns, scriptDb)
  } catch (e) {
    if (e instanceof Error) {
      ns.tprint(`Error reading script-db.txt: ${e}`)
    }
    return []
  }
}

function pathToTitle(path: string) {
  // Remove the leading '/' and the '.js' extension
  let cleanPath = path.startsWith('/') ? path.slice(1) : path
  cleanPath = cleanPath.endsWith('.js') ? cleanPath.slice(0, -3) : cleanPath

  // Get the last part of the path
  const parts = cleanPath.split('/')
  const fileName = parts[parts.length - 1]

  // Split the filename by '-', capitalize each part, and join them with a space
  const title = fileName
    .split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return title
}
