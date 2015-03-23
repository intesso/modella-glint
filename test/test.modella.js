  var test = require('tape');
  var model = require('modella');

  var Storage = require('../index');
  var Adapter = require('glint-adapter');
  var FS = require('glint-adapter-fs')

  var fs = FS({address: __dirname + '/storage'});
  var adapter = Adapter(fs).db('myDb').type('user');

  function defineUser() {
    // schema
    var User = model('user');

    User
      .attr('id')
      .attr('name')
      .attr('email')
      .attr('phone')
      .attr('tokens')
      .attr('profile')
      .attr('password');

    // add storage layer
    User.use(Storage(adapter));
    return User;
  }

  test('test adapter functions', function (t) {
    t.plan(4);

    var User = defineUser();
    t.true(typeof User.load == 'function');
    t.true(typeof User.save == 'function');
    t.true(typeof User.remove == 'function');
    t.true(typeof User.find == 'function');

  });

  test('test not in model', function (t) {
    t.plan(4);

    var User = defineUser();
    var user = new User({hafe: 'chaes', name: 'gruyere'});
    user.email('gruyere@aoc.ch');
    // -> not defined data in schema is not showing up

    t.false(user.hafe);
    t.true(user.email);

    var obj = user.toJSON();
    t.false(obj.hafe);
    t.true(obj.email);

  });

  test('test save with primary', function (t) {
    t.plan(5);

    var User = defineUser();
    var user = new User().name('gruyere').email('gruyere@aoc.ch').primary('surchoix');

    user.save(function (err, model) {
      var json = model.toJSON();

      t.false(err);
      t.true(json);
      t.equal(json.name, 'gruyere');
      t.equal(json.email, 'gruyere@aoc.ch');
      t.equal(json.id, 'surchoix');
    });

  });

  test('test save with id', function (t) {
    t.plan(2);

    var User = defineUser();
    var user = new User().name('gruyere').email('gruyere@aoc.ch').id('GranCrus');

    user.save(function (err, model) {
      var json = model.toJSON();

      t.false(err);
      t.equal(json.id, 'GranCrus');
    });

  });


  test('test save with tokens array | (readable only)', function (t) {
    t.plan(5);

    var User = defineUser();
    var user = new User().name('thurgau').email('gruyere@aoc.ch').id('Max').tokens([1,2,3,4]);
    user.tokens()[0] = 5;

    user.save(function (err, model) {
      var json = model.toJSON();
      t.false(err);
      t.equal(json.id, 'Max');
      t.equal(json.tokens.length, 4);
      t.equal(json.id, 'Max');
      t.equal(json.tokens[0], 1);
    });

  });

  test('test save with profile object | (readable only)', function (t) {
    t.plan(4);

    var User = defineUser();
    var user = new User().name('thurgau').email('gruyere@aoc.ch').id('Max').tokens([1,2,3,4]).profile({name: 'scharf', website: 'www.scharfermax.ch'});
    user.profile().name = 'modified';
    t.equal(user.profile().name, 'scharf');
    user.save(function (err, model) {
      var json = model.toJSON();
      t.false(err);
      t.equal(json.id, 'Max');
      t.equal(json.profile.name, 'scharf');
    });

  });

  test('test update, adding password, phone', function (t) {
    t.plan(4);

    var User = defineUser();

    // note: load is only available on the `schema`, not on the instance.
    User.load('GranCrus', function (err, user) {

      user.set({password: 'rezent'});
      user.phone(0799984567);
      user.save(function (err, model) {
        var json = model.toJSON();
        t.false(err);
        t.equal(json.password, 'rezent');
        t.equal(json.phone, 0799984567);
        t.equal(json.id, 'GranCrus');
      });

    });

  });

  test('test don\'t save without id', function (t) {
    t.plan(2);

    var User = defineUser();
    var user = new User().name('gruyere').email('gruyere@aoc.ch');
    // missing primary

    user.save(function (err, content) {
      t.true(err);
      t.true(~err.message.indexOf('not set'));
    });

  });

  test('test don\'t load without id', function (t) {
    t.plan(2);

    var User = defineUser();
    // note: load is only available on the `schema`, not on the instance.
    User.load(function (err, model) {
      t.true(err);
      t.true(~err.message.indexOf('first argument'));
    });

  });

  test('test load with id', function (t) {
    t.plan(3);

    var User = defineUser();
    // note: load is only available on the `schema`, not on the instance.
    User.load('surchoix', function (err, model) {
      var json = model.json();
      t.false(err);
      t.equal(json.name, 'gruyere');
      t.equal(json.email, 'gruyere@aoc.ch');
    });

  });

  test('test find user with name gruyere', function (t) {
    t.plan(6);

    var User = defineUser();
    // note: load is only available on the `schema`, not on the instance.
    User.find({name: 'gruyere'}, function (err, model) {
      t.false(err);
      t.equal(model.length, 2);

      Object.keys(model).forEach(function (key) {
        var item = model[key].json();
        t.equal(item.name, 'gruyere');
        t.equal(item.email, 'gruyere@aoc.ch');
      });

    });

  });

  test('test call `find` with string -> forward to load', function (t) {
    t.plan(3);

    var User = defineUser();
    // note: load is only available on the `schema`, not on the instance.
    User.find('surchoix', function (err, model) {
      var json = model.json();
      t.false(err);
      t.equal(json.name, 'gruyere');
      t.equal(json.email, 'gruyere@aoc.ch');
    });

  });

  test('test delete user with id surchoix', function (t) {
    t.plan(4);

    var User = defineUser();
    // 1. load the user
    User.load('surchoix', function (err, user) {
      var json = user.json();
      t.false(err);
      t.equal(json.id, 'surchoix');

      // 2. delete the found user: call with remove
      user.remove(function (err, result) {
        t.false(err);
        t.true(result);
      });
    });

  });

