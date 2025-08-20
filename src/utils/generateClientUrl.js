function generateClientUrl(pathname, query = {}) {
  const baseUrl = process.env.CLIENT_URL;
  const url = new URL(
    `${baseUrl.replace(/\/$/, "")}/${pathname.replace(/^\//, "")}`
  );

  Object.entries(query).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
}

module.exports = generateClientUrl;
