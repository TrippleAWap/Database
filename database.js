import { world, system } from "@minecraft/server";

const overworld = world.getDimension("overworld");

export class Database {
    /**
     * @param {string} databaseName - The name of the database
     */
    constructor(databaseName) {
        this.databaseName = databaseName;
        /**@private */
        this.objective = world.scoreboard.getObjective(databaseName) ?? world.scoreboard.addObjective(databaseName, databaseName);
        /**@private */
        this.data = JSON.parse(`{${this.objective.getParticipants().map((e) => e.displayName.replace(/\\"/g, '"')).join(",")}}`)
        /**@private */
        this.modified = false;
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
                    if (!this.modified)
                        (this.modified = true) &&
                        system.run(() => {
                            this.save();
                            this.modified = false;
                        });
                    return true;
                },
                deleteProperty: (target, key) => {
                    delete target[key];
                    if (!this.modified)
                        (this.modified = true) &&
                        system.run(() => {
                            this.save();
                            this.modified = false;
                        });
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
    save() {
        try { world.scoreboard.removeObjective(this.databaseName); } catch { };
        world.scoreboard.addObjective(this.databaseName, this.databaseName);
        for (const key in this.data) {
            overworld.runCommandAsync(`scoreboard players set "\\"${key}\\":${JSON.stringify(this.data[key]).replace(/"/g, '\\"')}" ${this.databaseName} 0`);
        }
    }
}
