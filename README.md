# Media Share Server

A simple, modernized media sharing server for your home network with Docker support.

## Features

- 🎬 Video streaming with range request support
- 📁 Directory browsing with serve-index
- 🐳 Docker and Docker Compose ready
- 🔒 Basic security (path traversal protection)
- 💚 Health check endpoint
- 🚀 Graceful shutdown handling

## Quick Start

### Using Docker Compose (Recommended)

1. Create a `media` directory and add your media files
2. Run the server:

```bash
docker-compose up -d
```

3. Access at `http://localhost:1337`

### Manual Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `public` directory and add your media files

3. Start the server:

```bash
npm start
```

## Configuration

### Environment Variables

- `PORT` - Server port (default: 1337)
- `MEDIA_DIR` - Path to media directory (default: ./public)
- `NODE_ENV` - Environment mode (default: production)

### Docker Compose

Edit `docker-compose.yml` to:
- Change the port mapping
- Update the media volume path
- Adjust resource limits

```yaml
volumes:
  - /path/to/your/media:/media:ro  # Read-only
  # or
  - /path/to/your/media:/media     # Read-write
```

## Usage

### Browse Files
Navigate to `http://localhost:1337` to browse your media directory

### Stream Videos
Videos are automatically streamed with range support for seeking

### Health Check
Check server status at `http://localhost:1337/health`

## Commands

```bash
# Start in development mode with auto-reload
npm run dev

# Start in production mode
npm start

# Docker commands
docker-compose up -d        # Start in background
docker-compose down         # Stop server
docker-compose logs -f      # View logs
docker-compose restart      # Restart server
```

## Security Notes

- This server is designed for **home network use only**
- Do not expose directly to the internet without additional security
- Consider using a reverse proxy (nginx, Caddy) with authentication for external access
- The Docker volume is mounted read-only (`:ro`) by default to prevent modifications
