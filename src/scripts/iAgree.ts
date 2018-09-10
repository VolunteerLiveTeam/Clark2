import * as D from "discord.js";
import * as T from "../interface";

function getQuarter(d?: Date) {
    const date = d || new Date();
    var month = date.getMonth() + 1;
    return "Q" + (Math.ceil(month / 3)) + "-" + date.getFullYear();
  }

export default (bot: T.BotScript) => {
    bot.client.on("guildMemberAdd", async member => {
        const newUserRole = member.guild.roles.find("name", "New Member");
        if (!newUserRole) {
            console.warn("No new user role found!");
            return;
        }
        await member.addRole(newUserRole);
    });

    bot.hear(/.*/, async (ctx, msg, _) => {
        // Find the channel ID
        const foyer = msg.guild.channels.find("name", "do-you-agree");
        if (!foyer) {
            console.warn("No foyer ID found.");
            return;
        }

        // Check if we're in a pertinent channel
        if (msg.channel.id !== foyer.id) {
            console.log("Bailing out - not in pertinent channel");
            return;
        }

        // Setting up for later
        const error = async (s: string, hourglass?: D.MessageReaction) => {
            if (hourglass) {
                await hourglass.remove();
            }
            await msg.react("❌");
            throw new Error(s);
        };

        let hourglass: D.MessageReaction | undefined = undefined;

        try {
            // Check if we care about the message
            const msgRegex = /i agree(?: (\d{2}?)\/(\d{2}?))?/i;
            const match = msg.content.match(msgRegex);
            if (match) {
                // Hourglass
                hourglass = await msg.react("⌛");

                // Locate the ID of the new member role
                const newUserRole = msg.guild.roles.find("name", "New Member");
                if (!newUserRole) {
                    await ctx.error("No new member role found!", msg, hourglass);
                    return;
                }

                // Find the quarterly role, or create it if it doesn't exist
                const quarter = getQuarter();
                let quarterlyRole = msg.guild.roles.find("name", quarter);
                if (!quarterlyRole) {
                    quarterlyRole = await msg.guild.createRole({ name: quarter, permissions: ["ADD_REACTIONS"] });
                }

                // Apply all the roles!
                await msg.member.removeRole(newUserRole, "They agree");
                await msg.member.addRole(quarterlyRole);

                // Save the birthday
                if (match.length >= 3) {
                    const [_, day, month] = match;
                    const date = day + "/" + month;
                    await ctx.brain.set(`birthday:${msg.member.id}`, date);
                }
            }
        } catch (e) {
            await ctx.error(e, msg, hourglass);
        } finally {
            console.log("do the delet");
            try {
                await msg.delete(1);
            } catch (e) {
                await ctx.error(e, msg, hourglass);
            }
        }
    });
};
