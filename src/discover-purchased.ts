export async function main(ns: NS): Promise<void> {
  const purchasedServers = ns.getPurchasedServers()
  ns.write("purchased-hosts.txt", purchasedServers.join("\n"), "w")
}
