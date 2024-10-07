import type { Conversation } from "@grammyjs/conversations";
import type { MyContext } from "../lib/types";
import type { _InstanceType } from "@aws-sdk/client-ec2";
import { mySesssion } from "../../bot";
import { paymentMethod } from "../menus/make-payment.menus";
import { getRunningInstances } from "../airtable/get-running-instances";
import { extendPayment } from "../menus/extend-payment.menu";

export async function ExtendInstanceForm(
  conversation: Conversation<MyContext>,
  ctx: MyContext
) {
  ctx.session.tgId = ctx.from!.id!.toString();
  
  const orderId = await getValidOrderId(conversation, ctx);
  if (!orderId) return; // Exit if no valid order ID

  const instanceDuration = await getInstanceDuration(conversation, ctx);
  
  const totalCost = calculateTotalCost(ctx.session.instance!.instanceType!, instanceDuration);
  
  updateSessionAndReply(ctx, orderId, instanceDuration, totalCost);
}

async function getValidOrderId(conversation: Conversation<MyContext>, ctx: MyContext): Promise<string | null> {
  while (true) {
    await ctx.reply("Please enter the order ID:");
    const orderId = await conversation.form.text();
    
    const runningInstances = await getRunningInstances(ctx.session.tgId!);
    const instance = runningInstances.find((instance) => instance.orderId === orderId);
    
    if (instance) {
      ctx.session.instance!.orderId = orderId;
      ctx.session.instance!.instanceId = instance.instanceId!.toString();
      ctx.session.instance!.instanceType = instance.instanceType as _InstanceType;
      return orderId;
    } else {
      await ctx.reply("The instance is not running or does not exist. Please enter a valid order ID.");
      return null;
    }
  }
}

async function getInstanceDuration(conversation: Conversation<MyContext>, ctx: MyContext): Promise<number> {
  await ctx.reply("How many days do you want to pay for?");
  return await conversation.form.number(async () => {
    await ctx.reply("Invalid Input. Please try again.");
  });
}

function calculateTotalCost(instanceType: string, duration: number): number {
  const costPerDay = {
    "t4g.small": 10,
    "t4g.medium": 20,
    "t4g.large": 40
  };
  return (costPerDay[instanceType as keyof typeof costPerDay] || 0) * duration;
}

async function updateSessionAndReply(ctx: MyContext, orderId: string, instanceDuration: number, totalCost: number) {
  ctx.session.instance!.instanceDuration = instanceDuration;
  ctx.session.instance!.instanceTotalCost = totalCost;
  mySesssion[ctx.from?.id!] = ctx.session!;

  await ctx.reply(
    `Your Instance Details:
    Order ID: ${orderId}
    Instance Duration: ${instanceDuration} Days

    ________________
    Total Cost: ${totalCost} USD

    Choose your payment method:`,
    {
      reply_markup: extendPayment,
    }
  );
}