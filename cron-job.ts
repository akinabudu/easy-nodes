import cron from 'node-cron';
import StopEc2 from './src/aws/stop-instance';
import { UpdateInstanceState } from './src/airtable/update-instance-state';
import { getAllRunningInstances } from './src/airtable/get-all-running-instances';
import { bot } from './src/lib/config';

async function checkInstanceExpiry() {
  console.log("Checking instance expiry");
  const allRunningInstances = await getAllRunningInstances(); // Fetch all running instances
  const now = new Date();

  for (const instance of allRunningInstances) {
    const expiryDate = new Date(instance.instanceDateExpiry as string);
    const oneDayBefore = new Date(expiryDate.getTime() - 24 * 60 * 60 * 1000);

    if (now >= expiryDate) {
      // Instance has expired
      await StopEc2(instance.instanceId as string);
      await UpdateInstanceState(instance.orderId as string);
      await bot.api.sendMessage(instance.tgId as number, `Your instance ${instance.instanceName} (Order ID: ${instance.orderId}) has expired and has been terminated.`);
    } else if (now >= oneDayBefore && now < expiryDate) {
      // One day before expiry
      await bot.api.sendMessage(instance.tgId as number, `Your instance ${instance.instanceName} (Order ID: ${instance.orderId}) will expire in 24 hours. Make Payment to continue using the instance!`);
    }
  }
}


cron.schedule('0 */4 * * *', checkInstanceExpiry);
