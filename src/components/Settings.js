//Ok done

import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Settings = ({ config, updateApiKeys }) => {
  const { translate, currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const [apiKeys, setApiKeys] = useState({
    geminiApiKey: config.geminiApiKey || '',
    weatherApiKey: config.weatherApiKey || ''
  });
  const [showKeys, setShowKeys] = useState({
    gemini: false,
    weather: false
  });

  const handleApiKeyChange = (key, value) => {
    setApiKeys(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveApiKey = (keyType) => {
    const keyMap = {
      gemini: 'geminiApiKey',
      weather: 'weatherApiKey'
    };
    
    const updates = {
      [keyMap[keyType]]: apiKeys[keyMap[keyType]]
    };
    
    updateApiKeys(updates);
    
    // Also save to localStorage for persistence
    const storedKeys = JSON.parse(localStorage.getItem('apiKeys') || '{}');
    storedKeys[keyType] = apiKeys[keyMap[keyType]];
    localStorage.setItem('apiKeys', JSON.stringify(storedKeys));
    
    alert(`${keyType.charAt(0).toUpperCase() + keyType.slice(1)} API key saved successfully!`);
  };

  const toggleKeyVisibility = (keyType) => {
    setShowKeys(prev => ({
      ...prev,
      [keyType]: !prev[keyType]
    }));
  };

  const testConnection = async (keyType) => {
    if (keyType === 'gemini') {
      if (!apiKeys.geminiApiKey) {
        alert('Please enter a Gemini API key first');
        return;
      }
      
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKeys.geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello' }] }]
          })
        });
        
        if (response.ok) {
          alert('✅ Gemini API: Connection successful!');
        } else {
          alert('❌ Gemini API: Connection failed - ' + response.status);
        }
      } catch (error) {
        alert('❌ Gemini API: Connection error - ' + error.message);
      }
    } else if (keyType === 'weather') {
      if (!apiKeys.weatherApiKey) {
        alert('Please enter a Weather API key first');
        return;
      }
      
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=28.6139&lon=77.2090&appid=${apiKeys.weatherApiKey}`
        );
        
        if (response.ok) {
          alert('✅ Weather API: Connection successful!');
        } else {
          alert('❌ Weather API: Connection failed - ' + response.status);
        }
      } catch (error) {
        alert('❌ Weather API: Connection error - ' + error.message);
      }
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h2>
            <i className="fas fa-cog"></i>
            {translate('settings')}
          </h2>
        </div>

        <div className="p-4">
          {/* Language Settings */}
          <div className="settings-section">
            <h3>
              <i className="fas fa-language"></i>
              {translate('language')}
            </h3>
            <div className="language-selector">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`btn ${currentLanguage === lang.code ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* API Keys Settings */}
          <div className="settings-section">
            <h3>
              <i className="fas fa-key"></i>
              {translate('apiKeys')}
            </h3>
            
            {/* Gemini API Key */}
            <div className="api-key-group">
              <label className="form-label">{translate('geminiKey')}</label>
              <div className="api-key-input">
                <input
                  type={showKeys.gemini ? 'text' : 'password'}
                  value={apiKeys.geminiApiKey}
                  onChange={(e) => handleApiKeyChange('geminiApiKey', e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility('gemini')}
                  className="btn btn-icon"
                  title="Toggle visibility"
                >
                  <i className={`fas ${showKeys.gemini ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
                <button
                  type="button"
                  onClick={() => saveApiKey('gemini')}
                  className="btn btn-primary"
                >
                  <i className="fas fa-save"></i>
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => testConnection('gemini')}
                  className="btn btn-secondary"
                >
                  <i className="fas fa-plug"></i>
                  Test
                </button>
              </div>
              <small className="text-muted">
                Get your API key from: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>
              </small>
            </div>

            {/* Weather API Key */}
            <div className="api-key-group">
              <label className="form-label">{translate('weatherKey')}</label>
              <div className="api-key-input">
                <input
                  type={showKeys.weather ? 'text' : 'password'}
                  value={apiKeys.weatherApiKey}
                  onChange={(e) => handleApiKeyChange('weatherApiKey', e.target.value)}
                  placeholder="Enter your OpenWeather API key"
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility('weather')}
                  className="btn btn-icon"
                  title="Toggle visibility"
                >
                  <i className={`fas ${showKeys.weather ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
                <button
                  type="button"
                  onClick={() => saveApiKey('weather')}
                  className="btn btn-primary"
                >
                  <i className="fas fa-save"></i>
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => testConnection('weather')}
                  className="btn btn-secondary"
                >
                  <i className="fas fa-plug"></i>
                  Test
                </button>
              </div>
              <small className="text-muted">
                Get your API key from: <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer">OpenWeatherMap</a>
              </small>
            </div>
          </div>

          {/* Location Settings */}
          <div className="settings-section">
            <h3>
              <i className="fas fa-map-marker-alt"></i>
              Location
            </h3>
            <div className="location-info">
              <p>
                <strong>Current Location:</strong> {config.location?.city || 'Not detected'}
              </p>
              {config.location?.lat && (
                <p>
                  <strong>Coordinates:</strong> {config.location.lat.toFixed(4)}, {config.location.lon.toFixed(4)}
                </p>
              )}
              <button
                onClick={() => window.location.reload()}
                className="btn btn-secondary"
              >
                <i className="fas fa-sync-alt"></i>
                Refresh Location
              </button>
            </div>
          </div>

          {/* App Information */}
          <div className="settings-section">
            <h3>
              <i className="fas fa-info-circle"></i>
              About
            </h3>
            <div className="app-info">
              <p><strong>Digital Krishi Officer</strong></p>
              <p>Version: 2.0.0 (React)</p>
              <p>AI-powered agricultural advisory system</p>
              <p>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-github"></i> View on GitHub
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
