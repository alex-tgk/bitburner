/** @param {NS} ns **/
export async function main(ns): Promise<void> {
    const factionName =  ns.args[0]
    
    // Check if we're already working for the target faction
    if (!ns.workForFaction(factionName, "Hacking Contracts", true)) {
        ns.tprint(`Error: Could not start work for faction ${factionName}. Make sure you're a member of the faction and have stopped any other work.`);
        return;
    }
    
    ns.tprint(`Started sharing for ${factionName}.`);
    
    // Continuously share computing power to gain reputation
    while (true) {
        await ns.share();
        // Log the current reputation gain rate if needed
        // ns.print(`Current reputation with ${factionName}: ${ns.getFactionRep(factionName)}`);
    }
}
