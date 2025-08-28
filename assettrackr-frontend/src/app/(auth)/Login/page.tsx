"use client";
import React, { useState } from "react";
import { auth } from "../firebaseClient";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";

function safeRedirect(p: string | null): string {
    if (p && p.startsWith('/') && !p.startsWith('//')) { return p; }
    return '/Home';
}

export default function Login() {
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = safeRedirect(searchParams.get("redirect"));

    async function loginEmail(e: React.FormEvent) {
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

    return (
        <form onSubmit={loginEmail}>
            <input type='text' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)}></input>
            <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)}></input>
            <button type='submit'>Log in</button>
        </form>
    );
    
}