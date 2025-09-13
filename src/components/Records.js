import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { recordsAPI } from '../services/apiService';

const Records = () => {
  console.log("Records component rendered"); // Debug log
  const { translate } = useLanguage();
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState('checking');
  const [formData, setFormData] = useState({
    cropName: '',
    plantingDate: '',
    expectedHarvest: '',
    areaOfPlantation: '',
    soilType: '',
    location: '',
    notes: '',

  });

  useEffect(() => {
    initializeDatabase();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const initializeDatabase = async () => {
    setIsLoading(true);
    try {
      // Test backend connection
      const healthCheck = await recordsAPI.health();
      setDbStatus(healthCheck.success ? 'connected' : 'error');

      // Load records
      await loadRecords();
    } catch (error) {
      console.error('Backend connection error:', error);
      setDbStatus('error');
      await loadRecordsFromLocalStorage(); // Fallback to localStorage
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecords = async () => {
    try {
      const response = await recordsAPI.getAll();
      setRecords(response.data || []);
    } catch (error) {
      console.error('Error loading records from backend:', error);
      await loadRecordsFromLocalStorage();
    }
  };

  const loadRecordsFromLocalStorage = async () => {
    try {
      const savedRecords = localStorage.getItem('farmingRecords');
      if (savedRecords) {
        setRecords(JSON.parse(savedRecords));
      }
    } catch (error) {
      console.error('Error loading records from localStorage:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log("Input changed:", name, value); // Debug log
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cropName || !formData.plantingDate || !formData.areaOfPlantation || !formData.soilType || !formData.location) {
      alert('Please fill in all required fields (Crop Name, Planting Date, Area of Plantation, Soil Type, and Location)');
      return;
    }

    setIsLoading(true);
    try {
      const response = await recordsAPI.create(formData);
      setRecords(prev => [response.data, ...prev]);

      setFormData({
        cropName: '',
        plantingDate: '',
        expectedHarvest: '',
        areaOfPlantation: '',
        soilType: '',
        location: '',
        notes: '',
        seedSource: '',
        irrigationMethod: '',
        fertilizers: '',
        pesticides: ''
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Failed to save record. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecord = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setIsLoading(true);
      try {
        await recordsAPI.delete(id);
        setRecords(prev => prev.filter(record =>
          record.id !== id && record._id !== id
        ));
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Failed to delete record. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getDbStatusIcon = () => {
    switch (dbStatus) {
      case 'connected':
        return <i className="fas fa-database text-success" title="Connected to MongoDB Atlas"></i>;
      case 'local':
        return <i className="fas fa-hdd text-warning" title="Using local storage"></i>;
      case 'error':
        return <i className="fas text-danger" title="Database error"></i>;
      default:
        return <i className="fas fa-spinner fa-spin text-muted" title="Connecting..."></i>;
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <div className="records-header">
            <div className="records-title">
              <h2>
                <i className="fas fa-clipboard-list"></i>
                {translate('farmingRecords')}
              </h2>
              <span className="db-status-icon">{getDbStatusIcon()}</span>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn btn-primary add-record-btn"
              disabled={isLoading}
            >
              <i className="fas fa-plus"></i>
              {translate('addRecord')}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="records-form" style={{background: '#f8f9fa', padding: '20px', borderRadius: '10px'}}>
            <form onSubmit={handleSubmit}>
              <div className="form-fields-container">
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

                <div className="form-group">
                  <label className="form-label">Area of Plantation (in acres) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="areaOfPlantation"
                    value={formData.areaOfPlantation}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Soil Type *</label>
                  <select
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select Soil Type</option>
                    <option value="Clay">Clay</option>
                    <option value="Sandy">Sandy</option>
                    <option value="Loamy">Loamy</option>
                    <option value="Silty">Silty</option>
                    <option value="Peaty">Peaty</option>
                    <option value="Chalky">Chalky</option>
                    <option value="Red Soil">Red Soil</option>
                    <option value="Black Soil">Black Soil</option>
                    <option value="Alluvial">Alluvial</option>
                    <option value="Laterite">Laterite</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Field Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter field location or address"
                    required
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
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      {translate('save')}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary"
                  disabled={isLoading}
                >
                  {translate('cancel')}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="p-4">
          {isLoading && records.length === 0 ? (
            <div className="records-empty">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading records...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="records-empty">
              <i className="fas fa-seedling"></i>
              <p>No farming records yet. Add your first record to get started!</p>
            </div>
          ) : (
            <div className="records-grid">
              {records.map((record) => (
                <div key={record.id || record._id} className="record-card">
                  <div className="record-header">
                    <h4>{record.cropName}</h4>
                    <button
                      onClick={() => deleteRecord(record.id || record._id)}
                      className="btn-delete"
                      title="Delete record"
                      disabled={isLoading}
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

                    <div className="record-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>Location: {record.location}</span>
                    </div>

                    <div className="record-item">
                        <i className="fas fa-seedling"></i>
                        <span>Soil Type: {record.soilType}</span>
                    </div>



                    <div className="record-item">
                        <i className="fas fa-expand-arrows-alt"></i>
                        <span>Area: {record.areaOfPlantation} acres</span>
                    </div>

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
