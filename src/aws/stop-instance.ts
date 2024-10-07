import { client } from "../lib/aws-client";
import { TerminateInstancesCommand, type TerminateInstancesCommandInput } from "@aws-sdk/client-ec2";

export default async function StopEc2(instanceId: string): Promise<any> {
  const params: TerminateInstancesCommandInput = {
    InstanceIds: [instanceId],
  };

  try {
    const command = new TerminateInstancesCommand(params);
    const response = await client.send(command);
    if (response.TerminatingInstances && response.TerminatingInstances[0].InstanceId === instanceId) {
      return { message: `Instance ${instanceId} terminated successfully` };
    } else {
      throw new Error(`Failed to terminate instance ${instanceId}`);
    }
  } catch (error) {
    console.error(`Error terminating instance ${instanceId}:`, error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
