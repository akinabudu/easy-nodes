import { Bot } from "grammy";
import type { MyContext } from "./types";
import Airtable from "airtable";
import { SolanaUSDTService } from "../payments/solana-payments/solana.payments";
import { PolygonUSDTService } from "../payments/polygon-payments/polygon.payments";
import { BaseUSDCService } from "../payments/base-payments/base.payment";
import dotenv from "dotenv";

dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN!,

  airatableApiKey: process.env.AIRTABLE_API_KEY!,
  airtableBaseId: process.env.AIRTABLE_BASE_ID!,
  airtableUrl: process.env.AIRTABLE_URL!,
  airtableOrderTableId: process.env.AIRTABLE_ORDER_TABLEID!,
  airtableOrderTableName: process.env.AIRTABLE_ORDER_TABLENAME!,
  airtableUserTableId: process.env.AIRTABLE_USER_TABLEID!,
  airtableUserTableName: process.env.AIRTABLE_USER_TABLENAME!,

  adminUserId: Number(process.env.ADMIN_USER_ID),
};

// Initialize clients
export const bot = new Bot<MyContext>(config.botToken);

export const airtable = new Airtable({ apiKey: config.airatableApiKey }).base(
  config.airtableBaseId
);

export const polygonService = new PolygonUSDTService(process.env.RPC_URL_POLYGON!);
export const solanaService = new SolanaUSDTService(process.env.RPC_URL_SOLANA!);
export const baseService = new BaseUSDCService(process.env.RPC_URL_BASE!);

export const githubRepoUrlMainnet = process.env.GITHUB_REPO_URL_MAINNET!;
export const githubRepoUrlTestnet = process.env.GITHUB_REPO_URL_TESTNET!;
