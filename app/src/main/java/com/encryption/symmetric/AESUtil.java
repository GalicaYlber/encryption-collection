package com.encryption.symmetric;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.SecureRandom;
import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import java.util.Base64;

public class AESUtil {
    private static final String ALGORITHM = "AES";

    public static SecretKey generateKey(int keySize) throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance(ALGORITHM);
        SecureRandom random = new SecureRandom();
        keyGen.init(keySize, random);
        return keyGen.generateKey();
    }

    public static void saveKey(SecretKey key, String fileName) throws IOException {
		byte[] keyBytes = key.getEncoded();
        try (FileOutputStream fos = new FileOutputStream(fileName)) {
            fos.write(keyBytes);
        }
    }

    public static SecretKey loadKey(String fileName) throws IOException {
        byte[] keyBytes = Files.readAllBytes(Paths.get(fileName));
        return new javax.crypto.spec.SecretKeySpec(keyBytes, ALGORITHM);
    }

	public static String encrypt(String plainText, SecretKey key) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        byte[] iv = new byte[16];
        SecureRandom random = new SecureRandom();
        random.nextBytes(iv);
        IvParameterSpec ivParams = new IvParameterSpec(iv);

        cipher.init(Cipher.ENCRYPT_MODE, key, ivParams);
        byte[] cipherText = cipher.doFinal(plainText.getBytes());
        
        byte[] combined = new byte[iv.length + cipherText.length];
        System.arraycopy(iv, 0, combined, 0, iv.length);
        System.arraycopy(cipherText, 0, combined, iv.length, cipherText.length);

        return Base64.getEncoder().encodeToString(combined);
    }

    public static String decrypt(String cipherText, SecretKey key) throws Exception {
        byte[] combined = Base64.getDecoder().decode(cipherText);
        byte[] iv = new byte[16];
        byte[] cipherBytes = new byte[combined.length - iv.length];

        System.arraycopy(combined, 0, iv, 0, iv.length);
        System.arraycopy(combined, iv.length, cipherBytes, 0, cipherBytes.length);

        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        IvParameterSpec ivParams = new IvParameterSpec(iv);
        cipher.init(Cipher.DECRYPT_MODE, key, ivParams);

        byte[] plainText = cipher.doFinal(cipherBytes);
        return new String(plainText);
    }
}
