function registerLogin(docId, document) {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(
        await axios.post(process.env.URL, { docId: docId, document: document })
      );
    } catch (err) {
      console.log("No URL received");
      resolve("Register Failure");
    }
  });
}

module.exports = {
  registerLogin,
};
