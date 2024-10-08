import { Composer } from "grammy";
import type { MyContext } from "./lib/types";
import { StopInstanceFunction } from "./forms/stop.form";

const callBackQueryComposer = new Composer<MyContext>();


callBackQueryComposer.on("callback_query:data", async (ctx) => {
  ctx.reply("Stopping Node...");
  const data = ctx.callbackQuery.data;
  if (data.startsWith("stop_instance")) {
      const instanceId = data.split(":")[1];
      const orderId = data.split(":")[2];
      console.log("Stopping Node", data, instanceId); 
      StopInstanceFunction(ctx, instanceId, orderId);
  }
  await ctx.answerCallbackQuery();
});

export { callBackQueryComposer };