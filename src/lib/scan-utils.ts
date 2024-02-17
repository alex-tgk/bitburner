/**
 * Recursively gets all servers accessible from a starting point (home), including nested servers.
 * 
 * @param ns - The namespace object.
 * @param start - The starting point to scan from. Defaults to 'home'.
 * @param visited - A set of visited servers to avoid infinite recursion. Defaults to an empty set.
 * @returns An array of all visited servers.
 */
export function getAllServers(ns: NS, start = 'home', visited: Set<string> = new Set()): string[] {
    visited.add(start);
    const neighbors = ns.scan(start).filter(server => !visited.has(server));
    for (const neighbor of neighbors) {
        getAllServers(ns, neighbor, visited);
    }
    return Array.from(visited);
}