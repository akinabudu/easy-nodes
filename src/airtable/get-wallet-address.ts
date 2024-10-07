import { airtable, config } from "../lib/config";

export async function getWalletAddress(tgId: number, network: string):Promise<string | null> {
  try {
    const records = await airtable(config.airtableUserTableName)
      .select({
        filterByFormula: `{tgId} = '${tgId}'`,
      })
      .all();

    if (records.length > 0) {
      if (network === "polygon") {
        const polygonAddress = records[0].get("polygonAddress");
        return polygonAddress as string;
      } else {
        const solanaAddress = records[0].get("solanaAddress");
        return solanaAddress as string;
      }
    }

    return null; // Return null if no matching record is found
  } catch (error) {
    console.error("Error fetching wallet address:", error);
    throw error;
  }
}
