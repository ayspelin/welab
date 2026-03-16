'use client';

import React, { useState } from 'react';
import styles from './InquiryModal.module.css';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
}

export default function InquiryModal({ isOpen, onClose, serviceName }: InquiryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, serviceName }),
      });

      if (res.ok) {
        setStatus('success');
        setTimeout(() => {
          onClose();
          setFormData({ name: '', company: '', email: '', phone: '', message: '' });
          setStatus('idle');
        }, 2000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        <div className={styles.header}>
          <h3>{serviceName} - Bilgi ve Başvuru Formu</h3>
          <p>Size nasıl yardımcı olabiliriz? Lütfen aşağıdaki formu doldurun.</p>
        </div>

        {status === 'success' ? (
          <div className={styles.successMsg}>
            <span className={styles.successIcon}>✓</span>
            <p>Talebiniz başarıyla iletildi. En kısa sürede dönüş yapacağız.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Ad Soyad *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: Ahmet Yılmaz"
              />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>E-posta *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ahmet@sirket.com"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Telefon *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="05xx xxx xx xx"
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Şirket / Kurum</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Şirket isminiz"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Mesajınız / Talebiniz *</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Size nasıl yardımcı olabiliriz?"
              />
            </div>
            {status === 'error' && (
              <p className={styles.errorMsg}>Bir hata oluştu. Lütfen tekrar deneyin.</p>
            )}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Gönderiliyor...' : 'Talebi Gönder'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
