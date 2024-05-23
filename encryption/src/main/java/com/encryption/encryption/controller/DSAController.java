package com.encryption.encryption.controller;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.KeyPair;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.util.ArrayList;
import java.util.Base64;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.encryption.encryption.signature.DSAUtil;
import com.encryption.encryption.keystore.KeyStoreUtil;
import com.encryption.encryption.requests.AssymetricRequest;
import com.encryption.encryption.requests.SignVerifyRequest;

@RestController
@CrossOrigin
@RequestMapping("/dsa")
public class DSAController {

    private KeyStoreUtil keyStoreUtil;

    @PostMapping("/storeKeyPair")
    public ResponseEntity<String> storeKeyPair(@RequestBody AssymetricRequest request)
            throws KeyStoreException, CertificateException {
        try {
            this.keyStoreUtil = new KeyStoreUtil(toAscii(request.getPassword()));
            KeyPair keypair = this.keyStoreUtil.generateKeyPair(request.getKeySize(), request.getAlgo(), request.getRandomness());
            this.keyStoreUtil.storeKeyPair(keypair, request.getAlias(), request.getAlgo());
            return new ResponseEntity<>("Key pair stored!", HttpStatus.OK);
        } catch (NoSuchAlgorithmException | IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/loadKeyPair")
    public ResponseEntity<String> loadKeyPair(@RequestBody AssymetricRequest request) {
        try {
            this.keyStoreUtil = new KeyStoreUtil(toAscii(request.getPassword()));
            KeyPair keyPair = keyStoreUtil.loadKeyPair(request.getAlias(), request.getAlgo());
            String publicKey = Base64.getEncoder().encodeToString(keyPair.getPublic().getEncoded());
            String privateKey = Base64.getEncoder().encodeToString(keyPair.getPrivate().getEncoded());
            return new ResponseEntity<>("Public Key: " + publicKey + "\nPrivate Key: " + privateKey, HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>("Error reading key pair: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (GeneralSecurityException e) {
            return new ResponseEntity<>("Security error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            return new ResponseEntity<>("Unexpected error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/sign")
    public ResponseEntity<String> sign(@RequestBody SignVerifyRequest request) {
        try {
            this.keyStoreUtil = new KeyStoreUtil(toAscii(request.getPassword()));
            KeyPair keyPair = keyStoreUtil.loadKeyPair(request.getAlias(), request.getAlgo());
            byte[] data = request.getText().getBytes();
            byte[] signature = DSAUtil.sign(data, keyPair.getPrivate());
            return new ResponseEntity<>(Base64.getEncoder().encodeToString(signature), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Signing error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody SignVerifyRequest request) {
        boolean isValid = false;

        try {
            KeyPair keyPair = keyStoreUtil.loadKeyPair(request.getAlias(), request.getAlgo());
            byte[] data = request.getText().getBytes();
            byte[] signatureBytes = Base64.getDecoder().decode(request.getSignature());
            isValid = DSAUtil.verify(data, signatureBytes, keyPair.getPublic());
            return new ResponseEntity<>(isValid, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(isValid, HttpStatus.OK);
        }
    }

	@PostMapping("/getAllAliases")
	public ResponseEntity<ArrayList<String>> getAllAliases(@RequestBody AssymetricRequest request) {
		try {
			this.keyStoreUtil = new KeyStoreUtil(toAscii(request.getPassword()));
			ArrayList<String> aliases = DSAUtil.getAllAliases();
			return new ResponseEntity<>(aliases, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
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
}