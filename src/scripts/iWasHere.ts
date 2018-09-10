import * as T from "../interface";
import * as D from "discord.js";

export default (bot: T.BotScript) => {
    bot.hear(/i was here/i, async (ctx, msg, match) => {
        // Only allow badges in lt- or ce- rooms
        const chan = msg.channel as D.TextChannel;
        const prefix = chan.name.substr(0, 3);
        if (!(prefix === "lt-" || prefix === "ce-")) {
            console.log("Bailing out - not in lt- or ce-: " + chan.name);
            return;
        }

        // React to let the user know we're doing something
        const reaction = await msg.react("⌛");

        try {
            // First, check if the user doesn't already have the role
            const roomName = chan.name;
            if (msg.member.roles.find("name", roomName)) {
                // we're done here
                await reaction.remove();
                return;
            }

            // Next, check if it exists. If not, create it.
            let role = msg.guild.roles.find("name", roomName);
            if (!role) {
                role = await msg.guild.createRole({ name: roomName, permissions: ["ADD_REACTIONS"] });
            }

            // Assign it
            await msg.member.addRole(role);
            
            // Remove the hourglass, and add a check mark, all in parallel
            await Promise.all([
                reaction.remove(),
                msg.react("✅")
            ]);
        } catch (e) {
            await ctx.error(e, msg, reaction);
        }
    });
};
