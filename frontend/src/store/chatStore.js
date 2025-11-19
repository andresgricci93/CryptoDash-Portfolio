import { create } from "zustand";
import { persist } from "zustand/middleware";




export const useChatStore = create(
  persist(
    (set, get) => ({
      // State: All messages for the current session
      messages: [],
      isStreaming: false,


      getContextMessages: () => {
        const { messages } = get();
        return messages.slice(-20);
      },

  

      addMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, message]
        }));
      },


       //* Used during streaming to update the assistant's response in real-time

      updateLastMessage: (content) => {
        set((state) => {

          const newMessages = [...state.messages];
          
          // Only update if there are messages in the conversation
          if (newMessages.length > 0) {

            const lastIndex = newMessages.length - 1;
            const lastMessage = newMessages[lastIndex];
            

            const updatedMessage = {
              ...lastMessage,
              content
            };
    
            newMessages[lastIndex] = updatedMessage;
          }
          
          return { messages: newMessages };
        });
      },


       // Used to disable input while AI is generating response

      setIsStreaming: (value) => {
        set({ isStreaming: value });
      },


      clearMessages: () => {
        set({ messages: [] });
      }
    }),
    {
      name: "chat-storage", // Key name in sessionStorage
      storage: {
        // Custom storage implementation using sessionStorage
        // Data persists during navigation but clears when tab is closed
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        }
      }
    }
  )
);