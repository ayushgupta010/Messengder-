import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import dbconnect from "@/lib/dbConnect";
import UserModel from "@/model/user";
import { User } from "next-auth";

export async function POST(request: Request) {
      await dbconnect();
      const session = await getServerSession(authOptions);
            const user:User = session?.user as User;
            if(!session || !user){
                  return Response.json({
                        success: false,
                        message: "Unauthorized"
                  }, {status: 401});
      
            }

            const userId = user.id;
            const {acceptMessages} = await request.json();  
      try {
           const updatedUser = await UserModel.findByIdAndUpdate(
                  userId,
                  { acceptMessages},
                  { new: true }
            );
            if (!updatedUser) {
                  return Response.json({
                        success: false,
                        message: "failed to update the user"
                  }, {status: 404});
            }
            return Response.json({
                  success: true,
                  message: "Messages accepted successfully"
            }, {status: 200})
      } catch (error) {
            console.log("Error accepting messages", error)
             return Response.json({
                        success: false,
                        message: "Error accepting messages"
            }, {status: 500});
      }
} 

export async function GET(request: Request) {
      await dbconnect();
      const session = await getServerSession(authOptions);
      const user:User = session?.user as User;
      if(!session || !user){
            return Response.json({
                  success: false,
                  message: "Unauthorized"
            }, {status: 401});
      }

      const userId = user.id;
      try {
            const foundUser = await UserModel.findById(userId);
            if (!foundUser) {
                  return Response.json({
                        success: false,
                        message: "User not found"
                  }, {status: 404});
            }
            return Response.json({
                  success: true,
                  isAcceptingMessages: foundUser.isAcceptingMessage,
                  user: foundUser
            }, {status: 200});
      } catch (error) {
            console.log("Error fetching user", error);
            return Response.json({
                  success: false,
                  message: "Error fetching user"
            }, {status: 500});
      }
}