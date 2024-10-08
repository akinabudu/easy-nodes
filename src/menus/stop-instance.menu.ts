import { Menu } from "@grammyjs/menu";
import type { MyContext } from "../lib/types";


export const stopInstance = new Menu<MyContext>("stop-instance")
  .text("Stop a Node", async (ctx) => {
    await ctx.reply(`loading ...`);
  })
 
