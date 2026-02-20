"use client";
import React, { useState } from "react";
import { auth } from "../../firebaseClient";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from '@/context/UserContext'
import styles from './Login.module.css'
import LoadingBar from '../../LoadingBar/LoadingBar'
import Image from 'next/image';

interface FirebaseError {
    code: string;
    message: string;
}

function safeRedirect(path: string | null): string {
    if (path && path.startsWith('/') && !path.startsWith('//')) return path; 
    return '/Home';
}

export default function Login() {
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = safeRedirect(searchParams.get("redirect"));

    const { setAuth } = useUser();

    async function loginEmail(e: React.FormEvent) {
        e.preventDefault();
        
        if (email == '' && password == '') {
            setErrorMsg("Please enter login details");
            return;
        }
        if (email == '') {
            setErrorMsg("Please enter an email");
            return;
        }
        if (password == '') {
            setErrorMsg("Please enter a password");
            return;
        }
        setErrorMsg('');

        try{
            const { user } = await signInWithEmailAndPassword(auth, email, password);
            setLoading(true);
            const idToken = await user.getIdToken(); // <--- RETRIEVES THE JWT (email + password)#

            // verifies the JWT 
            const res = await fetch('/api/authenticate', {
                method: 'POST',
                headers: { Authorization: `Bearer ${idToken}` },
            });
            if (!res.ok) {
                console.error('Flask rejected:', res.status);
            } else {
                console.log('Login verified');
            }

            // sets up a session
            const res2 = await fetch('/api/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken })
            })
            if (!res2.ok) {
                console.error('Failed to create session');
            } else {
                console.log('Session created');
                setAuth(user.uid, user.email);
                router.replace(redirectTo);
            }    
        } catch (err: unknown) {
            const fbErr = err as FirebaseError;
            switch (fbErr.code) {
            case "auth/invalid-email":
                setErrorMsg("That email address is not valid.");
                break;
            case "auth/user-disabled":
                setErrorMsg("This account has been disabled.");
                break;
            case "auth/user-not-found":
                setErrorMsg("No account found with that email.");
                break;
            case "auth/wrong-password":    
            case "auth/invalid-credential":  
                setErrorMsg("Incorrect credentials. Please try again.");
                break;
            case "auth/too-many-requests":
                setErrorMsg("Too many attempts. Please try again later.");
                break;
            case "auth/network-request-failed":
                setErrorMsg("Network error. Check your connection and try again.");
                break;
            default:
                setErrorMsg("Could not sign in. Please try again.");
            }  
        }
    }

    async function loginGoogle() {
        try{
            const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
            const idToken = await user.getIdToken(); // <--- RETRIEVES THE JWT (google sign on)
            
            // verifies the JWT 
            const res = await fetch('/api/authenticate', {
                method: 'POST',
                headers: { Authorization: `Bearer ${idToken}` },
            });
            if (!res.ok) {
                console.error('Flask rejected:', res.status);
            } else {
                console.log('Login verified');
            }

            // sets up a session
            const res2 = await fetch('/api/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken })
            })
            if (!res2.ok) {
                console.error('Failed to create session');
            } else {
                console.log('Session created');
                setAuth(user.uid, user.email);
                router.replace(redirectTo);
            }  
        } catch (err: unknown) {
            const fbErr = err as FirebaseError;
            switch (fbErr.code) {
            case "auth/invalid-email":
                setErrorMsg("That email address is not valid.");
                break;
            case "auth/user-disabled":
                setErrorMsg("This account has been disabled.");
                break;
            case "auth/user-not-found":
                setErrorMsg("No account found with that email.");
                break;
            case "auth/wrong-password":    
            case "auth/invalid-credential":  
                setErrorMsg("Incorrect credentials. Please try again.");
                break;
            case "auth/too-many-requests":
                setErrorMsg("Too many attempts. Please try again later.");
                break;
            case "auth/network-request-failed":
                setErrorMsg("Network error. Check your connection and try again.");
                break;
            default:
                setErrorMsg("Could not sign in. Please try again.");
            }  
        }
    }

    return (
        <div className={styles.entireDiv}>
            <h1 className={styles.welcomeMessage}>Welcome to AssetTrackR</h1>
            <button className={styles.googleLogInButton} onClick={loginGoogle}>
                <span>Log in with</span>
                <Image src="/images/google-logo.png" alt="GOOGLE" className={styles.icon}/>
            </button>

            <div className={styles.orDivider} role="separator" aria-label="or">
                <span className={styles.orText}>OR</span>
            </div>

            <form onSubmit={loginEmail}>
                <h1 className={styles.formTitles}>Email</h1>
                <input className={styles.formEntry} type='text' placeholder='Enter your email address' value={email} onChange={(e) => setEmail(e.target.value)}></input>
                <h1 className={styles.formTitles}>Password</h1>
                <input className={styles.formEntry} type='password' placeholder='Enter your password' value={password} onChange={(e) => setPassword(e.target.value)}></input>
                <button className={styles.regularLogInButton}  type='submit'>Log in</button>
            </form>

            <div className={styles.errorMsgDiv}>
                <h1 className={styles.errorMsg}>{errorMsg}</h1>
                {loading && (
                    <LoadingBar/>
                )}
            </div>

        </div>
        
    );
    
}