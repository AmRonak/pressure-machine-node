// Function to calculate days until token expiration
const daysUntilExpiration = (exp) => {
  const now = Math.floor(Date.now() / 1000);
  return Math.ceil((exp - now) / (60 * 60 * 24));
};

const isPasswordExpired = (lastPasswordChangeDateTime, expiryDays) => {
  const currentDateTime = new Date();
  const lastChangeDateTime = new Date(lastPasswordChangeDateTime);

  const differenceInTime = currentDateTime - lastChangeDateTime;

  const expiryTimeInMilliseconds = expiryDays * 24 * 60 * 60 * 1000;

  return differenceInTime > expiryTimeInMilliseconds;
}


module.exports = { daysUntilExpiration, isPasswordExpired };