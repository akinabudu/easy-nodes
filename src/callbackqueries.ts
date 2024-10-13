import { Composer, type CallbackQueryContext } from "grammy";
import type { MyContext } from "./lib/types";
import { StopInstanceFunction } from "./forms/stop.form";
import { mySesssion } from "../bot";
import type { _InstanceType } from "@aws-sdk/client-ec2";
import { setSession } from "./lib/set-session";
// import { ExtendInstanceFunction } from "./forms/extend.form";

const callBackQueryComposer = new Composer<MyContext>();


callBackQueryComposer.on("callback_query:data", async (ctx) => {
  setSession(ctx.from?.id!);
  ctx.reply("loading...");
  const data = ctx.callbackQuery.data;
  if (data.startsWith("stop_instance")) {
      const instanceId = data.split(":")[1];
      const orderId = data.split(":")[2];
      console.log("Stopping Node", data, instanceId); 
      StopInstanceFunction(ctx, instanceId, orderId);
  } else if (data.startsWith("extend_instance")) {
    const instanceType = data.split(":")[1];
    const orderId = data.split(":")[2];
    mySesssion[ctx.from?.id!].instance!.orderId = orderId;
    mySesssion[ctx.from?.id!].instance!.instanceType = instanceType as _InstanceType;
    // console.log("Extending Node", mySesssion[ctx.from?.id!].instance!.orderId,  mySesssion[ctx.from?.id!].instance!.instanceType);
    await ctx.conversation.enter("ExtendInstanceForm")
  }
  await ctx.answerCallbackQuery();
});

export { callBackQueryComposer };