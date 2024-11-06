import crypto from "crypto";
import { store } from "./storage";
import Ajv from "ajv";
import base64 from "react-native-base64";
import { Buffer } from "buffer";

const ajv = new Ajv();

enum Reason {
  PRIVATE_KEY_NOT_DEFINED,
  INVALID_CREDENTIAL,
}

class CredentialError extends Error {
  reason: Reason;
  message: string;
  cause?: any;

  constructor(reason: Reason, message: string, cause?: any) {
    super();
    this.reason = reason;
    this.message = message;
    this.cause = cause;
  }
}

class Credential {
  readonly id: number;
  readonly name: string;
  readonly lastname: string;
  readonly email: string;
  readonly dni: number;
  readonly role: string;
  // Base64 representation of the photo
  readonly photo: string;
  readonly valid_from: string;
  readonly valid_to: string;

  constructor(
    id: number,
    name: string,
    lastname: string,
    email: string,
    dni: number,
    role: string,
    photo: string,
    valid_from: string,
    valid_to: string,
  ) {
    this.id = id;
    this.name = name;
    this.lastname = lastname;
    this.email = email;
    this.dni = dni;
    this.role = role;
    this.photo = photo;
    this.valid_from = valid_from;
    this.valid_to = valid_to;
  }

  static toBase64(credential: Credential): string {
    return base64.encode(JSON.stringify(credential));
  }

  static fromBase64(credential: string): Credential {
    const parsed = JSON.parse(base64.decode(credential));
    const isValid = ajv.validate(credentialSchema, parsed);
    if (!isValid) {
      throw new CredentialError(
        Reason.INVALID_CREDENTIAL,
        "Credential is not valid",
      );
    }
    return parsed;
  }
}

const credentialSchema = {
  type: "object",
  properties: {
    id: {
      type: "number",
    },
    name: {
      type: "string",
    },
    lastname: {
      type: "string",
    },
    email: {
      type: "string",
    },
    dni: {
      type: "number",
    },
    role: {
      enum: ["A", "B", "C", "D", "E", "P", "X"],
    },
    photo: {
      type: "string",
    },
    valid_from: {
      type: "string",
      nullable: true,
    },
    valid_end: {
      type: "string",
      nullable: true,
    },
  },
  required: ["name", "lastname", "email", "photo"],
};

class CredentialService {
  async decrypt(credentials: string): Promise<Credential> {
    const pk = await store.getPrivateKey();
    if (!pk) {
      throw new CredentialError(
        Reason.PRIVATE_KEY_NOT_DEFINED,
        "Private key was not present in the store",
      );
    }
    const decrypted = crypto.privateDecrypt(
      {
        key: pk,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      // openssl pkeyutl -encrypt -inkey keyfile.pub -pubin -in user.json -out encrypted.bin -keyform PEM -pkeyopt rsa_padding_mode:oaep -pkeyopt rsa_oaep_md:sha256
      Buffer.from(credentials, "base64"),
    );
    const parsed = JSON.parse(decrypted.toString("utf8"));
    console.log(parsed);
    const isValid = ajv.validate(credentialSchema, parsed);
    if (!isValid) {
      throw new CredentialError(
        Reason.INVALID_CREDENTIAL,
        "The credential is not valid",
      );
    }
    return new Credential(
      parsed.id,
      parsed.name,
      parsed.lastname,
      parsed.email,
      parsed.dni,
      parsed.role,
      parsed.photo,
      parsed.valid_from,
      parsed.valid_to,
    );
  }
}

const credentialService = new CredentialService();

export { credentialService, Credential };
