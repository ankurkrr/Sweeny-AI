# Fixed: Duplicate Key Error in Bot Message Saving

## Problem
```
Failed to save bot message: Error: Failed to save message: Uniqueness violation. duplicate key value violates unique constraint "messages_pkey"
```

## Root Cause
The n8n backend was returning message IDs (`result.message.id`) that conflicted with existing database entries, causing duplicate primary key violations when saving bot responses.

## Solution Applied

### 1. Generate Fresh UUIDs for Bot Messages
**File:** `client/contexts/ChatContext.tsx` (lines 265-277)

**Before:**
```typescript
const botMessage: Message = {
  id: result.message.id, // Using n8n's ID - PROBLEMATIC
  content: result.message.content,
  sender: 'bot',
  timestamp: new Date(result.message.created_at),
};

await saveMessage(currentChat.id, result.message.content, true, userId, result.message.id);
```

**After:**
```typescript
// Generate a fresh UUID for the bot message to avoid conflicts
const botMessageId = generateUUID();

const botMessage: Message = {
  id: botMessageId, // Using our generated UUID - SAFE
  content: result.message.content,
  sender: 'bot',
  timestamp: new Date(result.message.created_at),
};

await saveMessage(currentChat.id, result.message.content, true, userId, botMessageId);
```

### 2. Added Retry Logic for Duplicate Key Errors
**File:** `client/lib/chat-api.ts` (lines 305-318)

**Enhanced Error Handling:**
```typescript
if (data.errors) {
  const errorMessage = data.errors[0].message;
  
  // Handle duplicate key errors specifically
  if (errorMessage.includes('duplicate key value violates unique constraint') || 
      errorMessage.includes('messages_pkey')) {
    // Try again with a new UUID
    console.warn('Duplicate message ID detected, retrying with new UUID...');
    const newMessageId = generateUUID();
    return saveMessage(chatId, content, isBot, userId, newMessageId);
  }
  
  throw new Error(`Failed to save message: ${errorMessage}`);
}
```

## Key Benefits
✅ **Eliminates duplicate key violations** by using frontend-generated UUIDs
✅ **Maintains n8n integration** while preventing ID conflicts  
✅ **Includes retry mechanism** as backup protection
✅ **Preserves all existing functionality** (user messages, bot responses, chat flow)

## Testing
To test the fix:
1. Start the chat application
2. Send multiple messages to trigger bot responses
3. Verify no duplicate key errors occur
4. Confirm messages save correctly to database

The fix ensures reliable message storage while maintaining seamless integration with your n8n backend workflow.
