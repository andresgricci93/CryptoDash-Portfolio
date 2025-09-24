import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Loader } from 'lucide-react';

const PasswordCompromiseCheck = ({ 
  password, 
  onStatusChange,
  shouldCheck = false,
  isPasswordStrong = false 
}) => {
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'clean', 'compromised', 'error'
  const [breachCount, setBreachCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheckedPassword, setLastCheckedPassword] = useState('');

  const checkPassword = async (password) => {
    // Do not verify if it is the same password that we already verified
    if (password === lastCheckedPassword && status !== 'idle') {
      return;
    }
    
    setLastCheckedPassword(password);
    setIsLoading(true);
    
    try {
      // 1. Hash SHA-1 of password
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
      
      // 2. Take the first 5 characters (k-anonymity)
      const prefix = hashHex.substring(0, 5);
      const suffix = hashHex.substring(5);
      
      // 3. API call with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); 
      
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.status === 404) {

        setStatus('clean');
        setBreachCount(0);
        onStatusChange(false, 'Password is clean');
      } else if (response.status === 200) {
        const text = await response.text();
        const lines = text.split('\n');
        
        // 4. Search for the suffix in the response
        const found = lines.find(line => line.startsWith(suffix));
        
        if (found) {
          const count = parseInt(found.split(':')[1]);
          setBreachCount(count);
          setStatus('compromised');
          onStatusChange(true, `This password is compromised, present in ${count} data breaches. Choose another password.`);
        } else {
          setStatus('clean');
          setBreachCount(0);
          onStatusChange(false, 'Password is clean');
        }
      } else {
        throw new Error('API responded with unexpected status');
      }
    } catch (error) {
      console.log('HaveIBeenPwned API error:', error);
      setStatus('error');
      setBreachCount(0);
      onStatusChange(false, 'HaveIBeenPwned API not available');
    } finally {
      setIsLoading(false);
    }
  };

  // Function that only executes when called manually
  const performCheck = () => {
    if (password && password.length > 0 && isPasswordStrong) {
      checkPassword(password);
    } else {
      setStatus('idle');
      setBreachCount(0);
      onStatusChange(false, '');
    }
  };

  useEffect(() => {
    if (shouldCheck) {
      performCheck();
    }
  }, [shouldCheck]); // Only when shouldCheck changes to true

  const renderStatus = () => {
    if (isLoading) {
      return (
        <div className="flex items-center text-blue-400 text-sm mt-2">
          <Loader className="w-4 h-4 mr-2 animate-spin" />
          Checking password security...
        </div>
      );
    }
    
    switch (status) {
      case 'clean':
        return (
          <div className="flex items-center text-green-500 text-sm mt-2">
            <CheckCircle className="w-4 h-4 mr-2" />
            Password is clean
          </div>
        );
      case 'compromised':
        return (
          <div className="flex items-start text-red-500 text-sm mt-2">
            <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>
              This password is compromised, present in {breachCount} data breaches. Choose another password.
            </span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-gray-400 text-sm mt-2">
            <Shield className="w-4 h-4 mr-2" />
            HaveIBeenPwned API not available
          </div>
        );
      default:
        return null;
    }
  };

  // Only render if there is something to show
  if (status === 'idle') return null;

  return (
    <div className="mb-4">
      {renderStatus()}
    </div>
  );
};

export default PasswordCompromiseCheck;