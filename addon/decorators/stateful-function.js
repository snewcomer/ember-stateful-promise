import { StatefulPromise } from 'ember-stateful-promise/utils/stateful-promise';
import { CanceledPromise } from 'ember-stateful-promise/utils/canceled-promise';
import { tracked } from '@glimmer/tracking';

class Handler {
  // these track the properties in stateful-promise
  @tracked isCanceled = false;
  @tracked isResolved = false;
  @tracked isRunning = false;
  @tracked isError = false;

  @tracked performCount = 0;

  cancelPromise = false;

  cancel() {
    this.cancelPromise = true;
  }

  apply(target, _thisArg, argumentsList) {
    return target(...argumentsList);
  }

  get(_target, prop) {
    if (this[prop] !== undefined && this[prop] !== null) {
      return this[prop];
    }

    return Reflect.get(...arguments);
  }
  set(_obj, prop, value) {
    if (this[prop] !== undefined && this[prop] !== null) {
      this[prop] = value;
    }
    return Reflect.set(...arguments);
  }
}

export function statefulFunction(options) {
  const throttle = options.throttle;
  let ctx;
  const decorator = function (target, _property, descriptor) {
    const actualFunc = descriptor.value;

    const handler = new Handler();
    let rej;

    const _statefulFunc = function (...args) {
      if (rej) {
        if (throttle) {
          return;
        }
        rej(
          new CanceledPromise(
            'This promise was canceled. Another promise was created while the other was outstanding.'
          )
        );
      }

      handler.performCount++;

      let maybePromise = actualFunc.call(ctx, ...args);
      // wrapping the promise in a StatefulPromise
      const sp = new StatefulPromise().create(target, (resolveFn, rejectFn) => {
        // store away in case we need to cancel
        rej = rejectFn;

        if (!maybePromise || !maybePromise.then) {
          maybePromise = Promise.resolve(maybePromise);
        }

        maybePromise
          .then((result) => {
            if (handler.cancelPromise) {
              rej(
                new CanceledPromise(
                  'This promise was canceled.  If this was unintended, check to see if `fn.cancel()` was called.'
                )
              );
            } else {
              resolveFn(result);
            }
          })
          .catch((e) => {
            rej(e);
          })
          .finally(() => {
            // Ideally we define a tracked property dynamically on the handler that just consumes the promise tracked state
            // https://github.com/emberjs/ember.js/issues/18362
            handler.isRunning = sp.isRunning;
            handler.isResolved = sp.isResolved;
            handler.isError = sp.isError;
            handler.isCanceled = sp.isCanceled;
          });
      });

      handler.isRunning = true;

      sp.catch((e) => {
        // ensure no unhandledrejection if canceled
        if (!(e instanceof CanceledPromise)) {
          throw e;
        }
      });

      return sp;
    };

    const proxy = new Proxy(_statefulFunc, handler);

    return {
      get() {
        ctx = this;
        return proxy;
      },
    };
  };

  if (isDecorating(...arguments)) {
    return decorator(...arguments);
  } else {
    return decorator;
  }
}

/**
 * If a decorator takes custom arguments, it should return another decorator
 * function that does the actual decorating.  The way this is detected is by
 * checking if the arguments match the expected decorator arguments which, for
 * a method, is a target funcgion/class, a name, and a descriptor.
 *
 * @returns {Boolean}
 */
function isDecorating() {
  return (
    arguments.length === 3 &&
    (typeof arguments[0] === 'object' || typeof arguments[0] === 'function') &&
    typeof arguments[1] === 'string' &&
    typeof arguments[2] === 'object'
  );
}
