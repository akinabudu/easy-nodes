import { Menu } from "@grammyjs/menu";
import type { MyContext } from "../lib/types";

export const register = new Menu<MyContext>("register")
  .text("Register", async (ctx) => {
    await ctx.conversation.enter("RegisterForm");
  })
  .text("Cancel", async (ctx) => {
    await ctx.reply("Registration cancelled");
  });
