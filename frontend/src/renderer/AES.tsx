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
import { downloadTxtFile } from './Downloader';

export default function AES() {
  const textAreaRef = useRef(null);
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
  const [password, setPassword] = useState<string>('');
  const [outlineColor, setOutlineColor] = useState('');
  const [randomness, setRandomness] = useState<string>('DEFAULT');

  const handleFileUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      if (file.size > 1000000) {
        // 1MB limit
        // alert('File is too large!');
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
    setPassword(localStorage.getItem('password') as string);

      fetchSymmetricKeys().then((response) => {
        setSymmetricKeys(response);
        setSelectedKey(response[0]);
      }).catch((error) => {
        toast.error('An error occurred while fetching the keys.');
      })

  }, []);

  useEffect(() => {
    if (symmetricKeys.length > 0) {
      setHasKeys(true);
    }
  }, [symmetricKeys]);

  async function generateKey() {
    try {
      const key = await generateSymmetricKey(keyName, bitLength, password, randomness);
      setSymmetricKeys([...symmetricKeys, keyName]);
      toast.success('Key generated successfully');
      toast.info('You may find the key at the selected key dropdown');
    } catch (error) {
      toast.error('Failed to generate key');
    }
  }

  async function handleEncrypt() {
    if (textArea1) {
      try {
        console.log('selectedKey', selectedKey);
        console.log('password', password);
        console.log('textArea', textArea1);
        const encryptedData = await encryptDataSymmetric(
          textArea1,
          selectedKey,
          password
        );
        settextArea2(encryptedData);
        setOutlineColor('');
        toast.success('Data encrypted successfully');
      } catch (error) {
        toast.error('Failed to encrypt data');
        setOutlineColor('');
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
          password
        );
        settextArea2(decryptedData);
        setOutlineColor('4px solid #00FF00');
        toast.success('Data decrypted successfully');
      } catch (error) {
        toast.error('Failed to decrypt data');
        setOutlineColor('4px solid red');
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
            <div className='title'>
            <h1>AES </h1>
            <p>
                AES is a symmetric encryption algorithm. It is used to encrypt and
                decrypt data.
              </p>
            </div>
          <div>

            {hasKeys ? (
              <div className="key-selection">
                <p>Selected Key:</p>
                <div className="radio-generate">
                  <select value={selectedKey} onChange={(e) => setSelectedKey(e.target.value) }>
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
                            value="192"
                            checked={bitLength == 192}
                            onClick={() => setBitLength(192)}
                          />
                          <>192 bit</>
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
                      {/* another three radio buttons  */}
                      <div>
                        <label>
                          <input
                            type="radio"
                            name="randomness"
                            value="DEFAULT"
                            checked={randomness == "DEFAULT"}
                            onClick={() => setRandomness("DEFAULT")}
                          />
                          <>DEFAULT</>
                          <br />
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="randomness"
                            value="SHA1PRNG"
                            checked={randomness == "SHA1PRNG"}
                            onClick={() => setRandomness("SHA1PRNG")}
                          />
                          <>SHA1PRNG</>
                          <br />
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="randomness"
                            value="DRBG"
                            checked={randomness == "DRBG"}
                            onClick={() => setRandomness("DRBG")}
                          />
                          <>DRBG</>
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
                          value="192"
                          checked={bitLength == 192}
                          onClick={() => setBitLength(192)}
                        />
                        <>192 bit</>
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
                    <div>
                        <label>
                          <input
                            type="radio"
                            name="randomness"
                            value="DEFAULT"
                            checked={randomness == "DEFAULT"}
                            onClick={() => setRandomness("DEFAULT")}
                          />
                          <>DEFAULT</>
                          <br />
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="randomness"
                            value="SHA1PRNG"
                            checked={randomness == "SHA1PRNG"}
                            onClick={() => setRandomness("SHA1PRNG")}
                          />
                          <>SHA1PRNG</>
                          <br />
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="randomness"
                            value="DRBG"
                            checked={randomness == "DRBG"}
                            onClick={() => setRandomness("DRBG")}
                          />
                          <>DRBG</>
                          <br />
                        </label>
                        </div>
                  </div>
                  <button onClick={() => generateKey()}>Generate Key</button>
                </div>
              </>
            )}

            <div className="encryption-area">
              <div className='decrypt-area'>
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
                <textarea
                  value={textArea1}
                  onChange={handleTextAreaChange}
                  placeholder='Enter text to encrypt/decrypt'
                ></textarea>
              </div>

              <div className="encryot-decrypt-buttons">
                <button onClick={handleEncrypt}>Encrypt</button>
                <button onClick={handleDecrypt}>Decrypt</button>
              </div>
              <div className='decrypt-area'>
                <button onClick={() => downloadTxtFile(textArea2)}>Download</button>
                <textarea ref={textAreaRef} style={{ border: outlineColor }} value={textArea2} placeholder='Resulting text here'></textarea>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
