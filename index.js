/**
 * modella-glint
 *
 * Glint Adapter persistence layer for [Modella](https://github.com/modella/modella/).
 *
 * @link https://github.com/intesso/modella-glint
 * @author Andi Neck <andi.neck@intesso.com>
 */

/**
 * Export `storage`
 */

var storage = module.exports = function (adapter) {

  return function (model) {
    storage.adapter = adapter;
    // mixin methods
    for (fn in storage) model[fn] = storage[fn];
    return model;

  };
};

storage.find = function (query, fn) {
  var self = this;
  if (typeof query == 'function') return query(new Error('first argument must be a query object'));
  fn = fn || noop;
  storage.setAdapterType();

  storage.adapter.find(query, function (err, content) {
    if (err) return fn(err);
    fn(null, content.map(self));
  });
};

storage.load = function (id, fn) {
  var self = this;
  if (typeof id == 'function') return id(new Error('first argument must be an id'));
  fn = fn || noop;
  storage.setAdapterType();

  storage.adapter.load(id, function (err, content) {
    if (err) return fn(err);
    fn(null, self(content));
  });
};

storage.update =
  storage.save = function (fn) {
    fn = fn || noop;
    storage.setAdapterType();
    var id = this.primary();
    if (!id) return fn(new Error('primary (id) is not set'));
    storage.adapter.save(id, this.toJSON(), function (err, content) {
      fn();
    });
  };

storage.remove = function (fn) {
  fn = fn || noop;
  storage.setAdapterType();
  var id = this.primary();
  if (!id) return fn(new Error('primary (id) is not set'));
  storage.adapter.delete(id, fn);
};

storage.setAdapterType = function () {
  var type = storage.adapter.type();
  if (!type || type != this.modelName) storage.adapter.type(this.modelName);
};

function noop() {
};