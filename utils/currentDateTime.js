function getCurrentDateTimeUTC() {
  const d = new Date();
  return d.toISOString().split('.')[0] + 'Z';
}

module.exports = { getCurrentDateTimeUTC };
