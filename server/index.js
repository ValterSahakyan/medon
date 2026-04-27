const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data', 'leads.json');
const adminSessions = new Map();

// Ensure data directory and file exist
fs.ensureFileSync(DATA_FILE);
if (fs.readFileSync(DATA_FILE, 'utf8').trim() === '') {
  fs.writeJsonSync(DATA_FILE, []);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, expectedHash] = storedHash.split(':');
  if (!salt || !expectedHash) {
    return false;
  }

  const actualHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(
    Buffer.from(actualHash, 'hex'),
    Buffer.from(expectedHash, 'hex')
  );
}

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  const envContents = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of envContents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

function getConfiguredAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!email) {
    throw new Error('Missing ADMIN_EMAIL in server/.env');
  }

  if (!password && !passwordHash) {
    throw new Error('Set either ADMIN_PASSWORD or ADMIN_PASSWORD_HASH in server/.env');
  }

  return {
    id: 'env-admin',
    email,
    role: 'admin',
    passwordHash: passwordHash || hashPassword(password)
  };
}

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null;

  if (!token || !adminSessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.admin = adminSessions.get(token);
  next();
}

app.use(cors());
app.use(bodyParser.json());

// Routes
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const admin = getConfiguredAdmin();

    if (
      admin.email.toLowerCase() !== String(email).toLowerCase() ||
      !verifyPassword(password, admin.passwordHash)
    ) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    adminSessions.set(token, {
      id: admin.id,
      email: admin.email,
      role: admin.role
    });

    res.json({
      token,
      admin: {
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

app.get('/api/leads', requireAdmin, async (req, res) => {
  try {
    const leads = await fs.readJson(DATA_FILE);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read leads' });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const leads = await fs.readJson(DATA_FILE);
    const newLead = {
      id: uuidv4(),
      date: new Date().toLocaleString(),
      ...req.body
    };
    leads.unshift(newLead); // Add to beginning
    await fs.writeJson(DATA_FILE, leads, { spaces: 2 });
    res.status(201).json(newLead);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save lead' });
  }
});

app.delete('/api/leads/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let leads = await fs.readJson(DATA_FILE);
    leads = leads.filter(lead => lead.id !== id);
    await fs.writeJson(DATA_FILE, leads, { spaces: 2 });
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

try {
  getConfiguredAdmin();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
