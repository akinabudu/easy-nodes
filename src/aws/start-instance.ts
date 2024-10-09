import { client, keyPair, securityGroup } from "../lib/aws-client";
import {
  type _InstanceType,
  RunInstancesCommand,
  type RunInstancesCommandInput,
} from "@aws-sdk/client-ec2";
import { githubRepoUrlMainnet, githubRepoUrlTestnet } from "../lib/config";

interface EC2InstanceConfig {
  amiId: string;
  instanceType: _InstanceType;
  instanceName: string;
  instanceDomain: string;
  isInstanceMainnet: boolean;
  instanceEthRpcUrl: string;
}

export default async function startEC2Instance({
  amiId,
  instanceType,
  instanceName,
  instanceDomain,
  isInstanceMainnet,
  instanceEthRpcUrl,
}: EC2InstanceConfig): Promise<
  | { instanceId: string; instanceUsername: string; instancePassword: string }
  | { error: string }
> {
  const newUsername = "ec2-user";
  const newPassword = generateRandomPassword();

  const userData = generateUserData(
    newPassword,
    instanceDomain,
    isInstanceMainnet,
    instanceEthRpcUrl
  );

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
    InstanceMarketOptions: {
      MarketType: "spot",
      SpotOptions: {
        SpotInstanceType: "persistent",
        InstanceInterruptionBehavior: "stop",
      },
    },
  };

  try {
    const command = new RunInstancesCommand(params);
    const response = await client.send(command);

    if (response.Instances && response.Instances[0].InstanceId) {
      return {
        instanceId: response.Instances[0].InstanceId,
        instanceUsername: newUsername!,
        instancePassword: newPassword!,
      };
    } else {
      throw new Error("Failed to create EC2 instance");
    }
  } catch (error) {
    console.error("Error creating EC2 instance:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

function generateUserData(
  newPassword: string,
  domain: string,
  mainnet: boolean,
  ethRpc: string
): string {
  let SSHD_CONFIG = "/etc/ssh/sshd_config";
  let DOCKER_CONFIG = "$HOME/.docker"
  let folderMainnet = "base-node-mainnet"
  let folderTestnet = "base-node-testnet"

  let repo_url = mainnet
    ? githubRepoUrlMainnet
    : githubRepoUrlTestnet;
  let repo_name = mainnet ? folderMainnet : folderTestnet;

  return `#!/bin/bash
set -e

# Function to log progress
log_progress() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a /var/log/user-data.log
}

log_progress "Starting user data script execution"

# Backup sshd_config
cp "${SSHD_CONFIG}" "${SSHD_CONFIG}.bak"
log_progress "sshd_config has been backed up."

# Enable password authentication
sed -i 's/^PasswordAuthentication no/PasswordAuthentication yes/' "${SSHD_CONFIG}"
log_progress "Password Authentication Enabled."

# Create new user and set password
echo "ec2-user:${newPassword}" | chpasswd
log_progress "User ec2-user created with password."

# Reload sshd configuration
systemctl restart sshd
log_progress "sshd restarted."

# Install Docker
sudo yum install -y docker
log_progress "Docker installed."
sudo yum update -y
sudo service docker start
sudo usermod -a -G docker ec2-user
log_progress "Docker service started and enabled."

# Install Docker Compose
sudo mkdir -p ${DOCKER_CONFIG}/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/download/v2.29.6/docker-compose-linux-aarch64 -o ${DOCKER_CONFIG}/cli-plugins/docker-compose
sudo chmod +x ${DOCKER_CONFIG}/cli-plugins/docker-compose
sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
log_progress "Docker Compose installed."

# Install git
sudo yum install -y git
log_progress "Git installed."

cd /home/ec2-user
log_progress "Changed directory to /home/ec2-user."


log_progress "Attempting to clone ${repo_url}"
if git clone "${repo_url}"; then
  cd "${repo_name}"
  log_progress "Repository cloned successfully and changed directory to ${repo_name}"
else
  log_progress "Failed to clone repository. Exiting."
  exit 1
fi



# Set OP_NODE_L1_ETH_RPC in .env
echo "" >> .env
echo "OP_NODE_L1_ETH_RPC=${ethRpc}" >> .env
log_progress "OP_NODE_L1_ETH_RPC set in .env file."

# Run docker-compose
sudo docker-compose up --build -d
log_progress "Docker-compose started."

# Wait for the service to be up
log_progress "Waiting for service to be up..."
sleep 60

# Run curl command
curl -d '{"id":0,"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["latest",false]}' \
  -H "Content-Type: application/json" http://localhost:8545
log_progress "Curl command executed."

# Install Caddy
sudo dnf config-manager --add-repo https://download.opensuse.org/repositories/home:/caddy:/stable/openSUSE_Leap_15.5/home:caddy:stable.repo
sudo dnf install -y caddy
log_progress "Caddy installed."

# Set up Caddy configuration
log_progress "Setting up Caddy configuration..."
cat << EOF > /home/ec2-user/${repo_name}/Caddyfile
${domain} {
  reverse_proxy localhost:8545
}
EOF

# Update docker-compose.yml to include Caddy
log_progress "Updating docker-compose.yml to include Caddy..."
cat << EOF >> /home/ec2-user/${repo_name}/docker-compose.yml

  caddy:
    image: caddy:2
    container_name: caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./site:/srv
      - caddy_data:/data
      - caddy_config:/config
    network_mode: host

volumes:
  caddy_data:
  caddy_config:
EOF

# Restart Docker Compose to apply changes
log_progress "Restarting Docker Compose to apply Caddy changes..."
cd /home/ec2-user/${repo_name}
sudo docker-compose down
sudo docker-compose up -d

log_progress "Caddy setup completed and Docker Compose restarted."

# Run curl command
curl -d '{"id":0,"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["latest",false]}' \
  -H "Content-Type: application/json" http://localhost:8545
log_progress "Curl command executed."


# Configure Caddy
echo "
${domain} {
  reverse_proxy localhost:8545
}
" | sudo tee /etc/caddy/Caddyfile
log_progress "Caddy configured."

# Start Caddy
sudo systemctl enable caddy
sudo systemctl start caddy
log_progress "Caddy started."

log_progress "Setup completed."
`;
}

function generateRandomPassword(length = 12): string {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
  return Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map((x) => charset[x % charset.length])
    .join("");
}


function getStorageSize(instanceType: string): number {
  if (instanceType === "t4g.xlarge") {
    return 1024;
  } else if (instanceType === "t4g.2xlarge") {
    return 1024;
  }
  return 1024;
}
