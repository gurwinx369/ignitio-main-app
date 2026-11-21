import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

config();

const rawUri = process.env.PROJECTS_MONGO_URI;
console.log('PROJECTS_MONGO_URI defined:', !!rawUri);
console.log('URI preview:', rawUri ? rawUri.substring(0, 100) + '...' : 'NOT SET');

if (!rawUri) {
  console.error('ERROR: PROJECTS_MONGO_URI is not set in .env');
  process.exit(1);
}

// Strip any surrounding quotes dotenv might have kept
const uri = rawUri.replace(/^["']|["']$/g, '');

console.log('\nAttempting connection...');
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 10000,
});

try {
  await client.connect();
  console.log('✅ SUCCESS: Connected to cluster!');

  const adminDb = client.db('admin');
  const isMaster = await adminDb.command({ isMaster: 1 });
  console.log('  replicaSet:', isMaster.setName);
  console.log('  primary:', isMaster.primary);
  console.log('  hosts:', isMaster.hosts);

  const projectsDb = client.db('ignitio_projects');
  const collections = await projectsDb.listCollections().toArray();
  console.log('\nCollections in ignitio_projects:', collections.map(c => c.name));

  await client.close();
  process.exit(0);
} catch (err) {
  console.error('❌ Connection failed:');
  console.error('  Code:', err.code);
  console.error('  Message:', err.message);
  if (err.code === 8000) {
    console.error('\n⚠️  AUTHENTICATION FAILED - Check Atlas Database Users in Project 0');
    console.error('   User: ignitiocloud01_db_user may not exist or password is wrong');
  }
  await client.close().catch(() => {});
  process.exit(1);
}
