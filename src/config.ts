import {config as dotenv} from "dotenv";
import * as convict from "convict";

dotenv();

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
            default: "kralC"
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

export default config;
