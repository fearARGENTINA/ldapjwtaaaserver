from Crypto.PublicKey import RSA
from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.Random import get_random_bytes
import base64
import secrets
from app.auth.config import CHARSET_SECRETS, \
                            PUBLIC_RSA_KEY, \
                            PRIVATE_RSA_KEY, \
                            PRIVATE_RSA_PASSPHRASE, \
                            AES_KEY_B64
import sys

class Decryptor:
    def encryptRSA(self, data):
        recipient_key = RSA.import_key(open(PUBLIC_RSA_KEY).read())
        session_key = get_random_bytes(16)
        cipher_rsa = PKCS1_OAEP.new(recipient_key)
        enc_session_key = cipher_rsa.encrypt(session_key)
        cipher_aes = AES.new(session_key, AES.MODE_EAX)
        ciphertext, tag = cipher_aes.encrypt_and_digest(data.encode('utf-8'))
        return base64.b64encode(enc_session_key+cipher_aes.nonce+tag+ciphertext).decode('utf-8')

    def decryptRSA(self, cipherblob):
        private_key = RSA.import_key(open(PRIVATE_RSA_KEY).read(), passphrase=PRIVATE_RSA_PASSPHRASE)
        whole = base64.b64decode(cipherblob)
        enc_session_key = whole[:private_key.size_in_bytes()]
        nonce = whole[private_key.size_in_bytes():private_key.size_in_bytes()+16]
        tag = whole[private_key.size_in_bytes()+16:private_key.size_in_bytes()+32]
        ciphertext = whole[private_key.size_in_bytes()+32:]
        cipher_rsa = PKCS1_OAEP.new(private_key)
        session_key = cipher_rsa.decrypt(enc_session_key)
        cipher_aes = AES.new(session_key, AES.MODE_EAX, nonce)
        data = cipher_aes.decrypt_and_verify(ciphertext, tag)
        return data.decode('utf-8')

    def encryptAES(self, data):
        AES_KEY = base64.b64decode(AES_KEY_B64)
        cipher = AES.new(AES_KEY, AES.MODE_EAX)
        ciphertext, tag = cipher.encrypt_and_digest(data.encode('utf-8'))
        return base64.b64encode(cipher.nonce+tag+ciphertext).decode('utf-8')

    def decryptAES(self, cipherblob):
        AES_KEY = base64.b64decode(AES_KEY_B64)
        whole = base64.b64decode(cipherblob)
        nonce = whole[:16]
        tag = whole[16:32]
        ciphertext = whole[32:]
        cipher = AES.new(AES_KEY, AES.MODE_EAX, nonce)
        data = cipher.decrypt_and_verify(ciphertext, tag)
        return data.decode('utf-8')

class SecretGenerator:
    def generateCode(self, length: int = 8):
        return "".join(secrets.choice(CHARSET_SECRETS) for _ in range(length))