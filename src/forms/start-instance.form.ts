import type { Conversation } from "@grammyjs/conversations";
import type { MyContext } from "../lib/types";
import { mySesssion } from "../../bot";
import { instanceType } from "../menus/instance-type.menu";
import { paymentMethod } from "../menus/make-payment.menus";
import { InlineKeyboard } from "grammy";
import type { _InstanceType } from "@aws-sdk/client-ec2";

const noDays= 30

export async function StartInstanceForm(
  conversation: Conversation<MyContext>,
  ctx: MyContext
) {
  ctx.session.tgId=ctx.from?.id!;
  let isValid = false;
  while (!isValid) {
    await ctx.reply("Choose your vps name:");
    ctx.session.instance!.instanceName! = await conversation.form.text()!;
    isValid = /^[a-zA-Z]{2,}$/.test(ctx.session.instance!.instanceName!);
    if (!isValid)
      await ctx.reply(
        "Invalid Instance Name. It should contain at least 2 letters. Please try again."
      );
  }

  await ctx.reply("Choose your vps size:", { reply_markup: instanceType });
  const selectedSize = await conversation.waitForCallbackQuery(
    ["t4g.nano", "t4g.small", "r6g.medium", "x2gd.medium"],
    {
      otherwise: async (ctx) => {
        await ctx.reply("Invalid Input. Please try again.");
      },
    }
  );
  ctx.session.instance!.instanceType! = selectedSize.update.callback_query.data as _InstanceType;

  await ctx.reply("How many weeks do you want to pay for?");
  ctx.session.instance!.instanceDuration! = await conversation.form.number(
    async (ctx) => {
      await ctx.reply("Invalid Input. Please try again.");
    }
  )!;

   const totalCost = getTotalCost(
    ctx.session.instance!.instanceType!,
    ctx.session.instance!.instanceDuration!
  );
  ctx.session.instance!.instanceTotalCost! = totalCost!;
  mySesssion[ctx.from?.id!] = ctx.session!;
  await ctx.reply(
    `Your Instance Details:
    Name: ${mySesssion[ctx.from?.id!].instance!.instanceName!}
    Type: ${getDetails(mySesssion[ctx.from?.id!].instance!.instanceType!)}
    Instance Duration: ${mySesssion[ctx.from?.id!].instance!.instanceDuration!} Weeks
    ________________
    Total Cost: ${totalCost} USD\n
    Make Payment:`,
    {
      reply_markup: paymentMethod,
    }
  );
}



export function getDetails(instancetype: string) {
  if (instancetype === "t4g.nano") {
    return "0.5GB/RAM | Amazon Linux ARM64 | 10GB/SSD | 2vCPU";
  } else if (instancetype === "t4g.small") {
    return "2GB/RAM | Amazon Linux ARM64 | 20GB/SSD | 2vCPU";
  } else if (instancetype === "r6g.medium") {
    return "8GB/RAM | Amazon Linux ARM64 | 30GB/SSD | 1vCPU";
  }else if (instancetype === "x2gd.medium") {
    return "16GB/RAM | Amazon Linux ARM64 | 50GB/SSD | 1vCPU";
  }
}
function getTotalCost(instancetype: string, duration: number) {
  if (instancetype === "t4g.nano") {
    return 1.4  * duration;
  } else if (instancetype === "t4g.small") {
    return 5.67 * duration;
  } else if (instancetype === "r6g.medium") {
    return 14.7 * duration;
  } else if (instancetype === "x2gd.medium") {
    return 28.7 *duration;
  }
}