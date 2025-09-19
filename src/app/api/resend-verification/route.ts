import dbconnect from "@/lib/dbConnect";
import UserModel from "@/model/user";
import { sendVerificationEmail } from "@/helpers/sendVerification";

/**
 * Handles the POST request for resending verification email.
 */
export async function POST(request: Request) {
    await dbconnect();

    try {
        const { email } = await request.json();

        if (!email) {
            return Response.json({
                success: false,
                message: "Email is required",
            }, {
                status: 400,
            });
        }

        // Find user by email
        const user = await UserModel.findOne({ email });

        if (!user) {
            return Response.json({
                success: false,
                message: "User not found",
            }, {
                status: 404,
            });
        }

        if (user.isverified) {
            return Response.json({
                success: false,
                message: "User is already verified",
            }, {
                status: 400,
            });
        }

        // Generate new verification code
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);

        // Update user with new verification code
        user.verifyCode = verifyCode;
        user.verifyCodeExpire = expiryDate;
        await user.save();

        // Send verification email
        const emailResponse = await sendVerificationEmail(email, user.username, verifyCode);

        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message,
            }, {
                status: 500,
            });
        }

        return Response.json({
            success: true,
            message: "Verification email sent successfully",
        }, {
            status: 200,
        });

    } catch (error) {
        console.error("Error resending verification email:", error);
        return Response.json({
            success: false,
            message: "Error resending verification email",
        }, {
            status: 500,
        });
    }
}

