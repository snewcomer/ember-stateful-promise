import { StatefulPromise } from 'ember-stateful-promise/utils/stateful-promise';

 export function statefulPromise(_target, _property, descriptor) {
   const actualFunc = descriptor.value;

   function statefulFunc(...args) {
     statefulFunc.performCount++;

     const maybePromise = actualFunc.call(this, ...args);
     const sp = new StatefulPromise((resolve, reject) => {
       maybePromise
         .then((result) => resolve(result))
         .catch((e) => reject(e));
     });

     return sp;
   }

   statefulFunc.performCount = 0;

   descriptor.value = statefulFunc;

   return descriptor;
 }