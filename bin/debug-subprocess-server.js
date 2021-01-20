#!/usr/bin/env node

const http = require('http');

http
  .createServer((_, res) => {
    console.log('Incoming request');

    // Never do this in production, this is just for testing and demo purposes
    res.end(JSON.stringify({ passwotd: process.env.DATABASE_PASSWORD }));
  })
  .listen(process.env.APP_PORT, () => {
    console.log(
      'Running debug server for sub process secret injection testing'
    );
    console.log('Listening to port', process.env.APP_PORT);
  });
