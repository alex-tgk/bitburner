/**
 * Calculates the optimal number of threads based on server RAM and script RAM usage.
 * 
 * @param ns - The namespace object.
 * @param server - The name of the server.
 * @param scriptName - The name of the script.
 * @returns The optimal number of threads.
 */
export function calculateThreads(ns: NS, server: string, scriptName: string): number {
    const serverRam = ns.getServerMaxRam(server);
    const scriptRam = ns.getScriptRam(scriptName);
    return Math.floor(serverRam / scriptRam);
}