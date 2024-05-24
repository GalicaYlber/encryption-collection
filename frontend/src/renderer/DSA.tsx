import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import {
  encryptDataAsymmetric,
  decryptDataAsymmetric,
  generateKeyPairAPI,
  signDocumentAPI,
  generateDSAKeyPairAPI,
  loadDSAKeyPairAPI,
  verifyDocumentAPI,
  fetchDSAKeys,
} from '../main/API';
import 'react-toastify/dist/ReactToastify.css';
import { downloadTxtFile } from './Downloader';

interface Key {
  publicKey: string;
  privateKey: string;
  alias: string;
}

export default function DSA() {
  const textAreaRef = useRef(null);
  const location = useLocation();
  const { props } = location.state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRefSignature = useRef<HTMLInputElement>(null);
  const [textArea1, settextArea1] = useState<string>('');
  const [textArea2, settextArea2] = useState<string>('');
  const [document, setDocument] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [keys, setKeys] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState<Key>();
  const [bitLength, setBitLength] = useState<number>(512);
  const [isNew, setIsNew] = useState<boolean>(false);
  const [keyName, setKeyName] = useState<string>('');
  const [outlineColor, setOutlineColor] = useState('');
  const [randomness, setRandomness] = useState('DEFAULT');

  const handleDocumentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDocument(e.target.value);
  };

  const handleSignClick = async () => {
    try {
      if (selectedKey) {
        const signedDocument = await signDocumentAPI(
          document,
          selectedKey.privateKey,
        ); // replace signDocumentAPI with your actual signing function
        setSignature(signedDocument);
        toast.success('Document signed successfully');
      } else {
        toast.error('No key selected');
      }
    } catch (error) {
      toast.error('Failed to sign document');
    }
  };
  const navigate = useNavigate();

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

  const handleFileUploadSignature = () => {
    const file = fileInputRefSignature.current?.files?.[0];
    if (file) {
      if (file.size > 1000000) {
        // 1MB limit
        // alert('File is too large!');
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSignature(e.target?.result as string);
        };
        reader.readAsText(file);
      }
    }
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    settextArea1(e.target.value);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  async function generateKeyPair() {
    try {
      await generateDSAKeyPairAPI(keyName, bitLength, randomness);
      const keyString = await loadDSAKeyPairAPI(keyName, bitLength);
      const lines = keyString.split('\n');
      const publicKey = lines[0].split(': ')[1];
      const privateKey = lines[1].split(': ')[1];
      const newKeyPair = { publicKey, privateKey, alias: keyName };
      // setKeyAlias((prevKeys) => [...prevKeys, selectedKey?.alias ?? '']);
      if (!keys.includes(keyName)) {
        setKeys((prevKeys) => [...prevKeys, keyName]);
      }
      setSelectedKey(newKeyPair);
      toast.success('Key pair generated successfully!');

      toast.success('Key pair generated successfully!');
    } catch (error) {
      toast.error('Failed to generate key pair');
    }
  }

  async function handleSign() {
    if (textArea1) {
      try {
        const encryptedData = await signDocumentAPI(
          textArea1,
          selectedKey?.alias ?? '',
        );
        setOutlineColor('');
        settextArea2(encryptedData);
        toast.success('Data encrypted successfully');
      } catch (error) {
        toast.error('Failed to encrypt data');
      }
    } else {
      toast.error('No data to encrypt');
    }
  }

  async function handleVerify() {
    if (textArea1) {
      try {
        const decryptedData = await verifyDocumentAPI(
          textArea1,
          selectedKey?.alias ?? '',
          signature,
        );

        console.log(decryptedData);

        setOutlineColor(decryptedData ? '4px solid #00FF00' : '4px solid red');
        settextArea2(
          decryptedData ? 'Document is verified' : 'Document is not verified',
        );

        toast.success('Data decrypted successfully');
      } catch (error) {
        toast.error('Failed to decrypt data');
      }
    } else {
      toast.error('No data to decrypt');
    }
  }

  async function fetchKeys() {
    try {
      const rawData = await fetchDSAKeys();
      const data = Array.from(new Set(rawData));
      setKeys(data);
      setKeyName(data[0]);
      if (data.length > 0) {
        const keyString = await loadDSAKeyPairAPI(data[0], bitLength);
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

  async function handleKeySelection(alias: string) {
    const keyString = await loadDSAKeyPairAPI(alias, bitLength);
    const lines = keyString.split('\n');
    const publicKey = lines[0].split(': ')[1];
    const privateKey = lines[1].split(': ')[1];
    const newKeyPair = { publicKey, privateKey, alias: alias };
    setSelectedKey(newKeyPair);
  }
  useEffect(() => {
    // setKeyName(keys[0]) ;
    fetchKeys();
  }, []);

  return (
    <div>
      <button onClick={handleBackClick}>Go Back</button>
      <ToastContainer />
      <div className="algorithm">
        <div className="title">
          <h1>DSA</h1>
          <p>
            DSA is a widely-used asymmetric encryption algorithm primarily used
            for digital signatures
          </p>
        </div>
        <div>
          {keys.length > 0 ? (
            <div className="key-selection">
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

              <p>
                Public Key: {selectedKey?.publicKey.substring(0, 10) + '...'}
              </p>

              <p>
                Private Key: {selectedKey?.privateKey.substring(0, 10) + '...'}
              </p>

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
            </div>
          ) : (
            <>
              <p>No keys found</p>
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
          <label
            htmlFor="fileUpload"
            className="file_upload"
            style={{ cursor: 'pointer' }}
          >
            Upload text
          </label>
          <label
            htmlFor="fileUploadSignature"
            className="file_upload"
            style={{ cursor: 'pointer' }}
          >
            Upload Signature
          </label>
          <input
            type="file"
            id="fileUpload"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <input
            type="file"
            id="fileUploadSignature"
            ref={fileInputRefSignature}
            onChange={handleFileUploadSignature}
            style={{ display: 'none' }}
          />
          <div className="encryption-area ">
            <div className="dsa-encryption">
              <textarea
                value={textArea1}
                onChange={handleTextAreaChange}
                placeholder="Enter text to sign here"
              ></textarea>
              <textarea
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Enter Signature here"
              ></textarea>
            </div>

            <div className="encryot-decrypt-buttons">
              <button onClick={handleSign}>S i g n</button>
              <button onClick={handleVerify}>V e r i f y</button>
            </div>
            {/* <h3>Cypher :</h3> */}
            <div className="dsa-encryption">
              <label
                htmlFor="fileUploadSignature"
                className=""
                style={{ cursor: 'pointer' }}
              >
                Encrypted text
              </label>
              <textarea
                id="fileUploadSignature"
                value={textArea2}
                style={{ border: outlineColor }}
                placeholder="The signature appears here"
              ></textarea>
              <button onClick={() => downloadTxtFile(textArea2)}>
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function verifySignatureAPI(textArea1: string, arg1: string) {
  throw new Error('Function not implemented.');
}
