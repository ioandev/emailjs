import accounts from "../../env.accounts"
import nodemailer from "nodemailer"

async function sendEmail(mail) {
    if (mail == null || mail.from == null) {
        throw `there was an issue with the mail`
    }
    let account = getAccountDetailsByEmail(mail.from)
    mail.from = account.meta.from

    if (account.transport) {
        let transporter = nodemailer.createTransport(account.transport)
        let info = await transporter.sendMail(mail)
        console.log("Email sent: %s", info.messageId);
        return {
            info
        }
    }

    if (account.sendgrid) {
        let apiKey = account.sendgrid.API_KEY

        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(apiKey);
        try {
            let response = await sgMail.send(mail);
            console.log("Email sent: %s", "something");
            console.log(response)
            return {
                response
            }
        } catch (error) {
            console.error(error);

            if (error.response) {
                console.error(error.response.body)
            }

            throw error
        }
    }

    throw 'No account config could be found. It has to either SMTP or sendgrid compatible.'
}

function getAccountDetailsByEmail(email) {
    let account = accounts().accounts.filter(function (account) {
        return account.meta.address === email;
    })[0] || null;
    
    if (account == null) {
        throw `Account couldn't be found for ${email}`
    }
    return account
}

export {
    sendEmail
}