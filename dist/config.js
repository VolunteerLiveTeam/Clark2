"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const convict = require("convict");
dotenv_1.config();
const config = convict({
    discord: {
        token: {
            env: "DISCORD_TOKEN",
            format: String,
            default: ""
        }
    },
    bot: {
        name: {
            format: String,
            default: "kralC",
            env: "BOT_NAME"
        }
    },
    redis: {
        url: {
            env: "REDIS_URL",
            format: String,
            default: "redis://localhost:6379"
        },
        prefix: {
            env: "REDIS_STORAGE_PREFIX",
            format: String,
            default: "clark:storage:"
        }
    }
});
config.validate({ allowed: "strict" });
exports.default = config;
