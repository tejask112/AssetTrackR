"use client";
import React, { useState } from "react";
import { auth } from "../firebaseClient";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";

function safeRedirect(p: string | null): string {
    if (p && p.startsWith('/') && !p.startsWith('//')) { return p; }
    return '/Home';
}

export default function Login() {

    // ----------------------------------- LOGIN -----------------------------------
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = safeRedirect(searchParams.get("redirect"));

    async function loginEmail(e: React.FormEvent) {
        console.log("button pressed")
        e.preventDefault();
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await user.getIdToken(); // <--- RETRIEVES THE JWT (email + password)#

        // verifies the JWT 
        const res = await fetch('/api/hello-flask', {
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
            router.replace(redirectTo);
        }        
    }

    // async function loginGoogle() {
    //     const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
    //     const idToken = await user.getIdToken(); // <--- RETRIEVES THE JWT (google sign on)
    //     await fetch('/api/hello-flask', {
    //         method: 'POST',
    //         headers: { 'Authorisation': `Bearer ${idToken}` }
    //     });
    //     redirect("/Home")
    // }

    // ----------------------------------- REGISTER -----------------------------------

    const [emailReg, setEmailReg] = useState("");
    const [passwordReg, setPasswordReg] = useState("");

    async function register(e: React.FormEvent) {
        e.preventDefault();
        
        try {
            const cred = await createUserWithEmailAndPassword(auth, emailReg, passwordReg);

            const idTokenReg = await cred.user.getIdToken();
            const resReg = await fetch("/api/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: idTokenReg })
            });
            if (!resReg) throw new Error("error in register new user - creating session")
            console.log('Session created');
            router.replace(redirectTo);
        } catch (err: any) {
            const code = err?.code || "";
            if (code === "auth/email-already-in-use") console.log("That email is already registered.");
            else if (code === "auth/invalid-email") console.log("Please enter a valid email address.");
            else if (code === "auth/weak-password") console.log("Password is too weak (min 6 chars).");
            else console.log(err.message || "Registration failed.");
        }
        
        
    }

    return (
        <div>
            <h1>Login:</h1>
            <form onSubmit={loginEmail}>
                <input type='text' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)}></input>
                <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)}></input>
                <button type='submit'>Log in</button>
            </form>
            
            <h1>Register:</h1>
            <form onSubmit={register}>
                <input type="email" placeholder="Email" value={emailReg} onChange={e=>setEmailReg(e.target.value)} required />
                <input type="password" placeholder="Password" value={passwordReg} onChange={e=>setPasswordReg(e.target.value)} required />
                <button type="submit">Create Account</button>
            </form>

        </div>

        
    );
    
}