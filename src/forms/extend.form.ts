import type { Conversation } from "@grammyjs/conversations";
import type { MyContext } from "../lib/types";
import type { _InstanceType } from "@aws-sdk/client-ec2";
import { mySesssion } from "../../bot";
import { getRunningInstances } from "../airtable/get-running-instances";
import { extendPayment } from "../menus/extend-payment.menu";

export async function ExtendInstanceForm(
  conversation: Conversation<MyContext>,
  ctx: MyContext
) {
  ctx.session.tgId = ctx.from!.id!.toString();

  const orderId = mySesssion[ctx.from?.id!].instance!.orderId;

  const instanceDuration = await getInstanceDuration(conversation, ctx);

  const totalCost = calculateTotalCost(
    ctx.session.instance!.instanceType!,
    instanceDuration
  );

  updateSessionAndReply(ctx, orderId, instanceDuration, totalCost);
}

async function getInstanceDuration(
  conversation: Conversation<MyContext>,
  ctx: MyContext
): Promise<number> {
  await ctx.reply("How many days do you want to pay for?");
  return await conversation.form.number(async () => {
    await ctx.reply("Invalid Input. Please try again.");
  });
}

function calculateTotalCost(instanceType: string, duration: number): number {
  const costPerDay = {
    "t4g.xlarge": 51,
    "t4g.2xlarge": 91,
  };
  return (costPerDay[instanceType as keyof typeof costPerDay] || 0) * duration;
}

async function updateSessionAndReply(
  ctx: MyContext,
  orderId: string,
  instanceDuration: number,
  totalCost: number
) {
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
