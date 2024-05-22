import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import {
  encryptDataAsymmetric,
  decryptDataAsymmetric,
  generateKeyPairAPI,
  signDocumentAPI,
} from '../main/API';
import 'react-toastify/dist/ReactToastify.css';

export default function DSA() {
  const location = useLocation();
  const { props } = location.state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [textArea1, settextArea1] = useState<string>('');
  const [textArea2, settextArea2] = useState<string>('');
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [publicKey, setPublicKey] = useState<string>('sd');
  const [privateKey, setPrivateKey] = useState<string>('dsadsa');
  const [document, setDocument] = useState<string>('');
  const [signature, setSignature] = useState<string>('');

  const handleDocumentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDocument(e.target.value);
  };

  const handleSignClick = async () => {
    try {
      const signedDocument = await signDocumentAPI(document, privateKey); // replace signDocumentAPI with your actual signing function
      setSignature(signedDocument);
      toast.success('Document signed successfully');
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

  const handleBackClick = () => {
    navigate(-1);
  };

  async function generateKeyPair() {
    try {
      const { publicKey, privateKey } = await generateKeyPairAPI();
      setPublicKey(publicKey);
      setPrivateKey(privateKey);
      toast.success('Key pair generated successfully!');
    } catch (error) {
      toast.error('Failed to generate key pair');
    }
  }

  async function handleEncrypt() {
    if (textArea1) {
      try {
        const encryptedData = await encryptDataAsymmetric(
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
        const decryptedData = await decryptDataAsymmetric(
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
      <div className="algorithm">
        <h1>DSA ADASDSA</h1>
        <div>
          <p>Dsa uses kahskhskaJK</p>
          <div className="key-selection">
            <p>Public Key: {publicKey}</p>

            <p>Private Key: {privateKey}</p>

            <button onClick={generateKeyPair}>Generate Key Pair</button>
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
          <div className="signing-area">
            <h2>Sign a Document</h2>
            <textarea
              id="signature"
              value={document}
              onChange={handleDocumentChange}
            ></textarea>
            <button onClick={handleSignClick}>Sign</button>
            <h2>Signature</h2>
            <p>{signature}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
