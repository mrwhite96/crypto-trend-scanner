import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Search, RefreshCw, AlertCircle, ChevronDown, ChevronUp, Settings, Activity, BarChart3, Zap, Wifi, WifiOff } from 'lucide-react';

const CryptoTrendScanner = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('roiScore');
  const [expandedAsset, setExpandedAsset] = useState(null);
  const [selectedTimeframes, setSelectedTimeframes] = useState(['1h', '4h', '1d', '1w']);
  const [showSettings, setShowSettings] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  
  const [settings, setSettings] = useState({
    trendSensitivity: 'medium',
    minVolume: 1000000,
    rsiOverbought: 70,
    rsiOversold: 30,
    includePatterns: true,
    includeVolume: true,
    minChangePercent: 1.5
  });

  const timeframes = [
    { value: '15m', label: '15 Min', interval: '15m', limit: 96 },
    { value: '1h', label: '1 Hour', interval: '1h', limit: 48 },
    { value: '4h', label: '4 Hours', interval: '4h', limit: 42 },
    { value: '1d', label: '1 Day', interval: '1d', limit: 30 },
    { value: '1w', label: '1 Week', interval: '1w', limit: 20 }
  ];

  const popularAssets = [
    'BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'DOGE', 'SOL', 'MATIC', 'DOT', 'AVAX',
    'LINK', 'UNI', 'ATOM', 'LTC', 'BCH', 'XLM', 'ALGO', 'VET', 'FIL', 'TRX',
    'NEAR', 'APT', 'ARB', 'OP', 'SUI'
  ];

  // Generate realistic mock data
  const generateMockCandles = (basePrice, trend, volatility, count) => {
    const candles = [];
    let price = basePrice;
    
    for (let i = 0; i < count; i++) {
      const trendChange = trend === 'bullish' ? Math.random() * 0.02 : trend === 'bearish' ? -Math.random() * 0.02 : (Math.random() - 0.5) * 0.01;
      const noise = (Math.random() - 0.5) * volatility;
      
      price = price * (1 + trendChange + noise);
      
      const open = price * (1 + (Math.random() - 0.5) * 0.005);
      const close = price * (1 + (Math.random() - 0.5) * 0.005);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = 1000000 + Math.random() * 5000000;
      
      candles.push([
        Date.now() - (count - i) * 3600000,
        open.toString(),
        high.toString(),
        low.toString(),
        close.toString(),
        volume.toString(),
        Date.now() - (count - i - 1) * 3600000,
        (volume * price).toString(),
        100,
        (volume * 0.5).toString(),
        (volume * price * 0.5).toString(),
        '0'
      ]);
    }
    
    return candles;
  };

  const generateMockTickerData = (baseVolume, priceChange) => {
    return {
      volume: (baseVolume * (0.8 + Math.random() * 0.4)).toString(),
      quoteVolume: (baseVolume * (0.8 + Math.random() * 0.4)).toString(),
      priceChangePercent: (priceChange + (Math.random() - 0.5) * 2).toString()
    };
  };

  // Mock data patterns for different assets
  const mockAssetPatterns = {
    'BTC': { trend: 'bullish', volatility: 0.01, basePrice: 45000, volume: 25000000000, change: 3.5 },
    'ETH': { trend: 'bullish', volatility: 0.015, basePrice: 2400, volume: 12000000000, change: 4.2 },
    'LINK': { trend: 'neutral', volatility: 0.005, basePrice: 14.5, volume: 180000000, change: 0.8 },
    'SOL': { trend: 'bullish', volatility: 0.02, basePrice: 110, volume: 2500000000, change: 5.1 },
    'MATIC': { trend: 'bearish', volatility: 0.015, basePrice: 0.85, volume: 450000000, change: -2.3 },
    'DOGE': { trend: 'neutral', volatility: 0.02, basePrice: 0.09, volume: 800000000, change: 1.1 },
    'XRP': { trend: 'bullish', volatility: 0.012, basePrice: 0.62, volume: 1500000000, change: 2.8 },
    'ADA': { trend: 'neutral', volatility: 0.01, basePrice: 0.58, volume: 380000000, change: -0.5 },
    'AVAX': { trend: 'bullish', volatility: 0.018, basePrice: 38, volume: 620000000, change: 3.9 },
    'DOT': { trend: 'bearish', volatility: 0.013, basePrice: 7.2, volume: 280000000, change: -1.8 }
  };

  const calculateRSI = (prices, period = 14) => {
    if (prices.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  const calculateMACD = (prices) => {
    if (prices.length < 26) return { macd: 0, signal: 0, histogram: 0 };
    
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    
    const recentPrices = prices.slice(-9);
    const signal = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    
    return {
      macd: macd,
      signal: signal,
      histogram: macd - signal
    };
  };

  const calculateEMA = (prices, period) => {
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    
    return ema;
  };

  const calculateMA = (prices, period) => {
    if (prices.length < period) return prices[prices.length - 1];
    const recent = prices.slice(-period);
    return recent.reduce((a, b) => a + b, 0) / period;
  };

  const detectSupportResistance = (candles) => {
    const highs = candles.map(c => parseFloat(c[2]));
    const lows = candles.map(c => parseFloat(c[3]));
    const closes = candles.map(c => parseFloat(c[4]));
    
    const currentPrice = closes[closes.length - 1];
    const recentHigh = Math.max(...highs.slice(-10));
    const recentLow = Math.min(...lows.slice(-10));
    
    const distanceFromResistance = ((recentHigh - currentPrice) / currentPrice) * 100;
    const distanceFromSupport = ((currentPrice - recentLow) / currentPrice) * 100;
    
    return {
      resistance: recentHigh,
      support: recentLow,
      distanceFromResistance: distanceFromResistance.toFixed(2),
      distanceFromSupport: distanceFromSupport.toFixed(2),
      nearResistance: distanceFromResistance < 2,
      nearSupport: distanceFromSupport < 2
    };
  };

  const detectPattern = (candles) => {
    const closes = candles.map(c => parseFloat(c[4]));
    const highs = candles.map(c => parseFloat(c[2]));
    const lows = candles.map(c => parseFloat(c[3]));
    
    const recentCloses = closes.slice(-10);
    const volatility = Math.max(...recentCloses) - Math.min(...recentCloses);
    const avgPrice = recentCloses.reduce((a, b) => a + b, 0) / recentCloses.length;
    const volatilityPercent = (volatility / avgPrice) * 100;
    
    if (volatilityPercent < 5) {
      return { pattern: 'consolidation', confidence: 'high' };
    }
    
    const currentPrice = closes[closes.length - 1];
    const recentHigh = Math.max(...highs.slice(-20, -1));
    const recentLow = Math.min(...lows.slice(-20, -1));
    
    if (currentPrice > recentHigh * 1.02) {
      return { pattern: 'breakout-bullish', confidence: 'high' };
    }
    if (currentPrice < recentLow * 0.98) {
      return { pattern: 'breakout-bearish', confidence: 'high' };
    }
    
    const mid = Math.floor(recentCloses.length / 2);
    const firstHalf = recentCloses.slice(0, mid);
    const secondHalf = recentCloses.slice(mid);
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg * 1.03) {
      return { pattern: 'uptrend', confidence: 'medium' };
    }
    if (secondAvg < firstAvg * 0.97) {
      return { pattern: 'downtrend', confidence: 'medium' };
    }
    
    return { pattern: 'ranging', confidence: 'medium' };
  };

  const calculateAdvancedTrend = (candles, timeframe) => {
    if (!candles || candles.length < 20) return { trend: 'neutral', confidence: 0, indicators: {} };
    
    const closes = candles.map(c => parseFloat(c[4]));
    const volumes = candles.map(c => parseFloat(c[5]));
    const highs = candles.map(c => parseFloat(c[2]));
    const lows = candles.map(c => parseFloat(c[3]));
    
    const currentPrice = closes[closes.length - 1];
    const firstPrice = closes[0];
    const priceChange = ((currentPrice - firstPrice) / firstPrice) * 100;
    
    const ma5 = calculateMA(closes, 5);
    const ma10 = calculateMA(closes, 10);
    const ma20 = calculateMA(closes, 20);
    const ema9 = calculateEMA(closes, 9);
    const ema21 = calculateEMA(closes, 21);
    
    const rsi = calculateRSI(closes);
    const macd = calculateMACD(closes);
    
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const recentVolume = volumes.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const volumeIncrease = ((recentVolume - avgVolume) / avgVolume) * 100;
    
    const srLevels = detectSupportResistance(candles);
    const pattern = detectPattern(candles);
    
    let bullishScore = 0;
    let bearishScore = 0;
    let signals = [];
    
    if (currentPrice > ma5 && ma5 > ma10 && ma10 > ma20) {
      bullishScore += 2;
      signals.push('MA alignment bullish');
    } else if (currentPrice < ma5 && ma5 < ma10 && ma10 < ma20) {
      bearishScore += 2;
      signals.push('MA alignment bearish');
    }
    
    if (ema9 > ema21) {
      bullishScore += 1;
      signals.push('EMA cross bullish');
    } else if (ema9 < ema21) {
      bearishScore += 1;
      signals.push('EMA cross bearish');
    }
    
    if (rsi > 50 && rsi < settings.rsiOverbought) {
      bullishScore += 1;
      signals.push('RSI bullish momentum');
    } else if (rsi < 50 && rsi > settings.rsiOversold) {
      bearishScore += 1;
      signals.push('RSI bearish momentum');
    }
    
    const sensitivityMultiplier = {
      'low': 3,
      'medium': 2,
      'high': 1.5
    }[settings.trendSensitivity];
    
    if (Math.abs(priceChange) > settings.minChangePercent) {
      if (priceChange > settings.minChangePercent) {
        bullishScore += 1;
        signals.push('Price momentum up');
      } else if (priceChange < -settings.minChangePercent) {
        bearishScore += 1;
        signals.push('Price momentum down');
      }
    }
    
    if (macd.histogram > 0 && macd.macd > macd.signal) {
      bullishScore += 1;
      signals.push('MACD bullish');
    } else if (macd.histogram < 0 && macd.macd < macd.signal) {
      bearishScore += 1;
      signals.push('MACD bearish');
    }
    
    if (settings.includeVolume && volumeIncrease > 20) {
      if (priceChange > 0) {
        bullishScore += 1;
        signals.push('Volume confirms up');
      } else if (priceChange < 0) {
        bearishScore += 1;
        signals.push('Volume confirms down');
      }
    }
    
    if (settings.includePatterns) {
      if (pattern.pattern === 'breakout-bullish') {
        bullishScore += 2;
        signals.push('Bullish breakout');
      } else if (pattern.pattern === 'breakout-bearish') {
        bearishScore += 2;
        signals.push('Bearish breakout');
      } else if (pattern.pattern === 'uptrend') {
        bullishScore += 1;
        signals.push('Uptrend structure');
      } else if (pattern.pattern === 'downtrend') {
        bearishScore += 1;
        signals.push('Downtrend structure');
      }
    }
    
    let trend = 'neutral';
    let confidence = 0;
    
    const totalSignals = bullishScore + bearishScore;
    
    if (bullishScore > bearishScore && bullishScore >= sensitivityMultiplier) {
      trend = 'bullish';
      confidence = Math.min((bullishScore / (bullishScore + bearishScore)) * 100, 100);
    } else if (bearishScore > bullishScore && bearishScore >= sensitivityMultiplier) {
      trend = 'bearish';
      confidence = Math.min((bearishScore / (bullishScore + bearishScore)) * 100, 100);
    } else if (totalSignals > 0) {
      trend = 'neutral';
      confidence = 30;
    }
    
    return {
      trend,
      confidence: Math.round(confidence),
      priceChange: priceChange.toFixed(2),
      currentPrice: currentPrice.toFixed(8),
      indicators: {
        rsi: rsi.toFixed(2),
        macd: macd.histogram.toFixed(4),
        volume: volumeIncrease.toFixed(2),
        ma5: ma5.toFixed(8),
        ma20: ma20.toFixed(8),
        pattern: pattern.pattern,
        patternConfidence: pattern.confidence
      },
      srLevels,
      signals,
      bullishScore,
      bearishScore
    };
  };

  const fetchPairData = async (symbol, pair, timeframe) => {
    try {
      const pairSymbol = `${symbol}${pair}`;
      const tfConfig = timeframes.find(tf => tf.value === timeframe);
      
      if (demoMode) {
        // Use mock data
        const assetPattern = mockAssetPatterns[symbol] || { trend: 'neutral', volatility: 0.01, basePrice: 100, volume: 1000000, change: 0 };
        const mockCandles = generateMockCandles(assetPattern.basePrice, assetPattern.trend, assetPattern.volatility, tfConfig.limit);
        const analysis = calculateAdvancedTrend(mockCandles, timeframe);
        
        return {
          pair: pairSymbol,
          ...analysis
        };
      }
      
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${pairSymbol}&interval=${tfConfig.interval}&limit=${tfConfig.limit}`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      const analysis = calculateAdvancedTrend(data, timeframe);
      
      return {
        pair: pairSymbol,
        ...analysis
      };
    } catch (err) {
      console.error(`Error fetching ${symbol}${pair}:`, err);
      return null;
    }
  };

  const fetch24hData = async (symbol, pair) => {
    try {
      const pairSymbol = `${symbol}${pair}`;
      
      if (demoMode) {
        const assetPattern = mockAssetPatterns[symbol] || { volume: 1000000, change: 0 };
        const mockData = generateMockTickerData(assetPattern.volume, assetPattern.change);
        return {
          volume: parseFloat(mockData.volume),
          priceChange24h: parseFloat(mockData.priceChangePercent)
        };
      }
      
      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${pairSymbol}`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      return {
        volume: parseFloat(data.quoteVolume),
        priceChange24h: parseFloat(data.priceChangePercent)
      };
    } catch (err) {
      console.error(`Error fetching 24h data for ${symbol}${pair}:`, err);
      return null;
    }
  };

  const analyzeAsset = async (symbol) => {
    const pairs = ['USDT', 'BTC', 'ETH'];
    const results = { symbol, timeframes: {} };
    
    const volumeData = await fetch24hData(symbol, 'USDT');
    if (volumeData && volumeData.volume < settings.minVolume && !demoMode) {
      return null;
    }
    
    results.volume24h = volumeData?.volume || 0;
    results.priceChange24h = volumeData?.priceChange24h || 0;
    
    for (const timeframe of selectedTimeframes) {
      const timeframeData = { pairs: {} };
      
      for (const pair of pairs) {
        const data = await fetchPairData(symbol, pair, timeframe);
        if (data) {
          timeframeData.pairs[pair] = data;
        }
      }
      
      const pairAnalyses = Object.values(timeframeData.pairs);
      const trends = pairAnalyses.map(p => p.trend);
      const avgConfidence = pairAnalyses.length > 0 
        ? pairAnalyses.reduce((sum, p) => sum + p.confidence, 0) / pairAnalyses.length 
        : 0;
      
      const bullishCount = trends.filter(t => t === 'bullish').length;
      const bearishCount = trends.filter(t => t === 'bearish').length;
      
      timeframeData.alignment = 'mixed';
      timeframeData.confidence = Math.round(avgConfidence);
      
      if (bullishCount === pairs.length) {
        timeframeData.alignment = 'bullish';
      } else if (bearishCount === pairs.length) {
        timeframeData.alignment = 'bearish';
      } else if (bullishCount >= 2) {
        timeframeData.alignment = 'mostly-bullish';
      } else if (bearishCount >= 2) {
        timeframeData.alignment = 'mostly-bearish';
      }
      
      results.timeframes[timeframe] = timeframeData;
    }
    
    const alignedTimeframes = Object.values(results.timeframes).filter(
      tf => tf.alignment === 'bullish' || tf.alignment === 'bearish'
    );
    
    const avgConfidenceAll = Object.values(results.timeframes).reduce(
      (sum, tf) => sum + tf.confidence, 0
    ) / selectedTimeframes.length;
    
    const alignmentScore = (alignedTimeframes.length / selectedTimeframes.length) * 40;
    const confidenceScore = (avgConfidenceAll / 100) * 30;
    
    let patternBonus = 0;
    const patterns = Object.values(results.timeframes).map(tf => 
      Object.values(tf.pairs)[0]?.indicators?.pattern
    );
    if (patterns.includes('breakout-bullish') || patterns.includes('breakout-bearish')) {
      patternBonus = 20;
    } else if (patterns.includes('uptrend') || patterns.includes('downtrend')) {
      patternBonus = 10;
    }
    
    const volumeBonus = results.volume24h > settings.minVolume * 2 ? 10 : 5;
    
    results.roiScore = Math.round(alignmentScore + confidenceScore + patternBonus + volumeBonus);
    results.alignmentCount = alignedTimeframes.length;
    
    const allAlignments = Object.values(results.timeframes).map(tf => tf.alignment);
    const bullishAlignments = allAlignments.filter(a => 
      a === 'bullish' || a === 'mostly-bullish'
    ).length;
    const bearishAlignments = allAlignments.filter(a => 
      a === 'bearish' || a === 'mostly-bearish'
    ).length;
    
    if (bullishAlignments > bearishAlignments) {
      results.dominantTrend = 'bullish';
    } else if (bearishAlignments > bullishAlignments) {
      results.dominantTrend = 'bearish';
    } else {
      results.dominantTrend = 'neutral';
    }
    
    return results;
  };

  const scanAssets = async () => {
    setLoading(true);
    setError(null);
    setAssets([]);
    
    // Test API availability
    if (!demoMode) {
      try {
        const testResponse = await fetch('https://api.binance.com/api/v3/ping');
        if (!testResponse.ok) {
          setDemoMode(true);
          setApiAvailable(false);
          setError('Network unavailable - Running in DEMO MODE with sample data');
        }
      } catch (err) {
        setDemoMode(true);
        setApiAvailable(false);
        setError('Network unavailable - Running in DEMO MODE with sample data');
      }
    }
    
    try {
      const results = [];
      const assetsToScan = demoMode ? Object.keys(mockAssetPatterns) : popularAssets;
      
      for (let i = 0; i < assetsToScan.length; i += 2) {
        const batch = assetsToScan.slice(i, i + 2);
        const batchResults = await Promise.all(
          batch.map(asset => analyzeAsset(asset))
        );
        results.push(...batchResults.filter(r => r !== null));
        
        setAssets([...results]);
        
        if (i + 2 < assetsToScan.length) {
          await new Promise(resolve => setTimeout(resolve, demoMode ? 200 : 800));
        }
      }
      
      setAssets(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sortedAssets = [...assets].sort((a, b) => {
    if (sortBy === 'roiScore') {
      return b.roiScore - a.roiScore;
    } else if (sortBy === 'volume') {
      return b.volume24h - a.volume24h;
    } else if (sortBy === 'symbol') {
      return a.symbol.localeCompare(b.symbol);
    }
    return 0;
  });

  const filteredAssets = sortedAssets.filter(asset =>
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTimeframe = (tf) => {
    if (selectedTimeframes.includes(tf)) {
      if (selectedTimeframes.length > 1) {
        setSelectedTimeframes(selectedTimeframes.filter(t => t !== tf));
      }
    } else {
      setSelectedTimeframes([...selectedTimeframes, tf]);
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'bullish' || trend === 'mostly-bullish') {
      return <TrendingUp className="w-4 h-4" />;
    } else if (trend === 'bearish' || trend === 'mostly-bearish') {
      return <TrendingDown className="w-4 h-4" />;
    }
    return <Minus className="w-4 h-4" />;
  };

  const getAlignmentColor = (alignment) => {
    if (alignment === 'bullish') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (alignment === 'mostly-bullish') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (alignment === 'bearish') return 'bg-red-500/20 text-red-300 border-red-500/40';
    if (alignment === 'mostly-bearish') return 'bg-red-500/10 text-red-400 border-red-500/30';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  };

  const getTrendColor = (trend) => {
    if (trend === 'bullish') return 'text-emerald-400';
    if (trend === 'bearish') return 'text-red-400';
    return 'text-slate-400';
  };

  const getROIColor = (score) => {
    if (score >= 75) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-slate-400';
  };

  const getPatternBadge = (pattern) => {
    const badges = {
      'breakout-bullish': { label: '🚀 Breakout', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
      'breakout-bearish': { label: '⚠️ Breakdown', color: 'bg-red-500/20 text-red-300 border-red-500/40' },
      'uptrend': { label: '📈 Uptrend', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
      'downtrend': { label: '📉 Downtrend', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
      'consolidation': { label: '⏸️ Consolidation', color: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },
      'ranging': { label: '↔️ Ranging', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' }
    };
    return badges[pattern] || badges['ranging'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tight">
                  Advanced Crypto Scanner
                </h1>
                <p className="text-slate-400 text-xs md:text-sm mt-1 flex items-center gap-2">
                  Multi-indicator technical analysis system
                  {demoMode && (
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs border border-yellow-500/30">
                      DEMO MODE
                    </span>
                  )}
                  {!apiAvailable && !demoMode && (
                    <span className="flex items-center gap-1 text-orange-400">
                      <WifiOff className="w-3 h-3" />
                      Offline
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setDemoMode(!demoMode);
                  setAssets([]);
                }}
                className={`p-3 rounded-xl transition-colors border ${
                  demoMode 
                    ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
                title={demoMode ? 'Demo Mode Active' : 'Switch to Demo Mode'}
              >
                {demoMode ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700"
              >
                <Settings className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Demo Mode Notice */}
        {demoMode && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <WifiOff className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-300 mb-1">Demo Mode Active</h3>
                <p className="text-xs text-yellow-400/80">
                  Using realistic sample data to demonstrate scanner functionality. 
                  To use live Binance data, deploy this app to a server with network access or click the WiFi icon to retry connection.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 mb-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-300 mb-4">Scanner Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">Trend Sensitivity</label>
                <select
                  value={settings.trendSensitivity}
                  onChange={(e) => setSettings({...settings, trendSensitivity: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="high">High (more signals)</option>
                  <option value="medium">Medium (balanced)</option>
                  <option value="low">Low (strong trends only)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">Min Price Change %</label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.minChangePercent}
                  onChange={(e) => setSettings({...settings, minChangePercent: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">Min 24h Volume (USD)</label>
                <input
                  type="number"
                  step="100000"
                  value={settings.minVolume}
                  onChange={(e) => setSettings({...settings, minVolume: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">RSI Overbought</label>
                <input
                  type="number"
                  value={settings.rsiOverbought}
                  onChange={(e) => setSettings({...settings, rsiOverbought: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">RSI Oversold</label>
                <input
                  type="number"
                  value={settings.rsiOversold}
                  onChange={(e) => setSettings({...settings, rsiOversold: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.includePatterns}
                    onChange={(e) => setSettings({...settings, includePatterns: e.target.checked})}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-slate-400">Pattern Recognition</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.includeVolume}
                    onChange={(e) => setSettings({...settings, includeVolume: e.target.checked})}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-slate-400">Volume Analysis</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 mb-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-3 block">
                Select Timeframes
              </label>
              <div className="flex flex-wrap gap-2">
                {timeframes.map(tf => (
                  <button
                    key={tf.value}
                    onClick={() => toggleTimeframe(tf.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedTimeframes.includes(tf.value)
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-3 block">
                Search & Sort
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value="roiScore">ROI Score</option>
                  <option value="volume">Volume</option>
                  <option value="symbol">Symbol</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={scanAssets}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 disabled:shadow-none flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Scanning Assets...' : demoMode ? 'Run Demo Scan' : 'Start Advanced Scan'}
          </button>
        </div>

        {error && (
          <div className={`border rounded-xl p-4 mb-6 flex items-center gap-3 ${
            demoMode 
              ? 'bg-yellow-500/10 border-yellow-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 ${demoMode ? 'text-yellow-400' : 'text-red-400'}`} />
            <p className={`text-sm ${demoMode ? 'text-yellow-300' : 'text-red-300'}`}>{error}</p>
          </div>
        )}

        {/* Results - keeping the same structure as before */}
        {filteredAssets.length > 0 && (
          <div className="space-y-3">
            {filteredAssets.map((asset) => (
              <div
                key={asset.symbol}
                className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all shadow-lg"
              >
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedAsset(expandedAsset === asset.symbol ? null : asset.symbol)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className={`text-2xl font-bold ${getTrendColor(asset.dominantTrend)}`}>
                          {asset.symbol}
                        </div>
                        {getTrendIcon(asset.dominantTrend)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs text-slate-500">ROI Score:</span>
                        <span className={`text-xl font-bold ${getROIColor(asset.roiScore)}`}>
                          {asset.roiScore}/100
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        <span className="text-slate-500">Vol:</span>
                        <span className="text-slate-300 font-medium">
                          ${(asset.volume24h / 1000000).toFixed(1)}M
                        </span>
                      </div>

                      <div className={`text-xs font-medium ${asset.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {asset.priceChange24h >= 0 ? '+' : ''}{asset.priceChange24h?.toFixed(2)}% (24h)
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="hidden lg:flex gap-2">
                        {selectedTimeframes.slice(0, 4).map(tf => {
                          const alignment = asset.timeframes[tf]?.alignment;
                          const confidence = asset.timeframes[tf]?.confidence;
                          return (
                            <div
                              key={tf}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${getAlignmentColor(alignment)}`}
                              title={`${tf}: ${alignment} (${confidence}% confidence)`}
                            >
                              {tf} {confidence}%
                            </div>
                          );
                        })}
                      </div>

                      {expandedAsset === asset.symbol ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedAsset === asset.symbol && (
                  <div className="border-t border-slate-800 bg-slate-900/30 p-5">
                    <div className="space-y-6">
                      {selectedTimeframes.map(tf => {
                        const tfData = asset.timeframes[tf];
                        if (!tfData) return null;

                        return (
                          <div key={tf} className="space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h4 className="text-sm font-semibold text-slate-300">{tf.toUpperCase()}</h4>
                              <div className={`px-3 py-1 rounded-lg text-xs font-medium border ${getAlignmentColor(tfData.alignment)}`}>
                                {tfData.alignment.replace('-', ' ')} • {tfData.confidence}% confidence
                              </div>
                              
                              {tfData.pairs.USDT?.indicators?.pattern && (
                                <div className={`px-3 py-1 rounded-lg text-xs font-medium border ${getPatternBadge(tfData.pairs.USDT.indicators.pattern).color}`}>
                                  {getPatternBadge(tfData.pairs.USDT.indicators.pattern).label}
                                </div>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {['USDT', 'BTC', 'ETH'].map(pair => {
                                const pairData = tfData.pairs[pair];
                                if (!pairData) return null;

                                return (
                                  <div
                                    key={pair}
                                    className={`bg-slate-800/50 rounded-lg p-4 border ${
                                      pairData.trend === 'bullish' ? 'border-emerald-500/30' :
                                      pairData.trend === 'bearish' ? 'border-red-500/30' :
                                      'border-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-xs font-medium text-slate-400">{asset.symbol}/{pair}</span>
                                      <div className={`flex items-center gap-1 ${getTrendColor(pairData.trend)}`}>
                                        {getTrendIcon(pairData.trend)}
                                        <span className="text-xs">{pairData.confidence}%</span>
                                      </div>
                                    </div>
                                    
                                    <div className={`text-lg font-bold mb-2 ${getTrendColor(pairData.trend)}`}>
                                      {pairData.priceChange > 0 ? '+' : ''}{pairData.priceChange}%
                                    </div>
                                    
                                    <div className="space-y-1 text-xs">
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">RSI:</span>
                                        <span className={`font-medium ${
                                          pairData.indicators.rsi > settings.rsiOverbought ? 'text-red-400' :
                                          pairData.indicators.rsi < settings.rsiOversold ? 'text-emerald-400' :
                                          'text-slate-400'
                                        }`}>{pairData.indicators.rsi}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">MACD:</span>
                                        <span className={`font-medium ${
                                          parseFloat(pairData.indicators.macd) > 0 ? 'text-emerald-400' : 'text-red-400'
                                        }`}>{pairData.indicators.macd}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Vol:</span>
                                        <span className={`font-medium ${
                                          parseFloat(pairData.indicators.volume) > 20 ? 'text-cyan-400' : 'text-slate-400'
                                        }`}>{pairData.indicators.volume}%</span>
                                      </div>
                                      
                                      {pairData.srLevels && (
                                        <>
                                          <div className="flex justify-between pt-2 border-t border-slate-700 mt-2">
                                            <span className="text-slate-500">Resistance:</span>
                                            <span className="text-red-400 font-medium text-xs">
                                              +{pairData.srLevels.distanceFromResistance}%
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-slate-500">Support:</span>
                                            <span className="text-emerald-400 font-medium text-xs">
                                              -{pairData.srLevels.distanceFromSupport}%
                                            </span>
                                          </div>
                                        </>
                                      )}
                                    </div>

                                    {pairData.signals && pairData.signals.length > 0 && (
                                      <div className="mt-3 pt-3 border-t border-slate-700">
                                        <div className="text-xs text-slate-500 mb-1">Active Signals:</div>
                                        <div className="flex flex-wrap gap-1">
                                          {pairData.signals.slice(0, 3).map((signal, idx) => (
                                            <span key={idx} className="text-xs px-2 py-0.5 bg-slate-700/50 rounded text-slate-400">
                                              {signal}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-lg border border-slate-700">
                      <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        ROI Potential Analysis
                      </h4>
                      <p className="text-sm text-slate-400">
                        {asset.roiScore >= 75 ? (
                          <span className="text-emerald-400">
                            🎯 <strong>Exceptional Setup ({asset.roiScore}/100):</strong> Multiple timeframes showing strong {asset.dominantTrend} alignment with high confidence indicators. 
                            {asset.alignmentCount}/{selectedTimeframes.length} timeframes fully aligned. This represents a high-probability setup for trend continuation.
                          </span>
                        ) : asset.roiScore >= 60 ? (
                          <span className="text-yellow-400">
                            ⭐ <strong>Good Setup ({asset.roiScore}/100):</strong> Solid {asset.dominantTrend} trend developing across timeframes. 
                            {asset.alignmentCount}/{selectedTimeframes.length} timeframes aligned. Consider entry with appropriate risk management.
                          </span>
                        ) : asset.roiScore >= 40 ? (
                          <span className="text-orange-400">
                            ⚠️ <strong>Moderate Setup ({asset.roiScore}/100):</strong> Partial trend alignment detected but signals are mixed. 
                            Wait for clearer confirmation or use tighter stop-losses. {asset.alignmentCount}/{selectedTimeframes.length} timeframes aligned.
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            ⚡ <strong>Low Confidence ({asset.roiScore}/100):</strong> Conflicting signals across timeframes suggest ranging or transitional market structure. 
                            High risk for false breakouts. Consider waiting for better setup.
                          </span>
                        )}
                      </p>
                      
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-slate-900/50 rounded p-2">
                          <div className="text-xs text-slate-500">Alignment</div>
                          <div className="text-sm font-bold text-slate-300">{asset.alignmentCount}/{selectedTimeframes.length}</div>
                        </div>
                        <div className="bg-slate-900/50 rounded p-2">
                          <div className="text-xs text-slate-500">24h Volume</div>
                          <div className="text-sm font-bold text-slate-300">${(asset.volume24h / 1000000).toFixed(1)}M</div>
                        </div>
                        <div className="bg-slate-900/50 rounded p-2">
                          <div className="text-xs text-slate-500">24h Change</div>
                          <div className={`text-sm font-bold ${asset.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {asset.priceChange24h >= 0 ? '+' : ''}{asset.priceChange24h?.toFixed(2)}%
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded p-2">
                          <div className="text-xs text-slate-500">Trend</div>
                          <div className={`text-sm font-bold ${getTrendColor(asset.dominantTrend)}`}>
                            {asset.dominantTrend.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && assets.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Data Yet</h3>
            <p className="text-slate-500">
              {demoMode 
                ? 'Click "Run Demo Scan" to see sample analysis' 
                : 'Configure your settings and click "Start Advanced Scan"'
              }
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-16">
            <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              {demoMode ? 'Running Demo Analysis...' : 'Analyzing Markets...'}
            </h3>
            <p className="text-slate-500">
              {demoMode 
                ? 'Generating realistic sample data with technical indicators'
                : 'Running advanced technical analysis with multiple indicators'
              }
            </p>
            {assets.length > 0 && (
              <p className="text-slate-600 text-sm mt-2">
                Processed {assets.length}/{demoMode ? Object.keys(mockAssetPatterns).length : popularAssets.length} assets
              </p>
            )}
          </div>
        )}

        <div className="mt-8 text-center text-xs text-slate-600">
          <p>Advanced multi-indicator analysis • {demoMode ? 'Demo Data' : 'Real-time Binance data'} • RSI • MACD • Volume • S/R Levels • Pattern Recognition</p>
          <p className="mt-1">Not financial advice • Always do your own research</p>
        </div>
      </div>
    </div>
  );
};

export default CryptoTrendScanner;
