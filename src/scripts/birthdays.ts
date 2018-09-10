import * as T from "../interface";

export default (bot: T.BotScript) => {
    bot.respond(/set birthday <@(\d+)> (\d{2}\/\d{2})/i, async (ctx, msg, match) => {
        ctx.authorize("Moderators");
        const member = msg.guild.members.get(match[1]);
        await ctx.brain.set(`birthday:${match[1]}`, match[2]);
        await msg.react("✅")
        await msg.channel.send(`${member!.displayName} is now born on ${match[2]}`)
    });

    bot.respond(/get birthday <@(\d+)>/i, async (ctx, msg, match) => {
        ctx.authorize("Moderators");
        const member = msg.guild.members.get(match[1]);
        try {
            const bday = await ctx.brain.get(`birthday:${match[1]}`);
            await msg.channel.send(`${member!.displayName} is born on ${bday}.`);
        } catch (e) {
            ctx.error(e, msg);
        }
    });

    bot.respond(/list birthdays/i, async (ctx, msg, match) => {
        ctx.authorize("Moderators");
        try {
            const kvPairs = await ctx.brain.getAllWithPrefix("birthday:")
            let result = "";
            const prefix = ctx.brain.getPrefix() + "birthday:";
            kvPairs.forEach(kvPair => {
                const [key, value] = kvPair;
                const userId = key.substr(prefix.length);
                const user = msg.guild.members.get(userId);
                const userName = user ? user.displayName : "an unknown user";
                result += `${userName} is born on ${value}\r\n`;
            });

            await msg.channel.send(result);
        } catch (e) {
            ctx.error(e, msg);
        }
    });
};
