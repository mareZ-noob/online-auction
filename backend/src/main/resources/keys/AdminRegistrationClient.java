package keys;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;

public class AdminRegistrationClient {

    public static String generateAdminSignature(String email, String keyFilePath) throws Exception {
        // Read file content
        Path path = Paths.get(keyFilePath);
        if (!Files.exists(path)) {
            throw new RuntimeException("Private key file not found at: " + keyFilePath);
        }

        String keyContent = Files.readString(path, StandardCharsets.UTF_8);

        // Clean up the PEM string (remove headers/footers/whitespace)
        String privateKeyPEM = keyContent
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");

        // Convert to PrivateKey object
        byte[] keyBytes = Base64.getDecoder().decode(privateKeyPEM);
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        PrivateKey privateKey = kf.generatePrivate(spec);

        // Sign the email using SHA256withRSA
        Signature signature = Signature.getInstance("SHA256withRSA");
        signature.initSign(privateKey);
        signature.update(email.getBytes(StandardCharsets.UTF_8));

        byte[] signatureBytes = signature.sign();

        // Return as Base64 string
        return Base64.getEncoder().encodeToString(signatureBytes);
    }

    public static void main(String[] args) {
        try {
            String emailToRegister = "admin123@auction.com";
            String privateKeyPath = "private_key.pem";

            System.out.println("Reading key from: " + privateKeyPath);
            String signature = generateAdminSignature(emailToRegister, privateKeyPath);

            System.out.println("\n=== Generated Data for Registration Request ===");
            System.out.println("Email: " + emailToRegister);
            System.out.println("Admin Signature: " + signature);

        } catch (Exception e) {
            System.err.println("Error generating signature: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
