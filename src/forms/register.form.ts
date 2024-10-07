import type { Conversation } from "@grammyjs/conversations";
import type { MyContext } from "../lib/types";
import { mySesssion } from "../../bot";
import { submit } from "../menus/submit-form.menu";
import { polygonService, solanaService } from "../lib/config";

export async function RegisterForm(
  conversation: Conversation<MyContext>,
  ctx: MyContext
) {
  let isValid = false;
  while (!isValid) {
    await ctx.reply("Please provide your First name:");
    ctx.session.firstName = await conversation.form.text()!;
    isValid = /^[a-zA-Z]{2,}$/.test(ctx.session.firstName);
    if (!isValid)
      await ctx.reply(
        "Invalid first name. It should contain at least 2 letters. Please try again."
      );
  }

  isValid = false;
  while (!isValid) {
    await ctx.reply("Please provide your Last name:");
    ctx.session.lastName = await conversation.form.text()!;
    isValid = /^[a-zA-Z]{2,}$/.test(ctx.session.lastName);
    if (!isValid)
      await ctx.reply(
        "Invalid last name. It should contain at least 2 letters. Please try again."
      );
  }

  isValid = false;
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

  mySesssion[ctx.from?.id!]=ctx.session
  await ctx.reply(`Your Details:\nFirstname: ${ctx.session.firstName!}\nLastname: ${ctx.session.lastName!}\nEmail: ${ctx.session.email!}\nYou confirm that this information is accurate?`, {
    reply_markup: submit
  })
 
}
