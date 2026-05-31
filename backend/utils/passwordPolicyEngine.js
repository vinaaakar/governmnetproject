/**
 * TN-UCRS Universal Password Policy Engine
 * Enforces a single statewide administrative password for demo and onboarding.
 */

const UNIVERSAL_PASSWORD = "admin1234$";

const getUniversalPassword = () => UNIVERSAL_PASSWORD;

const validateUniversalPassword = (password) => {
  return password === UNIVERSAL_PASSWORD;
};

module.exports = {
  getUniversalPassword,
  validateUniversalPassword
};
