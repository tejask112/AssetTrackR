import ResultBox from './ResultBox/ResultBox';
import styles from './SearchBar.module.css';
import { useState } from 'react';

export default function SearchBar() {

    const [input, setInput] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const saveValue = () => {
        setSearchTerm(input);
    }

    return (
        <div className={styles.searchStockDiv}>
            <h1 className={styles.searchText}>Search for a stock</h1>
            <div className={styles.searchArea}>
                <input className={styles.searchBox} type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter Symbol/Company Name"></input>
                <button className={styles.searchButton} onClick={saveValue}>Search</button>
                <button className={styles.clearButton}>Clear</button>
            </div>
            <div>
                <ResultBox lookupValue={searchTerm}/>
            </div>
                
        </div>
    )

}