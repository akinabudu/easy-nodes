import { type CommandContext } from "grammy";
import type { MyContext } from "../lib/types";
import { getUserbyId } from "../airtable/get-user-id";
import { register } from "../menus/register.menus";
import { mySesssion } from "../../bot";


export async function ExtendInstanceCommand(ctx: CommandContext<MyContext>) {
  ctx.reply("Starting...");
  //check if the user is resgistered
  const memberUsename = ctx.from!.username;
  const user = await getUserbyId(ctx.from!.id);
  if (!user) {
    ctx.reply("You are not registered. Please register first.");
    await ctx.reply(`Hello, ${memberUsename}. Kindly Register`, {
      reply_markup: register,
    });
    return;
  }
  ctx.session.tgId=ctx.from?.id!;
  await ctx.conversation.enter("ExtendInstanceForm");
}




