
import accounts from "../env.accounts"
import nodemailer from "nodemailer"

function getAccountDetailsByEmail(email) {
    let account = accounts().accounts.filter(function (account) {
        return account.transport.auth.user === email;
    })[0] || null;
    return account
}

async function sendEmail(mail) {
    let account = getAccountDetailsByEmail(mail.from)
    if (account == null) {
        throw `Account couldn't be found for X`
    }
    mail.from = account.meta.from
    let transport = account.transport

    let transporter = nodemailer.createTransport(transport)
    let info = await transporter.sendMail(mail)
    console.log("Message sent: %s", info.messageId);
    return {
        info
    }
}

export {
    sendEmail
}