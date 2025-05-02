import mongoose, {Schema, Document} from 'mongoose';

export interface Messaege extends Document{
      content: string;
      createdAt: Date;
}

const MessageSchema: Schema<Messaege> = new Schema({
      content:{
            type: String,
            required: true, 
      },
      createdAt:{
            type: Date,
            required: true,
            default: Date.now,
      }
})


export interface User extends Document{
      username: string;
      password: string;
      email: string;
      verifyCode: string;
      verifyCodeExpire: Date;
      isverified: boolean;
      isAcceptingMessage: boolean;
      messages: Messaege[];
}


const UserSchema: Schema<User> = new Schema({
      username:{
            type: String,
            required: [true, 'Username is required'],
            trim: true,
            unique: true, 
      },
      password:{
            type: String,
            required: [true, 'Password is required'],
      },
      email:{
            type: String,
            required: true,
            unique: true,
            match: [/.+@.+\..+/, 'Please fill a valid email address'],
      },
      verifyCode:{
            type: String,
            required: [true, 'Verify code is required'],
      },
      verifyCodeExpire:{
            type: Date,
            required: [true, 'Verify code expiration is required'],
      },
      isverified:{
            type: Boolean,
            required: true,
            default: false,
      },
      isAcceptingMessage:{
            type: Boolean,
            required: true,
            default: true,
      },
      messages:[MessageSchema]
})

const UserModel= (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>('User', UserSchema);

export default UserModel;