import { world, system } from "@minecraft/server"

export class Database {
    /**
     * @param {string} databaseName - The name of the database
     */
    constructor(databaseName) {
        this.databaseName = databaseName;
        /**@private */
        this.objective = world.scoreboard.getObjective(databaseName) ?? world.scoreboard.addObjective(databaseName, "{}");
        /**@private */
        this.data = this.objective ? JSON.parse(this.objective.displayName) : {}
        /**@private */
        this.modified = false;
        /**@private */
        this.proxy = new Proxy(this.data, {
            get: (target, key) => {
                return target[key];
            },
            set: (target, key, value) => {
                target[key] = value;
                if (!this.modified) (this.modified = true) && system.run(() => { this.save(); this.modified = false; });
                return true;
            },
            deleteProperty: (target, key) => {
                delete target[key];
                if (!this.modified) (this.modified = true) && system.run(() => { this.save(); this.modified = false; });
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
        world.scoreboard.addObjective(this.databaseName, JSON.stringify(this.data));
    }
}
