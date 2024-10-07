import { InlineKeyboard, type CommandContext } from "grammy";
import type { MyContext } from "../lib/types";
import { getUserbyId } from "../airtable/get-user-id";
import {  register } from "../menus/register.menus";
import { startActions } from "../menus/start-actions.menu";

export async function StartCommand(ctx: CommandContext<MyContext>) {
  ctx.reply("Starting...");
  if (ctx.from!.is_bot || !ctx.hasChatType("private")) {
    await ctx.reply(`Not Allowed`);
  } else {
    ctx.session.tgId = ctx.from!.id;
    let memberUsename = (ctx.session.tgUsername = ctx.from!.username);
    // console.log(ctx.session.membersId);
    await ctx.reply(`Hi ${memberUsename}`);
    const member = await getUserbyId(ctx.session.tgId);
    if (member) {
      await ctx.reply("Welcome back! ");
      await ctx.reply(`How may I be of Help`, { reply_markup: startActions });
    } else {
      await ctx.reply(`Hello, ${memberUsename}. Kindly Register`, {
        reply_markup: register,
      });
    }
  }
}
