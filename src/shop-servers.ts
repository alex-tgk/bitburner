/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
    const maxServers = ns.getPurchasedServerLimit();
    const moneyThreshold = ns.getServerMoneyAvailable("home") * 0.1; // Keep 10% of your money
    const ramOptions = [8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768]; // Possible RAM options for servers

    while (true) {
        const currentFunds = ns.getServerMoneyAvailable("home");
        const servers = ns.getPurchasedServers();

        if (servers.length < maxServers || canUpgrade(ns, servers, ramOptions, currentFunds - moneyThreshold)) {
            for (const ram of ramOptions.reverse()) {
                const cost = ns.getPurchasedServerCost(ram);
                if (currentFunds - cost > moneyThreshold) {
                    if (servers.length >= maxServers) {
                        replaceWeakestServer(ns, ram);
                    } else {
                        const hostname = ns.purchaseServer(`pserv-${ram}`, ram);
                        ns.tprint(`Purchased a new server: ${hostname} with ${ram}GB RAM for ${ns.nFormat(cost, '$0.000a')}`);
                    }
                    break; // Exit the loop after purchasing or replacing a server
                }
            }
        }

        await ns.sleep(60000); // Wait for a minute before checking again
    }
}

function canUpgrade(ns: NS, servers: string[], ramOptions: number[], budget: number): boolean {
    const weakestRam = Math.min(...servers.map(s => ns.getServerMaxRam(s)));
    const nextRamOption = ramOptions.find(ram => ram > weakestRam && ns.getPurchasedServerCost(ram) <= budget);
    return nextRamOption !== undefined;
}

function replaceWeakestServer(ns: NS, ram: number) {
    const servers = ns.getPurchasedServers();
    const weakestServer = servers.reduce((prev, curr) => ns.getServerMaxRam(prev) < ns.getServerMaxRam(curr) ? prev : curr);
    ns.killall(weakestServer);
    ns.deleteServer(weakestServer);
    const hostname = ns.purchaseServer(`pserv-${ram}`, ram);
    ns.tprint(`Replaced ${weakestServer} with a new server: ${hostname} with ${ram}GB RAM`);
}
