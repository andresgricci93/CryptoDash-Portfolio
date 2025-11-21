import { Conversation } from '../models/conversation.model.js';

/**
 * Get or create today's conversation for user
 */
export const getTodaysConversation = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const title = `conv-${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    
    let conversation = await Conversation.findOne({
      userId,
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    if (!conversation) {
      conversation = new Conversation({
        userId,
        title,
        date: today,
        messages: []
      });
      await conversation.save();
      console.log(`Created new conversation: ${title}`);
    }
    
    return conversation;
  } catch (error) {
    console.error('Error getting today\'s conversation:', error);
    throw error;
  }
};

/**
 * Add message to today's conversation
 */
export const addMessage = async (userId, role, content) => {
  try {
    const conversation = await getTodaysConversation(userId);
    
    conversation.messages.push({
      role,
      content,
      timestamp: new Date()
    });
    
    await conversation.save();
    return conversation;
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};

/**
 * Get today's conversation history (short-term memory)
 */
export const getTodayHistory = async (userId) => {
  try {
    const conversation = await getTodaysConversation(userId);
    return conversation.messages;
  } catch (error) {
    console.error('Error getting today history:', error);
    return [];
  }
};