import React, { useEffect } from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import AuthService from "../../services/auth";

interface ProtectedRouteProps extends RouteProps {
  requiresAdmin?: boolean;
  component: React.ComponentType<any>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, requiresAdmin = false, ...rest }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  const isAdmin = AuthService.isAdmin();

  useEffect(() => {
    // Force check authentication and admin status
    if (!isAuthenticated) {
      return;
    }
    if (requiresAdmin && !isAdmin) {
      window.location.href = "/";
    }
  }, [isAuthenticated, isAdmin, requiresAdmin]);

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          requiresAdmin && !isAdmin ? (
            <Redirect to="/" />
          ) : (
            <Component {...props} />
          )
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};

export default ProtectedRoute;
