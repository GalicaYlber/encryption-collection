import React, { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setKeyStorePassword } from '../main/API';

interface ButtonProps {
    path: string;
    label: string;
    componentProps: object;
}

const NavigationButton: React.FC<ButtonProps> = ({ path, label, componentProps }) => {
    const navigate = useNavigate();


    const handleButtonClick = () => {
        navigate(path, { state: { props: componentProps } });
    }

    return (
        <button onClick={handleButtonClick}>{label}</button>
    );
}

export default function Home() {
    const [password, setPassword] = useState<string>('');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        localStorage.getItem('password') && setPassword(localStorage.getItem('password') as string);
        handlePassword(localStorage.getItem('password'));
    }, []);

    // useEffect(() => {
    //     if (password === 'password') {
    //         setIsAuthenticated(true);
    //     }
    // }, [password]);

    function handlePassword(password : any) {
        localStorage.setItem('password', password);
        setPassword(password);
        setKeyStorePassword(password);
        if(password === 'password')
            setIsAuthenticated(true);
        else
            setIsAuthenticated(false);
    }
    
    return (

            <div className="container home">
                {isAuthenticated ? 
                (
                    <>
                     <h1>Choose an encryption method:</h1>
                        <div className="button-container">
                            <NavigationButton path="/aes" label="AES" componentProps={{ type: 'aes' }} />
                            <NavigationButton path="/rsa" label="RSA" componentProps={{ type: 'rsa' }} />
                            <NavigationButton path="/dsa" label="DSA" componentProps={{ type: 'dsa' }} />
                        </div>
                    </>
                ) : (
                    <>
                        <h1>Enter the password:</h1>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button onClick={() => handlePassword(password)}>Submit</button>
                    </>
                )}
                
            </div>
  

    );
}