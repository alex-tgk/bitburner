const portChannels = Object.freeze({
    commandQueue: 1,
    responseQueue: 2,
});

type PortCommand = 'hack' | 'grow' | 'weaken';

export async function main(ns: NS): Promise<void> {
    while (true) {
        const hosts = ns.read('hosts.txt').split('\n').filter(o => o !== '').filter(Boolean);
        const purchasedServers = ns.read('purchased-hosts.txt').split('\n').filter(o => o !== '').filter(Boolean);
        const availableServers = hosts.filter(o => !purchasedServers.includes(o));

        const serverMetrics = [] as Array<{ host: string; score: number }>
        for (const server of availableServers) {
            const serverScore = getServerMetrics(ns, server);
            serverMetrics.push({ host: server, score: serverScore })
        }

        const sorted = [...serverMetrics].sort((a, b) => b.score - a.score).filter(({ score }) => score > 0)

        for (const server of sorted) {
            ns.writePort(portChannels.commandQueue, JSON.stringify({ action: 'hack', target: server.host }));
        }
        await ns.sleep(5000)
    }
}

function getPreferredAction(ns: NS, server: string): PortCommand {
    const serverMoneyThreshold = ns.getServerMaxMoney(server) * .75;
    const serverMinSecurity = ns.getServerSecurityLevel(server);
    if (ns.getServerSecurityLevel(server) > serverMinSecurity) {
        return 'weaken';
    }
    if (ns.getServerMoneyAvailable(server) > serverMoneyThreshold) {
        return 'grow'
    }
    return 'hack';
}

function getServerMetrics(ns: NS, server: string) {
    const serverMoneyPerThread = ns.hackAnalyze(server);
    const serverHackChance = ns.hackAnalyzeChance(server);
    const serverMoneyMax = ns.getServerMaxMoney(server);
    const serverGrowth = ns.getServerGrowth(server);
    const serverScore = serverMoneyPerThread * serverMoneyMax * serverGrowth * serverHackChance;
    return serverScore;
}

