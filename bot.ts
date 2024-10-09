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
import { StopInstanceForm } from "./src/forms/stop.form";
import {  ExtendInstanceForm } from "./src/forms/extend.form";
import { callBackQueryComposer } from "./src/callbackqueries";
import { extendPayment } from "./src/menus/extend-payment.menu";

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
        isInstanceMainnet: false,
        instanceEthRpcUrl: "",
      },
    }),
  })
);
bot.use(conversations());
bot.use(paymentMethod);
bot.use(extendPayment);
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
// Set bot description
// bot.api.setMyDescription("Welcome to Easy Node Service! This bot helps you manage Base nodes on AWS. You can start, stop, and extend nodes, as well as get information about running instances. Use /start to begin and explore available commands.");

// Catch any errors
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  console.error(err.error);
});


