import * as T from "../interface";

export default (bot: T.BotScript) => {
    bot.hear(/echo (.+)/, async (ctx, msg, match) => {
        await msg.reply(match[1]);
        await msg.channel.send(match[1]);
    });
};
