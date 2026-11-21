import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

config();
const uri = process.env.PROJECTS_MONGO_URI.replace(/^["']|["']$/g, '');
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });

await client.connect();
const db = client.db('ignitio_projects');
const col = db.collection('projects');

const docs = await col.find({}, { projection: { slug: 1, isPublished: 1, track: 1 } }).toArray();
console.log('Documents in Cluster0 ignitio_projects.projects:');
docs.forEach(d => console.log('  ', JSON.stringify(d)));

// Check what findProjects query would return
const published = await col.find({ isPublished: true }).toArray();
console.log('\nWith isPublished:true filter:', published.length, 'results');

const noFilter = await col.find({}).toArray();
console.log('With no filter:', noFilter.length, 'results');

await client.close();
