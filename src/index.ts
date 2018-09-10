import * as Discord from "discord.js";
import * as fs from "fs";
import * as path from "path";
import * as Redis from "redis";

import * as T from "./interface";
import config from "./config";
import makeContext from "./context";

interface MessageHandler {
  regex: RegExp;
  callback: T.MessageCallback;
}

const messageHandlers: Array<MessageHandler> = [];

const name = config.get("bot.name") as string;

const ourHandlers = {
  message: (client: Discord.Client, redis: Redis.RedisClient) => async (
    msg: Discord.Message
  ) => {
    console.log("DEBUG: message " + msg);
    let run = false;
    await Promise.all(
      messageHandlers.map(async h => {
        const match = msg.content.match(h.regex);
        if (match) {
          console.log("DEBUG: matched on " + h.regex.source);
          run = true;
          try {
            const result = h.callback(
              makeContext(client, redis, msg),
              msg,
              match
            );
            if (result instanceof Promise) {
              return await result;
            } else {
              return result;
            }
          } catch (e) {
            if (e instanceof T.SecurityException) {
              console.error(e.message);
              msg.reply("You are not authorised to perform this action!");
            } else {
              return Promise.reject("ERROR RUNNING SCRIPT " + e);
            }
          }
        } else {
          console.log("DEBUG: no match " + h.regex.source);
          return Promise.resolve();
        }
      })
    );
    if (!run) {
      console.log("DEBUG: no handlers executed");
    }
  }
};

const bot: (
  client: Discord.Client,
  redisClient: Redis.RedisClient
) => T.BotScript = (client, redisClient) => ({
  hear(regex, callback) {
    messageHandlers.push({ regex, callback });
  },
  respond(regex, callback) {
    messageHandlers.push({
      regex: new RegExp(
        "(?:@?" + name + "|<@" + client.user.id + ">) " + regex.source,
        regex.flags
      ),
      callback
    });
  },
  ctx: makeContext(client, redisClient),
  client
});

(async () => {
  const redisClient = Redis.createClient(config.get("redis.url"));
  const client = new Discord.Client({});

  await client.login(config.get("discord.token"));

  (await fs.promises.readdir(path.join(__dirname, "scripts"))).forEach(
    async path => {
      const mod = "./scripts/" + path.replace(/\.[jt]s/, "");
      const script = (await import(mod)).default as T.BotScriptExport;
      const prom = script(bot(client, redisClient));
      if (prom instanceof Promise) {
        await prom;
      }
    }
  );

  client.on("message", ourHandlers.message(client, redisClient));

  console.log("Bot started.");
})();
