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
  
  const BACKEND_URL = 'http://localhost:3000'; 
  
  export async function generateSymmetricKey(alias: string): Promise<any> {
    // return sendRequest(BACKEND_URL + `url`, {
    //   method: "POST",
    //   body: { alias }, 
    // });
    // return true;
}

export async function fetchSymmetricKeys(): Promise<any> {
    // return sendRequest(BACKEND_URL + '/keys');
    
        return ['key1', 'key2', 'key3'];
    
}

export async function fetchAsymmetricKeys(): Promise<Array<{ publicKey: string, privateKey: string }>> {
    return [
        {
            publicKey: "publicKey1",
            privateKey: "privateKey1",
        },
        {
            publicKey: "publicKey2",
            privateKey: "privateKey2",
        },
        {
            publicKey: "publicKey3",
            privateKey: "privateKey3",
        },
    ];
}

export async function encryptDataSymmetric(text: string, key: string): Promise<string> {
    // For now, we'll just return a placeholder string
    return 'Encrypted data';
}

export async function decryptDataSymmetric(text: string, key: string): Promise<string> {
    // For now, we'll just return a placeholder string
    return 'Decrypted data';
}

export async function encryptDataAsymmetric(text: string, key: string): Promise<string> {
    // For now, we'll just return a placeholder string
    return 'Encrypted data';
}

export async function decryptDataAsymmetric(text: string, key: string): Promise<string> {
    // For now, we'll just return a placeholder string
    return 'Decrypted data';
}

export async function generateKeyPairAPI(): Promise<{ publicKey: string, privateKey: string }> {
    try {
        // const response = await sendRequest(BACKEND_URL + '/generate-key-pair', { method: 'POST' });
        return {
            publicKey: "adkasdlj",
            privateKey: "jadlljasljdl",
        };
    } catch (error) {
        throw new Error('Failed to generate key pair');
    }
}

export async function signDocumentAPI(document: string, privateKey: string): Promise<string> {
    try {
        // const response = await sendRequest(BACKEND_URL + '/sign-document', { method: 'POST', body: { document, privateKey } });
        return 'Signed document';
    }
    catch (error) {
        throw new Error('Failed to sign document');
    }
}

   