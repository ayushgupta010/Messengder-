import { NextAuthOptions } from "next-auth";
import  CredentialsProvider  from "next-auth/providers/credentials";  
import bcrypt from "bcryptjs";
import UserModel from "@/model/user";
import dbconnect from "@/lib/dbConnect";
import { promise } from "zod";
import { error } from "console";
import { use } from "react";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id:"credential",
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Username" },
        password: { label: "Password", type: "password", placeholder: "Password" },
      },
      async authorize(credentials: any): Promise<any> {
        await dbconnect();
        try {
          const user =  await UserModel.findOne({
                  $or: [
                        {email: credentials.identifier},
                        {username: credentials.identifier}
                  ]

            })

            if(!user){
                  throw new Error("No User Found")
            }

            if(!user.isverified){
                  throw new Error("Please verify your account before login")
            }

            const isCorrectPassword = await bcrypt.compare(credentials.password, user.password)

            if(isCorrectPassword){
                  return user
            }else{
                  throw new Error("Incorrect Password")
            }
        } catch (error) {
            console.error("Error during authentication:", error);
            throw new Error("Authentication failed");
        }
        
      },
    }),
  ],

  callbacks:{
      async jwt({token, user}){
            if(user){
                  token._id= user._id?.toString();
                  token.isAcceptingMessages= user.isAcceptingMessages;
                  token.isVerified= user.isVerified;
                  token.username= user.username;
            }
            return token
      },

      async session({session, token}){
            if(token){
                  session.user._id= token._id;
                  session.user.isAcceptingMessages= token.isAcceptingMessages;
                  session.user.isVerified= token.isVerified;
                  session.user.username= token.username;
            }
            return session
      }
      
  }, 

  pages:{
      signIn: "/sign-in",
  }, 

  session:{
      strategy: "jwt"
  }, 

  secret: process.env.NEXTAUTH_SECRET

}