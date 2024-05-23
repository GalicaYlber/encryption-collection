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
  verifyDocumentAPI
} from '../main/API';
import 'react-toastify/dist/ReactToastify.css';

interface Key {
  publicKey: string;
  privateKey: string;
  alias: string;
}

export default function DSA() {
  const location = useLocation();
  const { props } = location.state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRefSignature = useRef<HTMLInputElement>(null);
  const [textArea1, settextArea1] = useState<string>('');
  const [textArea2, settextArea2] = useState<string>('');
  const [selectedKey, setSelectedKey] = useState<Key>();
  // const [publicKey, setPublicKey] = useState<Key[]>([]);
  // const [privateKey, setPrivateKey] = useState<string>('dsadsa');
  const [document, setDocument] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [keys, setKeys] = useState<Key[]>([]);
  const [bitLength, setBitLength] = useState<number>(1024);
  const [isNew, setIsNew] = useState<boolean>(false);
  const [keyName, setKeyName] = useState<string>('');
  const [outlineColor, setOutlineColor] = useState('');


  const handleDocumentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDocument(e.target.value);
  };

  const handleSignClick = async () => {
    try {
      if (selectedKey) {
        const signedDocument = await signDocumentAPI(document, selectedKey.privateKey); // replace signDocumentAPI with your actual signing function
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
      await generateDSAKeyPairAPI(keyName, bitLength);
      const keyString = await loadDSAKeyPairAPI(keyName, bitLength);
      const lines = keyString.split('\n');
      const publicKey = lines[0].split(': ')[1];
      const privateKey = lines[1].split(': ')[1];
      const newKeyPair = { publicKey, privateKey, alias : keyName};
      // setKeyAlias((prevKeys) => [...prevKeys, selectedKey?.alias ?? '']);
      setKeys((prevKeys) => [...prevKeys, newKeyPair]);
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
        setOutlineColor("");
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
        setOutlineColor(decryptedData ? '4px solid green' : '4px solid red');
        settextArea2(decryptedData ? 'Document is verified' : 'Document is not verified');
        
        toast.success('Data decrypted successfully');
      } catch (error) {
        toast.error('Failed to decrypt data');
      }
    } else {
      toast.error('No data to decrypt');
    }
  }

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        // const response = await fetch('http://localhost:5000/keys');
        // const data = await response.json();
        const data = [
          {
            alias: 'key1',
            publicKey: 'publicKey1',
            privateKey: 'privateKey1'
          },
          {
            alias: 'key2',
            publicKey: 'publicKey2',
            privateKey: 'privateKey2'
          },
        ];
        setKeys(data);
        setSelectedKey(data[0]);
      } catch (error) {
        toast.error('An error occurred while fetching the keys.');
      }
    };

    fetchKeys();
  }, []);

  return (
    <div>
      <button onClick={handleBackClick}>Go Back</button>
      <ToastContainer />
      <div className="algorithm">
        <h1>DSA</h1>
        <div>
          <p>Dsa uses</p>

          <div className="key-selection">
            <select onChange={(e) => setSelectedKey(keys.find((key) => key.alias === e.target.value))}>
              {keys.map((key) => (
                <option key={key.alias} value={key.alias}>
                  {key.alias}
                </option>
              ))}
            </select>
            <p>Public Key: {selectedKey?.publicKey.substring(0, 10) + "..."}</p>

            <p>Private Key: {selectedKey?.privateKey.substring(0, 10) + "..."}</p>

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
            <div className='dsa-encryption'>
              <textarea
                value={textArea1}
                onChange={handleTextAreaChange}
                placeholder="Enter text to sign here"
              ></textarea>
              <textarea value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Enter Signature here">
              </textarea>
            </div>


            <div className="encryot-decrypt-buttons">
              <button onClick={handleSign}>S i g n</button>
              <button onClick={handleVerify}>V e r i f y</button>
            </div>
            {/* <h3>Cypher :</h3> */}
            <div className='dsa-encryption'>
            <label
            htmlFor="fileUploadSignature"
            className=""
            style={{ cursor: 'pointer' }}
          >
            Encrypted text
          </label>
            <textarea id="fileUploadSignature" value={textArea2} style={{border: outlineColor}} placeholder='Encrypted text here'></textarea>
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

