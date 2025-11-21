import mongoose from 'mongoose';


const messageSchema = new mongoose.Schema({
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  });

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Title: starts as "conv-DD-MM-YYYY-1", user can edit later
  title: {
    type: String,
    required: true
  },
  
  // Date of the conversation (for grouping/filtering)
  date: {
    type: Date,
    required: true,
    index: true
  },
  
// Summary generated daily at 3 AM for long-term memory
  summary: {
    type: String
  },
  
  // Keywords extracted for search
  keywords: [String],
  
  // All messages in this conversation
  messages: [messageSchema]
  
}, { 
  timestamps: true
});

// Multiple conversations per user per day allowed
conversationSchema.index({ userId: 1, date: 1 });
conversationSchema.index({ userId: 1, createdAt: -1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);