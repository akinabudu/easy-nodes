import type { _InstanceType } from "@aws-sdk/client-ec2";
import type { ConversationFlavor } from "@grammyjs/conversations";
import type { Context } from "grammy";

export interface SessionData {
  firstName?: string;
  lastName?: string;
  email?: string;
  tgId?: number;
  tgUsername?: string;
  polygonAddress?: string;
  polygonPrivateKey?: string;
  solanaAddress?: string;
  solanaPrivateKey?: string;
  instance?: {
    instanceId: string;
    instanceIp: string;
    instanceStatus: "active" | "inactive";
    instanceName: string;
    instanceDuration: number;
    instanceType: _InstanceType ;
    paymentStatus: "paid" | "unpaid";
    instanceTotalCost: number;
    orderId: string;
    orderDescription: string;
    instanceDateInitiated: string
    instanceDateExpiry: string
    instanceUsername: string
    instancePassword: string
  };
}

export type MyContext = Context &
  ConversationFlavor & {
    session: SessionData;
  };
export interface mySessionData {
  [key: number]: SessionData;
}
