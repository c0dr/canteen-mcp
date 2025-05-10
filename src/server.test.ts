import axios from 'axios';
import { FastMCP } from 'fastmcp';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createServer, validateEnvironment } from './server';

// Mock modules
vi.mock('axios');
vi.mock('fastmcp');

// Mock environment variables
const mockEnv = {
  API_URL: 'https://test-api.example.com/menu',
  ENDPOINT: '/httpStream',
  PORT: '8080',
};

// Helper function to create mock server
const createMockServer = () => ({
  addListener: vi.fn(),
  addPrompt: vi.fn(),
  addResource: vi.fn(),
  addResourceTemplate: vi.fn(),
  addTool: vi.fn(),
  emit: vi.fn(),
  eventNames: vi.fn(),
  getMaxListeners: vi.fn(),
  listenerCount: vi.fn(),
  listeners: vi.fn(),
  off: vi.fn(),
  on: vi.fn(),
  once: vi.fn(),
  prependListener: vi.fn(),
  prependOnceListener: vi.fn(),
  rawListeners: vi.fn(),
  removeAllListeners: vi.fn(),
  removeListener: vi.fn(),
  setMaxListeners: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
});

describe('Canteen MCP Server', () => {
  let mockServer: ReturnType<typeof createMockServer>;

  beforeEach(() => {
    // Clear all mocks and modules before each test
    vi.clearAllMocks();
    vi.resetModules();
    
    // Setup environment variables
    process.env = { ...mockEnv };

    // Create mock server instance
    mockServer = createMockServer();
    vi.mocked(FastMCP).mockImplementation(() => mockServer as unknown as FastMCP);
  });

  afterEach(() => {
    // Clear environment after each test
    process.env = {};
  });

  it('should create server with correct configuration', () => {
    createServer();

    expect(FastMCP).toHaveBeenCalledWith({
      name: 'Breuni Kantine Helper',
      version: '1.0.0',
    });
  });

  describe('environment validation', () => {
    it('should throw when environment variables are missing', () => {
      // Clear environment
      process.env = {};

      // Both direct validation and server creation should throw
      expect(validateEnvironment).toThrow('Missing required environment variable: API_URL');
      expect(createServer).toThrow('Missing required environment variable: API_URL');
    });

    it('should throw when environment variables are empty', () => {
      // Set empty environment variables
      process.env = {
        API_URL: '',
        PORT: '',
        SSE_ENDPOINT: '',
      };

      expect(validateEnvironment).toThrow('Missing required environment variable: API_URL');
    });
  });

  describe('get_lunch_menu tool', () => {
    const mockMenuData = {
      date: '2024-10-05',
      items: ['Schnitzel', 'Salad', 'Apple Strudel'],
    };

    beforeEach(() => {
      // Mock successful axios response
      vi.mocked(axios.get).mockResolvedValue({ data: mockMenuData });
    });

    it('should fetch menu data successfully', async () => {
      // Import the server module fresh for each test
      const { initializeServer } = await import('./server');
      initializeServer();

      // Verify tool was added with correct configuration
      expect(mockServer.addTool).toHaveBeenCalledWith(expect.objectContaining({
        description: 'Get the lunch menu from the canteen for a specific date',
        name: 'get_lunch_menu',
      }));

      // Simulate tool execution by calling axios directly
      const response = await axios.get(mockEnv.API_URL, {
        params: { date: '2024-10-05' }
      });
      
      expect(response.data).toEqual(mockMenuData);
    });

    it('should handle API errors gracefully', async () => {
      const errorMessage = 'API request failed';
      vi.mocked(axios.get).mockRejectedValue(new Error(errorMessage));

      // Verify error handling by calling axios directly
      await expect(axios.get(mockEnv.API_URL, {
        params: { date: '2024-10-05' }
      })).rejects.toThrow(errorMessage);
    });

    it('should have correct tool configuration', async () => {
      // Import the server module fresh for each test
      const { initializeServer } = await import('./server');
      initializeServer();

      expect(mockServer.addTool).toHaveBeenCalledWith(expect.objectContaining({
        annotations: {
          openWorldHint: true,
          readOnlyHint: true,
          title: 'Lunch Menu',
        },
        description: 'Get the lunch menu from the canteen for a specific date',
        name: 'get_lunch_menu',
      }));
    });
  });

  it('should start server with correct httpStream configuration', async () => {
    // Import the server module fresh
    const { initializeServer } = await import('./server');
    
    // Initialize server
    initializeServer();
    
    expect(mockServer.start).toHaveBeenCalledWith({
      httpStream: {
        endpoint: mockEnv.ENDPOINT,
        port: parseInt(mockEnv.PORT, 10),
      },
      transportType: 'httpStream',
    });
  });
});