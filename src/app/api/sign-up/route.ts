import dbconnect from "@/lib/dbConnect";
import UserModel from "@/model/user";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerification";


export async function POST(request: Request) {
      await dbconnect()

      try {
         const {username, email, password} =  await request.json() 
      } catch (error) {
            console.error("Error registering user", error)
            return Response.json({
                  success: false,
                  message: "Error registering user",
            },
      {
            status: 500,
      })
      }

}