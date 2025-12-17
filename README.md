# 🚀 Crypto Trend Scanner

Advanced cryptocurrency trend scanner with multi-timeframe analysis, technical indicators (RSI, MACD, Volume), pattern recognition, and support/resistance detection.

## Features

- ✅ Multi-timeframe analysis (15m, 1h, 4h, 1d, 1w)
- ✅ Multi-pair comparison (USDT, BTC, ETH)
- ✅ Advanced technical indicators (RSI, MACD, Moving Averages)
- ✅ Volume analysis and confirmation
- ✅ Support & Resistance level detection
- ✅ Pattern recognition (breakouts, consolidations, trends)
- ✅ ROI scoring system (0-100)
- ✅ Real-time Binance API integration
- ✅ Demo mode with realistic sample data
- ✅ Configurable sensitivity and thresholds

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open http://localhost:3000

### Build for Production

```bash
npm run build
```

## Deployment on Netlify

This project is configured for easy deployment on Netlify:

1. Push your code to GitHub
2. Connect your GitHub repo to Netlify
3. Build settings are automatic (Netlify detects Vite)
4. Deploy!

**Build Settings:**
- Build command: `npm run build`
- Publish directory: `dist`

## How to Use

1. **Select Timeframes**: Choose which timeframes to analyze (1h, 4h, 1d, 1w recommended)
2. **Configure Settings**: Adjust sensitivity, RSI levels, volume filters
3. **Start Scan**: Click to analyze popular crypto assets
4. **Review Results**: Assets sorted by ROI score (higher = better setup)
5. **Expand Details**: Click any asset to see detailed analysis per timeframe and pair

## Understanding the Scores

- **ROI Score 75-100**: Exceptional setup with strong trend alignment
- **ROI Score 60-74**: Good setup with solid trend development
- **ROI Score 40-59**: Moderate setup with mixed signals
- **ROI Score 0-39**: Low confidence with conflicting indicators

## Technical Indicators Explained

- **RSI**: Momentum indicator (>70 overbought, <30 oversold)
- **MACD**: Trend and momentum indicator
- **Volume**: Confirms price movements
- **S/R Levels**: Key price levels for entry/exit
- **Patterns**: Consolidation, breakout, ranging, trends

## Demo Mode

If network access is unavailable, the scanner automatically switches to demo mode with realistic sample data to demonstrate functionality.

## Disclaimer

This tool is for informational purposes only. Not financial advice. Always do your own research before making investment decisions.

## License

MIT
