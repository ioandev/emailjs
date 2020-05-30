import accounts from "../../env.accounts"
import nodemailer from "nodemailer"

async function sendEmail(mail) {
    let account = getAccountDetailsByEmail(mail.from)
    mail.from = account.meta.from
    let transporter = nodemailer.createTransport(account.transport)
    let info = await transporter.sendMail(mail)
    console.log("Email sent: %s", info.messageId);
    return {
        info
    }
}

function getAccountDetailsByEmail(email) {
    let account = accounts().accounts.filter(function (account) {
        return account.transport.auth.user === email;
    })[0] || null;
    
    if (account == null) {
        throw `Account couldn't be found for ${mail.from}`
    }
    return account
}

export {
    sendEmail
}