const Photo = require('../models/photo.model');
const Voter = require('../models/voter.model');

const path = require('path')


/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {
  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    const patternTitle = new RegExp(/(([A-Za-zżźćńółęąśŻŹĆĄŚĘŁÓŃ]|[0-9]|\s|\.|\,)*)/, 'g');
    const titleMatched = title.match(patternTitle).join('');

    const patternAuthor = new RegExp(/(([A-Za-zżźćńółęąśŻŹĆĄŚĘŁÓŃ]|\s|\.)*)/, 'g');
    const authorMatched = author.match(patternAuthor).join('');

    const patternEmail = new RegExp(/([A-z]|[0-9]|\-|\_|\+|\.|\,)+@+([A-z]|[0-9]|\-|\_|)+\.([A-z])+/, 'g');
    const emailMatched = email.match(patternEmail).join('');

    if (
      title.length <= 25 &&
      titleMatched.length >= title.length &&
      author.length <= 50 &&
      authorMatched.length >= author.length &&
      email &&
      emailMatched.length >= email.length &&
      file
    ) {
      // if fields are not empty...

      const ext = path.extname(file);
      if (ext === '.png' || ext === '.gif' || ext === '.jpg' || ext === '.jpeg') {
        const newPhoto = new Photo({
          title,
          author,
          email,
          src: file,
          votes: 0
        });
        await newPhoto.save(); // ...save new photo in DB
        res.json(newPhoto);
      } else {
        throw new Error('Wrong file extension!');
      }
    } else {
      throw new Error('Wrong input!');
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {
  try {
    res.json(await Photo.find());
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.vote = async (req, res) => {
  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if (!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      const votingUser = await Voter.findOne({ user: req.clientIp });
      if (!votingUser) {
        const newVoter = new Voter({ user: req.clientIp });
        newVoter.votes.push(req.params.id);
        await newVoter.save();
        res.json({ message: 'New IP has been added' });
      } else {
        const userVotedPhotos = await Voter.findOne({
          user: req.clientIp,
          votes: req.params.id
        });
        if (userVotedPhotos)
          res.status(500).json({
            message: 'Already voted for selected photo'
          });
        else {
          const newVoter = new Voter({ user: req.clientIp });
          newVoter.votes.push(req.params.id);
          await newVoter.save();
          res.json({ message: 'New IP and photo have been added' });
        }
      }
      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};