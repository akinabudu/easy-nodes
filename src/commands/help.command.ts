import type { MyContext } from "../lib/types";
import { InlineKeyboard } from "grammy";

export async function HelpCommand(ctx: MyContext) {
  const keyboard = new InlineKeyboard()
    .url("Contact Support", "https://t.me/global_instance_vps");

  await ctx.reply(
    "Need help? Click the button below to contact our support team:",
    { reply_markup: keyboard }
  );
}
