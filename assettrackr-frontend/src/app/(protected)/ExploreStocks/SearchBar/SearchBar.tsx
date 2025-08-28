import ResultBox from './ResultBox/ResultBox';
import styles from './SearchBar.module.css';
import { useState, useRef  } from 'react';

export default function SearchBar() {

    const [input, setInput] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const saveValue = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchTerm(input);
    }

    const handleClear = () => {
        setInput("");
        setSearchTerm("");
    }

    return (
        <div className={styles.searchStockDiv}>
            <h1 className={styles.searchText}>Search for a stock</h1>
            <form onSubmit={saveValue} className={styles.searchForm}>
                <div className={styles.searchArea}>
                    <input className={styles.searchBox} type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter Symbol/Company Name"></input>
                    <button className={styles.searchButton}>Search</button>
                    <button className={styles.clearButton} onClick={handleClear}>Clear Result</button>
                </div>
            </form>
            <div>
                <ResultBox lookupValue={searchTerm}/>
            </div>
        </div>
    )

}