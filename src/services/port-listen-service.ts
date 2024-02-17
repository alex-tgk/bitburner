const portChannels = Object.freeze({
    commandQueue: 1,
    responseQueue: 2,
});

export async function main(ns: NS): Promise<void> {
    const commandOptions = {
        hack: ns.hack,
        grow: ns.grow,
        weaken: ns.weaken,
    };
    while (true) {
        const message = ns.readPort(portChannels.commandQueue);
        if (message === "NULL PORT DATA") {
            continue;
        }

        const { action, target } = JSON.parse(message as string);
        if (!commandOptions[action as keyof typeof commandOptions]) {
            ns.print("Invalid action: " + action);
        }
        const commandFn = commandOptions[action as keyof typeof commandOptions];
        const result = await commandFn(target);
        ns.writePort(
            portChannels.responseQueue,
            JSON.stringify({ action, target, result }),
        );
        await ns.sleep(2500);
    }
}
