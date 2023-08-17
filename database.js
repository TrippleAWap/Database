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
                    if (Array.isArray(target[key])) {
                        // If the property is an array, wrap it with a Proxy
                        return this.createProxy(target[key]);
                    } else {
                        return target[key];
                    }},
                set: (target, key, value) => {
                    target[key] = value;
                    if (!this.modified)
                        (this.modified = true) &&
                        system.run(() => {
                            this.save();
                            this.modified = false;
                        });
                    return true;},
                deleteProperty: (target, key) => {
                    delete target[key];
                    if (!this.modified)
                        (this.modified = true) &&
                        system.run(() => {
                            this.save();
                            this.modified = false;
                        });
                    return true;},
                has: (target, key) => {
                    return key in target;},
                ownKeys: (target) => {
                    return Reflect.ownKeys(target);},
            });
        }
        /**@private */
        this.proxy = this.createProxy(this.data);
        return this.proxy;
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
        try { world.scoreboard.removeObjective(this.databaseName); } catch { };
        world.scoreboard.addObjective(this.databaseName, this.databaseName);
        for (const key in this.data) {
            overworld.runCommandAsync(`scoreboard players set "\\"${key}\\":${JSON.stringify(this.data[key]).replace(/"/g, '\\"')}" ${this.databaseName} 0`);
        }
    }
}
