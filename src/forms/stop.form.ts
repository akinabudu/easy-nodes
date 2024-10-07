import type { Conversation } from "@grammyjs/conversations";
import type { MyContext } from "../lib/types";
import { mySesssion } from "../../bot";
import { getRunningInstances } from "../airtable/get-running-instances";
import StopEc2 from "../aws/stop-instance";
import { UpdateInstanceState } from "../airtable/update-instance-state";

export async function StopInstanceForm(
  conversation: Conversation<MyContext>,
  ctx: MyContext
) {
  ctx.session.tgId = ctx.from!.id!.toString();

  await ctx.reply("Please enter the order ID:");
  ctx.session.instance!.orderId! = await conversation.form.text()!;
  const runningInstances = await getRunningInstances(ctx.session.tgId);
  const orderId = ctx.session.instance!.orderId!;
  if(!orderId)return
  const instanceId = orderId?runningInstances
    .find((instance) => instance.orderId === orderId)!
    .instanceId!.toString():null;
  if(!instanceId)return
  const isInstanceRunning = runningInstances.some((instance) => {
    instance.orderId === orderId;
  
  });

  if (isInstanceRunning) {
    await ctx.reply(
      "The instance is not running or does not exist. Please enter a valid instance ID."
    );
    return
  } else {
    StopInstanceFunction(ctx, instanceId, orderId);
  }
}


export async function StopInstanceFunction(ctx: MyContext, instanceId: string, orderId: string) {
    try {
        await StopEc2(instanceId);
        const updateResult = await UpdateInstanceState(orderId);
        if (updateResult) {
          await ctx.reply("Instance stopped successfully");
        } else {
          await ctx.reply("Failed to update instance state");
        }
      } catch (err) {
        console.error("Error stopping instance:", err);
        await ctx.reply("An error occurred while stopping the instance");
        }
}
