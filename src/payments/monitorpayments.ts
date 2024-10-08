import { mySesssion } from "../../bot";
import { SaveExtensionDetails } from "../airtable/save-extension-detail";
import { SaveOrderDetails } from "../airtable/save-order-details";
import { getInstancesIp } from "../aws/get-instance-ip";
import startEC2Instance from "../aws/start-instance";
import { baseService, config, polygonService, solanaService } from "../lib/config";
import type { MyContext } from "../lib/types";

export const monitorPayment = async (ctx: MyContext, network: string, address: string, amount: string, orderId: string, extend: boolean = false) => {
  const service = getServiceByNetwork(network);
  const maxAttempts = 20;
  const interval = 60000; // 1 minute

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const paid = await service.checkPayment(address, amount);
    if (paid) {
      await handleSuccessfulPayment(ctx, orderId, extend);
      return;
    }

    await delay(interval);
    await notifyOfPendingPayment(ctx, orderId, maxAttempts - attempt - 1);
  }

  await handleFailedPayment(ctx, orderId);
};

const getServiceByNetwork = (network: string) => {
  switch (network) {
    case "base": return baseService;
    case "polygon": return polygonService;
    case "solana": return solanaService;
    default: throw new Error(`Unsupported network: ${network}`);
  }
};

const handleSuccessfulPayment = async (ctx: MyContext, orderId: string, extend: boolean) => {
  console.log("Handling successful payment");
  await ctx.reply("Payment confirmed! Starting your node...");
  await sendPaymentConfirmation(ctx, orderId);

  const userId = ctx.from!.id!;
  const { instanceType, instanceName, instanceDuration, instanceDateExpiry, instanceDomain, instanceEthRpcUrl, isInstanceMainnet } = mySesssion[userId].instance!;

  const instanceDetails = await startEC2Instance({
    amiId: "ami-0b947c5d5516fa06e",
    instanceType,
    instanceName : instanceName || '',
    instanceDomain : instanceDomain || '',
    instanceEthRpcUrl: instanceEthRpcUrl || '',
    isInstanceMainnet: isInstanceMainnet
  });

  if (extend) {
    await SaveExtensionDetails(orderId, instanceDuration, instanceDateExpiry);
  } else {
    await updateSessionWithInstanceDetails(userId, instanceDetails, instanceDuration);
    await provideSSHDetails(ctx, userId);
    await SaveOrderDetails(mySesssion[userId]);
  }
};

const sendPaymentConfirmation = async (ctx: MyContext, orderId: string) => {
  const message = `Payment for order <code>${orderId}</code> has been confirmed!`;
  await Promise.all([
    ctx.api.sendMessage(config.adminUserId, message, { parse_mode: "HTML" }),
    ctx.api.sendMessage(ctx.from?.id!, message, { parse_mode: "HTML" })
  ]);
};

const updateSessionWithInstanceDetails = async (userId: number, instanceDetails: any, instanceDuration: number) => {
  const instance = mySesssion[userId].instance!;
  Object.assign(instance, {
    ...instanceDetails,
    instanceStatus: "active",
    paymentStatus: "paid",
    instanceDateInitiated: new Date().toISOString(),
    instanceDateExpiry: new Date(Date.now() + instanceDuration *7* 24 * 60 * 60 * 1000).toISOString(),
    
  });

  instance.instanceIp = await getInstancesIp(instance.instanceId!);
};

const provideSSHDetails = async (ctx: MyContext, userId: number) => {
  const { instanceUsername, instancePassword, instanceIp, instanceDomain } = mySesssion[userId].instance!;
  await ctx.reply(
    `SSH Command:\nRpc Url: <code>${instanceDomain}</code>\n\n<code>ssh ${instanceUsername}@${instanceIp}</code>\nPassword: <code>${instancePassword}</code>`,
    { parse_mode: "HTML" }
  );
  await ctx.reply(`Please use the above details to connect to your node. Your RPC node  might take a some minutes to initialize.`);
};

const handleFailedPayment = async (ctx: MyContext, orderId: string) => {
  const message = `Payment for order <code>${orderId}</code> has failed or expired.`;
  await Promise.all([
    ctx.api.sendMessage(config.adminUserId, message, { parse_mode: "HTML" }),
    ctx.api.sendMessage(ctx.from?.id!, message, { parse_mode: "HTML" })
  ]);
};

const notifyOfPendingPayment = async (ctx: MyContext, orderId: string, remainingAttempts: number) => {
  const remainingMinutes = remainingAttempts;
  const message = `Payment status for order <code>${orderId}</code> is still pending. ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} remaining for payment confirmation. Please check later.`;
  
  await Promise.all([
    ctx.api.sendMessage(config.adminUserId, message, { parse_mode: "HTML" }),
    ctx.api.sendMessage(ctx.from?.id!, message, { parse_mode: "HTML" })
  ]);
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));