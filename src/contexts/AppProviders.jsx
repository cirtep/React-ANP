import React from "react";
import { AuthProvider } from "./AuthContext";

const AppProviders = ({ children }) => <AuthProvider>{children}</AuthProvider>;

export default AppProviders;
