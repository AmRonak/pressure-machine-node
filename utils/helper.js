// Function to calculate days until token expiration
const daysUntilExpiration = (exp) => {
  const now = Math.floor(Date.now() / 1000);
  return Math.ceil((exp - now) / (60 * 60 * 24));
};


module.exports = { daysUntilExpiration };