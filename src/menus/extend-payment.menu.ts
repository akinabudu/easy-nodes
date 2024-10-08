import { Menu } from "@grammyjs/menu";
import type { MyContext } from "../lib/types";
import { mySesssion } from "../../bot";
import getPaymentMethod from "../payments/get-payment-method.payments";

export const extendPayment = new Menu<MyContext>("extend-payment")

  .text("Make Payment with Base", async (ctx) => {
    await ctx.reply(`Payment loading...`);
    const orderId = mySesssion[ctx.from?.id!].instance!.orderId;
    mySesssion[ctx.from?.id!].instance!.orderDescription = "Instance Extension";
    const totalCost = mySesssion[ctx.from?.id!].instance!.instanceTotalCost!;

    await getPaymentMethod(ctx, "base", totalCost, orderId, true);
  })
  .row()

  .text("Cancel", async (ctx) => {
    await ctx.reply("Payment cancelled");
  });
