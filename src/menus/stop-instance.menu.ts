import { Menu } from "@grammyjs/menu";
import type { MyContext } from "../lib/types";
import { getRunningInstances } from "../airtable/get-running-instances";
import StopEc2 from "../aws/stop-instance";

export const stopInstance = new Menu<MyContext>("stop-instance")
  .text("Stop an Instance", async (ctx) => {
    await ctx.reply(`loading ...`);
  })
 
