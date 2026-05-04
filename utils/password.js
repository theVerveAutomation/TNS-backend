// utils/password.js
const bcrypt = require("bcryptjs");
const { AppError } = require("./AppError.js");
const SALT_ROUNDS = 10;


const comparePassword = (password, hash) => bcrypt.compare(password, hash);

const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

const validatePassword = (password, username) => {
    // Minimum 8 characters, at least 1 letter, at least 1 number, allows special characters
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

    if (!regex.test(password)) {
        throw new AppError(400, "Password must be 8+ chars with letters, numbers, and can include special chars (@$!%*?& etc.)");
    }

    if (password === username) {
        throw new AppError(400, "Password cannot match username");
    }
};

module.exports = { comparePassword, hashPassword, validatePassword };