const User = require('../models/User');

async function listMembers(req, res) {
  const { search = '', district = '', skill = '' } = req.query;

  const query = {};
  if (district && district !== 'All Districts') {
    query.district = district;
  }
  if (skill && skill !== 'All Skills') {
    query.skills = skill;
  }
  if (search) {
    const re = new RegExp(search, 'i');
    query.$or = [{ name: re }, { district: re }, { skills: re }, { bio: re }];
  }

  const members = await User.find(query).sort({ createdAt: -1 }).limit(200);
  res.json({ members: members.map((m) => m.toPublicJSON()) });
}

async function getMember(req, res) {
  const member = await User.findById(req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found.' });
  res.json({ member: member.toPublicJSON() });
}

async function updateMe(req, res) {
  const { district, skills, bio } = req.body;
  if (district !== undefined) req.user.district = district;
  if (skills !== undefined) req.user.skills = skills;
  if (bio !== undefined) req.user.bio = bio;
  await req.user.save();
  res.json({ user: req.user.toPublicJSON() });
}

module.exports = { listMembers, getMember, updateMe };
