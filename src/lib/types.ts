import type { _InstanceType } from "@aws-sdk/client-ec2";
import type { ConversationFlavor } from "@grammyjs/conversations";
import type { Context } from "grammy";

export interface SessionData {
  email?: string;
  tgId?: string;
  tgUsername?: string;
  polygonAddress?: string;
  polygonPrivateKey?: string;
  solanaAddress?: string;
  solanaPrivateKey?: string;
  baseAddress?: string;
  basePrivateKey?: string;
  instance?: {
    instanceDomain: string;
    instanceId: string;
    instanceIp: string | undefined;
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
    instancePassword: string;
    isInstanceTestnet: boolean;
    instanceEthRpcUrl: string;
  };
}

export type MyContext = Context &
  ConversationFlavor & {
    session: SessionData;
  };
export interface mySessionData {
  [key: number]: SessionData;
}
