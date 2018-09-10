import * as Discord from "discord.js";
import * as Redis from "redis";

export class SecurityException extends Error {}

export interface BotBrain {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  getAllWithPrefix(prefix: string): Promise<Array<[string, string]>>;
  getPrefix(): string;
}

export interface BotContext {
  authorize: (role: Discord.Role | string) => void;
  send: (message: string) => Promise<void>;
  brain: BotBrain;
  error: (
    err: Error | string,
    msg?: Discord.Message,
    hourglass?: Discord.MessageReaction
  ) => Promise<void>;
}

export type MessageCallback = (
  ctx: BotContext,
  msg: Discord.Message,
  match: RegExpMatchArray
) => void | Promise<void>;

export interface BotScript {
  hear: (regex: RegExp, callback: MessageCallback) => void;
  respond: (regex: RegExp, callback: MessageCallback) => void;
  ctx: BotContext;
  client: Discord.Client;
}

export type BotScriptExport = (script: BotScript) => void | Promise<void>;
