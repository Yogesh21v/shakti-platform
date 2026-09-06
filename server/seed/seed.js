// Populates the database with realistic starter content so the app isn't empty
// on first run: sample members, forum discussions, business ideas, legal FAQs,
// helplines, mentors and government schemes.
//
// Safe to re-run: it only seeds collections that are currently empty.

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Post = require('../models/Post');
const BusinessIdea = require('../models/BusinessIdea');
const Scheme = require('../models/Scheme');
const LegalCategory = require('../models/LegalCategory');
const Helpline = require('../models/Helpline');
const Mentor = require('../models/Mentor');

const SAMPLE_MEMBERS = [
  { name: 'Padmavathi S', district: 'Guntur (AP)', skills: ['Cooking & Food', 'Business & Money'] },
  { name: 'Kavitha M', district: 'Coimbatore (TN)', skills: ['Rights & Law'] },
  { name: 'Sumathi R', district: 'Chennai (TN)', skills: ['Digital & Online', 'Education'] },
  { name: 'Lakshmi V', district: 'Vijayawada (AP)', skills: ['Digital & Online'] },
  { name: 'Revathi N', district: 'Guntur (AP)', skills: ['Textiles & Crafts'] },
  { name: 'Annapurna D', district: 'Madurai (TN)', skills: ['Cooking & Food'] },
  { name: 'Saraswathi B', district: 'Vizag (AP)', skills: ['Education'] },
  { name: 'Meenakshi K', district: 'Chennai (TN)', skills: ['Textiles & Crafts'] },
];

const SAMPLE_POSTS = [
  {
    title: "Started a pickle business from home with ₹2,000 — here's my full journey",
    body: 'I want to share my story so others can start too. It began in my own kitchen in Guntur with just gongura...',
    category: 'Business',
    tags: ['Business', 'Success Story'],
    district: 'Guntur (AP)',
  },
  {
    title: 'My daughter failed 10th — school says she cannot re-appear. Is this legal?',
    body: 'They are asking us to sign a paper and transfer her. She is only 15. What are our rights here?',
    category: 'Rights & Law',
    tags: ['Rights & Law', 'Education'],
    district: 'Madurai (TN)',
  },
  {
    title: 'Free digital marketing course in Telugu — full playlist with notes',
    body: 'Sisters, I have compiled everything. YouTube links, PDF notes in Telugu, practice assignments...',
    category: 'Education',
    tags: ['Education', 'Resource'],
    district: 'Vijayawada (AP)',
    pinned: true,
  },
  {
    title: 'Anyone else using Meesho/Instagram for selling sarees? Tips needed',
    body: "I have 40 sarees ready from Pochampally but don't know photography or pricing strategy well...",
    category: 'Business',
    tags: ['Business', 'Social Media'],
    district: 'Guntur (AP)',
  },
  {
    title: 'Husband refuses to let me open a bank account — what can I do?',
    body: 'I want to start saving independently. Is it my legal right to have my own account?',
    category: 'Rights & Law',
    tags: ['Rights & Law', 'Finance'],
    anonymous: true,
  },
];

const BUSINESS_IDEAS = [
  {
    emoji: '🍱', category: 'Food & Catering', title: 'Home Food & Tiffin Service',
    subtitle: 'Start from ₹500 · 200+ members doing this', theme: 'saffron', order: 1,
    description: 'South Indian cooking is a superpower. Many women run profitable tiffin services right from home. Startup cost is very low.',
    ideas: ['Tiffin service for office workers', 'Packaged pickles & chutneys', 'Wedding & event catering', 'Online food orders via Swiggy/Zomato'],
  },
  {
    emoji: '🧶', category: 'Textiles & Crafts', title: 'Handloom, Sarees & Crafts',
    subtitle: 'Start from ₹3,000 · High demand online', theme: 'gold', order: 2,
    description: 'Pochampally, Kanjivaram, and Kalamkari are world-famous. Sell directly to buyers across India through Instagram and Meesho.',
    ideas: ['Saree reselling via Instagram', 'Embroidery & stitching work', 'Terracotta & clay jewellery', 'Kolam art prints & canvas'],
  },
  {
    emoji: '📱', category: 'Digital & Online', title: 'Online & Digital Work',
    subtitle: 'Start for free · Work from home', theme: 'plain', order: 3,
    description: 'Even with basic smartphone skills you can start earning online. Many courses are available in Telugu and Tamil for free.',
    ideas: ['YouTube cooking / lifestyle channel', 'Data entry & transcription jobs', 'Social media manager for small shops', 'Online tuition (school subjects)'],
  },
  {
    emoji: '🌿', category: 'Beauty & Wellness', title: 'Beauty, Herbal & Wellness',
    subtitle: 'Start from ₹1,000 · Growing market', theme: 'saffron', order: 4,
    description: 'Natural, homemade beauty products are in huge demand. Traditional knowledge of herbs, oils, and remedies is a real business asset.',
    ideas: ['Homemade soaps & face packs', 'Herbal hair oil & powders', 'Beauty parlour at home', 'Yoga / fitness classes'],
  },
  {
    emoji: '📚', category: 'Education & Childcare', title: 'Teaching & Childcare',
    subtitle: 'High demand · Trusted community work', theme: 'gold', order: 5,
    description: 'Your knowledge and care for children is valued. Even home-based daycare or after-school coaching can provide steady income.',
    ideas: ['Home daycare / creche', 'After-school tuition centre', 'Music, dance, art classes', 'Spoken English coaching'],
  },
  {
    emoji: '🌾', category: 'Agriculture & Rural', title: 'Farm & Agri Products',
    subtitle: 'SHG Groups · Government support available', theme: 'plain', order: 6,
    description: "Women's self-help groups in Andhra and Tamil Nadu have built remarkable agri businesses with government support.",
    ideas: ['Organic vegetables & fruits', 'Rice, spices & pulses packaging', 'Dairy & poultry products', 'Mushroom cultivation'],
  },
];

const SCHEMES = [
  { name: 'PM Mudra Yojana', info: 'Collateral-free loans up to ₹10 lakh for small businesses.', order: 1 },
  { name: 'Stree Shakti Package', info: 'Special interest-rate concessions for women entrepreneurs.', order: 2 },
  { name: 'SHG Loans', info: 'Low-interest group loans through Self-Help Groups.', order: 3 },
  { name: 'NABARD Schemes', info: 'Support for agriculture and rural women-led enterprises.', order: 4 },
  { name: 'WEP Programme', info: "Government's Women Entrepreneurship Platform for mentorship & funding access.", order: 5 },
];

const LEGAL_CATEGORIES = [
  {
    icon: '🏠', iconColor: 'red', title: 'Property & Inheritance Rights', subtitle: 'What you legally own and can claim', order: 1,
    questions: [
      { question: 'Do daughters have equal right to parental property?', answer: 'Yes — daughters have equal right to parental property under the Hindu Succession Act, 2005.' },
      { question: 'Can I be thrown out of my marital home?', answer: 'No — a wife has the right to remain in the matrimonial home under the Domestic Violence Act, 2005.' },
      { question: "Can I buy property in my name without husband's permission?", answer: 'Yes — a wife can own and buy property independently of her husband.' },
      { question: 'Is my jewellery (streedhan) legally mine?', answer: 'Yes — stridhan (jewellery, gifts given to the bride) is legally hers alone.' },
      { question: "What are a widow's rights to husband's property?", answer: "Widows have full inheritance rights to their husband's property under Hindu succession law." },
    ],
  },
  {
    icon: '🛡️', iconColor: 'plain', title: 'Domestic Violence & Protection', subtitle: 'The law protects you — know how', order: 2,
    questions: [
      { question: 'What counts as domestic violence under Indian law?', answer: 'The Protection of Women from Domestic Violence Act, 2005 covers physical, verbal, and emotional abuse.' },
      { question: 'How do I file a complaint against my husband?', answer: 'Contact a Protection Officer or the police — filing a complaint is free, no fee required.' },
      { question: 'Is demanding dowry illegal? What can I do?', answer: 'Yes — under the Dowry Prohibition Act, 1961, demanding or giving dowry is a criminal offence.' },
      { question: 'What protection orders can a court give me?', answer: 'Courts can issue a Protection Order, Residence Order, and Monetary Relief.' },
      { question: 'Can I get maintenance even without divorce?', answer: 'Yes — under CrPC Section 125, a husband must support his wife even without a formal divorce.' },
    ],
  },
  {
    icon: '💰', iconColor: 'gold', title: 'Financial & Banking Rights', subtitle: 'Your money, your independence', order: 3,
    questions: [
      { question: 'Can my husband stop me from opening a bank account?', answer: 'No — every woman has the right to open and operate her own bank account independently.' },
      { question: 'How do I open a zero-balance bank account?', answer: 'The Pradhan Mantri Jan Dhan Yojana offers zero-balance accounts available to all.' },
      { question: "Can I get a business loan without my husband's signature?", answer: "Yes — women can get SHG loans and Mudra loans without a husband's permission." },
      { question: 'Am I entitled to equal pay as a woman worker?', answer: 'Yes — equal pay for equal work is a right under the Equal Remuneration Act, 1976.' },
    ],
  },
  {
    icon: '👶', iconColor: 'orange', title: 'Children & Education Rights', subtitle: 'Rights for you and your children', order: 4,
    questions: [
      { question: 'My child was denied school admission — what can I do?', answer: 'The Right to Education Act guarantees free education from age 6-14 as a constitutional right.' },
      { question: 'If I divorce, who gets custody of children?', answer: "A mother has equal guardianship rights; custody is decided based on the child's best interest." },
      { question: 'I was forced into marriage as a minor — what can I do?', answer: 'Child marriage is illegal — contact Childline 1098 immediately if at risk.' },
      { question: 'What maternity leave am I entitled to?', answer: 'The Maternity Benefit Act provides 26 weeks of paid leave for working mothers.' },
    ],
  },
];

const HELPLINES = [
  { name: '🆘 Women Helpline (National)', number: '1091', order: 1 },
  { name: '⚖️ Legal Aid Services', number: '15100', order: 2 },
  { name: '👮 Police Emergency', number: '100', order: 3 },
  { name: '🏛️ AP Women Commission', number: '0866-2439 399', order: 4 },
  { name: '🏛️ TN Women Commission', number: '044-28592750', order: 5 },
];

const MENTORS = [
  { name: 'Dr. Divya Reddy', role: 'Legal Expert · Hyderabad', avatarColor: '#8B1A2B', order: 1 },
  { name: 'Nirmala Krishnan', role: 'Business Mentor · Chennai', avatarColor: '#D4A017', order: 2 },
  { name: 'Sunitha Rao', role: 'Finance Expert · Vizag', avatarColor: '#1A6B7C', order: 3 },
];

async function seedIfEmpty(Model, docs, label) {
  const count = await Model.countDocuments();
  if (count > 0) {
    console.log(`[seed] ${label}: already has ${count} document(s), skipping.`);
    return [];
  }
  const created = await Model.insertMany(docs);
  console.log(`[seed] ${label}: inserted ${created.length} document(s).`);
  return created;
}

async function run() {
  await connectDB();

  // Seed content collections
  await seedIfEmpty(BusinessIdea, BUSINESS_IDEAS, 'Business ideas');
  await seedIfEmpty(Scheme, SCHEMES, 'Schemes');
  await seedIfEmpty(LegalCategory, LEGAL_CATEGORIES, 'Legal categories');
  await seedIfEmpty(Helpline, HELPLINES, 'Helplines');
  await seedIfEmpty(Mentor, MENTORS, 'Mentors');

  // Seed sample members (all with a shared demo password so you can log in and try the app)
  const existingUsers = await User.countDocuments();
  let users = [];
  if (existingUsers === 0) {
    const passwordHash = await bcrypt.hash('Demo@123', 10);
    const userDocs = SAMPLE_MEMBERS.map((m) => ({
      name: m.name,
      email: m.name.toLowerCase().replace(/\s+/g, '.') + '@example.com',
      passwordHash,
      district: m.district,
      skills: m.skills,
      online: Math.random() > 0.4,
    }));
    users = await User.insertMany(userDocs);
    console.log(`[seed] Members: inserted ${users.length} sample members (all with password "Demo@123").`);
  } else {
    users = await User.find().limit(SAMPLE_MEMBERS.length);
    console.log(`[seed] Members: already has ${existingUsers} document(s), skipping.`);
  }

  // Seed sample forum posts, authored by the sample members
  const existingPosts = await Post.countDocuments();
  if (existingPosts === 0 && users.length > 0) {
    const postDocs = SAMPLE_POSTS.map((p, i) => ({
      ...p,
      author: users[i % users.length]._id,
      authorName: users[i % users.length].name,
    }));
    const createdPosts = await Post.insertMany(postDocs);
    console.log(`[seed] Forum posts: inserted ${createdPosts.length} sample discussions.`);
  } else {
    console.log(`[seed] Forum posts: already has ${existingPosts} document(s), skipping.`);
  }

  console.log('[seed] Done.');
  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
