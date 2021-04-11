import { Document, Model, model, Schema } from "mongoose"

interface InlineMessageDocument extends Document {
  chatId: string;
  messageId: string;
}

interface InlineMessageModel extends Model<InlineMessageDocument> {
  findAndDeleteMostRecentMessageFromChat(chatId: string, callback: Function): InlineMessageDocument | null;
};

const InlineMessageSchema: Schema = new Schema({
  chatId: {
    type: String,
    unique: false,
    required: true,
  },
  messageId: {
    type: String,
    unique: true,
    required: true,
  }
});

InlineMessageSchema.statics.findAndDeleteMostRecentMessageFromChat = function (chatId, callback) {
  return this.findOneAndDelete({ chatId }, { sort: { messageId: -1 } }, callback);
}

// Default export
export default model<InlineMessageDocument, InlineMessageModel>("InlineMessage", InlineMessageSchema)