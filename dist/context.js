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
const T = require("./interface");
const config_1 = require("./config");
const REDIS_PREFIX = config_1.default.get("redis.prefix");
function makeContext(client, redisClient, message) {
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
                throw new T.SecurityException(`User ${message.member.displayName} is not authorised to perform this action - their top role ${userTopRole.name} is too small for the required ${role.name}.`);
            }
        },
        send: (text) => __awaiter(this, void 0, void 0, function* () {
            if (!message) {
                throw new Error("Attempt to call ctx.send from a context where it is impossible.\r\nPlease make sure you're using the ctx passed to the `hear/respond` callback, not `bot.ctx`.");
            }
            yield message.channel.send(text);
        }),
        brain: {
            get(key) {
                return new Promise((resolve, reject) => {
                    redisClient.get(REDIS_PREFIX + key, (err, result) => {
                        if (err) {
                            reject(err);
                        }
                        else if (result) {
                            resolve(JSON.parse(result));
                        }
                        else {
                            resolve(undefined);
                        }
                    });
                });
            },
            set(key, value) {
                return new Promise((resolve, reject) => {
                    redisClient.set(REDIS_PREFIX + key, JSON.stringify(value), (err, result) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                });
            },
            delete(key) {
                return new Promise((resolve, reject) => {
                    redisClient.del(REDIS_PREFIX + key, (err) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                });
            },
            getAllWithPrefix(prefix) {
                return __awaiter(this, void 0, void 0, function* () {
                    return new Promise((resolve, reject) => {
                        let cursor = "0";
                        let keys = [];
                        const pattern = `${REDIS_PREFIX}${prefix}*`;
                        const doScan = (err, res) => {
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
                                const result = [];
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
                            }
                            else {
                                redisClient.scan(cursor, "MATCH", pattern, doScan);
                            }
                        };
                        redisClient.scan(cursor, "MATCH", pattern, doScan);
                    });
                });
            },
            getPrefix() {
                return REDIS_PREFIX;
            }
        },
        error: (s, msg, hourglass) => __awaiter(this, void 0, void 0, function* () {
            if (hourglass) {
                yield hourglass.remove();
            }
            if (msg) {
                yield msg.react("❌");
            }
            if (s instanceof Error) {
                throw s;
            }
            else {
                throw new Error(s);
            }
        })
    };
}
exports.default = makeContext;
