'use client'
import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";

type UserContextValue = {
    userID: string | null;
    userEmail: string | null;
    setUserID: (v: string | null) => void;
    setUserEmail: (v: string | null) => void;
    setAuth: (id: string | null, email: string | null) => void;
    clear: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider(
    { initialUser = null, initialEmail = null, children, persist = false }: 
    { initialUser?: null, initialEmail?: null, children: ReactNode, persist?: boolean }) {

    const [userID, setUserID] = useState<string | null>(initialUser);
    const [userEmail, setUserEmail] = useState<string | null>(initialEmail);
    
    useEffect(() => {
        if (!persist) return;

        const savedUID = localStorage.getItem("uid");
        if ((savedUID && savedUID !== userID)) { setUserID(savedUID); } 
        
        const savedUEmail = localStorage.getItem("email");
        if ((savedUEmail && savedUEmail !== userEmail)) { setUserEmail(savedUEmail); }
    }, [persist]);

    useEffect(() => {
        if (!persist) return;
        if (userID) localStorage.setItem("uid", userID);
        else localStorage.removeItem("uid");

        if (userEmail) localStorage.setItem("email", userEmail);
        else localStorage.removeItem("email");
    }, [userID, userEmail, persist]);

    const clear = () => {
        setUserID(null);
        setUserEmail(null);
    }

    const setAuth = (id: string | null, email: string | null) => {
        setUserID(id);
        setUserEmail(email);
    }
    
    // useMemo avoids creating a new object for each render
    const value = useMemo(                          
        () => ({ userID, userEmail, setUserID, setUserEmail, setAuth, clear }), [userID]
    );

    return (
        <UserContext.Provider value={ value }>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be within UserProvider");
    return context;
}