const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16);
const secretsPath = path.join(__dirname, '../secrets.json');

class EncryptionHandler {
    static encrypt(text, secretKey) {
        // Ensure the key is a buffer of correct length (32 bytes for AES-256)
        const keyBuffer = Buffer.from(secretKey, 'hex');
        const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
      }
      
      static decrypt(encryptedText, secretKey) {
        let iv = Buffer.from(encryptedText.iv, 'hex');
        // Ensure the key is correctly converted back to a buffer
        const keyBuffer = Buffer.from(secretKey, 'hex');
        let encryptedTextBytes = Buffer.from(encryptedText.encryptedData, 'hex');
        const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
        let decrypted = decipher.update(encryptedTextBytes);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
      }
      

    static generateSecretKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    static initializeSecrets(username, password) {
        if (!fs.existsSync(secretsPath)) {
            const secretKey = this.generateSecretKey();
            const encryptedUsername = this.encrypt(username, secretKey);
            const encryptedPassword = this.encrypt(password, secretKey);

            const secrets = {
                secretKey,
                encryptedUsername,
                encryptedPassword
            };

            fs.writeFileSync(secretsPath, JSON.stringify(secrets, null, 2), 'utf8');
            console.log('Secrets file created.');
        } else {
            console.log('Secrets file already exists.');
        }
    }
}

module.exports = EncryptionHandler;
