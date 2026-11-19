import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

config();
const uri = process.env.PROJECTS_MONGO_URI.replace(/^["']|["']$/g, '');
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });

await client.connect();
const db = client.db('ignitio_projects');
const col = db.collection('projects');

// Patch all documents missing isPublished field
const result = await col.updateMany(
  { isPublished: { $exists: false } },
  { $set: { isPublished: true } }
);
console.log(`✅ Patched ${result.modifiedCount} documents with isPublished: true`);

// Verify
const published = await col.find({ isPublished: true }, { projection: { slug: 1, isPublished: 1 } }).toArray();
console.log('\nVerification — isPublished:true docs:', published.map(d => d.slug));

await client.close();
