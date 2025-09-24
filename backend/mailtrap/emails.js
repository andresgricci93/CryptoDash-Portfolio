import { mailtrapClient, sender } from "./mailtrap.config.js"
import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js"



export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{email}]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify your Email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification"
        })

        console.log("Email sent successfully", response);
    } catch(error) {
        console.error(`Error sending verification`, error);
        throw new Error(`Error sending verification email: ${error}`);
    }
}

export const sendWelcomeEmail = async (email, name) => {
       
   const recipient = [{email}];

   try {

    const response = await mailtrapClient.send({
        from: sender,
        to: recipient,
        template_uuid: "02b21a7c-1d2a-4c95-82e4-7c0222ef866e",
        template_variables: {
          "company_info_name": "CryptoDashboard Inc.",
          "name": name
        }
    })
     console.log("Welcome email sent successfully", response);
   } catch (error) {
     console.error(`Error sending welcome email`, error);
     throw new Error(`Error sending welcome email:${error}`);
   }

}


export const sendPasswordResetEmail = async (email, resetURL) => {
    console.log("This is the reset url:" + resetURL);
 const recipient = [{email}];

 try {
   const response = await mailtrapClient.send({
     from: sender,
     to: recipient,
     subject: "Reset your Password",
     html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
     category: "Password Reset"
   })
 } catch (error) {
    console.error(`Error sending password reset email`, error);

    throw new Error(`Error sending password reset email:  ${error}`);
 }

}

export const sendResetSuccessEmail = async (email) => {

    const recipient = [{ email }];

       try {

    const response = await mailtrapClient.send({
        from: sender,
        to: recipient,
        subject: "Password Reset Successful",
        html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        category: "Password Reset"
    })
     console.log("Reset email sent successfully", response);
   } catch (error) {
     console.error(`Error sending password reset success email`, error);
     throw new Error(`Error sending password reset success email: ${error}`);
   }


}