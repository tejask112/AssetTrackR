import Login from "../Login/Login";
import WelcomeText from '../WelcomeText/WelcomeText'
import styles from './Welcome.module.css'

export default function Welcome() {
    return(
        <div className={styles.entireDiv}>
            <div className={styles.halfDiv}>
                <h1>Welcome</h1>
            </div>
            <div className={styles.halfDiv}> 
                <Login/>
            </div>
        </div>
    )
}