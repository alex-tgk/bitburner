
const portChannels = Object.freeze({
    commandQueue: 1,
    responseQueue: 2,
});

/**
 * Listens to a port for incoming commands, executes the corresponding action,
 * and sends back the result through another port.
 *
 * @param ns - The namespace object for the script.
 * @returns A promise that resolves when the main function completes.
 */
export async function main(ns: NS): Promise<void> {
    const commandOptions = {
        hack: ns.hack,
        grow: ns.grow,
        weaken: ns.weaken,
    };
    while (true) {
        await ns.sleep(2500);
        const message = ns.readPort(portChannels.commandQueue);
        if (message === "NULL PORT DATA") {
            continue;
        }

        const { action, target } = JSON.parse(message as string);
        if (!commandOptions[action as keyof typeof commandOptions]) {
            ns.print("Invalid action: " + action);
        }
        try {
            const commandFn = commandOptions[action as keyof typeof commandOptions];
            const result = await commandFn(target);
            ns.writePort(
                portChannels.responseQueue,
                JSON.stringify({ action, target, result }),
            );
        } catch {
            ns.writePort(
                portChannels.responseQueue,
                JSON.stringify({ action, target, result: `Failed to ${action} on ${target}` }),
            );
        }
    }
}
