import { Menu } from "@grammyjs/menu";
import type { MyContext } from "../lib/types";
import { getRunningInstances } from "../airtable/get-running-instances";
import { GetRunningInstancesFunction } from "../commands/get-running-command";

export const startActions = new Menu<MyContext>("start-actions")
  // .text("Make Payment", (ctx) => ctx.reply("loading..."))
  // .row()
  .text("Start an Instance", async (ctx) => {
    await ctx.reply(`loading ...`);
    await ctx.conversation.enter("StartInstanceForm");
  })
  .text("Stop an Instance", async (ctx) => {
    await ctx.reply(`loading ...`);
    ctx.session.tgId=ctx.from!.id!.toString();
    await ctx.conversation.enter("StopInstanceForm");  })
  .row()
  .text("Running Instances", async (ctx) => {
    await ctx.reply("loading...");
    await GetRunningInstancesFunction(ctx);
  })
  .text("Extend Running Instances", async (ctx) =>{ ctx.reply("loading...")

    await ctx.conversation.enter("ExtendInstanceForm");

  });
