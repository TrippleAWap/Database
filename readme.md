# Example Usage
```js
import { world, system } from "@minecraft/server";

import { Database } from "./database";
const dB = new Database("name_here")
system.runInterval(async () => {
	for (const player of world.getAllPlayers()) {
		// dont have to manually set the database if you use variables
		const stats = dB[player.id] ??= { money: 0 }
		stats.money += 1
		player.onScreenDisplay.setActionBar(`${JSON.stringify(dB)}`)
	}
})
```
This is a simple database using scoreboards for MCBE created by TrippleAWap!
