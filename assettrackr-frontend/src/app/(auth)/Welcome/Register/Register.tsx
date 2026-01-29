"use client";
import React, { useState } from "react";
import { auth } from "../../firebaseClient";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import styles from './Register.module.css'
import LoadingBar from '../../LoadingBar/LoadingBar'
import { useUser } from '@/context/UserContext'

function safeRedirect(p: string | null): string {
    if (p && p.startsWith('/') && !p.startsWith('//')) { return p; }
    return '/Home';
}

export default function Register() {

    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = safeRedirect(searchParams.get("redirect"));

    const [emailReg, setEmailReg] = useState("");
    const [passwordReg, setPasswordReg] = useState("");
    const [passwordRetypeReg, setPasswordRetypeReg] = useState("");

    const [errorMsg, setErrorMsg] = useState<String | null>(null);
    const [loading, setLoading] = useState<Boolean>(false);

    const { setAuth } = useUser();

    async function register(e: React.FormEvent) {
        e.preventDefault();

        if (passwordReg != passwordRetypeReg) {
            setErrorMsg("Passwords do not match!");
            return;
        }
        
        try {
            setErrorMsg(null);
            setLoading(true);
            const { user } = await createUserWithEmailAndPassword(auth, emailReg, passwordReg);

            const idTokenReg = await user.getIdToken();

            // verifies the JWT + initialises the user (since they're new)
            const resInitialise = await fetch('/api/initialise_user', {
                method: 'POST',
                headers: { Authorization: `Bearer ${idTokenReg}` },
            });
            if (!resInitialise.ok) {
                console.error('Flask rejected:', resInitialise.status);
                throw new Error("Error in register new user. Please try again later")
            } else {
                console.log('Login verified');
            }

            // sets up a session
            const resReg = await fetch("/api/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: idTokenReg })
            });
            if (!resReg) throw new Error("Error in register new user. Please try again later")
            setAuth(user.uid, user.email);
            router.replace(redirectTo);
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
                    setErrorMsg("Incorrect password. Please try again.");
                    break;
                case "auth/too-many-requests":
                    setErrorMsg("Too many attempts. Please try again later.");
                    break;
                case "auth/network-request-failed":
                    setErrorMsg("Network error. Check your connection and try again.");
                    break;
                default:
                    setErrorMsg("Could not register. Please try again.");
            }
        }
    }

    return(
        <div>
            <h1 className={styles.welcomeMessage}>Welcome to AssetTrackR</h1>

            <form onSubmit={register}>
                <h1 className={styles.formTitles}>Email</h1>
                <input className={styles.formEntry} type='text' placeholder='Enter your email address' value={emailReg} onChange={e=>setEmailReg(e.target.value)} required></input>
                <h1 className={styles.formTitles}>Password</h1>
                <input className={styles.formEntry} type='password' placeholder='Enter your password' value={passwordReg} onChange={e=>setPasswordReg(e.target.value)} required></input>
                
                <h1 className={styles.formTitles}>Re-type password</h1>
                <input className={styles.formEntry} type='password' placeholder='Enter your password' value={passwordRetypeReg} onChange={e=>setPasswordRetypeReg(e.target.value)} required></input>
                <button className={styles.regularLogInButton} type='submit'>Create Account</button>
            </form>

            <div className={styles.errorMsgDiv}>
                <h1 className={styles.errorMsg}>{errorMsg}</h1>
                {(loading && errorMsg==null) &&  (
                    <LoadingBar/>
                )}
            </div>

          
        </div>
    )
}