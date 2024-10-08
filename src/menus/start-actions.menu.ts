import { Menu } from "@grammyjs/menu";
import type { MyContext } from "../lib/types";
import { GetRunningInstancesFunction } from "../commands/get-running-command";

export const startActions = new Menu<MyContext>("start-actions")

  .text("Start a Node", async (ctx) => {
    await ctx.reply(`loading ...`);
    await ctx.conversation.enter("StartInstanceForm");
  })
  .text("Stop a Node", async (ctx) => {
    await ctx.reply(`loading ...`);
    ctx.session.tgId=ctx.from!.id!.toString();
    await ctx.conversation.enter("StopInstanceForm");  })
  .row()
  .text("Running Nodes", async (ctx) => {
    await ctx.reply("loading...");
    await GetRunningInstancesFunction(ctx);
  })
  .text("Extend a Running Node", async (ctx) =>{ ctx.reply("loading...")

    await ctx.conversation.enter("ExtendInstanceForm");

  });
