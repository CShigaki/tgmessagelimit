import { Document, Model, model, Schema, Types } from "mongoose"

interface UserDocument extends Document {
  _id: string;
  chats: [{
    _id: string;
    messageCount: number;
    limited: boolean;
  }];
}

interface UserModel extends Model<UserDocument> {}

const UserSchema: Schema = new Schema({
  _id: {
    type: String,
    unique: true,
    required: true,
  },
  chats: {
    type: Array,
    unique: false,
    required: true,
  }
});

// Default export
export default model<UserDocument, UserModel>("User", UserSchema)