---
name: Server migration to HestiaCP
description: Migrated from cPanel/CloudLinux to Linux + HestiaCP — paths and Passenger config changed
type: project
---

Migrated from cPanel/CloudLinux to Linux + HestiaCP (March 2026).

**Why:** New server setup, code rsync'd over.

**How to apply:**
- Old path `/home/sis/public_html/sis` no longer exists
- New path: `/home/sis/web/sis.ulearnschool.com/public_html/sis`
- `.htaccess` for Passenger is no longer used — HestiaCP handles Node.js app routing
- The old `.htaccess` (with `PassengerAppRoot "/home/sis/public_html/sis"`) is obsolete
- CLAUDE.md still references old cPanel paths/commands — should be updated
