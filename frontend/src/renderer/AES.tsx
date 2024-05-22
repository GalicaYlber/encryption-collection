import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import {
  generateSymmetricKey,
  fetchSymmetricKeys,
  encryptDataSymmetric,
  decryptDataSymmetric,
} from '../main/API';
import 'react-toastify/dist/ReactToastify.css';

export default function AES() {
  const location = useLocation();
  const { props } = location.state;
  const [symmetricKeys, setSymmetricKeys] = useState<string[]>([]);
  const [hasKeys, setHasKeys] = useState<boolean>(false);
  const [keyName, setKeyName] = useState<string>('');
  const [bitLength, setBitLength] = useState<number>(64);
  const [isNew, setIsNew] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [textArea1, settextArea1] = useState<string>('');
  const [textArea2, settextArea2] = useState<string>('');
  const [selectedKey, setSelectedKey] = useState<string>('');

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

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    settextArea1(e.target.value);
  };

  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchKeys = async () => {
      setSymmetricKeys(['key1', 'key2', 'key3']);
      try {
        const response = await fetchSymmetricKeys();
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

  async function generateKey() {
    try {
      const key = await generateSymmetricKey(keyName);
      setSymmetricKeys([...symmetricKeys, key]);
      toast.success('Key generated successfully');
      toast.info('You may find the key at the selected key dropdown');
    } catch (error) {
      toast.error('Failed to generate key');
    }
  }

  async function handleEncrypt() {
    if (textArea1) {
      try {
        const encryptedData = await encryptDataSymmetric(
          textArea1,
          selectedKey,
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
    if (textArea1) {
      try {
        const decryptedData = await decryptDataSymmetric(
          textArea1,
          selectedKey,
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
      {props.type === 'aes' && (
        <div className="algorithm">
          <h1>AES</h1>
          <div>
            <p>
              AES is a symmetric encryption algorithm. It is used to encrypt and
              decrypt data.
            </p>
            {hasKeys ? (
              <div className="key-selection">
                <p>Selected Key:</p>
                <div className="radio-generate">
                  <select>
                    {symmetricKeys.map((key, index) => {
                      return <option key={index}>{key}</option>;
                    })}
                  </select>
                </div>
                {!isNew && (
                  <button onClick={() => setIsNew(true)}>
                    Generate New Key
                  </button>
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
                            value="64"
                            checked={bitLength == 64}
                            onClick={() => setBitLength(64)}
                          />
                          <>64 bit</>
                          <br />
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="bitlength"
                            value="128"
                            checked={bitLength == 128}
                            onClick={() => setBitLength(128)}
                          />
                          <>128 bit</>
                          <br />
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="bitlength"
                            value="256"
                            checked={bitLength == 256}
                            onClick={() => setBitLength(256)}
                          />
                          <>256 bit</>
                          <br />
                        </label>
                      </div>
                    </div>
                    <button onClick={() => generateKey()}>Generate Key</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <p>No keys stored, generate one!</p>
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
                          value="64"
                          checked={bitLength == 64}
                          onClick={() => setBitLength(64)}
                        />
                        <>64 bit</>
                        <br />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="bitlength"
                          value="128"
                          checked={bitLength == 128}
                          onClick={() => setBitLength(128)}
                        />
                        <>128 bit</>
                        <br />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="bitlength"
                          value="256"
                          checked={bitLength == 256}
                          onClick={() => setBitLength(256)}
                        />
                        <>256 bit</>
                        <br />
                      </label>
                    </div>
                  </div>
                  <button onClick={() => generateKey()}>Generate Key</button>
                </div>
              </>
            )}
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
      )}
    </div>
  );
}
