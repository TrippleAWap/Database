import { world } from "@minecraft/server";
export class Database {
    /**
     * @param {string} databaseName - The name of the database.
     * @param {string} [saveMode="scoreboard"] - The save mode of the database (scoreboard, entities).
     * @param {Object<{typeId: string, name: string}>} [entityData={typeId: null, name: null}] - The entity name and type id used if save mode is entities.
     * @param {object} [creationData={}] - The sub-databases needed upon creation (can be undefined if undefined add them later using the set | add method).
     */
    constructor(databaseName, creationData = {}) {
        this.creationData = creationData;
        this.entityData = entityData;
        this.saveMode = saveMode;
        this.databaseName = databaseName;
        if (world.scoreboard.getObjective(databaseName)) {
            this.data = JSON.parse(world.scoreboard.getObjective(databaseName).displayName);
        } else {
            world.scoreboard.addObjective(databaseName, JSON.stringify(creationData));
            this.data = this.creationData;
        }
    }

    /**
     * Gets the value associated with the specified key.
     * @param {string} key - The key to get the value of.
     * @returns {*} The value associated with the specified key.
     */
    get(key) {
        return this.data[key];
    }

    /**
     * Check if the specified key exists in the database.
     * @param {string} key - The key to check for existence.
     * @returns {boolean} Whether or not the key exists in the database.
     */
    has(key) {
        return this.data.hasOwnProperty(key);
    }
    /**
     * Get the entire data object of the database.
     * @returns {object} The data object of the database.
     */
    get all() {
        return this.data;
    }
    /**
     * Deletes the database. This method is deprecated and not recommended for use.
     * @deprecated This method is deprecated and not recommended for use.
     * @summary Use of this method is not recommended as it can cause unexpected data loss.
     */
    delete() {
            world.scoreboard.removeObjective(this.databaseName);
    }

    /**
     * Saves the database. This method is deprecated and not meant to be used.
     * @access private
     * @deprecated This method is deprecated and not meant to be used.
     * @summary Use of this method is not recommended as it may not correctly save the database data.
     */
    save() {
         world.scoreboard.removeObjective(this.databaseName);
         world.scoreboard.addObjective(this.databaseName, JSON.stringify(this.data));
    }
}
