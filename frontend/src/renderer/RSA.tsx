import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import {
  encryptDataAsymmetric,
  decryptDataAsymmetric,
  generateKeyPairAPI,
  fetchAsymmetricKeys,
  loadeKeyPairAPI,
} from '../main/API';
import 'react-toastify/dist/ReactToastify.css';

interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export default function RSA() {
  const location = useLocation();
  const { props } = location.state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [textArea1, settextArea1] = useState<string>('');
  const [textArea2, settextArea2] = useState<string>('');
  const [selectedKey, setSelectedKey] = useState<KeyPair | null>(null);
  const [symmetricKeys, setSymmetricKeys] = useState<KeyPair[]>([]);
  const [hasKeys, setHasKeys] = useState<boolean>(false);
  const [keyName, setKeyName] = useState<string>('');
  const [isNew, setIsNew] = useState<boolean>(false);
  const [bitLength, setBitLength] = useState<number>(1024);
  const navigate = useNavigate();

  const handleFileUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      if (file.size > 1000000) {
        // 1MB limit
        alert('File is too large!');
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          settextArea1(e.target?.result as string);
        };
        reader.readAsText(file);
      }
    }
  };

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await fetchAsymmetricKeys();
        setSymmetricKeys(response);
        setSelectedKey(response[0]);
      } catch (error) {
        toast.error('An error occurred while fetching the keys.');
      }
    };

    fetchKeys();
  }, []);

  useEffect(() => {
    if (symmetricKeys.length > 0) {
      setHasKeys(true);
    }
  }, [symmetricKeys]);

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    settextArea1(e.target.value);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  async function generateKeyPair() {
    try {
      await generateKeyPairAPI(keyName, bitLength, "RSA");
      const keyString = await loadeKeyPairAPI(keyName, bitLength, "RSA");
      const lines = keyString.split('\n');
      const publicKey = lines[0].split(': ')[1];
      const privateKey = lines[1].split(': ')[1];
      const newKeyPair = { publicKey, privateKey };
      setSymmetricKeys((prevKeys) => [...prevKeys, newKeyPair]);
      setSelectedKey(newKeyPair);
      toast.success('Key pair generated successfully!');
    } catch (error) {
      toast.error('Failed to generate key pair');
    }
  }

  async function handleEncrypt() {
    if (textArea1 && selectedKey) {
      try {
        const encryptedData = await encryptDataAsymmetric(
          textArea1,
          selectedKey.publicKey,
        );
        settextArea2(encryptedData);
        toast.success('Data encrypted successfully');
      } catch (error) {
        toast.error('Failed to encrypt data');
      }
    } else {
      toast.error('No data to encrypt');
    }
  }

  async function handleDecrypt() {
    if (textArea1 && selectedKey) {
      try {
        const decryptedData = await decryptDataAsymmetric(
          textArea1,
          selectedKey.privateKey,
        );
        settextArea2(decryptedData);
        toast.success('Data decrypted successfully');
      } catch (error) {
        toast.error('Failed to decrypt data');
      }
    } else {
      toast.error('No data to decrypt');
    }
  }

  return (
    <div>
      <button onClick={handleBackClick}>Go Back</button>
      <ToastContainer />
      <div className="algorithm">
        <h1>Asymmetric Encryption</h1>
        <div>
          <p>
            Asymmetric encryption uses a pair of public and private keys for
            encryption and decryption.
          </p>
          {hasKeys ? (
            <div className="key-selection">
              <p>Selected Key:</p>
              <div className="radio-generate">
                <select
                  value={selectedKey?.publicKey}
                  onChange={(e) => {
                    const selectedKeyPair = symmetricKeys.find(
                      (key) => key.publicKey === e.target.value,
                    );
                    if (selectedKeyPair) {
                      setSelectedKey(selectedKeyPair);
                    }
                  }}
                >
                  {symmetricKeys.map((keyPair, index) => {
                    return (
                      <option key={index} value={keyPair.publicKey}>
                        {keyPair.publicKey}
                      </option>
                    );
                  })}
                </select>
              </div>
              {!isNew && (
                <button onClick={() => setIsNew(true)}>Generate New Key</button>
              )}
              {isNew && (
                <div className="key-selection">
                  <div className="radio-generate">
                    <input
                      type="text"
                      placeholder="Key Name"
                      onChange={(e) => setKeyName(e.target.value)}
                    />

                    <div className="radio">
                      <label>
                        <input
                          type="radio"
                          name="bitlength"
                          value="1024"
                          checked={bitLength == 1024}
                          onClick={() => setBitLength(1024)}
                        />
                        <>1024 bit</>
                        <br />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="bitlength"
                          value="2048"
                          checked={bitLength == 2048}
                          onClick={() => setBitLength(2048)}
                        />
                        <>2048 bit</>
                        <br />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="bitlength"
                          value="4096"
                          checked={bitLength == 4096}
                          onClick={() => setBitLength(4096)}
                        />
                        <>4096 bit</>
                        <br />
                      </label>
                    </div>
                  </div>
                  <button onClick={() => generateKeyPair()}>
                    Generate Key
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p>No keys available</p>
          )}

          <div className="key-selection">
            <p>Public Key: {selectedKey?.publicKey.substring(0, 10) + "..."}</p>

            <p>Private Key: {selectedKey?.privateKey.substring(0, 10) + "..."}</p>
          </div>
          <label
            htmlFor="fileUpload"
            className="file_upload"
            style={{ cursor: 'pointer' }}
          >
            Upload File
          </label>
          <input
            type="file"
            id="fileUpload"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <div className="encryption-area">
            <textarea
              value={textArea1}
              onChange={handleTextAreaChange}
            ></textarea>
            <div className="encryot-decrypt-buttons">
              <button onClick={handleEncrypt}>Encrypt</button>
              <button onClick={handleDecrypt}>Decrypt</button>
            </div>
            <textarea value={textArea2}></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}
