const crypto = require('crypto');

const ENC_KEY = process.env.ENCRIPTION_KEY;
const IV = process.env.ENCRIPTION_IV;

function encrypt(value) {
    let cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
    let encrypted = cipher.update(value, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

function decrypt(value) {
    let decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV);
    let decrypted = decipher.update(value, 'base64', 'utf8');
    return (decrypted + decipher.final('utf8'));
}

module.exports = {
    encrypt,
    decrypt
}