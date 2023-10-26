import {world} from "@minecraft/server";

console.warn(`\n§7[§cDatabase§7] §rSuccessfully loaded!\n§7Registered Properties Count: ${world.getDynamicPropertyIds().length}\n§7Registered Properties: §a${world.getDynamicPropertyIds().map(i => JSON.stringify(i)).join(", ")}\n§7Total Bytes: §a${world.getDynamicPropertyTotalByteCount()}`);

export class Database {
    /**
     * @param {string} databaseName - The name of the database
     */
    constructor(databaseName) {
        /**@private */
        this.databaseName = databaseName;
        /**@private */
        const getDataFromSpreadDynamics = () => {
            let str = ''
            const dynamics = world.getDynamicPropertyIds().filter((id) => id.startsWith(`${this.databaseName}:`))
            for (const id of dynamics) {
                const value = world.getDynamicProperty(id) ?? {}
                str += value;
            }
            return str.length > 0 ? JSON.parse(str) : {};
        }
        /**@private */
        this.data = getDataFromSpreadDynamics();
        /**@private */
        this.createProxy = (target) => {
            return new Proxy(target, {
                get: (target, key) => {
                    let value = target[key];
                    if (typeof value === 'object' && value !== null) {
                        return this.createProxy(value);
                    } else {
                        return value;
                    }
                },
                set: (target, key, value) => {
                    target[key] = value;
                    this.save;
                    return true;
                },
                deleteProperty: (target, key) => {
                    delete target[key];
                    this.save;
                    return true;
                },
                has: (target, key) => {
                    return key in target;
                },
                ownKeys: (target) => {
                    return Reflect.ownKeys(target);
                }
            });
        }
        return this.createProxy(this.data)
    }


    /**
     * @private
     * @summary Use of this method is not recommended as the proxy will automatically save the database when it is modified.
     */
    get save() {
        const createSpreadDynamic = (obj) => {
            const stringObj = JSON.stringify(obj)
            const charCount = stringObj.length
            for (let i = 0; i < charCount; i += 32767) {
                const value = stringObj.slice(i, (i + 32767) > charCount ? charCount : i + 32767)
                world.setDynamicProperty(`${this.databaseName}:${i}`, value)
            }
        }
        createSpreadDynamic(this.data)
        return true;
    }
}
// This is an example usage.

// const playerStats = {
//     name: "",
//     money: 0,
//     level: 0,
//     exp: 0,
//     kills: 0,
//     deaths: 0,
//     playtime: 0,
//     lastActive: 0,
//     vault: {
//         vaultID: -1,
//         sharedVault: {
//             vaultID: -1,
//             rank: "Member"
//         }
//     }
// }
// const statsDB = new Database("stats");
// system.runInterval(() => {
//     const players = world.getAllPlayers();
//     for (const player of players) {
//         /** @type {typeof playerStats} */
//         const stats = statsDB[player.id] ??= playerStats;
//         stats.lastActive = Date.now()
//         stats.playtime += 1000 / 20
//         stats.name = player.name
//     }
//     console.warn(statsDB)
// })
