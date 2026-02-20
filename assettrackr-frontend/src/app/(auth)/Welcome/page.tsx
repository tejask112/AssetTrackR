'use client'
import Login from "./Login/Login";
import styles from './Welcome.module.css'
import StockTickers from "../StockTickers/StockTickers";
import { useState } from "react";
import Register from "./Register/Register";


export default function Welcome() {

    const [login, setLogin] = useState<boolean>(true);
    const [register, setRegister] = useState<boolean>(false);

    const toggleLogin = () => {
        setLogin(true);
        setRegister(false);
    }

    const toggleRegister = () => {
        setLogin(false);
        setRegister(true);
    }

    return(
        <div className={styles.entireDiv}>
            <div className={styles.leftDiv}>
                <StockTickers marketSector="Technology"/>
                <StockTickers marketSector="Financials"/>
                <StockTickers marketSector="Healthcare"/>
                <StockTickers marketSector="Consumer Staples"/>
                <StockTickers marketSector="Energy"/>
            </div>
            
            <div className={styles.rightDiv}> 
                {login && <Login/>}
                {register && <Register/>}

                {login && (
                    <div className={styles.loginUtilitiesDiv}>
                        <h1 className={styles.loginUtilitiesText}>Don&apos;t have an account?</h1>
                        <button onClick={toggleRegister} className={styles.loginUtilitiesButton}>Sign Up!</button>
                    </div>  
                )}

                {register && (
                    <div className={styles.loginUtilitiesDiv}>
                        <h1 className={styles.loginUtilitiesText}>Already have an account?</h1>
                        <button onClick={toggleLogin} className={styles.loginUtilitiesButton}>Log in!</button>
                    </div>  
                )}
            </div>
        </div>
    )
}