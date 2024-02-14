/** @param {NS} ns **/
export async function main(ns: NS) {
    const scriptName = ns.args[0] as string;
    const scriptArgs = ns.args.slice(1);

    // Function to recursively scan and run the script on all servers
    async function deployScript(server: string, visited: Set<string>) {
        // Skip if already visited
        if (visited.has(server)) return;
        visited.add(server);

        // Try to gain root access if we don't already have it
        if (!ns.hasRootAccess(server)) {
            gainRootAccess(server);
        }

        // Copy the script to the server if it's not already there
        if (!ns.fileExists(scriptName, server)) {
            await ns.scp(scriptName, "home", server);
        }

        // Calculate the maximum threads the server can run for this script
        const maxThreads = Math.floor(ns.getServerMaxRam(server) / ns.getScriptRam(scriptName, server));
        if (maxThreads > 0) {
            ns.exec(scriptName, server, maxThreads, ...scriptArgs);
            ns.tprint(`Executing ${scriptName} on ${server} with ${maxThreads} threads.`);
        }

        // Recursively deploy to connected servers
        for (const neighbor of ns.scan(server)) {
            await deployScript(neighbor, visited);
        }
    }

    // Function to gain root access
    function gainRootAccess(server: string) {
        // Example for gaining root access, assuming you have the required programs
        // Adjust according to your game progress and available programs
        ns.brutessh(server);
        ns.ftpcrack(server);
        ns.relaysmtp(server);
        ns.httpworm(server);
        ns.sqlinject(server);
        ns.nuke(server);
    }

    // Start the deployment from 'home' server
    await deployScript('home', new Set<string>());
}
