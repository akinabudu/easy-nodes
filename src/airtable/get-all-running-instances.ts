import { airtable, config } from "../lib/config";

export async function getAllRunningInstances() {
  try {
    const records = await airtable(config.airtableOrderTableName).select({
      filterByFormula: `{instanceStatus} = 'active'`,
    }).all();
    return records.map(record => ({
      tgId: record.get('tgId'),
      orderId: record.get('orderId'),
      instanceId: record.get('instanceId'),
      instanceIp: record.get('instanceIp'),
      instanceName: record.get('instanceName'),
      instanceType: record.get('instanceType'),
      instanceDateInitiated: record.get('instanceDateInitiated'),
      instanceDateExpiry: record.get('instanceDateExpiry'),
      instanceDuration: record.get('instanceDuration'),
      instanceUsername: record.get('instanceUsername'),
      instancePassword: record.get('instancePassword'),
      instanceTotalCost: record.get('instanceTotalCost'),
    }));
  } catch (error) {
    console.error('Error fetching running instances from Airtable:', error);
    throw error;
  }
}
