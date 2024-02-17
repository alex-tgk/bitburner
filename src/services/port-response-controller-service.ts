const portChannels = Object.freeze({
    commandQueue: 1,
    responseQueue: 2,
});

export async function main(ns: NS): Promise<void> {
    while (true) {
        try {
            await ns.sleep(2500);
            const message = ns.readPort(portChannels.responseQueue);
            if (message === "NULL PORT DATA") {
                continue;
            }
            const { action, target, result } = JSON.parse(message as string);
            ns.print(`Action: ${action} Target: ${target} Result: ${result}`);
        } catch (e) {
            if (typeof e === 'string') {
                ns.tprintf(e);
            }
            ns.exit()
        }
    }
}