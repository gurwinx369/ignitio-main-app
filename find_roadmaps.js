const mongoose = require("mongoose");
const uri = "mongodb://tst67540_db_user:tester01@ac-a166cx3-shard-00-00.wvx8gx4.mongodb.net:27017,ac-a166cx3-shard-00-01.wvx8gx4.mongodb.net:27017,ac-a166cx3-shard-00-02.wvx8gx4.mongodb.net:27017/?ssl=true&replicaSet=atlas-he4cp1-shard-0&authSource=admin&appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  const admin = mongoose.connection.db.admin();
  const dbs = await admin.listDatabases();
  console.log("Databases:", dbs.databases.map(d => d.name));
  
  const { Roadmap } = require('./models/v1/roadmap.model.js');
  const docs = await Roadmap.find({});
  console.log("Docs using model:", docs.map(d => d.name));
  process.exit(0);
}
run();
