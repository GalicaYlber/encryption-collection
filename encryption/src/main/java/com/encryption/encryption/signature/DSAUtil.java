package com.encryption.encryption.signature;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.ArrayList;
import java.util.Base64;

public class DSAUtil {
    private static final String ALGORITHM = "DSA";

	public static ArrayList<String> getAllAliases() throws IOException {
		ArrayList<String> aliases = new ArrayList<String>();
		Files.walk(Paths.get("")).forEach(filePath -> {
			if (Files.isRegularFile(filePath)) {
				String path = filePath.toString();
				if (path.endsWith("_DSA.pub.pem")) {
					aliases.add(path.split("_")[0]);
				}
				if (path.endsWith("_DSA.pem")) {
					aliases.add(path.split("_")[0]);
				}
			}
		});

		return aliases;
	}

    public static byte[] sign(byte[] data, PrivateKey privateKey) throws Exception {
        Signature signature = Signature.getInstance(ALGORITHM);
        signature.initSign(privateKey);
        signature.update(data);
        byte[] signatureBytes = signature.sign();
        try (FileOutputStream fos = new FileOutputStream("signature")) {
            fos.write(signatureBytes);
        }
        return signatureBytes;
    }

    public static boolean verify(byte[] data, byte[] signatureBytes, PublicKey publicKey) throws Exception {
        Signature signature = Signature.getInstance(ALGORITHM);
        signature.initVerify(publicKey);
        signature.update(data);
        return signature.verify(signatureBytes);
    }
}
