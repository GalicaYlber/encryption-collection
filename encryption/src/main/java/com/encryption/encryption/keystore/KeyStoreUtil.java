package com.encryption.encryption.keystore;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.util.io.pem.PemObject;
import org.bouncycastle.util.io.pem.PemReader;
import org.bouncycastle.util.io.pem.PemWriter;

import javax.crypto.SecretKey;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.*;
import java.security.cert.CertificateException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Scanner;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.Enumeration;

@Component
public class KeyStoreUtil {
    private static final String KEYSTORE_TYPE = "JCEKS";
    private static final String KEYSTORE_FILE = "keystore.jks";

	// possible source of randomness
	public static final String RANDOM_1 = "DEFAULT";
	public static final String RANDOM_2 = "SHA1PRNG";
	public static final String RANDOM_3 = "DRBG";

    private KeyStore keyStore;
    private char[] keystorePassword;

    static {
        Security.addProvider(new BouncyCastleProvider());
    }

    public KeyStoreUtil(char[] keystorePassword) throws KeyStoreException, IOException, NoSuchAlgorithmException, CertificateException {
        this.keystorePassword = keystorePassword;
        this.keyStore = KeyStore.getInstance(KEYSTORE_TYPE);

        // Load the keystore if it exists, otherwise create a new one
        try (FileInputStream fis = new FileInputStream(KEYSTORE_FILE)) {
            keyStore.load(fis, keystorePassword);
        } catch (IOException e) {
            keyStore.load(null, keystorePassword);
            try (FileOutputStream fos = new FileOutputStream(KEYSTORE_FILE)) {
                keyStore.store(fos, keystorePassword);
            }
        }
    }

    public void storeSecretKey(SecretKey secretKey, String alias) throws KeyStoreException, IOException, NoSuchAlgorithmException, CertificateException {
        KeyStore.ProtectionParameter protParam = new KeyStore.PasswordProtection(keystorePassword);
        KeyStore.SecretKeyEntry skEntry = new KeyStore.SecretKeyEntry(secretKey);
        keyStore.setEntry(alias, skEntry, protParam);

        // Save the keystore
        try (FileOutputStream fos = new FileOutputStream(KEYSTORE_FILE)) {
            keyStore.store(fos, keystorePassword);
        }
    }

    public SecretKey loadSecretKey(String alias) throws KeyStoreException, NoSuchAlgorithmException, UnrecoverableKeyException, IOException, CertificateException {
        return (SecretKey) keyStore.getKey(alias, keystorePassword);
    }

	public ArrayList<String> getAllAliases() throws KeyStoreException {
		ArrayList<String> aliases = new ArrayList<>();
		Enumeration<String> aliasEnum = keyStore.aliases();
		while (aliasEnum.hasMoreElements()) {
			aliases.add(aliasEnum.nextElement());
		}
		return aliases;
	}

    public KeyPair generateKeyPair(int keySize, String algo, String sourceOfRandomness) throws NoSuchAlgorithmException {
        System.out.println("Algorithm: " + algo);

        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(algo);
        keyPairGenerator.initialize(keySize, SecureRandom.getInstance(sourceOfRandomness));
        return keyPairGenerator.generateKeyPair();
    }

    public void storeKeyPair(KeyPair keyPair, String alias, String algo) throws IOException {
        // Store public key in PEM format
        try (PemWriter pemWriter = new PemWriter(new FileWriter(alias + "_" + algo + ".pub.pem"))) {
            PemObject pemObject = new PemObject("PUBLIC KEY", keyPair.getPublic().getEncoded());
            pemWriter.writeObject(pemObject);
        }

        // Store private key in PEM format
        try (PemWriter pemWriter = new PemWriter(new FileWriter(alias + "_" + algo + ".pem"))) {
            PemObject pemObject = new PemObject("PRIVATE KEY", keyPair.getPrivate().getEncoded());
            pemWriter.writeObject(pemObject);
        }
    }

    public KeyPair loadKeyPair(String alias, String algo) throws IOException, GeneralSecurityException {
        // Load public key from PEM file
        PublicKey publicKey;
        try (PemReader pemReader = new PemReader(new FileReader(alias + "_" + algo + ".pub.pem"))) {
            PemObject pemObject = pemReader.readPemObject();
            byte[] publicKeyBytes = pemObject.getContent();
            X509EncodedKeySpec publicKeySpec = new X509EncodedKeySpec(publicKeyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance(algo);
            publicKey = keyFactory.generatePublic(publicKeySpec);
        }

        // Load private key from PEM file
        PrivateKey privateKey;
        try (PemReader pemReader = new PemReader(new FileReader(alias + "_" + algo + ".pem"))) {
            PemObject pemObject = pemReader.readPemObject();
            byte[] privateKeyBytes = pemObject.getContent();
            PKCS8EncodedKeySpec privateKeySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance(algo);
            privateKey = keyFactory.generatePrivate(privateKeySpec);
        }

        return new KeyPair(publicKey, privateKey);
    }

    public PublicKey loadPublicKey(String alias, String algo) throws IOException, GeneralSecurityException {
        byte[] publicKeyBytes = Files.readAllBytes(Paths.get(alias + "_" + algo + ".pub.pem"));
        KeyFactory keyFactory = KeyFactory.getInstance(algo);
        X509EncodedKeySpec publicKeySpec = new X509EncodedKeySpec(publicKeyBytes);
        return keyFactory.generatePublic(publicKeySpec);
    }

    public PrivateKey loadPrivateKey(String alias, String algo) throws IOException, GeneralSecurityException {
        byte[] privateKeyBytes = Files.readAllBytes(Paths.get(alias + "_" + algo + ".pem"));
        KeyFactory keyFactory = KeyFactory.getInstance(algo);
        PKCS8EncodedKeySpec privateKeySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
        return keyFactory.generatePrivate(privateKeySpec);
    }

    public String encodePublicKey(PublicKey publicKey) {
        return Base64.getEncoder().encodeToString(publicKey.getEncoded());
    }

    public String encodePrivateKey(PrivateKey privateKey) {
        return Base64.getEncoder().encodeToString(privateKey.getEncoded());
    }

    public static char[] promptForPassword(String prompt) {
        Scanner scanner = new Scanner(System.in);
        System.out.print(prompt);
        return scanner.nextLine().toCharArray();
    }
}

	// lene qet sen per profen

	// The following code is not used in the application, but is provided here anyway.
	// We commented the code out because the assignment noted to save the keypairs for DSA and RSA in PEM format.
	// However we keep it here to show that we did figure out how to store them in the keystore.
	// It demonstrates how to generate a self-signed certificate and store the keys and keypairs in a keystore.
	// It also demonstrates how to load the keys and keypairs from the keystore.

	// public void storeKeyPair(KeyPair keyPair, String alias) throws KeyStoreException, IOException, NoSuchAlgorithmException, CertificateException {
    //     try {
    //         X509Certificate[] chain = {generateSelfSignedCertificate(keyPair)};
    //         KeyStore.PrivateKeyEntry privateKeyEntry = new KeyStore.PrivateKeyEntry(keyPair.getPrivate(), chain);
    //         KeyStore.ProtectionParameter protParam = new KeyStore.PasswordProtection(keystorePassword);
    //         keyStore.setEntry(alias, privateKeyEntry, protParam);

    //         // Save the keystore
    //         try (FileOutputStream fos = new FileOutputStream(KEYSTORE_FILE)) {
    //             keyStore.store(fos, keystorePassword);
    //         }
    //     } catch (Exception e) {
    //         throw new KeyStoreException("Failed to store key pair", e);
    //     }
    // }

	// public KeyPair loadKeyPair(String alias) throws KeyStoreException, NoSuchAlgorithmException, IOException, CertificateException, UnrecoverableEntryException {
	// 	KeyStore.PrivateKeyEntry privateKeyEntry = (KeyStore.PrivateKeyEntry) keyStore.getEntry(alias, new KeyStore.PasswordProtection(keystorePassword));
	// 	PublicKey publicKey = privateKeyEntry.getCertificate().getPublicKey();
	// 	PrivateKey privateKey = privateKeyEntry.getPrivateKey();
	// 	return new KeyPair(publicKey, privateKey);
	// }

	// public PublicKey loadPublicKey(String alias) throws KeyStoreException, NoSuchAlgorithmException, IOException, CertificateException, UnrecoverableEntryException {
	// 	KeyStore.PrivateKeyEntry privateKeyEntry = (KeyStore.PrivateKeyEntry) keyStore.getEntry(alias, new KeyStore.PasswordProtection(keystorePassword));
	// 	return privateKeyEntry.getCertificate().getPublicKey();
	// }

	// public PrivateKey loadPrivateKey(String alias) throws KeyStoreException, NoSuchAlgorithmException, IOException, CertificateException, UnrecoverableEntryException {
	// 	KeyStore.PrivateKeyEntry privateKeyEntry = (KeyStore.PrivateKeyEntry) keyStore.getEntry(alias, new KeyStore.PasswordProtection(keystorePassword));
	// 	return privateKeyEntry.getPrivateKey();
	// }

    // private X509Certificate generateSelfSignedCertificate(KeyPair keyPair) throws Exception {
    //     long now = System.currentTimeMillis();
    //     Date startDate = new Date(now);

    //     X500Name dnName = new X500Name("CN=Self-Signed Certificate");
    //     BigInteger certSerialNumber = new BigInteger(Long.toString(now));
    //     Date endDate = new Date(now + 365 * 24 * 60 * 60 * 1000L);  // 1 year validity

    //     PublicKey publicKey = keyPair.getPublic();
    //     PrivateKey privateKey = keyPair.getPrivate();

    //     JcaX509v3CertificateBuilder certBuilder = new JcaX509v3CertificateBuilder(
    //             dnName, certSerialNumber, startDate, endDate, dnName, publicKey);

    //     ContentSigner contentSigner = new JcaContentSignerBuilder("SHA256WithRSA").build(privateKey);
    //     X509CertificateHolder certHolder = certBuilder.build(contentSigner);

    //     return new JcaX509CertificateConverter().setProvider("BC").getCertificate(certHolder);
    // }