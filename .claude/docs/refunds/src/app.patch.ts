// =====================================================================
// Patches to src/app.ts — apply these edits manually (small, in 3 places).
// =====================================================================

// 1) Import the new route module (top of file, alongside the other imports):
//
//    import { refundRoutes } from './routes/refunds';

// 2) Add the public webhook path to the publicPaths array (inside requireAuth section):
//
//    const publicPaths = [
//      ...,
//      '/sis/api/webhooks',                      // already there — covers /webhooks/*
//      // (no change required if /sis/api/webhooks is already a prefix)
//    ];
//
//    The webhook mounts at /sis/api/webhooks/refund-request/webhook, so it is already
//    covered by the existing '/sis/api/webhooks' prefix. No edit needed.

// 3) Mount the routes (alongside the other `app.use('/sis/api/...')` calls):
//
//    // Public webhook (anonymous + shared-secret auth inside the route).
//    app.use('/sis/api/webhooks/refund-request', refundRoutes(prisma));
//
//    // Authenticated CRUD (gated by requireAuth and role permissions).
//    app.use('/sis/api/refunds', refundRoutes(prisma));
//
//    Note: mounting the same Router on two paths is fine — the inside of the
//    router uses path-relative routes. Only the /webhook sub-route is
//    advertised publicly; the rest sit under /sis/api/refunds and inherit
//    requireAuth.

// 4) Page serving for the admin UI (next to the other static page routes):
//
//    app.get('/sis/refunds', (_req, res) => {
//      res.sendFile(path.join(__dirname, '..', 'public', 'refunds', 'queue.html'));
//    });
//    app.get('/sis/refunds/:id', (_req, res) => {
//      res.sendFile(path.join(__dirname, '..', 'public', 'refunds', 'review.html'));
//    });
