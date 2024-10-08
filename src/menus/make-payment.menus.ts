import { Menu } from "@grammyjs/menu";
import type { MyContext } from "../lib/types";
import { mySesssion } from "../../bot";
import getPaymentMethod from "../payments/get-payment-method.payments";

export const paymentMethod = new Menu<MyContext>("pay-method")

.text("Make Payment on Base", async (ctx) => {
  await ctx.reply(`Payment loading...`)
  const orderId = generateOrderId()
  mySesssion[ctx.from!.id!].instance!.orderId = orderId
  mySesssion[ctx.from!.id!].instance!.orderDescription = "Payment for the node"
  const totalCost = mySesssion[ctx.from?.id!].instance!.instanceTotalCost!
 
  await getPaymentMethod(ctx,"base",totalCost,orderId,false)

}).row()

.text("Cancel", async (ctx) => {
  await ctx.reply("Payment cancelled")
})


//create a simple function that will generate unique order id
const generateOrderId = () => {
  return Math.random().toString(36).substring(2, 15);
};




