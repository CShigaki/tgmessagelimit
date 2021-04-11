import { Document, Model, model, Query, Schema } from "mongoose"

interface Configuration {
  messageLimit: number;
  allowPhoto: boolean;
  allowVideo: boolean;
  allowFile: boolean;
  allowGif: boolean;
  allowSticker: boolean;
}

interface ChatDocument extends Document {
  _id: string;
  config: Configuration;
  membersAndCounts: { [key: string]: number; };
}

interface ChatModel extends Model<ChatDocument> {
  findAll(): ChatDocument[];
  removeById(chatId: string): void;
}

const ChatSchema: Schema = new Schema({
  _id: {
    type: String,
    unique: true,
    required: true,
  },
  config: {
    type: Object,
    unique: false,
    required: true,
  },
  membersAndCounts: {
    type: Object,
    unique: false,
    required: true,
    default: {},
  }
});

ChatSchema.statics.findAll = async function() {
  return this.find();
};

ChatSchema.statics.removeById = async function(chatId: string) {
  return this.remove({ _id: chatId });
};

// Default export
export default model<ChatDocument, ChatModel>("Chat", ChatSchema);