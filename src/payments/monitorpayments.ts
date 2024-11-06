import { mySesssion } from "../../bot";
import { SaveExtensionDetails } from "../airtable/save-extension-detail";
import { SaveOrderDetails } from "../airtable/save-order-details";
import { getInstancesIp } from "../aws/get-instance-ip";
import startEC2Instance from "../aws/start-instance";
import { baseService, config, polygonService, solanaService } from "../lib/config";
import type { MyContext } from "../lib/types";

export const monitorPayment = async (ctx: MyContext, network: string, address: string, amount: string, orderId: string, extend: boolean = false) => {
  try {
    const service = getServiceByNetwork(network);
    const maxAttempts = 20;
    const interval = 300000; // 5 minutes

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const paid = await service.checkPayment(address, amount);
        if (paid) {
          await handleSuccessfulPayment(ctx, orderId, extend);
          return;
        }

        await delay(interval);
        await notifyOfPendingPayment(ctx, orderId, maxAttempts - attempt - 5);
      } catch (error) {
        console.error(`Error in payment check attempt ${attempt + 1}:`, error);
      }
    }

    await handleFailedPayment(ctx, orderId);
  } catch (error) {
    console.error("Error in monitorPayment:", error);
    await ctx.reply("An error occurred while monitoring the payment. Please contact support.");
  }
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
  try {
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
      await updateSessionWithInstanceDetails(userId, instanceDetails!, instanceDuration);
      await provideSSHDetails(ctx, userId);
      await SaveOrderDetails(mySesssion[userId]);
    }
  } catch (error) {
    console.error("Error in handleSuccessfulPayment:", error);
    await ctx.reply("An error occurred while processing your payment. Please contact support.");
  }
};

const sendPaymentConfirmation = async (ctx: MyContext, orderId: string) => {
  try {
    const message = `Payment for order <code>${orderId}</code> has been confirmed!`;
    await Promise.all([
      ctx.api.sendMessage(config.adminUserId, message, { parse_mode: "HTML" }),
      ctx.api.sendMessage(ctx.from?.id!, message, { parse_mode: "HTML" })
    ]);
  } catch (error) {
    console.error("Error in sendPaymentConfirmation:", error);
  }
};

const updateSessionWithInstanceDetails = async (userId: number, instanceDetails: any, instanceDuration: number) => {
  try {
    const instance = mySesssion[userId].instance!;
    Object.assign(instance, {
      ...instanceDetails,
      instanceStatus: "active",
      paymentStatus: "paid",
      instanceDateInitiated: new Date().toISOString(),
      instanceDateExpiry: new Date(Date.now() + instanceDuration * 24 * 60 * 60 * 1000).toISOString(),
    });

    await delay(5000); // Wait for 5 seconds
    console.log("instanceDetails created", instanceDetails);
    instance.instanceIp = await getInstancesIp(instance.instanceId!);
  } catch (error) {
    console.error("Error in updateSessionWithInstanceDetails:", error);
  }
};

const provideSSHDetails = async (ctx: MyContext, userId: number) => {
  try {
    const { instanceUsername, instancePassword, instanceIp, instanceDomain } = mySesssion[userId].instance!;
    await ctx.reply(
      `SSH Command:\nRpc Url: <code>${instanceDomain}</code>\n\n<code>ssh ${instanceUsername}@${instanceIp}</code>\nPassword: <code>${instancePassword}</code>`,
      { parse_mode: "HTML" }
    );
    await ctx.reply(`Please use the above details to connect to your node. Your RPC node might take a few minutes to initialize.`);
    await delay(300000);
    await ctx.reply("Your node is ready!");
  } catch (error) {
    console.error("Error in provideSSHDetails:", error);
    await ctx.reply("An error occurred while providing SSH details. Please contact support.");
  }
};

const handleFailedPayment = async (ctx: MyContext, orderId: string) => {
  try {
    const message = `Payment for order <code>${orderId}</code> has failed or expired.`;
    await Promise.all([
      ctx.api.sendMessage(config.adminUserId, message, { parse_mode: "HTML" }),
      ctx.api.sendMessage(ctx.from?.id!, message, { parse_mode: "HTML" })
    ]);
  } catch (error) {
    console.error("Error in handleFailedPayment:", error);
  }
};

const notifyOfPendingPayment = async (ctx: MyContext, orderId: string, remainingAttempts: number) => {
  try {
    const remainingMinutes = remainingAttempts;
    const message = `Payment status for order <code>${orderId}</code> is still pending. ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} remaining for payment confirmation. Please check later.`;
    
    await Promise.all([
      ctx.api.sendMessage(config.adminUserId, message, { parse_mode: "HTML" }),
      ctx.api.sendMessage(ctx.from?.id!, message, { parse_mode: "HTML" })
    ]);
  } catch (error) {
    console.error("Error in notifyOfPendingPayment:", error);
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));