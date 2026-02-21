import { getAuth, onAuthStateChanged } from "firebase/auth";

export function waitForUser() {
    const auth = getAuth();
    return new Promise<typeof auth.currentUser>((resolve) => {
        const unsub = onAuthStateChanged(auth, (user) => {
            unsub();
            resolve(user);
        });
    });
}

export async function getFirebaseJWT(): Promise<string> {
    const user = await waitForUser();
    if (!user) throw new Error("Could not authenticate");
    return await user.getIdToken(false);
}
