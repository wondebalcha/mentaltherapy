import CryptoJS from 'crypto-js';

// Function to encrypt a message with a given key
export const encryptMessage = (message, key) => {
    // Encrypt the message using AES encryption with the provided key
    const encryptedMessage = CryptoJS.AES.encrypt(message, key).toString();
    return encryptedMessage;
};

// Function to decrypt a message with a given key
export const decryptMessage = (encryptedMessage, key) => {
  // Decrypt the message using AES decryption with the provided key
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedMessage, key);
  // Convert the decrypted bytes to plaintext
  const decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8);
  return decryptedMessage;
};

