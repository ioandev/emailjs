let account1 = {
  meta: {
    from: '"Ioan Biticu 👻" <ioan@iamioan.com>',
    address: "ioan@iamioan.com"
  },
  transport: {
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: {
      user: "ioan@iamioan.com",
      pass: "password",
    }
  }
}

let account2 = {
  meta: {
    from: '"Ioan Biticu 👻" <me@ioan.blog>',
    address: "me@ioan.blog"
  },
  sendgrid: {
    API_KEY: "your_api_key"
  }
}

module.exports = () => ({
  accounts: [account2]
})