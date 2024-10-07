import { Menu } from "@grammyjs/menu";
import type { MyContext } from "../lib/types";
// import NowPayments from "../payments/now-payments/now";
import { mySesssion } from "../../bot";
// import { pollPaymentStatus } from "../payments/now-payments/polling-request";
import getPaymentMethod from "../payments/get-payment-method.payments";

export const extendPayment = new Menu<MyContext>("extend-payment")

.text("Make Payment with Base", async (ctx) => {
  await ctx.reply(`Payment loading...`)
  const orderId= mySesssion[ctx.from?.id!].instance!.orderId 
  mySesssion[ctx.from?.id!].instance!.orderDescription = "Instance Extension"
  const totalCost = mySesssion[ctx.from?.id!].instance!.instanceTotalCost!
  // await NowPayments(ctx,totalCost,"btc",orderId).then(async(res:any)=>{
  //  await pollPaymentStatus(ctx,res,mySesssion[ctx.from?.id!].instance!.orderId!,true)
  // })
  await getPaymentMethod(ctx,"base",totalCost,orderId,true)

  // console.log("making payment...")
}).row()
// .text("Make Payment with Solana", async (ctx) => {
//   await ctx.reply(`Payment loading...`)
//   const orderId= mySesssion[ctx.from?.id!].instance!.orderId 
//   mySesssion[ctx.from?.id!].instance!.orderDescription = "Instance Extension"
//   const totalCost = mySesssion[ctx.from?.id!].instance!.instanceTotalCost!
//   // await NowPayments(ctx,totalCost,"btc",orderId).then(async(res:any)=>{
//   //  await pollPaymentStatus(ctx,res,mySesssion[ctx.from?.id!].instance!.orderId!,true)
//   // })
//   await getPaymentMethod(ctx,"solana",totalCost,orderId,true)

//   console.log("making payment...")
// }).row()
.text("Cancel", async (ctx) => {
  await ctx.reply("Payment cancelled")
})

