const log = console.log;
const jose = require('node-jose');

async function createEncryptedJWT(payload) {
    try {
        const keystore = jose.JWK.createKeyStore();

        // Properly formatted JWK key
        const jwkKey = {
            kty: "oct",
            k: Buffer.from("WcTza4v8FzW2yHN2WE+zEdIszpUiaCk+HjBE89rqCKE=", "base64")
                .toString("base64url"), // Convert to Base64Url encoding
            alg: "A256GCM",
            use: "enc"
        };

        // Add key to keystore
        const key = await keystore.add(jwkKey);

        // Create encrypted JWT using a specific algorithm
        const encryptedJWT = await jose.JWE.createEncrypt(
            { format: "compact", contentAlg: "A256GCM" }, // Force A256GCM for compatibility
            key
        )
            .update(JSON.stringify(payload))
            .final();

        return encryptedJWT;
    } catch (err) {
        console.error("Error creating encrypted JWT:", err);
        throw err;
    }
}

async function decryptEncryptedJWT(encryptedJWT) {
    try {
        const keystore = jose.JWK.createKeyStore();

        // Properly formatted JWK key (must match encryption key)
        const jwkKey = {
            kty: "oct",
            k: Buffer.from("WcTza4v8FzW2yHN2WE+zEdIszpUiaCk+HjBE89rqCKE=", "base64")
                .toString("base64url"), // Convert to Base64Url encoding
            alg: "A256GCM",
            use: "enc"
        };

        // Add key to keystore
        const key = await keystore.add(jwkKey);

        // Decrypt the encrypted JWT
        const decryptedResult = await jose.JWE.createDecrypt(key).decrypt(encryptedJWT);

        // Convert decrypted result back to an object
        const decryptedPayload = JSON.parse(decryptedResult.plaintext.toString()); //log(decryptedPayload);

        return decryptedPayload;
    } catch (err) {
        console.error("Error decrypting JWT:", err);
        throw err;
    }
}

module.exports = {
    createEncryptedJWT,
    decryptEncryptedJWT
}