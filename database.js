import { world } from "@minecraft/server";

console.warn(`\n§7[§cDatabase§7] §rSuccessfully loaded!\n§7Registered Properties Count: ${world.getDynamicPropertyIds().length}\n§7Registered Properties: §a${world.getDynamicPropertyIds().map((i, index, map) => { map.filter(d => d.split(":").slice(0, -1).join(":") !== i); return JSON.stringify(i.split(":").slice(0, -1).join(":")) }).join(", ")}\n§7Total Bytes: §a${world.getDynamicPropertyTotalByteCount()}`);

export class Database {
    /**
     * @param {string} databaseName - The name of the database
     */
    constructor(databaseName) {
        /**@private */
        this.databaseName = databaseName;
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
        const classRef = this;
        this.createProxy = (target) => {
            return new Proxy(target, {
                get: (target, key) => {
                    let value = target[key];
                    if (key === "_o_parent") return classRef;
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
            for (let i = 0; i < charCount;) {
                const stringLength = `${this.databaseName}:${i}`.length
                const value = stringObj.slice(i, (i + 32767 - stringLength) > charCount ? charCount : i + 32767 - stringLength)
                world.setDynamicProperty(`${this.databaseName}:${i}`, value)
                i += 32767 - stringLength
            }
        }
        createSpreadDynamic(this.data)
        return true;
    }

    delete() {
        try {
            const dynamics = world.getDynamicPropertyIds().filter((id) => !id.startsWith(`${this.databaseName}:`))
            const data = {}
            for (const id of dynamics) {
                if (dynamics.includes(id)) continue;
                data[id] = world.getDynamicProperty(id) ?? {};
            }
            world.clearDynamicProperties()
            for (const id of dynamics) {
                world.setDynamicProperty(id, data[id])
            }
            console.warn(`§7[§cDatabase§7] §rDeleted database "${this.databaseName}"...`)
            this.data = {};
            return true;
        } catch (error) {
            console.warn(`§7[§cDatabase§7] §rFailed to delete database "${this.databaseName}"!`)
            return false;
        }
    }
}
