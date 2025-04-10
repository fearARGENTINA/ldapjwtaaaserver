# LDAP + OTP Authentication / Authorization Services with secure JWT creation for session management.

The solutions is provided with multiple services like:
- Postgres: simply the relational database server for session keys store.
- Log socket receiver: a simple parser for receiving logs through a TCP/UDP socket.
- Key role binding service front: ReactJS frontend to expose the JWT application audience's and JWT signing keys.
- Key role binding service: Python backend for the management of audience's and signing keys of JWT's.
- Filebeat: simply a filebeat service to audit logs storing in not included Elasticsearch motor.
- Auth service: an backend REST API developed in Python, capable of authenticate users through LDAP credentials + OTP flow, and generate JWT leveraging the audiences/signing keys of the key role binding service.
