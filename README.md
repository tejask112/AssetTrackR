# Paper Trading Web App

AssetTrackR is a full-stack paper trading web app that lets users simulate stock investing with virtual funds, track portfolio performance, explore stocks, manage watchlists, and review trading activity in a realistic market-style interface.

## Link to Deployed Site

[assettrackr.com](https://assettrackr.vercel.app/)

Create your own account, or use:  
email: `testing5@testing.com`  
password: `password`

## Tech Stack

- **Frontend:** Next.js (TypeScript + CSS) — deployed on Vercel
- **Backend:** Flask (Python) — deployed on Vercel
- **Database:** PostgreSQL (+ RPC Postgres functions) — deployed on Supabase
- **Workers:** TypeScript — deployed on Cloudflare

_This project tech stack was inspired by my COMP3207 Cloud coursework group._

## Features

### Authentication
- User registration and login, via email or Google Account (backed by Firebase)
- Session cookie handling for protected routes

### Paper Trading
- Virtual cash balance
- Deposit funds into a paper account
- Buy and sell stock positions
- Queue/cancel orders during closed market hours

### Portfolio Management
- View current holdings
- Track portfolio balance
- Portfolio analytics dashboard
- Performance and returns across multiple timeframes

### Market Discovery
- Explore stocks
- View company details and historical price data
- See top gainers and top losers
- Read market news

### Watchlist & History
- Add/remove stocks from a watchlist
- View trade history
- Track account timeline and portfolio changes over time

## Project Structure

```bash
AssetTrackR/
├── frontend/                      
|   └── src/app                    # Next.js frontend
|        ├── (auth)                # Login/Registration Pages
|        └── (protected)           # All Authenticated Pages
├── backend/                       
│   ├── api/                       # Flask Backend Deployment entrypoint(s)
│   ├── backend_app/               # Application factory, routes, services, utilities
│   └── supabase_pg_functions/     # All RPC Postgres functions 
├── worker/
│   ├── companydata-job/           # Company data update worker
│   ├── marketdata-job/            # Market data update worker
│   └── updatetimeline-job/        # Timeline update worker
└── docs/
```


