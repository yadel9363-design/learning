
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/learning/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/learning/login",
    "route": "/learning"
  },
  {
    "renderMode": 2,
    "route": "/learning/products"
  },
  {
    "renderMode": 2,
    "route": "/learning/orders"
  },
  {
    "renderMode": 2,
    "route": "/learning/login"
  },
  {
    "renderMode": 2,
    "route": "/learning/admin/orders"
  },
  {
    "renderMode": 2,
    "route": "/learning/admin/products"
  },
  {
    "renderMode": 2,
    "route": "/learning/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 1143, hash: 'b5ff7423c72eb4487c5d0205e56128dc98c06bc0a2838ec287d636ea8ffe3c5c', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1014, hash: '2fa565e0a952eaccf44d76e9f91d7e9c8e813d81db90de1d859153bf316d5e0d', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'admin/orders/index.html': {size: 47956, hash: '607b4dd478b637bcca0e238d8a4accd866590c38e64289c10f65f9226fc7b020', text: () => import('./assets-chunks/admin_orders_index_html.mjs').then(m => m.default)},
    'products/index.html': {size: 98590, hash: '53d2700a5c2d4b99e5721de5a86f761955f2c1768f83f47f82187056473e042b', text: () => import('./assets-chunks/products_index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 95820, hash: '3e394161b14fda497e56997dc4b466975df32bdf710d27538927f86bb5ce49ea', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'admin/products/index.html': {size: 47970, hash: 'ee77071997c1d93962447fc2e64cc80b511117cdd7f36babd33fbbfa753f72da', text: () => import('./assets-chunks/admin_products_index_html.mjs').then(m => m.default)},
    'orders/index.html': {size: 159173, hash: 'fb64b174e5731d58543c9d40c4f8c59340cc753eb0d0abe813249ff27dfec010', text: () => import('./assets-chunks/orders_index_html.mjs').then(m => m.default)},
    'styles-GG3JJJ5V.css': {size: 433624, hash: 'I0e1w2JAkj4', text: () => import('./assets-chunks/styles-GG3JJJ5V_css.mjs').then(m => m.default)}
  },
};
