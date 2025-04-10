from app import db
from app.auth.helpers import Decryptor

class User():
    def __init__(self, sid, dn, username, permissions):
        self.sid = sid
        self.dn = dn
        self.username = username
        self.permissions = permissions

    def __repr__(self):
        return self.dn

    def get_id(self):
        return self.dn

    def is_active(self):
        return True

    def is_authenticated(self):
        return True
    
    def is_anonymous(self):
        return False

    def get_permissions(self):
        return self.permissions.split(',')

class Secrets(db.Model):
    __tablename__ = "secrets"
    id = db.Column(db.Integer, primary_key=True)
    Audience = db.Column(db.String)
    _SecretKey = db.Column('SecretKey', db.String)
    Roles = db.relationship("Roles", back_populates="Secret")
    
    @property
    def SecretKey(self):
        return Decryptor().decrypt(self._SecretKey)

    def serialize(self):
        return {
            "id": self.id,
            "Audience": self.Audience,
            "SecretKey": self.SecretKey,
            "Roles": [ role.serialize_min() for role in self.Roles ]
        }

class Roles(db.Model):
    __tablename__ = "roles"
    id = db.Column(db.Integer, primary_key=True)
    Role = db.Column(db.String)
    DistinguishedName = db.Column(db.String)
    SecretId = db.Column(db.Integer, db.ForeignKey('secrets.id'))
    Secret = db.relationship("Secrets", back_populates="Roles")

    def serialize(self):
        return {
            "id": self.id,
            "Role": self.Role,
            "DistinguishedName": self.DistinguishedName,
            "SecretId": self.SecretId,
            "Secret": self.Secret.serialize()
        }

    def serialize_min(self):
        return {
            "id": self.id,
            "Role": self.Role,
            "DistinguishedName": self.DistinguishedName,
            "SecretId": self.SecretId,
        }

        