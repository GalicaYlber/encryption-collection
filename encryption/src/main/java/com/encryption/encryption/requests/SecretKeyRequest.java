package com.encryption.encryption.requests;

public class SecretKeyRequest {
    private int keySize;
    private String alias;
    private String password;
	private String randomness;

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public int getKeySize() {
        return keySize;
    }

    public void setKeySize(int keySize) {
        this.keySize = keySize;
    }

    public String getAlias() {
        return alias;
    }

    public void setAlias(String alias) {
        this.alias = alias;
    }

	public String getRandomness() {
		return randomness;
	}

	public void setRandomness(String randomness) {
		this.randomness = randomness;
	}
}
