module.exports = () => ({
  accounts: [
    {
      meta: {
        from: '"Ioan Biticu" <ioan@iamioan.com>',
      },
      transport: {
        host: "hostname",
        port: 465,
        secure: true,
        auth: {
          user: "ioan@iamioan.com",
          pass: "password",
        },
      },
    },
  ],
});
