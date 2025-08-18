# Sweeny-AI Chatbot

Sweeny-AI is a chatbot application designed to provide seamless communication between users and an AI assistant. The project is built using modern web technologies and is deployed on Netlify.

## Project Overview

- **Frontend**: React with TypeScript, Apollo Client, Tailwind CSS.
- **Backend**: Nhost (Hasura GraphQL) and n8n workflows.
- **Deployment**: Hosted on Netlify.
- **Live Link**: [Sweeny-AI Chatbot](https://sweenyai.netlify.app/)

## Features

- Real-time chat functionality using GraphQL subscriptions.
- User authentication and authorization.
- Responsive design for mobile and desktop.
- Integration with n8n workflows for backend automation.
- Mock authentication for development purposes.

## Installation

### Prerequisites

- Node.js (>= 14.x)
- npm or yarn

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/ankurkrr/Sweeny-AI.git
   cd Sweeny-AI
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   VITE_NHOST_SUBDOMAIN=<your-nhost-subdomain>
   VITE_NHOST_REGION=<your-nhost-region>
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open the application in your browser at `http://localhost:3000`.

## Deployment

The project is deployed on Netlify. To deploy your own version:

1. Build the project:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Deploy the `dist` folder to Netlify.

3. Ensure the `_redirects` file is present in the `public` folder to handle SPA routing:
   ```plaintext
   /*    /index.html   200
   ```

## Backend Setup

### Nhost

1. Create a project on [Nhost](https://nhost.io/).
2. Configure your GraphQL API and authentication settings.
3. Update the `.env` file with your Nhost subdomain and region.

### n8n

1. Set up an n8n instance (self-hosted or cloud).
2. Create workflows for handling backend automation.
3. Integrate n8n webhooks with the frontend.

## Folder Structure

```
frontend-chatbot/
├── client/
│   ├── components/       # React components
│   ├── contexts/         # Context API for state management
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   ├── pages/            # Page components
│   ├── tests/            # Unit and integration tests
│   └── global.css        # Global styles
├── public/               # Static assets
├── server/               # Backend server (if any)
└── README.md             # Project documentation
```

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, Apollo Client
- **Backend**: Nhost (Hasura GraphQL), n8n workflows
- **Deployment**: Netlify

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

For any questions or support, please contact [ankurkrr](https://github.com/ankurkrr).
