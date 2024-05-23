package com.encryption;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyPair;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Base64;
import java.util.Scanner;

import javax.crypto.SecretKey;

import com.encryption.symmetric.AESUtil;
import com.encryption.asymmetric.RSAUtil;
import com.encryption.signature.DSAUtil;
import com.encryption.keystore.KeyStoreUtil;

public class App {
	static String algorithm = "";
	static KeyStoreUtil keyStoreUtil;

	public static void main(String[] args) {
		Scanner scanner = new Scanner(System.in);

		try {
			System.out.print("Enter keystore password: ");
			char[] keystorePassword = scanner.nextLine().toCharArray();
			keyStoreUtil = new KeyStoreUtil(keystorePassword);

			while (true) {
				System.out.println("Choose encryption algorithm:");
				System.out.println("1. AES");
				System.out.println("2. RSA");
				System.out.println("3. DSA");
				System.out.println("4. Exit");
				int algorithmChoice = scanner.nextInt();
				scanner.nextLine(); // Consume newline

				switch (algorithmChoice) {
					case 1:
						algorithm = "AES";
						handleAESOption(scanner);
						break;
					case 2:
						algorithm = "RSA";
						handleRSAOption(scanner);
						break;
					case 3:
						algorithm = "DSA";
						handleDSAOption(scanner);
						break;
					case 4:
						System.out.println("Exiting...");
						return;
					default:
						System.out.println("Invalid option. Please try again.");
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			scanner.close();
		}
	}

	private static void handleAESOption(Scanner scanner) {
		try {
			while (true) {
				System.out.println("Choose an option:");
				System.out.println("1. Generate Key");
				System.out.println("2. Load Key");
				System.out.println("3. Encrypt Text");
				System.out.println("4. Decrypt Text");
				System.out.println("5. Back");
				int choice = scanner.nextInt();
				scanner.nextLine(); // Consume newline

				switch (choice) {
					case 1:
						System.out.print("Enter key size (128, 192, 256): ");
						int keySize = scanner.nextInt();
						scanner.nextLine(); // Consume newline
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
						System.out.println("Returning to algorithm selection...");
						return;
					default:
						System.out.println("Invalid option. Please try again.");
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private static void handleRSAOption(Scanner scanner) {
		try {
			while (true) {
				System.out.println("Choose an option:");
				System.out.println("1. Generate Key Pair");
				System.out.println("2. Load Key Pair");
				System.out.println("3. Encrypt Text");
				System.out.println("4. Decrypt Text");
				System.out.println("5. Back");
				int choice = scanner.nextInt();
				scanner.nextLine(); // Consume newline

				switch (choice) {
					case 1:
						System.out.print("Enter key size (512, 1024, 2048, ...): ");
						int keySize = scanner.nextInt();
						scanner.nextLine(); // Consume newline
						KeyPair keyPair = RSAUtil.generateKeyPair(keySize);
						System.out.print("Enter alias for the key pair: ");
						String alias = scanner.nextLine();
						keyStoreUtil.storeKeyPair(keyPair, alias, algorithm);
						System.out.println("Key pair generated and saved with alias: " + alias);
						System.out.println("Public Key (Hex): " + keyStoreUtil.encodePublicKey(keyPair.getPublic()));
						System.out.println("Private Key (Hex): " + keyStoreUtil.encodePrivateKey(keyPair.getPrivate()));
						break;
					case 2:
						System.out.print("Enter alias of the key pair to load: ");
						String loadAlias = scanner.nextLine();
						KeyPair loadedKeyPair = keyStoreUtil.loadKeyPair(loadAlias, algorithm);
						System.out.println("Key pair loaded.");
						System.out.println(
								"Public Key (Hex): " + keyStoreUtil.encodePublicKey(loadedKeyPair.getPublic()));
						System.out.println(
								"Private Key (Hex): " + keyStoreUtil.encodePrivateKey(loadedKeyPair.getPrivate()));
						break;
					case 3:
						System.out.print("Enter alias of the public key to use for encryption: ");
						String encryptAlias = scanner.nextLine();
						PublicKey publicKey = keyStoreUtil.loadPublicKey(encryptAlias, algorithm);
						System.out.print("Enter text to encrypt: ");
						String plainText = scanner.nextLine();
						String encryptedText = RSAUtil.encrypt(plainText, publicKey);
						System.out.println("Encrypted Text (Base64): " + encryptedText);
						break;
					case 4:
						System.out.print("Enter alias of the private key to use for decryption: ");
						String decryptAlias = scanner.nextLine();
						PrivateKey privateKey = keyStoreUtil.loadPrivateKey(decryptAlias, algorithm);
						System.out.print("Enter text to decrypt: ");
						String cipherText = scanner.nextLine();
						String decryptedText = RSAUtil.decrypt(cipherText, privateKey);
						System.out.println("Decrypted Text: " + decryptedText);
						break;
					case 5:
						System.out.println("Returning to algorithm selection...");
						return;
					default:
						System.out.println("Invalid option. Please try again.");
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private static void handleDSAOption(Scanner scanner) {

		try {
			while (true) {
				System.out.println("Choose an option:");
				System.out.println("1. Generate Key Pair");
				System.out.println("2. Load Key Pair");
				System.out.println("3. Sign Data");
				System.out.println("4. Verify Signature");
				System.out.println("5. Back");
				int choice = scanner.nextInt();
				scanner.nextLine(); // Consume newline

				switch (choice) {
					case 1:
						System.out.print("Enter key size (512, 1024, 2048, ...): ");
						int keySize = scanner.nextInt();
						scanner.nextLine(); // Consume newline
						KeyPair keyPair = keyStoreUtil.generateKeyPair(keySize, algorithm);
						System.out.print("Enter alias for the key pair: ");
						String keyPairAlias = scanner.nextLine();
						keyStoreUtil.storeKeyPair(keyPair, keyPairAlias, algorithm);
						System.out.println("Key pair generated and saved with alias: " + keyPairAlias);
						System.out.println("Public Key (Hex): " + keyStoreUtil.encodePublicKey(keyPair.getPublic()));
						System.out.println("Private Key (Hex): " + keyStoreUtil.encodePrivateKey(keyPair.getPrivate()));
						break;
					case 2:
						System.out.print("Enter alias of the key pair to load: ");
						String loadAlias = scanner.nextLine();
						KeyPair loadedKeyPair = keyStoreUtil.loadKeyPair(loadAlias, algorithm);
						System.out.println("Key pair loaded.");
						System.out.println("Public Key (Hex): " + keyStoreUtil.encodePublicKey(loadedKeyPair.getPublic()));
						System.out.println("Private Key (Hex): " + keyStoreUtil.encodePrivateKey(loadedKeyPair.getPrivate()));
						break;
					case 3:
						System.out.print("Enter alias to private key file: ");
						String alias = scanner.nextLine();
						PrivateKey privateKey = keyStoreUtil.loadPrivateKey(alias, algorithm);
						System.out.print("Enter path to data file to sign: ");
						String dataFilePath = scanner.nextLine();
						byte[] data = Files.readAllBytes(Paths.get(dataFilePath));
						byte[] signature = DSAUtil.sign(data, privateKey);
						System.out.println("Signature: " + Base64.getEncoder().encodeToString(signature));
						break;
					case 4:
						System.out.print("Enter path to public key file: ");
						String publicKeyPath = scanner.nextLine();
						PublicKey publicKey = keyStoreUtil.loadPublicKey(publicKeyPath, algorithm);
						System.out.print("Enter path to data file: ");
						dataFilePath = scanner.nextLine();
						data = Files.readAllBytes(Paths.get(dataFilePath));
						System.out.print("Enter path to signature file: ");
						String signatureFilePath = scanner.nextLine();
						byte[] signatureBytes = Files.readAllBytes(Paths.get(signatureFilePath));
						boolean isValid = DSAUtil.verify(data, signatureBytes, publicKey);
						if (isValid) {
							System.out.println("Signature is valid.");
						} else {
							System.out.println("Signature is NOT valid.");
						}
						break;
					case 5:
						System.out.println("Returning to algorithm selection...");
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
