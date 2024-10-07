import { Menu } from "@grammyjs/menu";
import type { MyContext } from "../lib/types";
import { mySesssion } from "../../bot";
import { startActions } from "./start-actions.menu";
import { SaveUser } from "../airtable/save-user";

export const submit = new Menu<MyContext>("submit-form")
  .text("Submit", async (ctx) => {
    await ctx.reply(`Submitted ...`);
    await SaveUser(ctx, mySesssion[ctx.from!.id]);
    //initiate start actions menu
    await ctx.reply(`How may I be of Help`, { reply_markup: startActions });
  })
  .row()
  .text("Cancel", (ctx) => ctx.editMessageText("Cancelled"));