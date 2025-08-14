export interface N8nResponse {
  id: string;
  content: string;
  is_bot: boolean;
  created_at: string;
}

export interface N8nApiError {
  success: false;
  error: string;
}

export interface N8nApiSuccess {
  success: true;
  message: {
    id: string;
    content: string;
    is_bot: boolean;
    created_at: string;
  };
}

export type N8nApiResult = N8nApiSuccess | N8nApiError;

/**
 * API function to communicate with your n8n backend
 */
export async function sendMessageToBot(
  chatId: string,
  message: string,
  userId: string
): Promise<N8nApiResult> {
  try {
    const response = await fetch('https://ankurx.app.n8n.cloud/webhook/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-n8n-webhook-abc123def456'
      },
      body: JSON.stringify({
        body: {
          input: {
            chat_id: chatId,
            content: message
          },
          'x-hasura-user-id': userId
        }
      })
    });

    if (!response.ok) {
      // Try to get error message from response body
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If parsing fails, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }
    
    return {
      success: true,
      message: {
        id: data.id,
        content: data.content,
        is_bot: true,
        created_at: data.created_at
      }
    };
    
  } catch (error) {
    console.error('Failed to send message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message'
    };
  }
}
