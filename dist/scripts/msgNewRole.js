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
exports.default = (bot) => {
    bot.client.on("guildMemberUpdate", (oldM, newM) => __awaiter(this, void 0, void 0, function* () {
        if (newM.roles.size > oldM.roles.size) {
            let added = [];
            newM.roles.forEach((val, key) => {
                if (!oldM.roles.get(key)) {
                    added.push([key, val]);
                }
            });
            if (added.some(x => x[1].name === (process.env.TRIGGER_ROLE_NAME || "Citizen Reporters"))) {
                yield newM.sendMessage(`Bleep bloop! A VLT Member has given you the Citizen Reporter role. You are now among those who have expressed interest in helping the VLT cover events, find sources, and run threads.

As a Citizen Reporter, you have access to all our Live Thread Discord chat channels. These are the channels where the team operates our LTs and you can communicate directly with them. If you help out on a live thread, type \`i was here\` in the chat and I will give you a special badge on your Discord profile to mark that.

If you are interested in becoming a full member, please fill out this form: ${process.env.FORM_URL}

Typically the path to membership is to participate in two threads as a Citizen Reporter and two more as a Trainee Member. We'll send you a message as you reach these thresholds.

In addition, here is the VLT's internal manual, which you may find interesting: ${process.env.MANUAL_URL}

- Clark, your friendly VLT Bot`);
            }
        }
    }));
};
