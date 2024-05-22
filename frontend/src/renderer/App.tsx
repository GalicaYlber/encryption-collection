import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import Home from './Home';
import AES from './AES';
import RSA from './RSA';
import DSA from './DSA';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aes" element={<AES />} />
        <Route path="/rsa" element={<RSA />} />
        <Route path="/dsa" element={<DSA />} />
      </Routes>
    </Router>
  );
}
