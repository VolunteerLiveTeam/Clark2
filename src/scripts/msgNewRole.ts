import * as D from "discord.js";
import * as T from "../interface";

export default (bot: T.BotScript) => {
  bot.client.on("guildMemberUpdate", async (oldM, newM) => {
    if (newM.roles.size > oldM.roles.size) {
      let added: [string, D.Role][] = [];
      newM.roles.forEach((val, key) => {
        if (!oldM.roles.get(key)) {
          added.push([key, val]);
        }
      });
      if (added.some(x => x[1].name === "Citizen Reporter")) {
        await newM.sendMessage(`Bleep bloop! A VLT Member has given you the Citizen Reporter role. You are now among those who have expressed interest in helping the VLT cover events, find sources, and run threads.

As a Citizen Reporter, you have access to all our Live Thread Discord chat channels. These are the channels where the team operates our LTs and you can communicate directly with them. If you help out on a live thread, type \`i was here\` in the chat and I will give you a special badge on your Discord profile to mark that.

If you are interested in becoming a full member, please fill out this form: <insert link here>

Typically the path to membership is to participate in two threads as a Citizen Reporter and two more as a Trainee Member. We'll send you a message as you reach these thresholds.

In addition, here is the VLT's internal manual, which you may find interesting:

- Clark, your friendly VLT Bot`);
      }
    }
  });
};
