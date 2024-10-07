# Use the official Bun image as a parent image
FROM oven/bun:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the rest of your application's source code
COPY . .
# Install dependencies
RUN bun install


# Expose the port your app runs on (if applicable)
EXPOSE 3000

# Run your bot and cron job
CMD ["sh", "-c", "bun run bot.ts & bun run cron-job.ts"]
