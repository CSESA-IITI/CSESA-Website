import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserDebugInfo: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-900 text-white p-4 rounded-lg text-sm">
        <h4 className="font-bold">Debug: No User</h4>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg text-sm max-w-xs">
      <h4 className="font-bold mb-2">Debug: User State</h4>
      <div>Email: {user.email}</div>
      <div>Name: {user.first_name} {user.last_name}</div>
      <div className={`font-bold ${user.is_onboarded ? 'text-green-400' : 'text-red-400'}`}>
        Onboarded: {user.is_onboarded ? 'YES' : 'NO'}
      </div>
      <div className="mt-2 text-xs">
        LocalStorage Flag: {localStorage.getItem('onboarding_completed') || 'none'}
      </div>
    </div>
  );
};

export default UserDebugInfo;