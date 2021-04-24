const path = require('path');
const fs = require('fs');

const fetch = require('node-fetch');

const songKickController = {};

songKickController.getEventDetails = (req, res, next) => {
  console.log('getEntryDetails fired...');
  const eventId = req.query.id;
  // fetch(`http://localhost:3001/api/data/?id=${eventId}`); // MOCK FETCH
  fetch(
    `https://api.songkick.com/api/3.0/events/${eventId}.json?apikey=${process.env.SK_API}`
  )
    .then((res) => {
      if (res.status >= 400)
        return next({
          log: `Error in getEventDetails middleware: ${res.status}: ${res.statusText}`,
          message: { err: 'An error occurred' },
        });
      return res.json();
    })
    .then((data) => {
      res.locals.data = data.resultsPage.results.event;
      return next();
    })
    .catch((err) => {
      return next({
        log: `Error in getEventDetails middleware: ${err}`,
        message: { err: 'An error occurred' },
      });
    });
};

songKickController.eventParser = (req, res, next) => {
  console.log('eventParser fired...');
  const sk = res.locals.data;

  const festivalDetails = {
    id: sk.id,
    url: sk.uri,
    festName: sk.displayName,
    date: { start: sk.start.date, end: sk.end.date },
    venue: sk.venue.displayName,
    city: sk.location.city,
    artists: [],
  };
  sk.performance.forEach((artist) => {
    festivalDetails.artists.push(artist.displayName);
  });

  res.locals.event = festivalDetails;
  // console.log('Parsed festival details:', festivalDetails);
  return next();
};

module.exports = songKickController;
