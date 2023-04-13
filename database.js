import { world } from "@minecraft/server";
export class Database {
    /**
     * @param {string} databaseName - The name of the database.
     * @param {string} [saveMode="scoreboard"] - The save mode of the database (scoreboard, entities).
     * @param {Object<{typeId: string, name: string}>} [entityData={typeId: null, name: null}] - The entity name and type id used if save mode is entities.
     * @param {object} [creationData={}] - The sub-databases needed upon creation (can be undefined if undefined add them later using the set | add method).
     */
    constructor(databaseName, saveMode = "scoreboard", entityData = { typeId: null, name: null }, creationData = {}) {
        this.creationData = creationData;
        this.entityData = entityData;
        this.saveMode = saveMode;
        this.databaseName = databaseName;
        this.data
        this.entity = {}
        if (saveMode === "entity") {
            if (entityData?.typeId) {
                if (!entityData?.name) return this.entity = [...world.getDimension(`overworld`).getEntities()].filter(entity => entity?.typeId === entityData?.typeId);
                this.entity = world.getDimension(`overworld`).getEntities().filter(entity => entity?.name === entityData?.name && entity?.typeId === entityData?.typeId);
            } else {
                if (!entityData?.name) return console.warn("Entity name and type id cannot both be undefined.");
                this.entity = [...world.getDimension(`overworld`).getEntities()].filter(entity => entity?.name === entityData?.name);
            }
        }
        if (world.scoreboard.getObjectives().find(objective => objective.id === databaseName)) {
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
     * Subtracts the value from the specified key.
     * @param {string} key - The key to subtract the value from.
     * @param {any} value - The value to subtract from the key.
     */
    remove(key, value) {
        this.data[key] -= value;
        this.save();
        return this.data[key];
    }

    /**
     * Adds the specified value to the specified key.
     * @param {string} key - The key to add the value to.
     * @param {*} value - The value to add to the key.
     * @returns {*} The value associated with the specified key.
     */
    add(key, value) {
        if (typeof this.data[key] === "undefined") this.data[key] = []
        try {
            this.data[key].push(value);
        } catch (e) {
            this.data[key] += value;
        }
        this.save();
        return this.data[key];
    }

    /**
    * Set the value of the specified key in the database.
    * @param {string} key - The key to set the value of.
    * @param {any} value - The value to set the key to.
    * @returns {any} The value that was set for the key.
    */
    set(key, value) {
        this.data[key] = value;
        this.save();
        return this.data[key];
    }

    /**
     * Delete the specified key from the database.
     * @param {string} key - The key to delete.
     * @returns {any} The value of the deleted key, or undefined if the key did not exist.
     */
    delete(key) {
        const value = this.data[key];
        delete this.data[key];
        this.save();
        return value;
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
     * Clear all keys and values from the database. This method is not recommended.
     * @returns {object} An empty object representing the cleared database.
     */
    clear() {
        if (Object.keys(this.data).length === 0) {
            console.warn("Already empty");
        }
        const emptyData = {};
        this.data = emptyData;
        this.save();
        return emptyData;
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
        if (this.saveMode === "scoreboard") {
            world.scoreboard.removeObjective(this.databaseName);
        } else if (this.saveMode === "entity") {
            world.getDimension(`overworld`).forEach(entity => {
                if (this.entityData.typeId) {
                    if (this.entityData.name) {
                        if (entity.typeId === this.entityData.typeId && entity.name === this.entityData.name) {
                            entity.removeTag(entity.getTags().find(tag => tag.startsWith(this.databaseName)));
                        }
                    } else {
                        if (entity.typeId === this.entityData.typeId) {
                            entity.removeTag(entity.getTags().find(tag => tag.startsWith(this.databaseName)));
                        }
                    }
                } else if (this.entityData.name) {
                    if (entity.name === this.entityData.name) {
                        entity.removeTag(entity.getTags().find(tag => tag.startsWith(this.databaseName)));
                    }
                }
            });
            entity.addTag(`{${this.databaseName.toString()}:${JSON.stringify(this.data)}}`);
        }
    }

    /**
     * Saves the database. This method is deprecated and not meant to be used.
     * @access private
     * @deprecated This method is deprecated and not meant to be used.
     * @summary Use of this method is not recommended as it may not correctly save the database data.
     */
    save() {
        if (this.saveMode === "scoreboard") {
            world.scoreboard.removeObjective(this.databaseName);
            world.scoreboard.addObjective(this.databaseName, JSON.stringify(this.data));
        } else if (this.saveMode === "entity") {
            const newTag = `{${this.databaseName.toString()}:${JSON.stringify(this.data)}}`;
            this.entity.removeTag(entity.getTags().find(tag => tag.startsWith(this.databaseName)));
            this.entity.addTag(newTag);
        }
    }
}