import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Records = () => {
  const { translate } = useLanguage();
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cropName: '',
    plantingDate: '',
    expectedHarvest: '',
    notes: ''
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const savedRecords = localStorage.getItem('farmingRecords');
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
  };

  const saveRecords = (newRecords) => {
    localStorage.setItem('farmingRecords', JSON.stringify(newRecords));
    setRecords(newRecords);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.cropName || !formData.plantingDate) {
      alert('Please fill in required fields');
      return;
    }

    const newRecord = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString()
    };

    const updatedRecords = [...records, newRecord];
    saveRecords(updatedRecords);
    
    setFormData({
      cropName: '',
      plantingDate: '',
      expectedHarvest: '',
      notes: ''
    });
    setShowForm(false);
  };

  const deleteRecord = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      const updatedRecords = records.filter(record => record.id !== id);
      saveRecords(updatedRecords);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h2>
            <i className="fas fa-clipboard-list"></i>
            {translate('farmingRecords')}
          </h2>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            <i className="fas fa-plus"></i>
            {translate('addRecord')}
          </button>
        </div>

        {showForm && (
          <div className="p-4 bg-light">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">{translate('cropName')} *</label>
                  <input
                    type="text"
                    name="cropName"
                    value={formData.cropName}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{translate('plantingDate')} *</label>
                  <input
                    type="date"
                    name="plantingDate"
                    value={formData.plantingDate}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{translate('expectedHarvest')}</label>
                  <input
                    type="date"
                    name="expectedHarvest"
                    value={formData.expectedHarvest}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">{translate('notes')}</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="form-input form-textarea"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i>
                  {translate('save')}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary"
                >
                  {translate('cancel')}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="p-4">
          {records.length === 0 ? (
            <div className="text-center text-muted p-4">
              <i className="fas fa-seedling fa-3x mb-3"></i>
              <p>No farming records yet. Add your first record to get started!</p>
            </div>
          ) : (
            <div className="records-grid">
              {records.map((record) => (
                <div key={record.id} className="record-card">
                  <div className="record-header">
                    <h4>{record.cropName}</h4>
                    <button 
                      onClick={() => deleteRecord(record.id)}
                      className="btn-delete"
                      title="Delete record"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  
                  <div className="record-details">
                    <div className="record-item">
                      <i className="fas fa-calendar-plus"></i>
                      <span>Planted: {formatDate(record.plantingDate)}</span>
                    </div>
                    
                    {record.expectedHarvest && (
                      <div className="record-item">
                        <i className="fas fa-calendar-check"></i>
                        <span>Expected Harvest: {formatDate(record.expectedHarvest)}</span>
                      </div>
                    )}
                    
                    {record.notes && (
                      <div className="record-notes">
                        <i className="fas fa-sticky-note"></i>
                        <p>{record.notes}</p>
                      </div>
                    )}
                    
                    <div className="record-meta">
                      <small>Added: {formatDate(record.createdAt)}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Records;
