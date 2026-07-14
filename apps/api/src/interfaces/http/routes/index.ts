import type { FastifyInstance } from 'fastify';
import { authRoutes } from '../../../modules/auth/routes/auth.routes.js';
import { categoryRoutes } from '../../../modules/categories/routes/category.routes.js';
import { customerRoutes } from '../../../modules/customers/routes/customer.routes.js';
import { dashboardRoutes } from '../../../modules/dashboard/routes/dashboard.routes.js';
import { evolutionRoutes } from '../../../modules/evolution/routes/evolution.routes.js';
import { orderRoutes } from '../../../modules/orders/routes/order.routes.js';
import { productRoutes } from '../../../modules/products/routes/product.routes.js';

export async function registerApiRoutes(app: FastifyInstance) {
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(categoryRoutes, { prefix: '/categories' });
  await app.register(productRoutes, { prefix: '/products' });
  await app.register(customerRoutes, { prefix: '/customers' });
  await app.register(orderRoutes, { prefix: '/orders' });
  await app.register(dashboardRoutes, { prefix: '/dashboard' });
  await app.register(evolutionRoutes, { prefix: '/webhooks/evolution' });
}
