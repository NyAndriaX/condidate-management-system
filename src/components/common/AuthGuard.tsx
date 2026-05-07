import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';

import { authService } from '../../services';

interface AuthGuardProps {
  children: ReactElement;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const token = authService.getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthGuard;
