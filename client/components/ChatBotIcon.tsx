import React from 'react';

export default function ChatBotIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`${className} flex items-center justify-center transition-all duration-200 hover:scale-110`}>
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2F91c20ca81e764ec69cd5de4ed7fc445e%2Ff5e1ea2291e344d6b84127d617e63e9f?format=webp&width=800"
        alt="Sweeny Logo"
        className="w-full h-full object-cover rounded-lg"
      />
    </div>
  );
}
