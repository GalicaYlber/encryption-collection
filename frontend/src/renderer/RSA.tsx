import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import {
  encryptDataAsymmetric,
  decryptDataAsymmetric,
  generateKeyPairAPI,
  fetchAsymmetricKeys,
  loadKeyPairAPI,
} from '../main/API';
import 'react-toastify/dist/ReactToastify.css';
import { downloadTxtFile } from './Downloader';

interface KeyPair {
  publicKey: string;
  privateKey: string;
  alias: string;
}

export default function RSA() {
  const textAreaRef = useRef(null);
  const location = useLocation();
  const { props } = location.state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [textArea1, settextArea1] = useState<string>('');
  const [textArea2, settextArea2] = useState<string>('');
  const [selectedKey, setSelectedKey] = useState<KeyPair>();
  const [keys, setKeys] = useState<string[]>([]);
  const [outlineColor, setOutlineColor] = useState('');
  const [hasKeys, setHasKeys] = useState<boolean>(false);
  const [isNew, setIsNew] = useState<boolean>(false);
  const [bitLength, setBitLength] = useState<number>(512);
  const [keyName, setKeyName] = useState<string>('');
  const [randomness, setRandomness] = useState<string>('DEFAULT');

  const navigate = useNavigate();

  const handleFileUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      if (file.size > 1000000) {
        // 1MB limit
        toast.error('File is too large!');
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          settextArea1(e.target?.result as string);
        };
        reader.readAsText(file);
      }
    }
  };

  async function fetchKeys() {
    try {
      const rawData = await fetchAsymmetricKeys();
      const data = Array.from(new Set(rawData));
      setKeys(data);
      setKeyName(data[0]);
      if (data.length > 0) {
        const keyString = await loadKeyPairAPI(data[0], bitLength, 'RSA');
        const lines = keyString.split('\n');
        const publicKey = lines[0].split(': ')[1];
        const privateKey = lines[1].split(': ')[1];
        const newKeyPair = { publicKey, privateKey, alias: data[0] };
        setSelectedKey(newKeyPair);
      }
    } catch (error) {
      toast.error('Failed to fetch keys');
    }
  }

  useEffect(() => {
    fetchKeys();
  }, []);

  useEffect(() => {
    if (keys.length > 0) {
      setHasKeys(true);
    }
  }, [keys]);

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    settextArea1(e.target.value);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  async function generateKeyPair() {
    try {
      await generateKeyPairAPI(keyName ?? '', bitLength, 'RSA', randomness);
      const keyString = await loadKeyPairAPI(
        keyName ?? '',
        bitLength,
        'RSA',
      );
      const lines = keyString.split('\n');
      const publicKey = lines[0].split(': ')[1];
      const privateKey = lines[1].split(': ')[1];
      const newKeyPair = { publicKey, privateKey, alias: keyName};
      // setKeyAlias((prevKeys) => [...prevKeys, selectedKey?.alias ?? '']);
      if (!keys.includes(keyName)) {
        setKeys((prevKeys) => [...prevKeys, keyName]);
      }
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
          selectedKey.alias,
        );
        settextArea2(encryptedData);
        setOutlineColor('');
        toast.success('Data encrypted successfully');
      } catch (error) {
        toast.error(error as string); // Cast error to string
        setOutlineColor('');
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
          selectedKey.alias,
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

  async function handleKeySelection(alias: string) {
    const keyString = await loadKeyPairAPI(alias, bitLength, 'RSA');
    const lines = keyString.split('\n');
    const publicKey = lines[0].split(': ')[1];
    const privateKey = lines[1].split(': ')[1];
    const newKeyPair = { publicKey, privateKey, alias: alias };
    setSelectedKey(newKeyPair);
  }

  return (
    <div>
      <button onClick={handleBackClick}>Go Back</button>
      <ToastContainer />
      <div className="algorithm">
        <div className='title'>
          <h1>RSA</h1>
          <p>
            RSA is a popular asymmetric encryption algorithm widely used for secure communication and digital signatures.
          </p>
        </div>
        <div>
          
          {hasKeys ? (
            <div className="key-selection">
              <p>Selected Key:</p>
              <div className="radio-generate">
                <select
                  value={selectedKey?.alias}
                  onChange={(e) => handleKeySelection(e.target.value)}
                >
                  {keys.map((key) => (
                    <option key={1} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>
              {!isNew && (
                <button onClick={() => setIsNew(true)}>Generate New Key</button>
              )}
              {isNew && (
                <>
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
                            value="512"
                            checked={bitLength == 512}
                            onClick={() => setBitLength(512)}
                          />
                          <>512 bit</>
                          <br />
                        </label>
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
                      </div>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="randomness"
                        value="DEFAULT"
                        checked={randomness == 'DEFAULT'}
                        onClick={() => setRandomness('DEFAULT')}
                      />
                      <>DEFAULT</>
                      <br />
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="randomness"
                        value="SHA1PRNG"
                        checked={randomness == 'SHA1PRNG'}
                        onClick={() => setRandomness('SHA1PRNG')}
                      />
                      <>SHA1PRNG</>
                      <br />
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="randomness"
                        value="DRBG"
                        checked={randomness == 'DRBG'}
                        onClick={() => setRandomness('DRBG')}
                      />
                      <>DRBG</>
                      <br />
                    </label>
                  </div>
                    </div>
                  </div>
                  <button onClick={() => generateKeyPair()}>
                    Generate Key
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              <p>No keys available</p>
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
                          value="512"
                          checked={bitLength == 512}
                          onClick={() => setBitLength(512)}
                        />
                        <>512 bit</>
                        <br />
                      </label>
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
                    </div>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="randomness"
                        value="DEFAULT"
                        checked={randomness == 'DEFAULT'}
                        onClick={() => setRandomness('DEFAULT')}
                      />
                      <>DEFAULT</>
                      <br />
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="randomness"
                        value="SHA1PRNG"
                        checked={randomness == 'SHA1PRNG'}
                        onClick={() => setRandomness('SHA1PRNG')}
                      />
                      <>SHA1PRNG</>
                      <br />
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="randomness"
                        value="DRBG"
                        checked={randomness == 'DRBG'}
                        onClick={() => setRandomness('DRBG')}
                      />
                      <>DRBG</>
                      <br />
                    </label>
                  </div>
                  </div>

                  <button onClick={() => generateKeyPair()}>
                    Generate Key
                  </button>
                </div>
              )}
            </>
          )}

          <div className="key-selection">
            <p>Public Key: {selectedKey?.publicKey.substring(0, 10) + '...'}</p>

            <p>
              Private Key: {selectedKey?.privateKey.substring(0, 10) + '...'}
            </p>
          </div>

          
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
                placeholder='Enter text to encrypt/decrypt here'
              ></textarea>
            </div>
            <div className="encryot-decrypt-buttons">
              <button onClick={handleEncrypt}>Encrypt</button>
              <button onClick={handleDecrypt}>Decrypt</button>
            </div>
            <div className='decrypt-area'>

              <button onClick={() => downloadTxtFile(textArea2)}>Download</button>
              <textarea style={{ border: outlineColor }} value={textArea2} placeholder='Resulting text here'></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
