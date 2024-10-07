import { client, keyPair, securityGroup } from "../lib/aws-client";
import {
  type _InstanceType,
  RunInstancesCommand,
  type RunInstancesCommandInput,
} from "@aws-sdk/client-ec2";

interface EC2InstanceConfig {
  amiId: string;
  instanceType: _InstanceType;
  instanceName: string;
}

export default async function startEC2Instance({
  amiId,
  instanceType,
  instanceName,
}: EC2InstanceConfig): Promise<{ instanceId: string; username: string; password: string } | { error: string }> {
  const newUsername = "ec2-user";
  const newPassword = generateRandomPassword();

  const userData = generateUserData( newPassword);

  const params: RunInstancesCommandInput = {
    KeyName: keyPair,
    SecurityGroupIds: [securityGroup],
    ImageId: amiId,
    InstanceType: instanceType,
    BlockDeviceMappings: [
      {
        DeviceName: "/dev/xvda",
        Ebs: {
          VolumeSize: getStorageSize(instanceType),
          VolumeType: "gp3",
          DeleteOnTermination: true,
        },
      },
    ],
    MinCount: 1,
    MaxCount: 1,
    UserData: Buffer.from(userData).toString("base64"),
    TagSpecifications: [
      {
        ResourceType: "instance",
        Tags: [{ Key: "Name", Value: instanceName }],
      },
    ],
  };

  try {
    const command = new RunInstancesCommand(params);
    const response = await client.send(command);
    
    if (response.Instances && response.Instances[0].InstanceId) {
      return { 
        instanceId: response.Instances[0].InstanceId, 
        username: newUsername!, 
        password: newPassword! 
      };
    } else {
      throw new Error("Failed to create EC2 instance");
    }
  } catch (error) {
    console.error("Error creating EC2 instance:", error);
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

function generateUserData( newPassword: string): string {
  let SSHD_CONFIG="/etc/ssh/sshd_config"
  return `#!/bin/bash
set -e


# Backup sshd_config
cp "${SSHD_CONFIG}" "${SSHD_CONFIG}.bak"
echo "sshd_config has been backed up."

# Enable password authentication
sed -i 's/^PasswordAuthentication no/PasswordAuthentication yes/' "${SSHD_CONFIG}"
echo "Password Authentication Enabled."

# Create new user and set password
echo "ec2-user:${newPassword}" | chpasswd
echo "User ec2-user created with password."

# Reload sshd configuration
systemctl restart sshd
echo "sshd restarted."

sudo yum install -y docker
echo "Docker installed."

sudo systemctl start docker
sudo systemctl enable docker
echo "Docker service started and enabled."

echo "Script execution completed."
`;
}

function generateRandomPassword(length = 12): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
  return Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map((x) => charset[x % charset.length])
    .join('');
}

// function generateRandomUsername(): string {
//   const instancePrefix = Math.random().toString(36).substring(2, 5).toLowerCase();
//   const userPrefix = Math.random().toString(36).substring(2, 5).toLowerCase();
//   const randomSuffix = Math.random().toString(36).substring(2, 5);
//   return `${instancePrefix}${userPrefix}${randomSuffix}`;
// }

function getStorageSize(instanceType: string): number {
if (instanceType === "t4g.nano") {
  return 10;
} else if (instanceType === "t4g.small") {
  return 20;
} else if (instanceType === "r6g.medium") {
  return 30;
} else if (instanceType === "x2gd.medium") {
  return 40;
}
return 20;
}