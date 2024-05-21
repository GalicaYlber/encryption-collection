package com.encryption.keystore;

import javax.crypto.SecretKey;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;
import java.util.Scanner;

public class KeyStoreUtil {
    private static final String KEYSTORE_TYPE = "JCEKS";
    private static final String KEYSTORE_FILE = "keystore.jks";

    private KeyStore keyStore;
    private char[] keystorePassword;

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

    public static char[] promptForPassword(String prompt) {
        Scanner scanner = new Scanner(System.in);
        System.out.print(prompt);
        return scanner.nextLine().toCharArray();
    }
}