from app import db
from app.auth.helpers import Decryptor
from sqlalchemy.ext.hybrid import hybrid_property
import base64
import sys

class User():
    def __init__(self, sid, dn, username):
        self.sid = sid
        self.dn = dn
        self.username = username

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

class Users(db.Model):
    __tablename__ = "users"
    Username = db.Column(db.String, primary_key=True)
    _TOTPSeed = db.Column("TOTPSeed", db.String)
    LastTOTP = db.Column(db.String, default="")
    Blocked = db.Column(db.Boolean, default=False)
    BlockedUntil = db.Column(db.DateTime, default=None)
    FailPasswordCount = db.Column(db.Integer, default=0)
    FailTOTPCount = db.Column(db.Integer, default=0)

    @hybrid_property
    def TOTPSeed(self):
        if self._TOTPSeed is None:
            return None
        return Decryptor().decryptAES(self._TOTPSeed)

    @TOTPSeed.setter
    def TOTPSeed(self, otp):
        data = Decryptor().encryptAES(otp)
        self._TOTPSeed = data
    
    def __init__(self, username, TOTPSeed = None):
        self.Username = username
        if not TOTPSeed is None:
            self.TOTPSeed = TOTPSeed

    def serialize(self):
        return {
            "Username": self.Username,
            "TOTPSeed": self.TOTPSeed,
            "LastTOTP": self.LastTOTP,
            "Blocked": self.Blocked,
            "BlockedUntil": self.BlockedUntil,
            "FailTOTPCount": self.FailTOTPCount,
            "FailPasswordCount": self.FailPasswordCount,
        }

class Secrets(db.Model):
    __tablename__ = "secrets"
    id = db.Column(db.Integer, primary_key=True)
    Audience = db.Column(db.String)
    _SecretKey = db.Column('SecretKey', db.String)
    Roles = db.relationship("Roles", back_populates="Secret")

    def __init__(self, audience, secretKey):
        self.Audience = audience
        self.SecretKey = secretKey

    @hybrid_property
    def SecretKey(self):
        return Decryptor().decryptRSA(self._SecretKey)

    @SecretKey.setter
    def SecretKey(self, secretKey):
        self._SecretKey = Decryptor().encryptRSA(secretKey)

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

    def __init__(self, role, distinguishedName, secretId):
        self.Role = role
        self.DistinguishedName = distinguishedName
        self.SecretId = secretId

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