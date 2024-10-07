import { mySesssion } from "../../bot";
import { SaveExtensionDetails } from "../airtable/save-extension-detail";
import { SaveOrderDetails } from "../airtable/save-order-details";
import { getInstancesIp } from "../aws/get-instance-ip";
import startEC2Instance from "../aws/start-instance";
import { baseService, config, polygonService, solanaService } from "../lib/config";
import type { MyContext } from "../lib/types";


export const monitorPayment= async(ctx: MyContext, network: string, address: string, amount: string, orderId: string, extend: boolean = false) =>{
  let paid :number | boolean;
  const service = network === "base" ? baseService : network === "polygon" ? polygonService : solanaService ;
  const maxAttempts = 20;
  const interval = 60000; // 1 minute

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    paid = await service.checkPayment(address, amount);
    if (paid) {
      await handleSuccessfulPayment(ctx, orderId, extend);
      return;
    } 
    // else if (paid === false){
    //     await handleFailedPayment(ctx, orderId);
    //     return;
    // }

    // await SaveOrderDetails(mySesssion[ctx.from?.id!]);
    await new Promise(resolve => setTimeout(resolve, interval));
    await notifyAdminOfPendingPayment(ctx, orderId, maxAttempts - attempt - 1);
  }

}

const handleSuccessfulPayment = async (
  ctx: MyContext,
  orderId: string,
  extend: boolean
) => {
  await ctx.api.sendMessage(
    config.adminUserId,
    `Payment for order <code>${orderId}</code> has been confirmed!`, { parse_mode: "HTML" }
  );
  await ctx.api.sendMessage(
    ctx.from?.id!,
    `Payment for order <code>${orderId}</code> has been confirmed!`, { parse_mode: "HTML" }
  );

  const userId = ctx.from?.id!;
  const { instanceType, instanceName, instanceDuration, instanceDateExpiry } =
    mySesssion[userId].instance!;

  const instanceDetails = await startEC2Instance({
    amiId: "ami-0b947c5d5516fa06e",
    instanceType,
    instanceName,
  });

  if (extend) {
    await SaveExtensionDetails(orderId, instanceDuration, instanceDateExpiry);
  } else {
    await updateSessionWithInstanceDetails(
      userId,
      instanceDetails,
      instanceDuration
    );
    await provideSSHDetails(ctx, userId);
    await SaveOrderDetails(mySesssion[userId]);
  }
};

const updateSessionWithInstanceDetails = async (
  userId: number,
  instanceDetails: any,
  instanceDuration: number
) => {
  const instance = mySesssion[userId].instance!;
  instance.instanceId = instanceDetails.instanceId;
  instance.instanceUsername = instanceDetails.username;
  instance.instancePassword = instanceDetails.password;
  instance.instanceStatus = "active";
  instance.paymentStatus = "paid";
  instance.instanceDateInitiated = new Date().toISOString();
  instance.instanceDateExpiry = new Date(
    new Date().setDate(new Date().getDate() + instanceDuration)
  ).toISOString();

  const instanceIp = await getInstancesIp(instance.instanceId!);
  instance.instanceIp = instanceIp!;
};

const provideSSHDetails = async (ctx: MyContext, userId: number) => {
  const { instanceUsername, instancePassword, instanceIp } =
    mySesssion[userId].instance!;
  await ctx.reply(
    `SSH Command: <code>ssh ${instanceUsername}@${instanceIp}</code>
    Password: <code>${instancePassword}</code>
    `,
    {
      parse_mode: "HTML",
    }
  );
};

const handleFailedPayment = async (ctx: MyContext, orderId: string) => {
  await ctx.api.sendMessage(
    config.adminUserId,
    `Payment for order <code>${orderId}</code> has failed or expired.`, { parse_mode: "HTML" }
  );
  await ctx.api.sendMessage(
    ctx.from?.id!,
    `Payment for order <code>${orderId}</code> has failed or expired.`, { parse_mode: "HTML" }
  );
};

const notifyAdminOfPendingPayment = async (ctx: MyContext, orderId: string, remainingAttempts: number) => {
  const remainingMinutes = remainingAttempts;
  const message = `Payment status for order <code>${orderId}</code> is still pending. ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} remaining for payment confirmation. Please check later.`;
  
  await ctx.api.sendMessage(config.adminUserId, message, { parse_mode: "HTML" });
  await ctx.api.sendMessage(ctx.from?.id!, message, { parse_mode: "HTML" });
};