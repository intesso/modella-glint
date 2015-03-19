# modella-glint
Modella Storage Adapter for Glint Adapters


## install

```bash
npm install modella-glint
```

## usage

### setup

```js
var model = require('modella');
var Storage = require('modella-glint');
var Adapter = require('glint-adapter');
var Ajax = require('glint-adapter-ajax');

var adapter = Adapter(Ajax()).db('myDb');
var storage = Storage(adapter);

```

### model definition (schema)
```js

var User = model('user')
  .attr('id')
  .attr('name')
  .attr('email')
  .attr('password');

User.use(storage);

```

### model instance

```js
var user = new User;

user.id('hanswurst')
  .name('hans')
  .email('hans@wur.st')
  .password('grischuna');

user.save(function(err) {
  console.log(user.toJSON());
});

```

## model functions

#### load(id, fn)
called on model
```js
User.load('hanswurst', function (err, model) {
  var json = model.toJSON();
  // json.name == 'hans'
});
```

#### find(query, fn)
called on model
query is dependent on the used adapter.
e.g. for `glint-adapter-fs`, use the [mingo](https://github.com/kofrasa/mingo) syntax.
```js
User.find({name: 'hans'}, function (err, model) {

  Object.keys(model).forEach(function (key) {
    var item = model[key].json();
    // item.name == 'gruyere'
    // item.email == 'gruyere@aoc.ch'
  });

});
```

## instance functions

#### save(fn)
called on instance
note: unlike described in the adapter plugin guide, this implementation requires the id to be set manually.
if the `id()` aka `primary()` is not set, it will throw an Error.
```js
user.save(function (err, model) {
  var json = model.toJSON();
  // json.id == 'hanswurst'
});
```

#### remove(fn)
called on instance
note: modella only supports `remove`, but NOT `delete`, as it is used with `glint-adapter`.
```js
user.remove(function (err, model) {
  var json = model.toJSON();
  // json.id == 'hanswurst'
});
```



