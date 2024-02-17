
/**
 * Executes a series of scripts on startup.
 * @param ns - The namespace object.
 * @returns A promise that resolves when all scripts have been executed.
 */
export async function main(ns: NS): Promise<void> {
    ns.run('watcher.js', 1);
    ns.run('services/port-listen-service.js', 1)
    ns.run('services/start-controller-services.js', 1);
}