import React from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';

export function VillageSimpleMode({ onAction }) {
  const { t, language } = useLanguage();

  return (
    <div className="content-card village-simple-mode-card" style={{ background: 'linear-gradient(135deg, #fff5f8 0%, #ffe4ec 100%)', padding: '24px', borderRadius: '16px', border: '2px solid #f8bbd0', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span style={{ background: '#ad1457', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
            🌾 SIMPLE TAILORING MODE (எளிய தையல் முறை)
          </span>
          <h2 style={{ color: '#880e4f', margin: '8px 0 2px' }}>
            {language === 'ta' ? 'எளிய தையல் சேவை' : language === 'hi' ? 'आसान दर्जी सेवा' : 'Simple Women Tailoring Mode'}
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
            {language === 'ta'
              ? 'உங்கள் துணியை ததைக்க அல்லது ஆடை நிலை அறிய கீழே உள்ள பொத்தான்களை அழுத்தவும்.'
              : language === 'hi'
              ? 'अपने कपड़े सिलवाने के लिए नीचे दिए गए बटन पर क्लिक करें।'
              : 'Click any button below for easy 1-click tailoring.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        <button
          type="button"
          onClick={() => onAction('blouse')}
          style={{
            padding: '20px 14px',
            borderRadius: '14px',
            background: '#fff',
            border: '2px solid #d81b60',
            color: '#880e4f',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '32px' }}>✂️</span>
          <span>{language === 'ta' ? 'ரவிக்கை தைக்க' : language === 'hi' ? 'ब्लाउज सिलाई' : 'Stitch My Blouse'}</span>
        </button>

        <button
          type="button"
          onClick={() => onAction('dress')}
          style={{
            padding: '20px 14px',
            borderRadius: '14px',
            background: '#fff',
            border: '2px solid #d81b60',
            color: '#880e4f',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '32px' }}>👗</span>
          <span>{language === 'ta' ? 'ஆடை தைக்க' : language === 'hi' ? 'ड्रेस सिलाई' : 'Stitch My Dress'}</span>
        </button>

        <button
          type="button"
          onClick={() => onAction('fabric')}
          style={{
            padding: '20px 14px',
            borderRadius: '14px',
            background: '#fff',
            border: '2px solid #d81b60',
            color: '#880e4f',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '32px' }}>🧵</span>
          <span>{language === 'ta' ? 'என்னமிடம் துணி உள்ளது' : language === 'hi' ? 'मेरे पास कपड़ा है' : 'I Have My Own Fabric'}</span>
        </button>

        <button
          type="button"
          onClick={() => onAction('reference')}
          style={{
            padding: '20px 14px',
            borderRadius: '14px',
            background: '#fff',
            border: '2px solid #d81b60',
            color: '#880e4f',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '32px' }}>📸</span>
          <span>{language === 'ta' ? 'படம் பதிவேற்ற' : language === 'hi' ? 'फोटो अपलोड' : 'Upload My Design'}</span>
        </button>

        <button
          type="button"
          onClick={() => onAction('tracking')}
          style={{
            padding: '20px 14px',
            borderRadius: '14px',
            background: '#fff',
            border: '2px solid #d81b60',
            color: '#880e4f',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '32px' }}>🚚</span>
          <span>{language === 'ta' ? 'ஆடை நிலை அறிய' : language === 'hi' ? 'आर्डर ट्रैकिंग' : 'Check My Order'}</span>
        </button>

        <button
          type="button"
          onClick={() => alert('📞 Calling Tailor Workshop: +91 98765 43210')}
          style={{
            padding: '20px 14px',
            borderRadius: '14px',
            background: '#fff',
            border: '2px solid #2e7d32',
            color: '#2e7d32',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '32px' }}>📞</span>
          <span>{language === 'ta' ? 'தையல்காரரை அழைக்க' : language === 'hi' ? 'दर्जी से बात करें' : 'Contact My Tailor'}</span>
        </button>
      </div>
    </div>
  );
}
