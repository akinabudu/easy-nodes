import axios from "axios";
import { mySesssion } from "../../../bot";
import { SaveOrderDetails } from "../../airtable/save-order-details";
import type { MyContext } from "../../lib/types";
import { config } from "../../lib/config";
import startEC2Instance from "../../aws/start-instance";
import { getInstancesIp } from "../../aws/get-instance-ip";
import { SaveExtensionDetails } from "../../airtable/save-extension-detail";

export const pollPaymentStatus = async (
  ctx: MyContext,
  payment_id: number,
  orderId: string,
  extend: boolean = false
) => {
  const maxAttempts = 20;
  const interval = 60000; // 1 minute

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await checkPaymentStatus(payment_id);

    if (status === "finished" || status === "confirmed") {
      await handleSuccessfulPayment(ctx, orderId, extend);
      return;
    } else if (status === "failed" || status === "expired") {
      await handleFailedPayment(ctx, orderId);
      return;
    }

    await SaveOrderDetails( mySesssion[ctx.from?.id!]);
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  await notifyAdminOfPendingPayment(ctx, orderId);
};

const checkPaymentStatus = async (payment_id: number): Promise<string> => {
  try {
    const response = await axios.get(
      `${config.nowpaymentsUrl}/payment/${payment_id}`,
      {
        headers: {
          "x-api-key": `${config.nowpaymentsApiKey}`,
        },
      }
    );
    return "finished"; // Temporarily hardcoded for testing
    // return response.data.payment_status;
  } catch (error) {
    console.error("Error checking payment status:", error);
    throw error;
  }
};

const handleSuccessfulPayment = async (
  ctx: MyContext,
  orderId: string,
  extend: boolean
) => {
  await ctx.api.sendMessage(
    config.adminUserId,
    `Payment for order <code>${orderId}</code> has been confirmed!`,{parse_mode:"HTML"}
  );
  //send message to the user
  await ctx.api.sendMessage(
    ctx.from?.id!,
    `Payment for order <code>${orderId}</code> has been confirmed!`,{parse_mode:"HTML"}
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
    `Payment for order <code>${orderId}</code> has failed or expired.`,{parse_mode:"HTML"}
  );
  await ctx.api.sendMessage(
    ctx.from?.id!,
    `Payment for order <code>${orderId}</code> has failed or expired.`,{parse_mode:"HTML"}
  );
};

const notifyAdminOfPendingPayment = async (ctx: MyContext, orderId: string) => {
  await ctx.api.sendMessage(
    config.adminUserId,
    `Payment status for order <code>${orderId}</code> is still pending. Please check later.`,{parse_mode:"HTML"}
  );
  await ctx.api.sendMessage(
    ctx.from?.id!,
    `Payment status for order <code>${orderId}</code> is still pending. Please check later.`,{parse_mode:"HTML"}
  );
};
