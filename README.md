# Canteen MCP

A Model Context Protocol (MCP) server that provides access to the canteen's lunch menu via a simple API integration.

## Description

Canteen MCP is a FastMCP-based server that exposes a tool for retrieving daily lunch menus from the canteen. It connects to a menu API and provides a structured interface for querying menu data for specific dates.

## Features

- Get lunch menu for any specific date
- httpStream-based transport for real-time communication
- Environment-based configuration
- Type-safe API with input validation

## Installation

```bash
npm install
```

## Configuration

Copy the example environment file and update it with your values:

```bash
cp .env.example .env
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| API_URL | URL of the lunch menu API | https://lunch-menu-ai.vercel.app/api/v1/menu |
| PORT | Port for the MCP server | 8080 |
| ENDPOINT | HTTP endpoint | /endpoint |

## Usage

Start the server:

```bash
npm start
```

### Available Tools

#### get_lunch_menu

Retrieves the lunch menu for a specific date.

- **Parameters**:
  - `date`: String in YYYY-MM-DD format
- **Returns**: JSON string containing the menu data
- **Example**:
  ```typescript
  const result = await tool.execute({ date: "2024-10-05" });
  ```

## Development

### Prerequisites

- Node.js >= 18
- npm

### Running in Development Mode

```bash
npm run dev
```

## Docker

### Building the Image

```bash
docker build -t canteen-mcp .
```

### Running the Container

```bash
docker run -d \
  -p 8080:3000 \
  -e API_URL=your_api_url \
  -e PORT=3000 \
  -e ENDPOINT=/http \
  --name canteen-mcp \
  canteen-mcp
```

### Using GitHub Container Registry

Pull the latest image:
```bash
docker pull ghcr.io/[your-username]/canteen-mcp:latest
```

## Deployment

### Deploying to Hetzner

1. SSH into your Hetzner server:
```bash
ssh root@your-server-ip
```

2. Install Docker if not already installed:
```bash
curl -fsSL https://get.docker.com | sh
```

3. Create a docker-compose.yml file:
```yaml
version: '3.8'
services:
  canteen-mcp:
    image: ghcr.io/c0dr/canteen-mcp:latest
    restart: always
    ports:
      - "8080:3000"
    environment:
      - API_URL=your_api_url
      - PORT=3000
      - ENDPOINT=/http
```

4. Start the service:
```bash
docker-compose up -d
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

Based on https://github.com/punkpeye/fastmcp-boilerplate