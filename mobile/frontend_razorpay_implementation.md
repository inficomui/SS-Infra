# Frontend Admin Panel — Dynamic Razorpay Keys

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/admin/settings/razorpay` | Fetch current Razorpay config (secret masked) |
| `PUT` | `/api/v1/admin/settings/razorpay` | Update Razorpay Key ID and/or Secret |
| `GET` | `/api/v1/admin/settings` | Fetch all app settings grouped |

> [!IMPORTANT]
> All endpoints require `Authorization: Bearer <token>` header and **Admin** role.

---

## API Response Shapes

### GET `/admin/settings/razorpay`

```json
{
  "success": true,
  "settings": [
    {
      "key": "razorpay_key_id",
      "label": "Razorpay Key ID",
      "value": "rzp_live_xxxxxxxxxxxx",
      "isSet": true,
      "isSecret": false,
      "updatedAt": "2026-06-22T09:03:28+00:00"
    },
    {
      "key": "razorpay_key_secret",
      "label": "Razorpay Key Secret",
      "value": "••••••••cret",
      "isSet": true,
      "isSecret": true,
      "updatedAt": "2026-06-22T09:03:28+00:00"
    }
  ]
}
```

### PUT `/admin/settings/razorpay`

**Request body** (both fields optional — partial update supported):

```json
{
  "razorpay_key_id": "rzp_live_xxxxxxxxxxxx",
  "razorpay_key_secret": "your_secret_here"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Razorpay settings updated successfully."
}
```

---

## API Service Layer

Create `src/services/settingsService.js`:

```javascript
import api from './api'; // your configured axios instance

const SettingsService = {
  getRazorpaySettings: () =>
    api.get('/admin/settings/razorpay'),

  updateRazorpaySettings: (data) =>
    api.put('/admin/settings/razorpay', data),

  getAllSettings: () =>
    api.get('/admin/settings'),
};

export default SettingsService;
```

---

## React Component

Create `src/pages/settings/RazorpaySettings.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import SettingsService from '../../services/settingsService';
import { toast } from 'react-toastify'; // or your toast library

const RazorpaySettings = () => {
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [currentSettings, setCurrentSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await SettingsService.getRazorpaySettings();
      if (data.success) {
        setCurrentSettings(data.settings);
        const idSetting = data.settings.find(s => s.key === 'razorpay_key_id');
        if (idSetting?.value) setKeyId(idSetting.value);
        // DO NOT pre-fill the secret — it's masked
      }
    } catch (err) {
      toast.error('Failed to load Razorpay settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {};

    if (keyId.trim()) payload.razorpay_key_id = keyId.trim();
    if (keySecret.trim()) payload.razorpay_key_secret = keySecret.trim();

    if (!Object.keys(payload).length) {
      toast.warning('Enter at least one value to update');
      return;
    }

    try {
      setSaving(true);
      const { data } = await SettingsService.updateRazorpaySettings(payload);
      if (data.success) {
        toast.success(data.message);
        setKeySecret('');  // clear secret after save
        fetchSettings();   // refresh masked display
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  // Helper: find a setting's display info
  const getSettingInfo = (key) =>
    currentSettings.find(s => s.key === key);

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="spinner" />
        <p>Loading Razorpay settings...</p>
      </div>
    );
  }

  const idInfo = getSettingInfo('razorpay_key_id');
  const secretInfo = getSettingInfo('razorpay_key_secret');

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Razorpay Configuration</h1>
        <p>Manage your payment gateway credentials. Changes take effect immediately.</p>
      </div>

      {/* Status badges */}
      <div className="settings-status">
        <div className={`status-badge ${idInfo?.isSet ? 'active' : 'inactive'}`}>
          Key ID: {idInfo?.isSet ? '✅ Configured' : '❌ Not Set'}
        </div>
        <div className={`status-badge ${secretInfo?.isSet ? 'active' : 'inactive'}`}>
          Secret: {secretInfo?.isSet ? '✅ Configured' : '❌ Not Set'}
        </div>
        {secretInfo?.updatedAt && (
          <span className="last-updated">
            Last updated: {new Date(secretInfo.updatedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label htmlFor="razorpay_key_id">Razorpay Key ID</label>
          <input
            id="razorpay_key_id"
            type="text"
            value={keyId}
            onChange={(e) => setKeyId(e.target.value)}
            placeholder="rzp_live_xxxxxxxxxxxx"
          />
          <small>Public key used to initialize Razorpay checkout on frontend</small>
        </div>

        <div className="form-group">
          <label htmlFor="razorpay_key_secret">Razorpay Key Secret</label>
          <input
            id="razorpay_key_secret"
            type="password"
            value={keySecret}
            onChange={(e) => setKeySecret(e.target.value)}
            placeholder={secretInfo?.isSet ? '••••••••••••' : 'Enter secret key'}
          />
          <small>
            {secretInfo?.isSet
              ? 'Current secret is set. Leave blank to keep existing.'
              : 'No secret configured. Enter your Razorpay secret key.'}
          </small>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default RazorpaySettings;
```

---

## CSS Styles

Add to your settings stylesheet:

```css
.settings-page {
  max-width: 640px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.settings-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0.25rem;
}

.settings-header p {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.settings-status {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.last-updated {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-left: auto;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
}

.form-group small {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  align-self: flex-end;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.settings-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #6b7280;
}
```

---

## Add Route & Sidebar

### Router (in your admin routes config):

```jsx
import RazorpaySettings from './pages/settings/RazorpaySettings';

// Inside admin route group
<Route path="/settings/razorpay" element={<RazorpaySettings />} />
```

### Sidebar menu item:

```jsx
{
  label: 'Razorpay Settings',
  path: '/settings/razorpay',
  icon: 'settings', // or use CreditCard icon
}
```

---

## Key Rules

> [!WARNING]
> - **Never pre-fill the secret input** with the masked value from GET response
> - The secret field should always start **empty** — user enters new value only when changing
> - **Partial updates work** — sending only `razorpay_key_id` won't touch the secret

> [!TIP]
> - Backend caches keys for 5 minutes, auto-busts cache on PUT
> - The `isSet` field tells you if a key exists without revealing the value
> - Changes take effect immediately for new payment orders
