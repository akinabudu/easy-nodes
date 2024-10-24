import { type CommandContext, InlineKeyboard } from "grammy";
import type { MyContext } from "../lib/types";
import { getRunningInstances } from "../airtable/get-running-instances";
import { getUserbyId } from "../airtable/get-user-id";
import { register } from "../menus/register.menus";
import { getDetails } from "../forms/start-instance.form";
import { mySesssion } from "../../bot";
import { stopInstance } from "../menus/stop-instance.menu";
import StopEc2 from "../aws/stop-instance";

export async function GetRunningCommand(ctx: CommandContext<MyContext>) {
  ctx.reply("Getting running nodes...");
  //check if the user is resgistered
  const memberUsename = ctx.from!.username;
  const user = await getUserbyId(ctx.from!.id.toString());
  if (!user) {
    ctx.reply("You are not registered. Please register first.");
    await ctx.reply(`Hello, ${memberUsename}. Kindly Register`, {
      reply_markup: register,
    });
    return;
  }
  ctx.session.tgId = ctx.from!.id!.toString();
  await GetRunningInstancesFunction(ctx);
}

export async function GetRunningInstancesFunction(
  ctx: MyContext
) {
  const runningInstances = await getRunningInstances(ctx.from!.id.toString());
  if (runningInstances.length === 0) {
    await ctx.reply("No running nodes found");
  }
  runningInstances.map((instance) => {
    const userId = ctx.from!.id!;
    const keyboard = new InlineKeyboard()
      .text("Stop Node", `stop_instance:${instance.instanceId}:${instance.orderId}`)
      .text("Extend Node", `extend_instance:${instance.instanceType}:${instance.orderId}:${userId}`)
      .row();

    ctx.reply(
      `
            Order ID: <code>${instance.orderId}</code>
            Name: ${instance.instanceName}
            IP: <code>${instance.instanceIp}</code>
            Type: ${getDetails(String(instance.instanceType))}
            Date Initiated: ${instance.instanceDateInitiated}
            Expiry: ${instance.instanceDateExpiry}
            Duration: ${instance.instanceDuration} days
            Total Cost: ${instance.instanceTotalCost} USD
            Username: <code>${instance.instanceUsername}</code>
            Password: <code>${instance.instancePassword}</code>
            Domain: <code>${instance.instanceDomain}</code>
            `,
      {
        parse_mode: "HTML",
        reply_markup: keyboard,
      }
    );
  });

  // console.log(runningInstances);
}
