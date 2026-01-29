"use client";
import React, { useState } from "react";
import { auth } from "../../firebaseClient";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from '@/context/UserContext'
import styles from './Login.module.css'
import LoadingBar from '../../LoadingBar/LoadingBar'

function safeRedirect(p: string | null): string {
    if (p && p.startsWith('/') && !p.startsWith('//')) { return p; }
    return '/Home';
}

export default function Login() {
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [errorMsg, setErrorMsg] = useState<String | null>(null);
    const [loading, setLoading] = useState<Boolean>(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = safeRedirect(searchParams.get("redirect"));

    const { setAuth } = useUser();

    async function loginEmail(e: React.FormEvent) {
        console.log("button pressed")
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
        } catch (err: any) {
            switch (err.code) {
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
        } catch (err: any) {
            switch (err.code) {
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
                {/* <Image src="/images/google-logo.jpg" alt="" width={320} height={320} unoptimized className={styles.icon}/> */}
                <span>Log in with Google</span>
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