import * as Discord from "discord.js";
import * as Redis from "redis";
import * as T from "./interface";
import config from "./config";

const REDIS_PREFIX = config.get("redis.prefix");

export default function makeContext(
  client: Discord.Client,
  redisClient: Redis.RedisClient,
  message?: Discord.Message
): T.BotContext {
  return {
    // TODO
    authorize: role => {
      if (!message) {
        return; // makes no sense
      }
      if (typeof role === "string") {
        role = message.guild.roles.find("name", role);
      }
      const userTopRole = message.member.roles
        .sort((a, b) => b.position - a.position)
        .first();
      if (userTopRole.position < role.position) {
        throw new T.SecurityException(
          `User ${
            message.member.displayName
          } is not authorised to perform this action - their top role ${
            userTopRole.name
          } is too small for the required ${role.name}.`
        );
      }
    },
    send: async text => {
      if (!message) {
        throw new Error(
          "Attempt to call ctx.send from a context where it is impossible.\r\nPlease make sure you're using the ctx passed to the `hear/respond` callback, not `bot.ctx`."
        );
      }
      await message.channel.send(text);
    },
    brain: {
      get<T>(key: string) {
        return new Promise((resolve, reject) => {
          redisClient.get(REDIS_PREFIX + key, (err, result) => {
            if (err) {
              reject(err);
            } else if (result) {
              resolve(JSON.parse(result));
            } else {
              resolve(undefined);
            }
          });
        });
      },
      set<T>(key: string, value: T) {
        return new Promise((resolve, reject) => {
          redisClient.set(
            REDIS_PREFIX + key,
            JSON.stringify(value),
            (err, result) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            }
          );
        });
      },
      delete(key) {
          return new Promise((resolve, reject) => {
            redisClient.del(REDIS_PREFIX + key, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
          });
      },
      async getAllWithPrefix(prefix) {
        return new Promise<Array<[string, string]>>((resolve, reject) => {
          let cursor = "0";
          let keys: string[] = [];
          const pattern = `${REDIS_PREFIX}${prefix}*`;
          const doScan: Redis.Callback<[string, string[]]> = (err, res) => {
            console.log("doScan", res);
            if (err) {
              reject(err);
              return;
            }
            cursor = res[0];
            const keys_ = res[1];
            keys_.forEach(key => {
              keys.push(key);
            });
            if (cursor == "0") {
              // Done scanning
              const result: Array<[string, string]> = [];
              keys.forEach(key => {
                redisClient.get(key, (err, res) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  result.push([key, res]);
                  if (result.length === keys.length) {
                    resolve(result);
                  }
                });
              });
            } else {
              redisClient.scan(cursor, "MATCH", pattern, doScan);
            }
          };
          redisClient.scan(cursor, "MATCH", pattern, doScan);
        });
      },
      getPrefix() {
        return REDIS_PREFIX;
      }
    },
    error: async (s, msg, hourglass) => {
      if (hourglass) {
        await hourglass.remove();
      }
      if (msg) {
        await msg.react("❌");
      }
      if (s instanceof Error) {
        throw s;
      } else {
        throw new Error(s);
      }
    }
  };
}
