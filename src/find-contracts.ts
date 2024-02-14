/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
    // Define a type for easier handling of servers and their contracts
    type ServerWithContracts = {
        name: string;
        contracts: string[];
    };

    // Function to recursively scan servers
    async function scanServers(server: string, visited: Set<string>): Promise<ServerWithContracts[]> {
        visited.add(server);
        const foundContracts: ServerWithContracts[] = [];
        const contracts = ns.ls(server, '.cct');

        if (contracts.length > 0) {
            foundContracts.push({ name: server, contracts: contracts });
        }

        for (const connectedServer of ns.scan(server)) {
            if (!visited.has(connectedServer)) {
                const results = await scanServers(connectedServer, visited);
                foundContracts.push(...results);
            }
        }

        return foundContracts;
    }

    // Start scanning from 'home'
    const visited = new Set<string>();
    const contractsFound = await scanServers('home', visited);

    // Output the results
    if (contractsFound.length === 0) {
        ns.tprint("No contracts found.");
    } else {
        contractsFound.forEach(server => {
            server.contracts.forEach(contract => {
                ns.tprint(`Contract found: ${contract} on server ${server.name}`);
            });
        });
    }
}
