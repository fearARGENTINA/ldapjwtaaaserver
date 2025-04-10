from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, PositiveInt, StrictInt, StrictStr

class LoginPostSchema(BaseModel):
    username: StrictStr
    password: StrictStr

class OtpPostSchema(BaseModel):
    otp : StrictStr

class SecretsQuerySchema(BaseModel):
    id: Optional[int]
    audience: Optional[str]
    searchAudience: Optional[str]
    limit: Optional[PositiveInt] = 100
    skip: Optional[int] = Field(0, ge=0)

class SecretsPostSchema(BaseModel):
    audience: StrictStr

class SecretsPutSchema(SecretsPostSchema):
    id: StrictInt

class RolesQuerySchema(BaseModel):
    id: Optional[int]
    role: Optional[str]
    distinguishedName: Optional[str]
    secretId: Optional[int]

class RolePostSchema(BaseModel):
    role: StrictStr
    distinguishedName: StrictStr
    secretId: StrictInt

class RolePutSchema(RolePostSchema):
    id: StrictInt

class UserQuerySchema(BaseModel):
    username: Optional[str]
    blocked: Optional[bool]

class UserPostSchema(BaseModel):
    username: StrictStr
    totpSeed: Optional[str]
    lastTOTP: Optional[str]
    blocked: Optional[bool]
    blockedUntil: Optional[datetime]
    failTOTPCount: Optional[int]
    failPasswordCount: Optional[int]
    