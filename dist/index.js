"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");
const Redis = require("redis");
const T = require("./interface");
const config_1 = require("./config");
const context_1 = require("./context");
const messageHandlers = [];
const name = config_1.default.get("bot.name");
const ourHandlers = {
    message: (client, redis) => (msg) => __awaiter(this, void 0, void 0, function* () {
        console.log("DEBUG: message " + msg);
        let run = false;
        yield Promise.all(messageHandlers.map((h) => __awaiter(this, void 0, void 0, function* () {
            const match = msg.content.match(h.regex);
            if (match) {
                console.log("DEBUG: matched on " + h.regex.source);
                run = true;
                try {
                    const result = h.callback(context_1.default(client, redis, msg), msg, match);
                    if (result instanceof Promise) {
                        return yield result;
                    }
                    else {
                        return result;
                    }
                }
                catch (e) {
                    if (e instanceof T.SecurityException) {
                        console.error(e.message);
                        msg.reply("You are not authorised to perform this action!");
                    }
                    else {
                        return Promise.reject("ERROR RUNNING SCRIPT " + e);
                    }
                }
            }
            else {
                console.log("DEBUG: no match " + h.regex.source);
                return Promise.resolve();
            }
        })));
        if (!run) {
            console.log("DEBUG: no handlers executed");
        }
    })
};
const bot = (client, redisClient) => ({
    hear(regex, callback) {
        messageHandlers.push({ regex, callback });
    },
    respond(regex, callback) {
        messageHandlers.push({
            regex: new RegExp("(?:@?" + name + "|<@" + client.user.id + ">) " + regex.source, regex.flags),
            callback
        });
    },
    ctx: context_1.default(client, redisClient),
    client
});
(() => __awaiter(this, void 0, void 0, function* () {
    const redisClient = Redis.createClient(config_1.default.get("redis.url"));
    const client = new Discord.Client({});
    yield client.login(config_1.default.get("discord.token"));
    (yield fs.promises.readdir(path.join(__dirname, "scripts"))).forEach((path) => __awaiter(this, void 0, void 0, function* () {
        const mod = "./scripts/" + path.replace(/\.[jt]s/, "");
        const script = (yield Promise.resolve().then(() => require(mod))).default;
        const prom = script(bot(client, redisClient));
        if (prom instanceof Promise) {
            yield prom;
        }
    }));
    client.on("message", ourHandlers.message(client, redisClient));
    console.log("Bot started.");
}))();
