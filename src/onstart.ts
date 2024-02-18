
/**
 * Executes a series of scripts on startup.
 * @param ns - The namespace object.
 * @returns A promise that resolves when all scripts have been executed.
 */
export async function main(ns: NS): Promise<void> {
    // Start script to listen for home directory file changes
    ns.run('watcher.js', 1);
    // Start host scanning script
    ns.run('services/scan-service.js', 1)
    // Start script to listen for responses on port 2
    ns.run('services/port-response-controller-service.js', 1);
    // Start listen script on other machines
    ns.run('services/start-listen-service.js', 1)
    await ns.sleep(500)

    // Start script that scans through hosts and issues hacking commands to port 1
    const controllerThreads = calculateThreads(ns, 'home', 'services/port-controller-service.js');
    ns.run('services/port-controller-service.js', Math.floor(controllerThreads / 2));

    // Start script that listens for incoming commands on port 1 and executes them.
    const listenerThreads = calculateThreads(ns, 'home', 'services/port-listen-service.js');
    ns.run('services/port-listen-service.js', Math.floor(listenerThreads / 2));
}


function calculateThreads(ns: NS, server: string, scriptName: string): number {
    if (!ns.fileExists(scriptName)) {
        ns.tprintf('Script %s does not exist', scriptName)
        ns.exit()
    }
    const serverRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
    const scriptRam = ns.getScriptRam(scriptName);
    return Math.floor(serverRam / scriptRam);
}