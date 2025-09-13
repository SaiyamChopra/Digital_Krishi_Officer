const { MongoClient } = require('mongodb');

class Database {
    constructor() {
        this.client = null;
        this.db = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            const connectionString = process.env.MONGODB_URI;

            if (!connectionString) {
                throw new Error('MongoDB connection string not found in environment variables');
            }

            // Check if already connected
            if (this.isConnected && this.client) {
                try {
                    // Test the connection
                    await this.db.admin().ping();
                    console.log('✅ Already connected to MongoDB Atlas');
                    return true;
                } catch (pingError) {
                    // Connection is stale, close it
                    console.log('Stale connection detected, reconnecting...');
                    await this.disconnect();
                }
            }

            this.client = new MongoClient(connectionString, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000, // 5 second timeout
                connectTimeoutMS: 10000, // 10 second timeout
            });

            await this.client.connect();
            this.db = this.client.db('digital_krishi_officer');
            this.isConnected = true;

            // Test the connection
            await this.db.admin().ping();
            console.log('✅ Connected to MongoDB Atlas');

            // Setup connection monitoring
            this.client.on('close', () => {
                console.log('MongoDB connection closed');
                this.isConnected = false;
            });

            this.client.on('error', (err) => {
                console.error('MongoDB connection error:', err);
                this.isConnected = false;
            });

            return true;
        } catch (error) {
            console.error('❌ MongoDB connection failed:', error);
            this.isConnected = false;
            
            // Enhanced error message
            const errorMessage = error.message.includes('ENOTFOUND') 
                ? 'Could not reach MongoDB Atlas. Please check your internet connection and MongoDB URI'
                : error.message.includes('Authentication failed') 
                    ? 'MongoDB authentication failed. Please check your username and password'
                    : error.message;
                    
            throw new Error(errorMessage);
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            this.isConnected = false;
            console.log('Disconnected from MongoDB');
        }
    }

    getCollection(name) {
        if (!this.isConnected) {
            throw new Error('Database not connected');
        }
        return this.db.collection(name);
    }

    async healthCheck() {
        try {
            if (!this.isConnected) {
                return { status: 'disconnected', message: 'Database not connected' };
            }

            await this.db.admin().ping();
            return { status: 'connected', message: 'MongoDB Atlas connection healthy' };
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    }
}

// Create and export a singleton instance
const database = new Database();
module.exports = database;
