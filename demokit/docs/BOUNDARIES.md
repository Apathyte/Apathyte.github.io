# System boundaries

This browser application loads static files from the website. It has no authentication, database API, cloud connector, telemetry, broker connection, protocol session or machine command path. Browser-local storage and explicit file import/export are its only persistence mechanisms. The production Content Security Policy blocks network connections from scripts. External reference links open only when the visitor follows them.

A synthetic publisher, routing illustration and optional consumers demonstrate pub/sub. Delivery in this exercise does not establish broker quality of service, clock synchronisation, ordering, retries or permission to act. A real adapter needs a versioned observation contract, quality/timestamp handling and acceptance tests.

ISA-95 activity levels describe different responsibilities. Equipment hierarchy, material routing, security zoning and command authority are separate relationships. This is a proposed teaching mapping, not a certified standard model. A physical observation becomes operational evidence only with context and the required authority.
