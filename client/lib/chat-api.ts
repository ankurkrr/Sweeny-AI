import { generateUUID } from './uuid';

export interface ChatData {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface MessageData {
  id: string;
  chat_id: string;
  content: string;
  is_bot: boolean;
  user_id: string;
  created_at: string;
}

const GRAPHQL_ENDPOINT = 'https://rjobnorfovzdsfuialca.graphql.ap-south-1.nhost.run/v1';
const ADMIN_SECRET = 'i9xY+ZkT-(a:pNEB\'r5MTx1Jl-i,hz1p';

/**
 * Create a new chat in the backend database
 */
export async function createChat(userId: string, firstMessage?: string): Promise<ChatData> {
  // Generate chat title from first message (first 50 chars) or use default
  const messageText = firstMessage || 'New Chat';
  const title = messageText.substring(0, 50) + (messageText.length > 50 ? '...' : '');
  
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': ADMIN_SECRET
    },
    body: JSON.stringify({
      query: `
        mutation CreateChat($user_id: uuid!, $title: String!) {
          insert_chats_one(object: {
            user_id: $user_id, 
            title: $title,
            created_at: "now()",
            updated_at: "now()"
          }) {
            id
            title
            user_id
            created_at
            updated_at
          }
        }
      `,
      variables: {
        user_id: userId,
        title: title
      }
    })
  });

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`Failed to create chat: ${data.errors[0].message}`);
  }
  
  return data.data.insert_chats_one;
}

/**
 * Fetch all chats for a user with message counts
 */
export async function getUserChats(userId: string): Promise<(ChatData & { message_count: number })[]> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': ADMIN_SECRET
    },
    body: JSON.stringify({
      query: `
        query GetUserChats($user_id: uuid!) {
          chats(
            where: { user_id: { _eq: $user_id } }
            order_by: { updated_at: desc }
          ) {
            id
            title
            user_id
            created_at
            updated_at
            messages_aggregate {
              aggregate {
                count
              }
            }
          }
        }
      `,
      variables: {
        user_id: userId
      }
    })
  });

  const data = await response.json();

  if (data.errors) {
    throw new Error(`Failed to fetch chats: ${data.errors[0].message}`);
  }

  return data.data.chats.map((chat: any) => ({
    ...chat,
    message_count: chat.messages_aggregate.aggregate.count
  }));
}

/**
 * Update chat's updated_at timestamp
 */
export async function updateChatTimestamp(chatId: string): Promise<void> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': ADMIN_SECRET
    },
    body: JSON.stringify({
      query: `
        mutation UpdateChatTimestamp($chat_id: uuid!) {
          update_chats_by_pk(
            pk_columns: { id: $chat_id }
            _set: { updated_at: "now()" }
          ) {
            id
          }
        }
      `,
      variables: {
        chat_id: chatId
      }
    })
  });

  const data = await response.json();

  if (data.errors) {
    throw new Error(`Failed to update chat: ${data.errors[0].message}`);
  }
}

/**
 * Delete a chat and all its messages
 */
export async function deleteChat(chatId: string, silent: boolean = false): Promise<void> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': ADMIN_SECRET
      },
      body: JSON.stringify({
        query: `
          mutation DeleteChat($chat_id: uuid!) {
            delete_messages(where: { chat_id: { _eq: $chat_id } }) {
              affected_rows
            }
            delete_chats_by_pk(id: $chat_id) {
              id
            }
          }
        `,
        variables: {
          chat_id: chatId
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`Failed to delete chat: ${data.errors[0].message}`);
    }
  } catch (error) {
    // If silent mode is enabled (for cleanup operations), log but don't throw
    if (silent) {
      console.warn(`Silent delete failed for chat ${chatId}:`, error);
      return;
    }

    // For regular delete operations, throw the error
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Delete operation timed out. Please try again.');
      }
      throw error;
    }
    throw new Error('Failed to delete chat');
  }
}

/**
 * Rename a chat
 */
export async function renameChat(chatId: string, newTitle: string): Promise<ChatData> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': ADMIN_SECRET
    },
    body: JSON.stringify({
      query: `
        mutation RenameChat($chat_id: uuid!, $title: String!) {
          update_chats_by_pk(
            pk_columns: { id: $chat_id }
            _set: { title: $title, updated_at: "now()" }
          ) {
            id
            title
            user_id
            created_at
            updated_at
          }
        }
      `,
      variables: {
        chat_id: chatId,
        title: newTitle
      }
    })
  });

  const data = await response.json();

  if (data.errors) {
    throw new Error(`Failed to rename chat: ${data.errors[0].message}`);
  }

  return data.data.update_chats_by_pk;
}

/**
 * Save a message to the database
 */
export async function saveMessage(
  chatId: string,
  content: string,
  isBot: boolean,
  userId: string,
  messageId?: string
): Promise<MessageData> {
  // Generate UUID if messageId is not provided
  const finalMessageId = messageId || generateUUID();

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': ADMIN_SECRET
    },
    body: JSON.stringify({
      query: `
        mutation SaveMessage($chat_id: uuid!, $content: String!, $is_bot: Boolean!, $user_id: uuid!, $id: uuid) {
          insert_messages_one(object: {
            id: $id,
            chat_id: $chat_id,
            content: $content,
            is_bot: $is_bot,
            user_id: $user_id,
            created_at: "now()"
          }) {
            id
            chat_id
            content
            is_bot
            user_id
            created_at
          }
        }
      `,
      variables: {
        id: finalMessageId,
        chat_id: chatId,
        content: content,
        is_bot: isBot,
        user_id: userId
      }
    })
  });

  const data = await response.json();

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

  return data.data.insert_messages_one;
}

/**
 * Get all messages for a chat
 */
export async function getChatMessages(chatId: string): Promise<MessageData[]> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': ADMIN_SECRET
    },
    body: JSON.stringify({
      query: `
        query GetChatMessages($chat_id: uuid!) {
          messages(
            where: { chat_id: { _eq: $chat_id } }
            order_by: { created_at: asc }
          ) {
            id
            chat_id
            content
            is_bot
            user_id
            created_at
          }
        }
      `,
      variables: {
        chat_id: chatId
      }
    })
  });

  const data = await response.json();

  if (data.errors) {
    throw new Error(`Failed to get messages: ${data.errors[0].message}`);
  }

  return data.data.messages;
}
