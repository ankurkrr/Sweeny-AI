import { render, screen, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import ChatWindow from '../components/ChatWindow';
import { GET_MESSAGES_SUBSCRIPTION, SEND_MESSAGE_MUTATION } from '../components/ChatWindow';

const mocks = [
  {
    request: {
      query: GET_MESSAGES_SUBSCRIPTION,
      variables: { chat_id: '1' },
    },
    result: {
      data: {
        chatbot_messages: [
          { id: '1', content: 'Hello', is_bot: false, created_at: '2025-08-13T12:00:00Z' },
          { id: '2', content: 'Hi there!', is_bot: true, created_at: '2025-08-13T12:01:00Z' },
        ],
      },
    },
  },
  {
    request: {
      query: SEND_MESSAGE_MUTATION,
      variables: { chat_id: '1', content: 'How are you?' },
    },
    result: {
      data: {
        insert_chatbot_messages_one: { id: '3', content: 'How are you?', is_bot: false, created_at: '2025-08-13T12:02:00Z' },
      },
    },
  },
];

describe('ChatWindow Component', () => {
  it('renders messages from subscription', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatWindow chatId="1" chatTitle="Test Chat" />
      </MockedProvider>
    );

    expect(await screen.findByText('Hello')).toBeInTheDocument();
    expect(await screen.findByText('Hi there!')).toBeInTheDocument();
  });

  it('sends a new message', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatWindow chatId="1" chatTitle="Test Chat" />
      </MockedProvider>
    );

    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'How are you?' } });

    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);

    expect(await screen.findByText('How are you?')).toBeInTheDocument();
  });
});
