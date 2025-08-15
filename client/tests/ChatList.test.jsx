import { render, screen, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import ChatList from '../components/ChatList';
import { GET_CHATS_SUBSCRIPTION, CREATE_CHAT_MUTATION } from '../components/ChatList';

const mocks = [
  {
    request: {
      query: GET_CHATS_SUBSCRIPTION,
    },
    result: {
      data: {
        chatbot_chats: [
          { id: '1', title: 'Chat 1', updated_at: '2025-08-13T12:00:00Z' },
          { id: '2', title: 'Chat 2', updated_at: '2025-08-13T12:05:00Z' },
        ],
      },
    },
  },
  {
    request: {
      query: CREATE_CHAT_MUTATION,
      variables: { title: 'New Chat' },
    },
    result: {
      data: {
        insert_chatbot_chats_one: { id: '3', title: 'New Chat', created_at: '2025-08-13T12:10:00Z' },
      },
    },
  },
];

describe('ChatList Component', () => {
  it('renders chats from subscription', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatList selectedChatId={null} onChatSelect={() => {}} />
      </MockedProvider>
    );

    expect(await screen.findByText('Chat 1')).toBeInTheDocument();
    expect(await screen.findByText('Chat 2')).toBeInTheDocument();
  });

  it('creates a new chat', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatList selectedChatId={null} onChatSelect={() => {}} />
      </MockedProvider>
    );

    const createButton = screen.getByText('Create Chat');
    fireEvent.click(createButton);

    expect(await screen.findByText('New Chat')).toBeInTheDocument();
  });
});
