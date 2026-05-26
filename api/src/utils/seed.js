import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Post from '../models/Post.js';

await mongoose.connect(process.env.MONGO_URI);
console.log('Connected');

await User.deleteMany({});
await Post.deleteMany({});

const pass = await bcrypt.hash('pass123', 10);
const [admin, editor, viewer] = await User.create([
  { name:'Admin', email:'admin@demo.com', password:pass, role:'Admin' },
  { name:'Editor', email:'editor@demo.com', password:pass, role:'Editor' },
  { name:'Viewer', email:'viewer@demo.com', password:pass, role:'Viewer' },
]);

await Post.create([
  { title:'Welcome', body:'This is a demo post anyone can read.', authorId: admin._id },
  { title:'Editor Note', body:'Editors can edit their own content.', authorId: editor._id },
]);

console.log('Seeded users and posts.');
await mongoose.disconnect();
