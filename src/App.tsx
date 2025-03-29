import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25分鐘
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      setIsBreak(!isBreak);
      setTimeLeft(isBreak ? 25 * 60 : 5 * 60);
      new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isBreak]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(25 * 60);
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
      </div>
    </div>
  )
}

export default App
