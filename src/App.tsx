import { useState, useEffect } from 'react'
import { LocalNotifications } from '@capacitor/local-notifications'
import './App.css'

function App() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25分鐘
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  // 請求通知權限
  useEffect(() => {
    LocalNotifications.requestPermissions();
  }, []);

  // 計時器邏輯
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let backgroundTimer: NodeJS.Timeout;

    const updateTimer = () => {
      const now = Date.now();
      const timeDiff = Math.floor((now - lastUpdateTime) / 1000);
      setLastUpdateTime(now);
      setTimeLeft(prev => {
        const newTime = prev - timeDiff;
        if (newTime <= 0) {
          // 時間到，發送通知
          LocalNotifications.schedule({
            notifications: [
              {
                title: isBreak ? '休息時間結束' : '工作時間結束',
                body: isBreak ? '該開始工作了！' : '該休息了！',
                id: 1,
                schedule: { at: new Date() },
                sound: 'notification.wav',
                attachments: [],
                actionTypeId: '',
                extra: null
              }
            ]
          });
          // 停止計時器
          setIsRunning(false);
          // 切換到下一輪
          setIsBreak(!isBreak);
          setLastUpdateTime(now); // 重置最後更新時間
          return isBreak ? (isTestMode ? 5 : 25 * 60) : (isTestMode ? 3 : 5 * 60);
        }
        return newTime;
      });
    };

    if (isRunning) {
      // 前台計時器
      timer = setInterval(updateTimer, 1000);
      
      // 後台計時器（每分鐘更新一次）
      backgroundTimer = setInterval(() => {
        if (document.hidden) {
          updateTimer();
        }
      }, 60000);
    }

    return () => {
      clearInterval(timer);
      clearInterval(backgroundTimer);
    };
  }, [isRunning, lastUpdateTime, isBreak, isTestMode]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    setLastUpdateTime(Date.now());
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(isTestMode ? 5 : 25 * 60);
    setLastUpdateTime(Date.now());
  };

  const toggleTestMode = () => {
    setIsTestMode(!isTestMode);
    setTimeLeft(isTestMode ? 25 * 60 : 5);
    setLastUpdateTime(Date.now());
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="app">
      <h1>番茄鐘</h1>
      <div className="timer">
        <h2>{formatTime(timeLeft)}</h2>
        <p>{isBreak ? '休息時間' : '工作時間'}</p>
      </div>
      <div className="controls">
        <button onClick={toggleTimer}>
          {isRunning ? '暫停' : '開始'}
        </button>
        <button onClick={resetTimer}>重置</button>
        <button onClick={toggleTestMode} className={isTestMode ? 'test-mode' : ''}>
          {isTestMode ? '測試模式' : '正常模式'}
        </button>
      </div>
    </div>
  )
}

export default App
