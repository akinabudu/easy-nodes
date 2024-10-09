import { client } from "../lib/aws-client";
import {
  TerminateInstancesCommand,
  DescribeSpotInstanceRequestsCommand,
  CancelSpotInstanceRequestsCommand,
} from "@aws-sdk/client-ec2";

export default async function StopEc2(instanceId: string): Promise<any> {
  try {
    await terminateEC2Instance(instanceId);
    return { message: `Instance ${instanceId} and its Spot request have been terminated successfully` };
  } catch (error) {
    console.error(`Error terminating instance ${instanceId}:`, error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function terminateEC2Instance(instanceId: string): Promise<void> {
  try {
    // First, cancel the Spot request associated with the instance
    const describeSpotInstanceRequestsCommand = new DescribeSpotInstanceRequestsCommand({
      Filters: [
        {
          Name: "instance-id",
          Values: [instanceId],
        },
      ],
    });
    const spotRequests = await client.send(describeSpotInstanceRequestsCommand);
    
    if (spotRequests.SpotInstanceRequests && spotRequests.SpotInstanceRequests.length > 0) {
      const spotRequestId = spotRequests.SpotInstanceRequests[0].SpotInstanceRequestId;
      const cancelSpotInstanceRequestsCommand = new CancelSpotInstanceRequestsCommand({
        SpotInstanceRequestIds: [spotRequestId!],
      });
      await client.send(cancelSpotInstanceRequestsCommand);
    }

    // Then, terminate the instance
    const terminateInstancesCommand = new TerminateInstancesCommand({
      InstanceIds: [instanceId],
    });
    await client.send(terminateInstancesCommand);

    console.log(`Instance ${instanceId} and its Spot request have been terminated.`);
  } catch (error) {
    console.error("Error terminating EC2 instance:", error);
    throw error;
  }
}
