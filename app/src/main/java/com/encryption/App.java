package com.encryption;

import java.security.KeyStore;
import java.util.Scanner;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

import com.encryption.symmetric.AESUtil;
import com.encryption.keystore.KeyStoreUtil;

/**
 * Hello world!
 *
 */
public class App 
{
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        try {
            // Prompt for the keystore password once
            char[] keystorePassword = KeyStoreUtil.promptForPassword("Enter keystore password: ");
            KeyStoreUtil keyStoreUtil = new KeyStoreUtil(keystorePassword);

            while (true) {
                System.out.println("Choose an option:");
                System.out.println("1. Generate Key");
                System.out.println("2. Load Key");
                System.out.println("3. Encrypt Text");
                System.out.println("4. Decrypt Text");
                System.out.println("5. Exit");
                int choice = scanner.nextInt();
                scanner.nextLine();  // Consume newline

                switch (choice) {
                    case 1:
                        System.out.print("Enter key size (128, 192, 256): ");
                        int keySize = scanner.nextInt();
                        scanner.nextLine();  // Consume newline
                        System.out.print("Enter alias for the key: ");
                        String storeAlias = scanner.nextLine();
                        SecretKey key = AESUtil.generateKey(keySize);
                        keyStoreUtil.storeSecretKey(key, storeAlias);
                        System.out.println("Key generated and stored in keystore.");
                        System.out.println("Key (Hex): " + bytesToHex(key.getEncoded()));
                        break;
                    case 2:
                        System.out.print("Enter alias of the key to load: ");
                        String loadAlias = scanner.nextLine();
                        SecretKey loadedKey = keyStoreUtil.loadSecretKey(loadAlias);
                        System.out.println("Key loaded from keystore.");
                        System.out.println("Key (Hex): " + bytesToHex(loadedKey.getEncoded()));
                        break;
                    case 3:
                        System.out.print("Enter alias of the key to use for encryption: ");
                        String encryptAlias = scanner.nextLine();
                        System.out.print("Enter text to encrypt: ");
                        String plainText = scanner.nextLine();
                        loadedKey = keyStoreUtil.loadSecretKey(encryptAlias);
                        String encryptedText = AESUtil.encrypt(plainText, loadedKey);
                        System.out.println("Encrypted Text (Base64): " + encryptedText);
                        break;
                    case 4:
                        System.out.print("Enter alias of the key to use for decryption: ");
                        String decryptAlias = scanner.nextLine();
                        System.out.print("Enter text to decrypt: ");
                        String cipherText = scanner.nextLine();
                        loadedKey = keyStoreUtil.loadSecretKey(decryptAlias);
                        String decryptedText = AESUtil.decrypt(cipherText, loadedKey);
                        System.out.println("Decrypted Text: " + decryptedText);
                        break;
                    case 5:
                        System.out.println("Exiting...");
                        return;
                    default:
                        System.out.println("Invalid option. Please try again.");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
