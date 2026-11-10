const fs = require('fs');

// DOMモックの作成
const domElements = {};
global.document = {
  getElementById: (id) => {
    if (!domElements[id]) {
      domElements[id] = {
        addEventListener: () => {},
        style: {},
        classList: {
          add: () => {},
          remove: () => {},
          contains: () => false
        },
        getBoundingClientRect: () => ({ width: 1280, height: 720 }),
        appendChild: () => {},
        getContext: () => ({ drawImage: () => {} })
      };
    }
    return domElements[id];
  },
  createElement: (tag) => ({
    style: {},
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false
    },
    appendChild: () => {}
  })
};
global.window = {
  addEventListener: () => {},
  innerWidth: 1280,
  innerHeight: 720
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};
global.navigator = {
  userAgent: ''
};
global.FileReader = function() {
  this.readAsDataURL = () => {};
};
global.Image = function() {
  setTimeout(() => {
    if (this.onload) this.onload();
  }, 0);
};

try {
  const code = fs.readFileSync('js/ccfolialayoutmaker_ai.js', 'utf8');
  eval(code);
  console.log("Execution successful without immediate errors!");
} catch (e) {
  console.error("Execution error:", e);
}
