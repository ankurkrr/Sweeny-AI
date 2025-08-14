# n8n API Integration Guide

This project now includes a complete integration with your n8n backend webhook for real-time chat functionality.

## Features Implemented

### 1. n8n API Service (`client/lib/n8n-api.ts`)

A TypeScript service that handles communication with your n8n webhook:

```typescript
import { sendMessageToBot } from '@/lib/n8n-api';

// Example usage
const result = await sendMessageToBot(chatId, message, userId);
if (result.success) {
  console.log('Bot replied:', result.message.content);
} else {
  console.error('Error:', result.error);
}
```

**Configuration:**
- Endpoint: `https://ankurx.app.n8n.cloud/webhook/send-message`
- Authorization: `Bearer sk-n8n-webhook-abc123def456`

### 2. Global Window API

The `sendMessageToBot` function is also available globally on the window object:

```javascript
// Available anywhere in your app
const result = await window.sendMessageToBot(chatId, message, userId);
```

### 3. Integrated Chat System

The chat context (`client/contexts/ChatContext.tsx`) now automatically:

- Sends user messages to your n8n backend
- Displays real bot responses from your AI system
- Handles errors gracefully with user-friendly messages
- Shows typing indicators during API calls
- Uses authenticated user IDs from the auth system

### 4. Authentication Integration

- User IDs are automatically generated using `crypto.randomUUID()`
- Each chat message includes the authenticated user's ID
- Chat IDs are unique per conversation

## API Request Format

The integration sends requests in this format:

```json
{
  "body": {
    "input": {
      "chat_id": "unique-chat-id",
      "content": "user message"
    },
    "x-hasura-user-id": "user-uuid"
  }
}
```

## Expected Response Format

Your n8n webhook should respond with:

```json
{
  "id": "message-id",
  "content": "bot response text",
  "is_bot": true,
  "created_at": "2024-01-01T12:00:00Z"
}
```

## Error Handling

The integration includes comprehensive error handling:

- Network errors are caught and displayed to users
- Invalid responses are handled gracefully
- Users see helpful error messages instead of technical details
- Failed messages don't break the chat experience

## Usage Examples

### Basic Chat Message
When a user types a message, it automatically:
1. Adds the user message to the chat UI
2. Shows a typing indicator
3. Sends the message to your n8n backend
4. Receives and displays the bot response
5. Handles any errors that occur

### Manual API Call
You can also call the API directly:

```typescript
import { sendMessageToBot } from '@/lib/n8n-api';

async function sendManualMessage() {
  const chatId = "my-chat-123";
  const userId = "user-uuid-456";
  const message = "Hello, bot!";
  
  const result = await sendMessageToBot(chatId, message, userId);
  
  if (result.success) {
    console.log('Bot response:', result.message.content);
  } else {
    console.error('Failed to send message:', result.error);
  }
}
```

## Configuration

To update the n8n endpoint or authorization token, edit `client/lib/n8n-api.ts`:

```typescript
const response = await fetch('YOUR_N8N_WEBHOOK_URL', {
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN'
  },
  // ... rest of configuration
});
```

## Testing

The integration is fully functional and ready to use. When you:

1. Sign in to the application
2. Start a new chat
3. Send a message

The message will be sent to your n8n backend and the response will appear in the chat interface.

## Next Steps

- Test the integration with your n8n workflow
- Customize error messages if needed
- Add additional API endpoints as required
- Implement message persistence if desired
