"use strict";

var jetpack = require('fs-jetpack');
var app = require('remote').require('app');

function DB() {
  this.db = null;
  this.config = window.env;
  this.useDataDir = jetpack.cwd(app.getPath("userData"));
}

DB.prototype.init = function() {

  if (this.db) {
    return this.db;
  }
  var fs = require("fs");
  var DataStore = require('nedb');
  var self = this;

  function createOrReadDatabase(dbname) {

    var yes_article = fs.existsSync(self.useDataDir.path(dbname.article));
    var yes_tag = fs.existsSync(self.useDataDir.path(dbname.tag));
    var yes_feed = fs.existsSync(self.useDataDir.path(dbname.feed));

    if (yes_article && yes_tag && yes_feed) {

      var article_data = fs.readFileSync(self.useDataDir.path(dbname.article));
      var tag_data = fs.readFileSync(self.useDataDir.path(dbname.tag));
      var feed_data = fs.readFileSync(self.useDataDir.path(dbname.feed));

      if (!article_data && !tag_data && !feed_data) {
        return;
      }

      var database = {};

      database.article = new DataStore({
        filename: self.useDataDir.path(dbname.article),
        autoload: true
      });
      database.tag = new DataStore({
        filename: self.useDataDir.path(dbname.tag),
        autoload: true
      });
      database.feed = new DataStore({
        filename: self.useDataDir.path(dbname.feed),
        autoload: true
      });

      return database;

    } else {
      try {

        self.useDataDir.write(dbname.article);
        self.useDataDir.write(dbname.tag);
        self.useDataDir.write(dbname.feed);

        var database = {};

        database.article = new DataStore({
          filename: self.useDataDir.path(dbname.article),
          autoload: true
        });
        database.tag = new DataStore({
          filename: self.useDataDir.path(dbname.tag),
          autoload: true
        });
        database.feed = new DataStore({
          filename: self.useDataDir.path(dbname.feed),
          autoload: true
        });

        return database;

      } catch (e) {
        console.log(e);
      }

    }

  }
  this.db = createOrReadDatabase(this.config.dbFileNames);
  return this.db;
}

module.exports = exports = DB;
