const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const tls = require('tls');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data', 'leads.json');
const ADMIN_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

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

function getAdminTokenSecret(admin) {
  return process.env.ADMIN_TOKEN_SECRET || admin.passwordHash;
}

function signTokenPayload(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');
}

function createAdminToken(admin) {
  const payload = Buffer.from(
    JSON.stringify({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      exp: Date.now() + ADMIN_TOKEN_TTL_MS
    }),
    'utf8'
  ).toString('base64url');

  const signature = signTokenPayload(payload, getAdminTokenSecret(admin));
  return `${payload}.${signature}`;
}

function verifyAdminToken(token) {
  const [payloadBase64, signature] = String(token || '').split('.');
  if (!payloadBase64 || !signature) {
    return null;
  }

  const admin = getConfiguredAdmin();
  const expectedSignature = signTokenPayload(payloadBase64, getAdminTokenSecret(admin));

  const actualSignatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);
  if (
    actualSignatureBuffer.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(actualSignatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (!payload?.exp || payload.exp < Date.now()) {
    return null;
  }

  if (
    payload.id !== admin.id ||
    String(payload.email).toLowerCase() !== admin.email.toLowerCase() ||
    payload.role !== admin.role
  ) {
    return null;
  }

  return {
    id: admin.id,
    email: admin.email,
    role: admin.role
  };
}

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null;

  const adminSession = verifyAdminToken(token);

  if (!adminSession) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.admin = adminSession;
  next();
}

function getMailConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  const notificationTo = process.env.SMTP_NOTIFICATION_TO || user;

  if (!host || !port || !user || !pass || !from) {
    return null;
  }

  return {
    host,
    port,
    user,
    pass,
    from,
    notificationTo
  };
}

function getMailConfigurationError() {
  const requiredKeys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missingKeys = requiredKeys.filter((key) => !process.env[key]);
  return missingKeys.length > 0
    ? `Missing SMTP configuration: ${missingKeys.join(', ')}`
    : null;
}

function normalizeLineBreaks(value) {
  return String(value || '').replace(/\r?\n/g, '\r\n');
}

function encodeBase64(value) {
  return Buffer.from(String(value), 'utf8').toString('base64');
}

function toBase64Lines(value, lineLength = 76) {
  return Buffer.from(String(value), 'utf8')
    .toString('base64')
    .match(new RegExp(`.{1,${lineLength}}`, 'g'))
    .join('\r\n');
}

function readSmtpResponse(socket) {
  return new Promise((resolve, reject) => {
    let buffer = '';

    const cleanup = () => {
      socket.off('data', onData);
      socket.off('error', onError);
      socket.off('close', onClose);
      socket.off('end', onClose);
    };

    const tryResolve = () => {
      const lines = buffer.split('\r\n').filter(Boolean);
      if (lines.length === 0) {
        return;
      }

      const lastLine = lines[lines.length - 1];
      if (!/^\d{3} /.test(lastLine)) {
        return;
      }

      cleanup();
      const code = Number(lastLine.slice(0, 3));
      if (code >= 400) {
        reject(new Error(lines.join(' | ')));
        return;
      }

      resolve(lines.join('\n'));
    };

    const onData = (chunk) => {
      buffer += chunk.toString();
      tryResolve();
    };

    const onError = (error) => {
      cleanup();
      reject(error);
    };

    const onClose = () => {
      cleanup();
      reject(new Error('SMTP connection closed unexpectedly'));
    };

    socket.on('data', onData);
    socket.on('error', onError);
    socket.on('close', onClose);
    socket.on('end', onClose);
  });
}

async function sendSmtpCommand(socket, command, sensitive = false) {
  socket.write(`${command}\r\n`);
  return readSmtpResponse(socket);
}

async function sendEmail({ to, subject, text, replyTo }) {
  const mailConfig = getMailConfig();
  if (!mailConfig) {
    throw new Error('SMTP is not fully configured');
  }

  const socket = tls.connect({
    host: mailConfig.host,
    port: mailConfig.port,
    servername: mailConfig.host,
    rejectUnauthorized: true
  });

  socket.setEncoding('utf8');

  await new Promise((resolve, reject) => {
    socket.once('secureConnect', resolve);
    socket.once('error', reject);
  });

  try {
    await readSmtpResponse(socket);
    await sendSmtpCommand(socket, `EHLO ${mailConfig.host}`);
    await sendSmtpCommand(socket, 'AUTH LOGIN');
    await sendSmtpCommand(socket, encodeBase64(mailConfig.user), true);
    await sendSmtpCommand(socket, encodeBase64(mailConfig.pass), true);
    await sendSmtpCommand(socket, `MAIL FROM:<${mailConfig.from}>`);
    await sendSmtpCommand(socket, `RCPT TO:<${to}>`);
    await sendSmtpCommand(socket, 'DATA');

    const headers = [
      `From: Medon <${mailConfig.from}>`,
      `To: <${to}>`,
      `Subject: =?UTF-8?B?${encodeBase64(subject)}?=`,
      replyTo ? `Reply-To: ${replyTo}` : null,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: <${crypto.randomUUID()}@medon.am>`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64'
    ]
      .filter(Boolean)
      .join('\r\n');

    const message = `${headers}\r\n\r\n${toBase64Lines(normalizeLineBreaks(text))}\r\n.`;
    await sendSmtpCommand(socket, message, true);
    await sendSmtpCommand(socket, 'QUIT');
  } finally {
    socket.end();
  }
}

function buildLeadReplyEmail(lead) {
  const leadName = lead.name || 'there';
  const isRussian = lead.lang === 'ru';

  if (isRussian) {
    return {
      subject: 'Мы получили вашу заявку',
      text: [
        `Здравствуйте, ${leadName}!`,
        '',
        'Спасибо за вашу заявку.',
        'Мы получили ваш запрос и свяжемся с вами в ближайшее время.',
        '',
        'Если у вас есть дополнительные вопросы, вы можете ответить на это письмо.',
        '',
        'С уважением,',
        'Команда Medon',
        'info@medon.am',
        '+374 33 240120'
      ].join('\n')
    };
  }

  return {
    subject: 'Մենք ստացել ենք ձեր հայտը',
    text: [
      `Բարև, ${leadName}!`,
      '',
      'Շնորհակալություն ձեր հայտի համար։',
      'Մենք ստացել ենք ձեր հարցումը և շուտով կկապվենք ձեզ հետ։',
      '',
      'Եթե ունեք հավելյալ հարցեր, կարող եք պատասխանել այս նամակին։',
      '',
      'Հարգանքով,',
      'Medon թիմ',
      'info@medon.am',
      '+374 33 240120'
    ].join('\n')
  };
}

function buildLeadNotificationEmail(lead) {
  const trafficSource = lead.trafficSource || {};

  return {
    subject: `New lead from ${lead.name || 'Unknown lead'}`,
    text: [
      'A new lead was submitted on medon.am.',
      '',
      `Date: ${lead.date || ''}`,
      `Source: ${lead.source || ''}`,
      `Name: ${lead.name || ''}`,
      `Email: ${lead.email || ''}`,
      `Phone: ${lead.phone || ''}`,
      `Clinic: ${lead.clinicName || ''}`,
      `Specialization: ${lead.specialization || ''}`,
      `Team Size: ${lead.teamSize || ''}`,
      `Main Problem: ${lead.mainProblem || ''}`,
      `Current Tools: ${lead.currentTools || ''}`,
      `Traffic Channel: ${trafficSource.channel || ''}`,
      `Traffic Medium: ${trafficSource.medium || ''}`,
      `Traffic Campaign: ${trafficSource.campaign || ''}`,
      `Traffic Referrer: ${trafficSource.referrer || ''}`
    ].join('\n')
  };
}

async function sendLeadEmails(lead) {
  const mailConfig = getMailConfig();
  if (!mailConfig) {
    return;
  }

  if (lead.email) {
    const replyEmail = buildLeadReplyEmail(lead);
    await sendEmail({
      to: lead.email,
      subject: replyEmail.subject,
      text: replyEmail.text,
      replyTo: mailConfig.from
    });
    return;
  }

  throw new Error('Lead email is missing');
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

    const token = createAdminToken(admin);

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
    const mailConfigurationError = getMailConfigurationError();

    try {
      if (mailConfigurationError) {
        return res.status(201).json({
          ...newLead,
          mailStatus: 'disabled',
          mailError: mailConfigurationError
        });
      }

      await sendLeadEmails(newLead);
      return res.status(201).json({
        ...newLead,
        mailStatus: 'sent'
      });
    } catch (mailError) {
      console.error('Failed to send lead email:', mailError.message);
      return res.status(201).json({
        ...newLead,
        mailStatus: 'failed',
        mailError: mailError.message
      });
    }
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

const mailConfigurationError = getMailConfigurationError();
if (mailConfigurationError) {
  console.warn(`Email sending disabled. ${mailConfigurationError}`);
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
