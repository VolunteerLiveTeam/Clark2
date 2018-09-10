import * as T from "../interface";
import * as D from "discord.js";

export default (bot: T.BotScript) => {
    bot.respond(/setLiveThread (?:.*live\/)?([a-z0-9]*)/i, async (ctx, msg, match) => {
        // React to let the user know we're doing something
        const reaction = await msg.react("⌛");

        const slug = match[1];
        const url = `https://reddit.com/live/${slug}`;

        await bot.client.user.setActivity("a live thread! live/" + slug, {type: "WATCHING", url})

        await Promise.all([
            reaction.remove(),
            msg.react("✅")
        ]);
    });

    bot.respond(/setGame(?: (.*))?/i, async (ctx, msg, match) => {
        const reaction = await msg.react('⌛'); // hourglass

        const game = match[1] || 'w/ liveteam.org';
        await bot.client.user.setActivity(game, {type: "PLAYING", url: "https://liveteam.org"});

        await Promise.all([
            reaction.remove(),
            msg.react("✅")
        ]);
    });
};
