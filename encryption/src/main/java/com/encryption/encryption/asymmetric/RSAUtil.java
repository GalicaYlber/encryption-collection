package com.encryption.encryption.asymmetric;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.ArrayList;
import java.util.Base64;

import javax.crypto.Cipher;

public class RSAUtil {
    private static final String ALGORITHM = "RSA";

    public static KeyPair generateKeyPair(int keySize, String sourceOfRandomness) throws NoSuchAlgorithmException {
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(ALGORITHM);
        keyPairGenerator.initialize(keySize, SecureRandom.getInstance(sourceOfRandomness));
        return keyPairGenerator.generateKeyPair();
    }

    public static void saveKeyPair(KeyPair keyPair, String publicKeyPath, String privateKeyPath) throws IOException {
        byte[] publicKeyBytes = keyPair.getPublic().getEncoded();
        byte[] privateKeyBytes = keyPair.getPrivate().getEncoded();

        try (FileOutputStream publicKeyFos = new FileOutputStream(publicKeyPath);
             FileOutputStream privateKeyFos = new FileOutputStream(privateKeyPath)) {
            publicKeyFos.write(publicKeyBytes);
            privateKeyFos.write(privateKeyBytes);
        }
    }

	public static ArrayList<String> getAllAliases() throws IOException {
		ArrayList<String> aliases = new ArrayList<String>();
		Files.walk(Paths.get("")).forEach(filePath -> {
			System.out.println(filePath.toString());
			if (Files.isRegularFile(filePath)) {
				String path = filePath.toString();
				if (path.endsWith("_RSA.pub.pem")) {
					aliases.add(path.split("_")[0]);
				}
				if (path.endsWith("_RSA.pem")) {
					aliases.add(path.split("_")[0]);
				}
			}
		});

		return aliases;
	}

    public static KeyPair loadKeyPair(String publicKeyPath, String privateKeyPath) throws IOException, GeneralSecurityException {
        byte[] publicKeyBytes = Files.readAllBytes(Paths.get(publicKeyPath));
        byte[] privateKeyBytes = Files.readAllBytes(Paths.get(privateKeyPath));

        KeyFactory keyFactory = KeyFactory.getInstance(ALGORITHM);
        X509EncodedKeySpec publicKeySpec = new X509EncodedKeySpec(publicKeyBytes);
        PublicKey publicKey = keyFactory.generatePublic(publicKeySpec);

        PKCS8EncodedKeySpec privateKeySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
        PrivateKey privateKey = keyFactory.generatePrivate(privateKeySpec);

        return new KeyPair(publicKey, privateKey);
    }

	public static PublicKey loadPublicKey(String publicKeyPath) throws IOException, GeneralSecurityException {
		byte[] publicKeyBytes = Files.readAllBytes(Paths.get(publicKeyPath));
		KeyFactory keyFactory = KeyFactory.getInstance(ALGORITHM);
		X509EncodedKeySpec publicKeySpec = new X509EncodedKeySpec(publicKeyBytes);
		return keyFactory.generatePublic(publicKeySpec);
	}

	public static PrivateKey loadPrivateKey(String privateKeyPath) throws IOException, GeneralSecurityException {
		byte[] privateKeyBytes = Files.readAllBytes(Paths.get(privateKeyPath));
		KeyFactory keyFactory = KeyFactory.getInstance(ALGORITHM);
		PKCS8EncodedKeySpec privateKeySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
		return keyFactory.generatePrivate(privateKeySpec);
	}

	 public static String encrypt(String plaintext, PublicKey publicKey) throws Exception {
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, publicKey);
        byte[] encryptedBytes = cipher.doFinal(plaintext.getBytes());
        return Base64.getEncoder().encodeToString(encryptedBytes);
    }

    public static String decrypt(String ciphertext, PrivateKey privateKey) throws Exception {
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, privateKey);
        byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(ciphertext));
        return new String(decryptedBytes);
    }
}
