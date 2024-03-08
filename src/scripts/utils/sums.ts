import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
  const numberSet = [2, 3, 4, 5, 7, 10, 11, 12]
  const targetNumber = 25

  const results: number[][] = []

  const sums = (ns: NS, sumArray: number[] = []): void => {
    const sum = sumArray.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    )
    if (targetNumber < sum) {
      return
    }
    if (targetNumber === sum) {
      results.push(sumArray)
      return
    }
    for (const thisNumber of numberSet) {
      if (thisNumber >= Math.max(...sumArray)) {
        sums(ns, [...sumArray, thisNumber])
      }
    }
  }

  sums(ns)
  ns.tprint(results)
  const newResults = findSums(targetNumber, numberSet)
  ns.tprint(newResults)
}
/* 
const findSums = (target: number, inputs: number[]) => {
  const fn = (
    addends: number[] = [],
    outputs: number[][] = [],
    index = -1,
  ): number[][] => {
    const sum = addends.reduce((a, b) => a + b, 0)
    if (target < sum) {
      return fn(addends, outputs, index + 1)
    }
    if (sum === target) {
      return fn(addends, [...outputs, addends], index + 1)
    }
    for (let i = index; i < inputs.length; i++) {
      const value = inputs[i]
      if (value >= Math.max(...addends)) {
        return fn([...addends, value], outputs, i + 1)
      }
    }
    if (index === inputs.length - 1) {
      return outputs
    }
    return fn(addends, outputs, index + 1)
  }
  return fn()
}
 */

const findSums = (target: number, inputs: number[]): number[][] => {
  const fn = (
    addends: number[] = [],
    outputs: number[][] = [],
    index = 0,
  ): number[][] => {
    if (index === inputs.length) {
      return outputs
    }
    const sum = addends.reduce((a, b) => a + b, 0)
    if (sum > target) {
      return fn([], outputs, index + 1)
    }
    if (sum === target) {
      return fn([], [...outputs, addends], index + 1)
    }
    for (const value of inputs) {
      if (value >= Math.max(...addends)) {
        return fn([...addends, value], outputs, index)
      }
    }
    return fn([], outputs, index + 1)
  }
  return fn()
}
