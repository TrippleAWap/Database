# Example Usage
```js
import { world, system } from "@minecraft/server";

import { Database } from "./database";
const dB = new Database("name_here")
system.runInterval(async () => {
	for (const player of world.getAllPlayers()) {
		dB[player.id] ??= { money: 0 }
		dB[player.id].money += 1
		player.onScreenDisplay.setActionBar(`${JSON.stringify(dB)}`)
	}
})
```
This is a simple database using scoreboards for MCBE created by TrippleAWap!

# MCBE+ DISCORD
This is my personal discord I've made with a friend, if you're a developer or a realm owner consider joining 🙂
```
https://discord.gg/btDmHuqrgB
```
