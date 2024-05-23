import { PassThrough } from "stream";

function transformToJsonOrTextPromise(response: Response): Promise<any> {
    const contentLength = response.headers.get("Content-Length");
    const contentType = response.headers.get("Content-Type");
    if (
      contentLength !== "0" &&
      contentType &&
      contentType.includes("application/json")
    ) {
      return response.json();
    } else {
      return response.text();
    }
  }
  
  interface RequestOptions {
    method?: string;
    body?: any;
    headers?: any;
  }
  
  async function sendRequest(url: string, { method = "GET", body, headers = {} }: RequestOptions = {}): Promise<any> {
    const options = {
      method,
      headers: new Headers({ "content-type": "application/json", ...headers }),
      body: body ? JSON.stringify(body) : null,
    };
  
    return fetch(url, options).then((res) => {
      const jsonOrTextPromise = transformToJsonOrTextPromise(res);
  
      if (res.ok) {
        return jsonOrTextPromise;
      } else {
        return jsonOrTextPromise.then(function (response) {
          const responseObject = {
            status: res.status,
            ok: false,
            message: typeof response === "string" ? response : response.message,
          };
  
          return Promise.reject(responseObject);
        });
      }
    });
  }
  
  const BACKEND_URL = 'http://localhost:8080'; 
  
  export async function generateSymmetricKey(alias: string, size: number, password: string): Promise<any> {
    return sendRequest(BACKEND_URL + `/aes/generateAndStoreKey`, {
        method: "POST",
        body: { keySize: size, alias: alias, password: password }
    });
}

  export async function setKeyStorePassword(password: string): Promise<any> {
    sendRequest(BACKEND_URL + '/aes/setKeystorePassword', { 
      method: 'POST', 
      body: { password: password },
    });
  }

export async function fetchSymmetricKeys(): Promise<any> {
    // return sendRequest(BACKEND_URL + '/keys');
    
        return ['key1', 'key2', 'key3'];
    
}

export async function fetchAsymmetricKeys(): Promise<Array<{ publicKey: string, privateKey: string, alias : string }>> {
    return [
        {
            publicKey: "publicKey1",
            privateKey: "privateKey1",
            alias: "key1"
        },
        {
            publicKey: "publicKey2",
            privateKey: "privateKey2",
            alias: "key2"
        },
        {
            publicKey: "publicKey3",
            privateKey: "privateKey3",
            alias: "key3"
        },
    ];
}

export async function encryptDataSymmetric(text: string, key: string, password: string): Promise<string> {
    return sendRequest(BACKEND_URL + '/aes/encrypt', { method: 'POST', 
    body: { 
      alias : key,
      text : text,
      password : password
      } 
  });
}

export async function decryptDataSymmetric(text: string, key: string, password: string): Promise<string> {
  return sendRequest(BACKEND_URL + '/aes/decrypt', { method: 'POST', 
      body: { 
        alias : key,
        text : text,
        password : password
        } 
    });
}

export async function encryptDataAsymmetric(text: string, key: string): Promise<string> {
  return sendRequest(BACKEND_URL + '/rsa/encrypt', { method: 'POST', 
      body: { 
        alias : key,
        text : text,
        algo : "RSA",
        password : localStorage.getItem('password')
        } 
    });
}

export async function decryptDataAsymmetric(text: string, key: string): Promise<string> {
  return sendRequest(BACKEND_URL + '/rsa/decrypt', { method: 'POST', 
      body: { 
        alias : key,
        text : text,
        algo : "RSA",
        password : localStorage.getItem('password')
        } 
    })
}

export async function generateKeyPairAPI(alias: string, bitLength: number, algo: string): Promise<any> {
  return sendRequest(BACKEND_URL + '/rsa/storeKeyPair', { method: 'POST', 
      body: { 
        alias : alias,
        password : localStorage.getItem('password'),
        algo: algo,
        keySize : bitLength
        } 
    });
  }

  export async function loadeKeyPairAPI(alias: string, bitLength: number, algo: string): Promise<any> {
    return sendRequest(BACKEND_URL + '/rsa/loadKeyPair', { method: 'POST', 
        body: { 
          alias : alias,
          password : localStorage.getItem('password'),
          algo: algo,
          keySize : bitLength
          } 
      });
    }

    export async function generateDSAKeyPairAPI(alias: string ,bitLength : number): Promise<string> {
      return sendRequest(BACKEND_URL + '/dsa/storeKeyPair', {
        method: 'POST', 
        body : { 
          alias: alias,
          password : localStorage.getItem('password'),
          algo: "DSA",
          keySize : bitLength
          
        }
        });
    }
    
    export async function loadDSAKeyPairAPI(alias : string , bitLength : number): Promise<string> {
      return sendRequest(BACKEND_URL + '/dsa/loadKeyPair', {
        method: 'POST', 
        body : { 
          alias : alias,
          password : localStorage.getItem('password'),
          algo: "DSA",
          keySize : bitLength
          
        }
        });
    }

export async function signDocumentAPI(document: string, alias: string): Promise<string> {
  return sendRequest(BACKEND_URL + '/dsa/sign', { method: 'POST', 
      body: { 
        alias : alias,
        text : document,
        password : localStorage.getItem('password'),
        algo : "DSA"
        } 
    });
}

export async function verifyDocumentAPI(document: string, alias: string, signature : string): Promise<boolean> {
  return sendRequest(BACKEND_URL + '/dsa/verify', { method: 'POST', 
      body: { 
        alias : alias,
        text : document,
        signature : signature,
        algo : "DSA"
        } 
    });
}

   