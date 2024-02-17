export async function main(ns: NS): Promise<void> {
    const [target] = ns.args as string[];
    await ns.grow(target)
}