import { session } from "grammy";
import { bot } from "./src/lib/config";
import type { mySessionData, SessionData } from "./src/lib/types";
import { conversations, createConversation } from "@grammyjs/conversations";
import { register } from "./src/menus/register.menus";
import { commandsComposer } from "./src/commands";
import { RegisterForm } from "./src/forms/register.form";
import { StartInstanceForm } from "./src/forms/start-instance.form";
import { startActions } from "./src/menus/start-actions.menu";
import { submit } from "./src/menus/submit-form.menu";
import { paymentMethod } from "./src/menus/make-payment.menus";
import { stopInstance } from "./src/menus/stop-instance.menu";
import { StopInstanceForm } from "./src/forms/stop.form";
import { ExtendInstanceForm } from "./src/forms/extend.form";
import { callBackQueryComposer } from "./src/callbackqueries";

export let mySesssion: mySessionData = {};

bot.use(
  session({
    initial: (): SessionData => ({
      tgId: "",
      tgUsername: "",
      email: "",
      instance: {
        instanceDomain: "",
        instanceId: "",
        instanceIp: "",
        instanceStatus: "inactive",
        instanceName: "",
        instanceDuration: 1,
        instanceType: "t4g.xlarge",
        paymentStatus: "unpaid",
        instanceTotalCost: 0,
        orderId: "",
        orderDescription: "",
        instanceDateInitiated: new Date().toISOString(),
        instanceDateExpiry: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), // 7 days from now as default
        instanceUsername: "",
        instancePassword: "",
        isInstanceTestnet: false,
        instanceEthRpcUrl: "",
      },
    }),
  })
);
bot.use(conversations());
// bot.use(instanceType);
bot.use(paymentMethod);
bot.use(createConversation(ExtendInstanceForm));
bot.use(createConversation(StartInstanceForm));
bot.use(createConversation(StopInstanceForm));
bot.use(startActions);
bot.use(submit);
bot.use(createConversation(RegisterForm));
bot.use(register);

bot.use(commandsComposer);
bot.use(callBackQueryComposer)
bot.api.setMyCommands([
  {
    command: "start",
    description: "Start Easy Node Service",
  },
  {
    command: "create_node",
    description: "Create a new node",
  },
  {
    command: "get_running",
    description: "Get running nodes",
  },
  // {
  //   command: "stop_instance",
  //   description: "Stop an instance",
  // },
  {
    command: "extend_node",
    description: "Extend a running node",
  },
  {
    command: "help",
    description: "Get help",
  },
]);

bot.start();
console.log("Bot is running");
