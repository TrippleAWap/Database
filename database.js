import {system, world} from "@minecraft/server";
export class Database {
    /**
     * @param {string} databaseName - The name of the database
     */
    constructor(databaseName)
    {
        this.databaseName = databaseName;
        const objective = world.scoreboard.getObjective(databaseName);
        this.data = objective ? JSON.parse(objective.displayName) : {};
        if (world.ascoreboard.getObjective(databaseName)) {
            this.data = JSON.parse(world.scoreboard.getObjective(databaseName).displayName)
        } else {
            world.scoreboard.addObjective(databaseName, "{}");
        }
        system.runInterval(() => {
            this.save();
        })
    }
    /**
     * Get the entire data object of the database.
     * @returns {object} The data object of the database.
     */
    get all() {
        return this.data;
    }

    /**
     * Saves the database. This method is deprecated and not meant to be used.
     * @access private
     * @summary Use of this method is not recommended as it may not correctly save the database data.
     */
    save() {
        const scoreboard = world.scoreboard.getObjective(this.databaseName);
        const serializedData = JSON.stringify(this.data);
        if (scoreboard.displayName === serializedData) return;
        world.scoreboard.removeObjective(this.databaseName)
        world.scoreboard.addObjective(this.databaseName, serializedData);
    }

}

