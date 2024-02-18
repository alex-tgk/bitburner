/**
 * The % of players money (expressed as a decimal) 
 * to spend on hacknet servers.
 */
const moneyRatio = 0.2 as const

export async function main(ns: NS): Promise<void> {
    const { hacknet: hn } = ns
    const serverCount = hn.numNodes();
    while (true) {
        try {
            await upgradeServers(serverCount, ns, hn);
        } catch {
            continue;
        } finally {
            await ns.sleep(2500);
        }
    }
}

async function upgradeServers(serverCount: number, ns: NS, hn: typeof ns.hacknet) {
    for (const server of [...Array(serverCount).keys()]) {
        while (true) {
            const availableToSpend = moneyRatio * ns.getServerMoneyAvailable('home');

            const upgradeRamCost = hn.getRamUpgradeCost(server);
            const upgradeLevelCost = hn.getLevelUpgradeCost(server);
            const upgradeCoreCost = hn.getCoreUpgradeCost(server);

            const canUpgradeRam = upgradeRamCost < availableToSpend;
            const canUpgradeLevel = upgradeLevelCost < availableToSpend;
            const canUpgradeCore = upgradeCoreCost < availableToSpend;

            if (canUpgradeRam) {
                ns.print(`INFO: Upgrading ram on hacknet server #${server}`)
                hn.upgradeRam(server);
                continue;
            }
            if (canUpgradeLevel) {
                ns.print(`INFO: Upgrading level on hacknet server #${server}`)
                hn.upgradeLevel(server);
                continue;
            }
            if (canUpgradeCore) {
                ns.print(`INFO: Upgrading core on hacknet server #${server}`)
                hn.upgradeCore(server);
                continue;
            }
            ns.print(`INFO: Out of money to upgrade hacknet server #${server}`)
            break;
        }

        await ns.sleep(2500);
    }
}
