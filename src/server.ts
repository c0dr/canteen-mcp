import axios from "axios";
import dotenv from "dotenv";
import { FastMCP } from "fastmcp";
import { z } from "zod";

// Load environment variables
dotenv.config();

// Function to create and configure server
export function createServer(): FastMCP {
  // Validate environment before creating server
  validateEnvironment();

  return new FastMCP({
    name: "Breuni Kantine Helper",
    version: "1.0.0",
  });
}

// Function to validate environment variables
export function validateEnvironment(): void {
  const requiredEnvVars = ['API_URL', 'PORT', 'ENDPOINT'];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar] || process.env[envVar].trim() === '') {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}

// Create the server instance
export const server = createServer();

// Function to configure and start the server
export function initializeServer(): void {
  server.addTool({
    annotations: {
      openWorldHint: true, // This tool interacts with external API
      readOnlyHint: true, // This tool doesn't modify anything
      title: "Lunch Menu",
    },
    description: "Get the lunch menu from the canteen for a specific date",
    execute: async (args) => {
      try {
        const response = await axios.get(process.env.API_URL!, {
          params: { date: args.date }
        });
        return JSON.stringify(response.data, null, 2);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(`Failed to fetch menu: ${error.message}`);
        }
        throw error;
      }
    },
    name: "get_lunch_menu",
    parameters: z.object({
      date: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
        .describe("The date to get the menu for (YYYY-MM-DD)"),
    }),
  });

  server.start({
    sse: {
      endpoint: process.env.ENDPOINT as `/${string}`,
      port: parseInt(process.env.PORT!, 10),
    },
    transportType: "sse",
  });
}
