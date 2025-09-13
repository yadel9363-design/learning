
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/login",
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/products"
  },
  {
    "renderMode": 2,
    "route": "/orders"
  },
  {
    "renderMode": 2,
    "route": "/login"
  },
  {
    "renderMode": 2,
    "route": "/admin/orders"
  },
  {
    "renderMode": 2,
    "route": "/admin/products"
  },
  {
    "renderMode": 2,
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 1134, hash: 'f08a83ac883fa18a6c5521113c50785bde2a7d05223dd9ca297324ef33f59dbf', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1005, hash: 'b89714a2bb1afc97bf1954cb7982d85aa23b7b7b0e280c1c80198fe08723a158', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'login/index.html': {size: 95775, hash: 'f5577b5e2f9984211afb472983ed9f6e508aaea9e2899ea9550b6b95e3f29ead', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'admin/orders/index.html': {size: 47911, hash: '63b81bb3028cd1655b5502e1a2fc4c11ee111f959ddb774e4566cda451a82904', text: () => import('./assets-chunks/admin_orders_index_html.mjs').then(m => m.default)},
    'admin/products/index.html': {size: 47925, hash: '7319d2d999ce680baf30bf062d131f29c7b377a5fe06243d3c68f69a704e8142', text: () => import('./assets-chunks/admin_products_index_html.mjs').then(m => m.default)},
    'products/index.html': {size: 98545, hash: '6b7ac3368fc45ea5b3adbb36da3a6164ab656ebb3d11b14cb4a267e6f80e0124', text: () => import('./assets-chunks/products_index_html.mjs').then(m => m.default)},
    'orders/index.html': {size: 159128, hash: '85f2f5afef525da06c2895b657d032c8ca1f12b469292d68f1e859c780e054c2', text: () => import('./assets-chunks/orders_index_html.mjs').then(m => m.default)},
    'styles-GG3JJJ5V.css': {size: 433624, hash: 'I0e1w2JAkj4', text: () => import('./assets-chunks/styles-GG3JJJ5V_css.mjs').then(m => m.default)}
  },
};
