# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Enhanced README with GitHub badges and SEO-friendly sections
- Professional contribution guidelines
- Code of Conduct for open-source collaboration
- Security policy documentation
- Changelog for release tracking

### Changed
- Public registration now blocks admin invite code usage
- Added secret admin-only account creation endpoint
- Added admin endpoint security audit logging
- Register page clarifies organizer-only invite codes

### Security
- Locked down admin account creation flow
- Improved authorization audit trails for admin routes

## [1.1.0] - 2026-03-25

### Added
- Database-backed profile image storage (base64)
- Improved navbar profile image rendering
- New admin security hardening controls
- Extended CORS support for Netlify production domain

### Fixed
- ApplicationsReview stats initial load issue (showing zeros)
- OAuth domain mismatch guidance for deployment changes
- Profile image display and upload consistency

### Changed
- README rewritten with startup and deployment guide
- JSON payload limits updated for profile image support

## [1.0.0] - 2026-03-20

### Added
- Initial production deployment with MERN stack
- JWT authentication and role-based access
- Resource creation and management workflows
- Application submission and review system
- Admin console and policy enforcement tools
- Netlify frontend deployment
- Render backend deployment
- MongoDB Atlas cloud database integration

---

## Release Notes Template

When creating new releases, follow this template:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Updates to existing features

### Deprecated
- Soon-to-be removed features

### Removed
- Features removed in this release

### Fixed
- Bug fixes

### Security
- Security improvements/fixes
```
