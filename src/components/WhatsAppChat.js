import React from 'react';
import './WhatsAppChat.css';

const WhatsAppChat = () => {
    const phoneNumber = process.env.REACT_APP_WHATSAPP_NUMBER || '';
    
    // Debug log to check if the number is being read correctly
    console.log('WhatsApp Number from env:', process.env.REACT_APP_WHATSAPP_NUMBER);
    
    const handleWhatsAppClick = () => {
        // Ensure the phone number exists
        if (!phoneNumber) {
            console.error('WhatsApp number not found in environment variables');
            alert('WhatsApp number not configured');
            return;
        }
        // Format phone number: remove spaces, dashes, and parentheses
        // eslint-disable-next-line no-useless-escape
        let formattedNumber = phoneNumber.replace(/[\s()\-]/g, '');
        
        // If number starts with '+', remove it and ensure we have the number only
        if (formattedNumber.startsWith('+')) {
            formattedNumber = formattedNumber.substring(1);
        }
        
        console.log('Formatted number:', formattedNumber); // Debug log
        
        // Create WhatsApp URL with default message
        const defaultMessage = "Hello, I would like to consult about farming.";
        const encodedMessage = encodeURIComponent(defaultMessage);
        
        // Create mobile app URL
        const whatsappUrl = `whatsapp://send?phone=${formattedNumber}&text=${encodedMessage}`;
        
        // Create web URL
        const webWhatsappUrl = `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encodedMessage}`;
        
        try {
            // Try to open in WhatsApp app first
            window.location.href = whatsappUrl;
            // Set a timeout to try web version if app doesn't open
            setTimeout(() => {
                window.location.href = webWhatsappUrl;
            }, 500);
        } catch (e) {
            // Fallback to web version
            window.open(webWhatsappUrl, '_blank');
        }
    };

    return (
        <button 
            className="whatsapp-button" 
            onClick={handleWhatsAppClick}
            title="Chat with Officer on WhatsApp"
        >
            <i className="fab fa-whatsapp"></i>
            Chat with Officer
        </button>
    );
};

export default WhatsAppChat;