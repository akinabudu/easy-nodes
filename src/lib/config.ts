import { Bot } from "grammy";
import type { MyContext } from "./types";
import Airtable from "airtable";
import { SolanaUSDTService } from "../payments/solana-payments/solana.payments";
import { PolygonUSDTService } from "../payments/polygon-payments/polygon.payments";
import { BaseUSDCService } from "../payments/base-payments/base.payment";

export const config = {
  botToken: String(process.env.BOT_TOKEN),

  airatableApiKey: String(process.env.AIRTABLE_API_KEY),
  airtableBaseId: String(process.env.AIRTABLE_BASE_ID),
  airtableUrl: String(process.env.AIRTABLE_URL),
  airtableOrderTableId: String(process.env.AIRTABLE_ORDER_TABLEID),
  airtableOrderTableName: String(process.env.AIRTABLE_ORDER_TABLENAME),
  airtableUserTableId: String(process.env.AIRTABLE_USER_TABLEID),
  airtableUserTableName: String(process.env.AIRTABLE_USER_TABLENAME),

  adminUserId: Number(process.env.ADMIN_USER_ID),


};
// Initialize clients
export const bot = new Bot<MyContext>(config.botToken);

export const airtable = new Airtable({ apiKey: config.airatableApiKey }).base(
  config.airtableBaseId
);

export const polygonService = new PolygonUSDTService(String(process.env.RPC_URL_POLYGON));
export const solanaService = new SolanaUSDTService(String(process.env.RPC_URL_SOLANA));
export const baseService = new BaseUSDCService(String(process.env.RPC_URL_BASE));
