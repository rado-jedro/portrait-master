const Photo = require('../models/photo.model');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {
  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    const patternTitle = new RegExp(/(([A-z]|[0-9]|\s|\.|\,)*)/, 'g');
    const titleMatched = title.match(patternTitle).join('');

    const patternAuthor = new RegExp(/(([A-z]|\s|\.)*)/, 'g');
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
      if (ext === 'png' || ext === 'gif' || ext === 'jpg' || ext === 'jpeg') {
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

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {
  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if (!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
