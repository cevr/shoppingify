module.exports = {
  experimental: {
    modern: true,
  },
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/items",
        permanent: true,
      },
    ];
  },
};
