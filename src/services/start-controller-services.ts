export async function main(ns : NS) : Promise<void> {
    ns.run('scan-service.js', 1)
    ns.run('port-response-controller-service.js', 1)
    const threads = calculateThreads(ns, 'home', 'port-controller-service.js');
    ns.tprintf('Starting port-controller-service with %d threads', threads);
    ns.run('port-controller-service.js', threads);
}

function calculateThreads(ns: NS, server: string, scriptName: string): number {
    const serverRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
    const scriptRam = ns.getScriptRam(scriptName);
    return Math.floor(serverRam / scriptRam);
}