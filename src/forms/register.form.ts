import type { Conversation } from "@grammyjs/conversations";
import type { MyContext } from "../lib/types";
import { mySesssion } from "../../bot";
import { submit } from "../menus/submit-form.menu";
import { baseService, polygonService, solanaService } from "../lib/config";

export async function RegisterForm(
  conversation: Conversation<MyContext>,
  ctx: MyContext
) {
  let isValid = false;
  ctx.session.tgUsername = ctx.from?.username!
  while (!isValid) {
    await ctx.reply("Please provide your email address:");
    ctx.session.email = await conversation.form.text()!;
    isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ctx.session.email);
    if (!isValid)
      await ctx.reply(
        "Invalid email address. Please enter a valid email and try again."
      );
  }
      const poly = polygonService.generateAddress();
      ctx.session.polygonAddress = poly.address
      ctx.session.polygonPrivateKey = poly.privateKey
      const sol = solanaService.generateAddress();
      ctx.session.solanaAddress = sol.address
      ctx.session.solanaPrivateKey = sol.privateKey
      const base = baseService.generateAddress();
      ctx.session.baseAddress = base.address
      ctx.session.basePrivateKey = base.privateKey

  mySesssion[ctx.from?.id!]=ctx.session
  await ctx.reply(`Your Details:\nUsername: ${ctx.session.tgUsername!}\nEmail: ${ctx.session.email!}\nYou confirm that this information is accurate?`, {
    reply_markup: submit
  })
 
}
