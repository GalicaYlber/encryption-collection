import React from 'react';
import { useNavigate } from 'react-router-dom';

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
    return (
        <div className="container home">
            <h1>Choose an encryption method:</h1>
            <div className="button-container">
                <NavigationButton path="/aes" label="AES" componentProps={{ type: 'aes' }} />
                <NavigationButton path="/rsa" label="RSA" componentProps={{ type: 'rsa' }} />
                <NavigationButton path="/dsa" label="DSA" componentProps={{ type: 'dsa' }} />
            </div>
        </div>
    );
}