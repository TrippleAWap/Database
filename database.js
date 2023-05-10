import {world, system, ScoreboardIdentity, Vector} from "@minecraft/server";

const overworld = world.getDimension("overworld");
export class Database {
    /**
     * @param {string} databaseName - The name of the database
     */
    constructor(databaseName) {
        try {
            this.databaseName = databaseName;
            /**@private */
            this.objective = world.scoreboard.getObjective(databaseName) ?? world.scoreboard.addObjective(databaseName, databaseName);
            this.modified = false;
            /**@private */
            this.data = this.objective.getParticipants().length > 0 ? Object.fromEntries(this.objective.getParticipants().map(x => {
                const [key, value] = x.displayName.split(":");
                return [key, JSON.parse(value)];
                })) : {};
            /**@private */
            this.createProxy = (target) => {
                return new Proxy(target, {
                    get: (target, key) => {
                        if (Array.isArray(target[key])) {
                            // If the property is an array, wrap it with a Proxy
                            return this.createProxy(target[key]);
                        } else {
                            return target[key];
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
                    },
                });
            }
            /**@private */
            this.proxy = this.createProxy(this.data);
        } catch {}
    }

    /**
     * Get the entire data object of the database.
     * @returns {object} The data object of the database.
     */
    get all() {
        return this.proxy;
    }

    /**
     * Saves the database. This method is deprecated and not meant to be used.
     * @private
     * @summary Use of this method is not recommended as it may not correctly save the database data.
     */
    save() {

        try { world.scoreboard.removeObjective(this.databaseName) } catch (e) { console.warn(e) }
        world.scoreboard.addObjective(this.databaseName, this.databaseName);
        for (const [key, value] of Object.entries(this.proxy)) {
            try { overworld.runCommandAsync(`scoreboard players set "${key}:${JSON.stringify(value).replace(/"/g, '\\"')}" ${this.databaseName} 0`) } catch (e) { console.warn(e) }
        }
    }
}
