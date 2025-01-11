// Required modules
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import zip from 'adm-zip'; // Ensure to install 'adm-zip' for handling zip files

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const DOCKER_PATH = process.env.DOCKER_MOUNT;
const __dirname = path.join(path.dirname(__filename),DOCKER_PATH);

const MACHINE_NAME = "CRO Voron 2.4";
const ORIGINAL_ORCA_PRINTER = path.join(__dirname, `${MACHINE_NAME}.orca_printer`);
const EXTRACT_PATH = path.join(__dirname, 'extracted_orca_printer');
const OUTPUT_ORCA_PRINTER_DIR = path.join(__dirname, 'outputs');
const PRINTER_HOST = `${process.env.FRONTEND_URL}/api`;
const DEFAULT_FILAMENT = "Generic PLA template @Voron v2 300mm3 0.4 nozzle"
const DEFAULT_PROCESS = "0.20 Standard"
const VERSION = "1.0"

// Path
const queueFilePath = path.join(__dirname, 'printQueue.json');
const verifiedUsersPath = path.join(__dirname, 'verifiedUsers.json');
// Load or generate a UUID for the bot
const botUuidFilePath = path.join(__dirname, 'botUuid.json');
let botUuid;


// Ensure verifiedUsers.json exists
if (!fs.existsSync(verifiedUsersPath)) {
  fs.writeFileSync(verifiedUsersPath, JSON.stringify({}), 'utf-8');
}

// Load the bot UUID if it exists, otherwise generate and save it
if (fs.existsSync(botUuidFilePath)) {
  const data = fs.readFileSync(botUuidFilePath, 'utf-8');
  botUuid = JSON.parse(data).uuid;
  console.log(`Bot UUID: ${botUuid}`);
} else {
  botUuid = uuidv4();
  fs.writeFileSync(botUuidFilePath, JSON.stringify({ uuid: botUuid }, null, 2), 'utf-8');
  console.log(`Generated new bot UUID: ${botUuid}`);
}

// Load verified users
const loadVerifiedUsers = () => JSON.parse(fs.readFileSync(verifiedUsersPath, 'utf-8'));
const saveVerifiedUsers = (users) => fs.writeFileSync(verifiedUsersPath, JSON.stringify(users, null, 2), 'utf-8');

// Discord configuration
const DISCORD_API_URL = 'https://discord.com/api';
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

// Validate environment variables
if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET || !process.env.DISCORD_REDIRECT_URI || !process.env.SESSION_SECRET || !DISCORD_GUILD_ID || !DISCORD_BOT_TOKEN) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Load print queue
const loadQueue = () => (fs.existsSync(queueFilePath) ? JSON.parse(fs.readFileSync(queueFilePath, 'utf-8')) : []);
const saveQueue = (queue) => fs.writeFileSync(queueFilePath, JSON.stringify(queue, null, 2), 'utf-8');
const printQueue = loadQueue();

// Multer configuration for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// Helper function to fetch Discord user data
const fetchDiscordUser = async (token) => {
  const response = await fetch(`${DISCORD_API_URL}/users/@me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch Discord user data');
  return await response.json();
};

function extractThumbnail(filePath) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n');
      let isThumbnail = false;
      let base64Data = '';
  
      lines.forEach((line) => {
        if (line.includes('; THUMBNAIL_BLOCK_START')) {
          isThumbnail = true;
        } else if (line.includes('; THUMBNAIL_BLOCK_END')) {
          isThumbnail = false;
        } else if (isThumbnail && !line.startsWith('; thumbnail')) {
          base64Data += line.trim().substring(2); // Remove leading `; `
        }
      });
  
      if (!base64Data) {
        return null; // No thumbnail found
      }
  
      return base64Data;
    } catch (error) {
      console.error('Error extracting thumbnail:', error);
      return null;
    }
  }

// Helper function to check if a user is in the server
async function isUserInGuild(userId) {
    try {
      const response = await fetch(`https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/members/${userId}`, {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`, // Use your Discord bot token
        },
      });
  
      return response.status === 200; // If the status is 200, the user is in the server
    } catch (error) {
      console.error('Error checking guild membership:', error);
      return false;
    }
  }

  const verifyGuildMembership = async (req, res, next) => {
    if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });
  
    const verifiedUsers = loadVerifiedUsers();
    const uuid = Object.keys(verifiedUsers).find((key) => verifiedUsers[key].id === req.session.user.id);
  
    if (!uuid) {
      return res.status(403).json({ message: 'User not verified' });
    }
  
    const isMember = await isUserInGuild(req.session.user.id);
  
    if (!isMember) {
      delete verifiedUsers[uuid];
      saveVerifiedUsers(verifiedUsers);
  
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
      });
  
      return res.status(403).json({ message: 'You are no longer a member of the server.' });
    }
  
    next(); // Proceed to the next middleware or route handler
  };
  
  const verifyGuildMembershipByUUID = async (req, res, next) => {
    const { uuid } = req.params;
  
    const verifiedUsers = loadVerifiedUsers();
    const user = verifiedUsers[uuid];
  
    if (!user) {
      return res.status(404).json({ message: 'User not found or not verified' });
    }
  
    try {
      const isMember = await isUserInGuild(user.id);
  
      if (!isMember) {
        delete verifiedUsers[uuid];
        saveVerifiedUsers(verifiedUsers);
  
        return res.status(403).json({ message: 'User is no longer a member of the server' });
      }
  
      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error('Error verifying user:', error);
      res.status(500).json({ message: 'Failed to verify user' });
    }
  };
  

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'];
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'DELETE'],
}));
app.options('*', cors());
app.use(express.json());

// CORS configuration for open access
const openCorsOptions = {
    origin: '*', // Allow all origins
    methods: ['GET'],
  };

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
}));

// Root route
app.get('/', (req, res) => res.send(`Print Queue API is running. Version: ${VERSION}`));

// OAuth2 login
app.get('/auth/login', (req, res) => {
  const scope = 'identify';
  const authUrl = `${DISCORD_API_URL}/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT_URI)}&response_type=code&scope=${scope}`;
  res.redirect(authUrl);
});

// OAuth2 callback
app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing authorization code');

  try {
    const tokenResponse = await fetch(`${DISCORD_API_URL}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) throw new Error('Failed to fetch access token');

    const tokenData = await tokenResponse.json();
    const userData = await fetchDiscordUser(tokenData.access_token);

    // Verify user is in the guild
    const isMember = await isUserInGuild(userData.id);
    if (!isMember) return res.status(403).send('You must be a member of the server.');

    // Generate a UUID for the user
    const verifiedUsers = loadVerifiedUsers();
    let userUUID = Object.keys(verifiedUsers).find((uuid) => verifiedUsers[uuid].id === userData.id);

    if (!userUUID) {
      userUUID = uuidv4(); // Generate a new UUID if not already stored
      verifiedUsers[userUUID] = {
        id: userData.id,
        username: userData.username,
        discriminator: userData.discriminator,
      };
      saveVerifiedUsers(verifiedUsers);
    }

    userData.uuid = userUUID; // Attach the UUID to the user data
    req.session.user = userData;

    // Redirect with the UUID (you could also provide it in the frontend)
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).send('Authentication failed');
  }
});

app.get('/queue/:id/thumbnail', (req, res) => {
    const { id } = req.params;
    const queueItem = printQueue.find((item) => item.id === id);
  
    if (!queueItem) {
      return res.status(404).json({ message: 'File not found in the queue' });
    }
  
    const filePath = path.join(__dirname, 'uploads', queueItem.filename);
    const thumbnailBase64 = extractThumbnail(filePath);
  
    if (!thumbnailBase64) {
      return res.status(404).json({ message: 'Thumbnail not found in the file' });
    }
  
    res.json({ thumbnail: thumbnailBase64 });
  });
  


// Fake Octoprint Server
app.get('/:uuid/api/version',verifyGuildMembershipByUUID, (req, res) => {
    const { uuid } = req.params; // Extract the ID from the route
    const verifiedUsers = loadVerifiedUsers();

    if (!verifiedUsers[uuid]) {
        return res.status(403).json({ message: 'User is not authorized to upload files' });
      }
  
    // Create the version info response
    const versionInfo = {
      server: "1.5.0",
      api: "0.1",
      text: "OctoPrint (Moonraker v0.3.1-12)",
      uuid, // Include the dynamic ID in the response for context
    };
  
    // Send the response as JSON
    res.status(200).json(versionInfo);
  });

// Remote file upload by UUID
app.post('/:uuid/api/files/local',verifyGuildMembershipByUUID, upload.single('file'), (req, res) => {
    const { uuid } = req.params;
    const verifiedUsers = loadVerifiedUsers();
  
    if (!verifiedUsers[uuid]) {
      return res.status(403).json({ message: 'User is not authorized to upload files' });
    }
  
    const file = req.file;
    if (!file) return res.status(400).send('No file uploaded');
  
    const queueItem = {
      id: uuidv4(),
      filename: file.filename,
      originalFilename: file.originalname,
      uploader: verifiedUsers[uuid].username,
      uploadedAt: new Date(),
    };
  
    printQueue.push(queueItem);
    saveQueue(printQueue);
    res.status(200).json({ message: 'File uploaded successfully', queueItem });
  });

// Ensure necessary directories exist
if (!fs.existsSync(OUTPUT_ORCA_PRINTER_DIR)) fs.mkdirSync(OUTPUT_ORCA_PRINTER_DIR);
if (!fs.existsSync(path.join(__dirname,'outputs'))) fs.mkdirSync(path.join(__dirname,'outputs'));
if (!fs.existsSync(path.join(__dirname,'uploads'))) fs.mkdirSync(path.join(__dirname,'uploads'));

// Helper Functions

// Unzip the `.orca_printer` file
const extractOrcaPrinter = (filePath, extractTo) => {
  const zipFile = new zip(filePath);
  zipFile.extractAllTo(extractTo, true);
};

// Edit the JSON file within the extracted `.orca_printer`
const editJsonFile = (filePath, authorName, id) => {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Modify relevant fields
  if (data.machine_end_gcode) {
    data.machine_end_gcode = data.machine_end_gcode.replace(
      "AUTHOR=CHANGE_ME",
      `AUTHOR=${authorName}`
    );
  }

  data.print_host = `${PRINTER_HOST}/${id}`;
  data.inherits = "";
  data.default_filament_profile = DEFAULT_FILAMENT;
  data.default_print_profile = DEFAULT_PROCESS;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Edit the JSON file within the extracted `.orca_printer`
const editFilament = (filePath) => {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  data.compatible_printers=`${MACHINE_NAME}`;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

const editPrint = (filePath) => {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  data.brim_type="no_brim";
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Repackage the modified `.orca_printer` file
const repackageOrcaPrinter = (sourceDir, outputFile) => {
  const zipFile = new zip();
  zipFile.addLocalFolder(sourceDir);
  zipFile.writeZip(outputFile);
};

app.get('/version', (req, res) => {
  res.json({ version: VERSION });
});

// Download Route
app.get('/:uuid/api/download',verifyGuildMembershipByUUID, (req, res) => {
  const { uuid } = req.params;
  const verifiedUsers = loadVerifiedUsers();

  if (!verifiedUsers[uuid]) {
    return res.status(403).json({ message: 'User is not authorized to download files' });
  }

  const discordUser = verifiedUsers[uuid];

  if (!fs.existsSync(ORIGINAL_ORCA_PRINTER)) {
    return res.status(400).json({ message: `Original file '${ORIGINAL_ORCA_PRINTER}' not found.` });
  }

  // Prepare paths for processing
  const userExtractPath = path.join(EXTRACT_PATH, uuid);
  const outputOrcaPrinter = path.join(OUTPUT_ORCA_PRINTER_DIR, `${uuid}.orca_printer`);

  // Clean up previous data
  if (fs.existsSync(userExtractPath)) fs.rmSync(userExtractPath, { recursive: true, force: true });
  if (fs.existsSync(outputOrcaPrinter)) fs.unlinkSync(outputOrcaPrinter);

  try {
    // Step 1: Extract the original `.orca_printer` file
    extractOrcaPrinter(ORIGINAL_ORCA_PRINTER, userExtractPath);

    // Step 2: Edit the JSON file
    const jsonFileToEdit = path.join(userExtractPath, 'printer', `${MACHINE_NAME}.json`);
    if (!fs.existsSync(jsonFileToEdit)) {
      return res.status(400).json({ message: `JSON file '${jsonFileToEdit}' not found.` });
    }
    editJsonFile(jsonFileToEdit, discordUser.id, uuid);

    // Step 3: Edit the Filament file
    const filamentPath = path.join(userExtractPath, 'filament');
    const files = fs.readdirSync(filamentPath).filter(file => file.endsWith('.json'));
    files.forEach((file) => {
      const jsonFileToEdit = path.join(filamentPath, file);
      editFilament(jsonFileToEdit);
    });

    // Step 4: Edit the Print file
    const printPath = path.join(userExtractPath, 'process');
    const printFiles = fs.readdirSync(printPath).filter(file => file.endsWith('.json'));
    printFiles.forEach((file) => {
      const jsonFileToEdit = path.join(printPath, file);
      editPrint(jsonFileToEdit);
    });

    // Step 3: Repackage the modified `.orca_printer` file
    repackageOrcaPrinter(userExtractPath, outputOrcaPrinter);

    // Step 4: Serve the modified file
    return res.download(outputOrcaPrinter, `${MACHINE_NAME}-${discordUser.username}.orca_printer`);
  } catch (error) {
    console.error('Error processing .orca_printer file:', error);
    return res.status(500).json({ message: 'Failed to process the .orca_printer file.' });
  }
});


// Dashboard route
app.get('/dashboard', verifyGuildMembership, (req, res) => {
    if (!req.session.user) return res.status(401).send('Unauthorized');
  
    const verifiedUsers = loadVerifiedUsers();
    const uuid = Object.keys(verifiedUsers).find((key) => verifiedUsers[key].id === req.session.user.id);
  
    if (!uuid) {
      return res.status(403).json({ message: 'User not verified' });
    }
  
    res.json({ username: req.session.user.username, uuid });
  });

// Upload G-Code
app.post('/upload',verifyGuildMembership, upload.single('gcode'), (req, res) => {
  if (!req.session.user) return res.status(401).send('Unauthorized');

  const file = req.file;
  if (!file) return res.status(400).send('No file uploaded');

  const queueItem = {
    id: uuidv4(),
    filename: file.filename,
    originalFilename: file.originalname,
    uploader: req.session.user.username,
    uploadedAt: new Date(),
  };

  printQueue.push(queueItem);
  saveQueue(printQueue);
  res.status(200).json({ message: 'File uploaded successfully', queueItem });
});

// Get print queue
app.get('/queue', (req, res) => res.json(printQueue));

// Delete queue item
app.delete('/queue/:id', (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });
  
    const { id } = req.params;
  
    // Find the item in the queue
    const index = printQueue.findIndex((item) => item.id === id);
    if (index === -1) return res.status(404).json({ message: 'Item not found' });
  
    const queueItem = printQueue[index];
  
    // Check if the current user is the uploader
    if (queueItem.uploader !== req.session.user.username) {
      return res.status(403).json({ message: 'You are not authorized to delete this file' });
    }
  
    const filePath = path.join(__dirname, 'uploads', queueItem.filename);
  
    // Delete the file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        return res.status(500).json({ message: 'Failed to delete the file' });
      }
  
      // Remove the item from the queue
      const [deletedItem] = printQueue.splice(index, 1);
      saveQueue(printQueue);
      res.status(200).json({ message: 'Item and file deleted successfully', deletedItem });
    });
  });

  app.post('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ message: 'Failed to log out' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
  
  // Route to send the first .gcode file in the queue to any requester
app.get(`/${botUuid}/requestgcode`, cors(openCorsOptions), (req, res) => {
    if (printQueue.length === 0) {
        return res.status(404).json({ message: 'The queue is empty' });
      }
    
      const firstQueueItem = printQueue[0];
      const filePath = path.join(__dirname, 'uploads', firstQueueItem.filename);
    
      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        return res.status(500).json({ message: 'File not found on the server' });
      }
    
      // Set Content-Disposition header to suggest a filename for the client
      res.setHeader('Content-Disposition', `attachment; filename="${firstQueueItem.originalFilename}"`);
    
      // Send the .gcode file
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(500).json({ message: 'Failed to send the file' });
        } else {
            // Remove the item from the queue
            fs.unlink(filePath, (err) => {
                if (err) {
                  console.error('Error deleting file:', err);
                  return res.status(500).json({ message: 'Failed to delete the file' });
                }})
            printQueue.shift();
            saveQueue(printQueue);
          console.log(`File sent: ${firstQueueItem.originalFilename}`);
        }
      });
    });

    app.post(`/${botUuid}/notify`, async (req, res) => {
      const { message } = req.body;
  
      if (!message) {
          return res.status(400).json({ message: 'Message is required' });
      }
  
      try {
          const response = await fetch(`${DISCORD_API_URL}/channels/${process.env.DISCORD_CHANNEL_ID}/messages`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  content: message,
              }),
          });
  
          if (!response.ok) {
              const errorDetails = await response.text(); // Fetch error details
              throw new Error(`Failed to send message: ${response.statusText} - ${errorDetails}`);
          }
  
          res.status(200).json({ message: 'Notification sent successfully' });
      } catch (error) {
          console.error('Error sending notification:', error);
          res.status(500).json({ message: 'Failed to send notification', error: error.message });
      }
  });
  
  

// // Handle 404 errors
// app.use((req, res) => res.status(404).send('Route not found'));

// Log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });


// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
