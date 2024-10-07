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
  ctx.session.tgId=ctx.from?.id!.toString();
  let isValid = false;
  while (!isValid) {
    await ctx.reply("Choose your rpc name:");
    ctx.session.instance!.instanceName! = await conversation.form.text()!;
    isValid = /^[a-zA-Z0-9]{2,}$/.test(ctx.session.instance!.instanceName!);
    if (!isValid)
      await ctx.reply(
        "Invalid Instance Name. It should contain at least 2 letters. Please try again."
      );
  }

    await ctx.reply("Enter your rpc domain url (example: rpc.example.com):");
    ctx.session.instance!.instanceDomain! = await conversation.form.text(
      async (ctx) => {
        await ctx.reply("Invalid Input. Please try again.");
      },
    )!;

    await ctx.reply("Enter your ethrpc node url (example: https://eth-sepolia.blockscout.com/api):");
    ctx.session.instance!.instanceEthRpcUrl! = await conversation.form.text(
      async (ctx) => {
        await ctx.reply("Invalid Input. Please try again.");
      },
    )!;

    await ctx.reply("Is this a testnet? (y/n):");
    const isTestnet = await conversation.form.select(
      ["y", "n"],
      async (ctx) => {
        await ctx.reply("Invalid Input. Please try again.");
      },
    )!;
    ctx.session.instance!.isInstanceTestnet = isTestnet === "y" ? true : false;

  await ctx.reply("Choose your vps size:", { reply_markup: instanceType });
  const selectedSize = await conversation.waitForCallbackQuery(
    ["t4g.xlarge", "t4g.2xlarge"],
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
    },
  );

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
    Testnet: ${mySesssion[ctx.from?.id!].instance!.isInstanceTestnet ? "Yes" : "No"}
    EthRPC URL: ${mySesssion[ctx.from?.id!].instance!.instanceEthRpcUrl!}
    Domain: ${mySesssion[ctx.from?.id!].instance!.instanceDomain!}
    ________________
    Total Cost: ${totalCost} USD\n
    Make Payment:`,
    {
      reply_markup: paymentMethod,
    }
  );
}



export function getDetails(instancetype: string) {
  if (instancetype === "t4g.xlarge") {
    return "16GB/RAM | RHEL ARM64 | 1TB/SSD | 4vCPU";
  } else if (instancetype === "t4g.2xlarge") {
    return "32GB/RAM | RHEL ARM64 | 1TB/SSD | 8vCPU";
  }
}
function getTotalCost(instancetype: string, duration: number) {
  if (instancetype === "t4g.xlarge") {
    return 51 * duration;
  } else if (instancetype === "t4g.2xlarge") {
    return 91 * duration;

  }
}