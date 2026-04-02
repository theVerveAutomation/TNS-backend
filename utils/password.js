// utils/password.js
import bcrypt from "bcrypt";
const SALT_ROUNDS = 10;


export const comparePassword = (password, hash) => bcrypt.compare(password, hash);

export const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

export const validatePassword = (password, username) => {
    // Minimum 8 characters, at least 1 letter, at least 1 number, only alphanumeric
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!regex.test(password)) {
        throw new Error("Password must be 8+ chars with letters & numbers");
    }

    if (password === username) {
        throw new Error("Password cannot match username");
    }
};