"use client";
import React, { useState } from "react";
import { auth } from "../firebaseClient";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
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

    async function register(e: React.FormEvent) {
        e.preventDefault();
        
        try {
            const cred = await createUserWithEmailAndPassword(auth, emailReg, passwordReg);

            const idTokenReg = await cred.user.getIdToken();

            // verifies the JWT + initialises the user (since they're new)
            const resInitialise = await fetch('/api/initialise_user', {
                method: 'POST',
                headers: { Authorization: `Bearer ${idTokenReg}` },
            });
            if (!resInitialise.ok) {
                console.error('Flask rejected:', resInitialise.status);
                throw new Error("error in register new user - initialising user")
            } else {
                console.log('Login verified');
            }

            // sets up a session
            const resReg = await fetch("/api/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: idTokenReg })
            });
            if (!resReg) throw new Error("error in register new user - creating session")
            console.log('Session created');
            router.replace(redirectTo);
        } catch (err: any) {
            console.log(err.message || "Registration failed.");
        }
        
        
    }

    return(
        <div>
            <h1>Register:</h1>
            <form onSubmit={register}>
                <input type="email" placeholder="Email" value={emailReg} onChange={e=>setEmailReg(e.target.value)} required />
                <input type="password" placeholder="Password" value={passwordReg} onChange={e=>setPasswordReg(e.target.value)} required />
                <button type="submit">Create Account</button>
            </form>
        </div>
    )
}