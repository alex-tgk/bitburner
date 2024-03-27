import { Ports } from '/scripts/constants/Ports'
import { selfRegisterScript } from '/scripts/script-tracker/script-tracker'

let ns: NS

export async function main(_ns: NS) {
  ns = _ns
  selfRegisterScript(_ns)
  while (true) {
    await ns.sleep(10000)
  }
}

const getKeystore = () => {
  const keystore = ns.peek(Ports.keys)
  const serialized =
    typeof keystore === 'string'
      ? JSON.parse(keystore)
      : JSON.parse(keystore.toString())
  return serialized
}

export const getKey = (key: string) => {
  const keystore = getKeystore()
  return keystore[key]
}

export const setKey = <T extends { toString(): string }>(
  key: string,
  value: T,
): void => {
  const keystore = getKeystore()
  ns.clearPort(Ports.keys)
  ns.writePort(Ports.keys, JSON.stringify({ ...keystore, [key]: value }))
}

export const deleteKey = (key: string): void => {
  const keystore = getKeystore()
  delete keystore[key]
  ns.clearPort(Ports.keys)
  ns.writePort(Ports.keys, JSON.stringify(keystore))
}
