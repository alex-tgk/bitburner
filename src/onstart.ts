
/**
 * Executes a series of scripts on startup.
 * @param ns - The namespace object.
 * @returns A promise that resolves when all scripts have been executed.
 */
export async function main(ns: NS): Promise<void> {
    ns.exec('discover-hosts.js', 'home', 1);
    ns.exec('nuke-hosts.js','home', 1);
    ns.exec('hack-all-hosts.js', 'home', 1);
    ns.exec('watcher.js', 'home', 1);
}