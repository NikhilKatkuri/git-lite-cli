# Security Policy

## Our Commitment

As a solo developer, I prioritize the security of GLC and the safety of your Git repositories. While I strive to follow industry best practices, I acknowledge that security is a continuous process.

## Supported Versions

Currently, only the latest version of GLC receives security updates.

| Version | Supported |
| ------- | --------- |
| 3.x.x   | Yes       |
| < 2.x   | No        |

## How GLC Protects You

Local Processing: GLC performs Git operations locally on your machine. Your code is never uploaded to external servers.

Encrypted Storage: Sensitive data (like GitHub tokens) is handled through the conf package, stored in your system's protected user directory.

Sanitized Execution: All Git commands run via execa are passed as arguments, significantly reducing the risk of command injection.

## Reporting a Vulnerability

Please do not open a public GitHub Issue for security vulnerabilities.

If you discover a security bug, please report it directly to me so I can fix it before it becomes public knowledge.

Email: Send a detailed report to [mail](knikhil07k@gmail.com).

Details to Include:

- Type of issue (e.g., token exposure, command injection).

- Steps to reproduce the vulnerability.

- Potential impact.

## Data Privacy & The Analytics Promise

GLC uses a private backend for telemetry to improve the tool. This is a promise to my users:

- Anonymity: Telemetry data is stripped of personal identifiers, file paths, and sensitive metadata before being sent to the backend.

- Minimalism: Only the necessary command counts, OS types, and execution times are tracked.

- No Code Access: GLC never reads the contents of your files or your commit messages for analytics purposes.

- Encryption: All data sent to the private backend is transmitted over secure HTTPS connections.

## Response Time

As a solo maintainer, I typically respond to security reports within 48–72 hours. I will keep you updated on the progress of the fix and will provide credit for your discovery (if desired) once the patch is released.

# Out of Scope

The following are not considered vulnerabilities of GLC:

- Security flaws in Git itself.

- Security flaws in Node.js or pnpm.

- Issues arising from a compromised local machine.
