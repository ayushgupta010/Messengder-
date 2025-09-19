import dbconnect from "@/lib/dbConnect";
import UserModel from "@/model/user";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerification";


/**
 * Handles the POST request for user registration.
 *
 * This function performs the following steps:
 * 1. Establishes a connection to the database.
 * 2. Parses the incoming request to extract `username`, `email`, and `password`.
 * 3. Checks if a user with the same `username` and verified status already exists in the database.
 *    - If such a user exists, returns a 409 Conflict response with an appropriate message.
 * 4. Checks if a user with the same `email` and verified status already exists in the database.
 *    - If such a user exists, returns a 409 Conflict response with an appropriate message.
 * 5. If no conflicts are found:
 *    - Hashes the provided password using bcrypt.
 *    - Generates a 6-digit verification code.
 *    - Sets an expiration time for the verification code (1 hour from the current time).
 *    - Creates a new user in the database with the provided details, hashed password, and verification code.
 *    - Saves the new user to the database.
 * 6. Sends a verification email to the user with the generated verification code.
 *    - If the email fails to send, returns a 500 Internal Server Error response with an appropriate message.
 * 7. Handles any unexpected errors during the process and logs them to the console.
 *    - Returns a 500 Internal Server Error response with a generic error message.
 *
 * @param request - The incoming HTTP request object containing user registration details.
 * @returns A JSON response indicating the success or failure of the registration process.
 */
export async function POST(request: Request) {
      await dbconnect()

      try {
         const {username, email, password} =  await request.json() 

      // Check if a user with the same username and verified status already exists in the database
      const existingUserVerifiedByUsername = await UserModel.findOne({ 
           username,
           isverified: true
      });

       if(existingUserVerifiedByUsername) {
            return Response.json({
                  success: false,
                  message: "Username already exists",
            },
            {
                  status: 409,
            })
       }

       const existingUserByEmail = await UserModel.findOne({ 
            email
       })

       let verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

       if(existingUserByEmail) {
           if(existingUserByEmail.isverified) {
            return Response.json({
                  success: false,
                  message: "Email already exists",
            },
            {
                  status: 409,
            })
       }
            else{
                  const hashedPassword = await bcrypt.hash(password, 10);
                  existingUserByEmail.password = hashedPassword;
                  existingUserByEmail.verifyCode = verifyCode;
                  existingUserByEmail.verifyCodeExpire = new Date(Date.now() + 3600000);
                  await existingUserByEmail.save();
           }
      }
        else{
            const hasedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)
            const newUser = await UserModel.create({
                  username,
                  email,
                  password: hasedPassword,
                  verifyCode,
                  verifyCodeExpire: expiryDate,
                  isverified: false,
                  isAcceptingMessage: true,
                  messages: [],
            })
            await newUser.save()
       }

       const emailResponse = await sendVerificationEmail(email, username, verifyCode)
       
       if(!emailResponse.success) {
            return Response.json({
                  success: false,
                  message: emailResponse.message,
            },
            {
                  status: 500,
            })
       }
            return Response.json({
                  success: true,
                  message: "User registered successfully",
            },
            {
                  status: 201,
            })

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