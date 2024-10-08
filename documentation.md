# Base Node Deployment Bot Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Setup](#setup)
3. [Architecture](#architecture)
4. [Key Components](#key-components)
5. [User Flow](#user-flow)
6. [Commands](#commands)
7. [Payment Processing](#payment-processing)
8. [Instance Management](#instance-management)
9. [Data Storage](#data-storage)
10. [Deployment](#deployment)

## Introduction
The Base Node Deployment Bot is a Telegram bot that automates the process of deploying and managing Base nodes on AWS EC2 instances. It provides an easy-to-use interface for users to create, monitor, stop, and extend the runtime of their Base nodes.

## Setup
To set up the project:
1. Clone the repository
2. Install dependencies using `bun install`
3. Set up environment variables (see `.env.example`)
4. Run the bot using `bun run bot.ts`
5. Run the cron job using `bun run cron-job.ts`

## Architecture
The project is built using Bun as the JavaScript runtime and uses the Grammy library for Telegram bot functionality. It interacts with AWS EC2 for instance management and Airtable for data storage.

## Key Components
- `bot.ts`: Main entry point for the Telegram bot
- `cron-job.ts`: Handles periodic tasks like checking instance expiry
- `src/commands/`: Contains command handlers
- `src/forms/`: Implements conversation flows for user interactions
- `src/menus/`: Defines menu structures for the bot
- `src/payments/`: Handles payment processing and monitoring
- `src/aws/`: Manages AWS EC2 instance operations
- `src/airtable/`: Interfaces with Airtable for data storage

## User Flow
1. User starts the bot and registers
2. User initiates node creation
3. User selects node configuration
4. User makes payment
5. Bot deploys the node and provides access details
6. User can monitor, stop, or extend the node

## Commands
- `/start`: Initiates the bot
- `/create_node`: Starts the node creation process
- `/get_running`: Lists running nodes
- `/extend_node`: Extends the runtime of a node
- `/help`: Provides help information

## Payment Processing
The bot uses USDC on the Base network for payments. It generates a unique address for each transaction and monitors for incoming payments.

## Instance Management
AWS EC2 instances are created, monitored, and terminated using the AWS SDK. The bot handles instance creation, status updates, and automatic termination upon expiry.

## Data Storage
User data, node configurations, and transaction details are stored in Airtable. The bot interacts with Airtable to persist and retrieve data.

## Deployment
The project includes a Dockerfile for easy deployment. It can be deployed to any platform that supports Docker containers.

To build and run the Docker container: