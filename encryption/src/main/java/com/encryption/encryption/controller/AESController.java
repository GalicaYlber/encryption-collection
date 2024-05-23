package com.encryption.encryption.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.encryption.encryption.keystore.KeyStoreUtil;
import com.encryption.encryption.requests.SecretKeyRequest;
import com.encryption.encryption.requests.encryptDecryptRequest;
import com.encryption.encryption.symmetric.AESUtil;
import java.security.KeyStoreException;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;
import javax.crypto.SecretKey;

@RestController
@CrossOrigin 
@RequestMapping("/aes")

public class AESController {

    private KeyStoreUtil keyStoreUtil;
    private AESUtil AESUtil;

    @PostMapping("/setKeystorePassword")
    public String setKeystorePassword(@RequestBody String password) {
        System.out.println("Password: " + password);
        try {
            this.keyStoreUtil = new KeyStoreUtil(toAscii(password));
            return "Password set successfully!";
        } catch (KeyStoreException | IOException | NoSuchAlgorithmException | CertificateException e) {
            return "Failed to set password: " + e.getMessage();
        }
    }

    private char[] toAscii(String str) {
        StringBuilder sb = new StringBuilder();
        for (char c : str.toCharArray()) {
            if ((int) c < 128) {
                sb.append(c);
            }
        }
        return sb.toString().toCharArray();
    }

    @PostMapping("/generateAndStoreKey")
    public String generateAndStoreKey(@RequestBody SecretKeyRequest keyRequest) {
        if (this.keyStoreUtil == null) {
            return "Failed to generate and store key: KeyStoreUtil has not been initialized. Please set the keystore password first.";
        }
        try {
            SecretKey secretKey = AESUtil.generateKey(keyRequest.getKeySize());
            this.keyStoreUtil = new KeyStoreUtil(toAscii(keyRequest.getPassword()));
            this.keyStoreUtil.storeSecretKey(secretKey, keyRequest.getAlias());
            return "Key generated and stored in keystore. Key (Hex): " + bytesToHex(secretKey.getEncoded());
        } catch (Exception e) {
            return "Failed to generate and store key: " + e.getClass().getSimpleName() + " - " + e.getMessage();
        }
    }

    @PostMapping("/encrypt")
    public ResponseEntity<String> encrypt(@RequestBody encryptDecryptRequest keyRequest) {
        try {
            this.keyStoreUtil = new KeyStoreUtil(toAscii(keyRequest.getPassword()));
            SecretKey secretKey = keyStoreUtil.loadSecretKey(keyRequest.getAlias());
            String encryptedText = AESUtil.encrypt(keyRequest.getText(), secretKey);
            return new ResponseEntity<>(encryptedText, HttpStatus.OK);
        } catch (Exception e) {
            System.out.println("pass :" + keyRequest.getPassword() + " " + "key :" + keyRequest.getAlias() + "text :" + keyRequest.getText());
            return new ResponseEntity<>("Encryption error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/decrypt")
    public ResponseEntity<String> decrypt(@RequestBody encryptDecryptRequest keyRequest) {
        try {
            this.keyStoreUtil = new KeyStoreUtil(toAscii(keyRequest.getPassword()));
            SecretKey secretKey = keyStoreUtil.loadSecretKey(keyRequest.getAlias());
            String decryptedText = AESUtil.decrypt(keyRequest.getText(), secretKey);
            return new ResponseEntity<>(decryptedText, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Decryption error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    @PostMapping("/loadSecretKey")
    public ResponseEntity<SecretKey> loadSecretKey(@RequestBody SecretKeyRequest keyRequest) {
        try {
            this.keyStoreUtil = new KeyStoreUtil(toAscii(keyRequest.getPassword()));
            SecretKey secretKey = keyStoreUtil.loadSecretKey(keyRequest.getAlias());

            return new ResponseEntity<>(secretKey, HttpStatus.OK);
        } catch (KeyStoreException | NoSuchAlgorithmException | UnrecoverableKeyException | IOException
                | CertificateException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}