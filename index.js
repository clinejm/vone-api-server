import pkg from 'pg';
import { nanoid } from 'nanoid'
const { Pool, Client } = pkg;


import jsonwebtoken from "jsonwebtoken";

import dotenv from 'dotenv';

dotenv.config();


const port = process.env.PORT || 3001

const connectionString = process.env.PG


const AUTH0_PUBLIC_KEY = {
    "key": "-----BEGIN CERTIFICATE-----\nMIIC/TCCAeWgAwIBAgIJS7r3+hWwTjMlMA0GCSqGSIb3DQEBCwUAMBwxGjAYBgNV\nBAMTEWRldi1hN2UuYXV0aDAuY29tMB4XDTIwMDQxNDA1MTk0OFoXDTMzMTIyMjA1\nMTk0OFowHDEaMBgGA1UEAxMRZGV2LWE3ZS5hdXRoMC5jb20wggEiMA0GCSqGSIb3\nDQEBAQUAA4IBDwAwggEKAoIBAQDWmrYPzIB4ENJewYoD4DFPkqDKFZEm3I/+25/O\nDN/MEI8Q+nZMuJCLSjKhT6Aci+6njHsNhuZIne+0RFLDopqCOL6kpf4FpxtZ31OA\n8ELjLCQEumU8UVKOUlnz4ATw/PEJMEd0K79iwur6K7AsqCm4HAaSNN9TFqkt3kRA\nb6YLfoGzEH5Scts18xMw4s3chhB9nfM7jrx45/yWGu8447QtaYwL7Sg62ovwKl0t\nIgKqYbPP6ebaJpyG5FUh3F12qxk0T9Fk8mh9qkEtfAttlvFpR16NCqd+SkhkphiS\nJ253Yr1DgZF/Au7jd9X1xY36Mh27DPDcKwvg8sBszke1lJn7AgMBAAGjQjBAMA8G\nA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFEggaBjhQdJqMR1OQwkaJnvqSKjQMA4G\nA1UdDwEB/wQEAwIChDANBgkqhkiG9w0BAQsFAAOCAQEAuAkLlUpEEE0y3i6oFY0o\nr3oXv5ldqnBmUXJUEhEbKj3xT3Whb5Ctx60w53NidLoDCH+j9Ap2Nq5VvVbKKOGp\nnIVMwTbexbGvgJovO5zTBJ9wKYwwtU1yIQW9J7zRcBVaX8afqvFmeCO2MRSWcGyF\ny4MnBM9E3FyVjfksK6iYfEDRP1MJAuYpF0ElOEjMIivBPz+8g7cFw4Au7ZuTh/S8\nISKkhPPNoAV7XwgQrhXrfsqhqxVoxP4xZEKeWrj7r4DiYLHux0nBYxr90LJ0RF5T\nx6aR5LelQ6a8kLbitHAXtTmwDcI6UPboCUik4UuMAsDO+cMlEK04h3j28dD+dAtd\nAw==\n-----END CERTIFICATE-----",
    "type": "RS512"
}



const db_cert = `-----BEGIN CERTIFICATE-----\nMIIEQTCCAqmgAwIBAgIUfZapzQSiSJymz9OqDvSfT4HqlLIwDQYJKoZIhvcNAQEM\nBQAwOjE4MDYGA1UEAwwvNzFkZDcwMDgtMWIzZS00NTkzLWJhYjItOTJhZjdmYWVl\nMzU5IFByb2plY3QgQ0EwHhcNMjIwMTMwMDAwOTExWhcNMzIwMTI4MDAwOTExWjA6\nMTgwNgYDVQQDDC83MWRkNzAwOC0xYjNlLTQ1OTMtYmFiMi05MmFmN2ZhZWUzNTkg\nUHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBALFvEAJy\ntwoLIatQfZhJFbncE50dwRzd87VDGhrtsatCa5r+SNmH4NX1RApxDDh4CjrjDTUe\nQLslDJ2YT5AGiceYwoeSNKY7hUZ1EtSyLXpgW2GOqFNij+uVyJQtjs1d6zrFvdw3\n5b3Qi2grpaBeTCqY6b3QTKcJQCwrWUC+fM/uhrIDZNM8xp7mNNQALKKC3KXJ6bW8\nGbd/ttKTN49D3RiwnQ84B/S5FP8DGdYg42KA8m+Q3aZmI73GQuQU44yXsQpbWMQ8\nn4WL1ZWp6rUrWzZVdbt0J3eSa3QNaumTXPo7bjKvnttijJWhAZUujMWihYjK2cfW\nzJFJacpgz3/PxZWmsZTG+W2I/eW4H+OTCJYwgXxEEhq3Wc3Eq/1V6PKu+c+ucCVY\n7/lMKXuEWPVFxMAgPHP8FCUFGkwIMOwaPxgRF3kIJt3qx/Rn1nlswq8u2/sbl3bo\n0xc1DspjE0kSMvjgLazgwYKh3zyoL9ffuAUy1FdDuSfeeB2UdG9rOOPcXQIDAQAB\noz8wPTAdBgNVHQ4EFgQUeAE6fHCmLGchSpcgtoj1I+lO4KkwDwYDVR0TBAgwBgEB\n/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBACJmdGlLXjKQXJwp\nPCtWVS828Ab1vt0o9uQDI2q7nQfkHSxlXZBVx7S/2JMMzCxUJquWdkiUT048t6jk\nunO7sStVGwIYHSpxdQWtUQWKxcbTTYwau5BLKyXTR3Z1hvrATUKGX21h57UaSHEY\nUkwkKsSm10acoJRZFZc3CSpqJUH5K/qIPLAljkL+b8MxbOoMhtVTXoEn0NMeXcKm\n2BTf9EjmZL5Mx4tmCCj4YksiT6XhX2c0GBymiqfca0z2KBbqCrvzZ7zUIOVHmSQU\n6UkZUjsuMFR/7rsOMUQiXMwMHbzp8alYn6WkdScqwa386h12ivb66DcF34GdfsWl\nwUEZaHY9soBzFg+m3maSvEDPHSYvxVwu1ah8xa7CA0spKp2SBYiHsv74GdtJLmii\n7koZQJG34XBIXHaZFYvx4NCkewqyIDl3+mTSA4RPJEcruN06GmjaJbv/CsSsZXVz\n8DDI1I6vE4WLn3HutmLo4FmV2vzDyi8CUqVarg/GDU7Pe5U0Fw==\n-----END CERTIFICATE-----`;


const pool = new Pool({
    connectionString,
    ssl: {
        ca: db_cert,
    },
});


const USER_ORG_QUERY = `SELECT u.id, u.name, u.email, u.auth_id, o.id as org_id, o.code, o.name as org_name
from 
    public.user u, 
    public.org_user ou,
    public.org o
where 
    u.auth_id=$1
and u.id = ou.user_id 
and ou.org_id = o.id
and ou.org_id=$2`

const DOC_QUERY = 'SELECT data FROM "shared_doc" WHERE id = $1'

const DOC_INSERT = `INSERT INTO "shared_doc" ("id", "org_id", "type", "data") VALUES ($1, $2, $3, $4)
ON CONFLICT(id) DO UPDATE SET data = $4`



const INSERT_PURSUIT = `update pursuit set meta=$1, answers=$2, categories=$3, questions=$4, notes=$5 where id = $6 `;



async function onAuthenticate(data) {


    const { token, documentName } = data
    //console.log('onAuthenticate', documentName, token);

    let authId;

    try {
        const verfied = jsonwebtoken.verify(token, AUTH0_PUBLIC_KEY.key);
        authId = verfied['https://hasura.io/jwt/claims']?.['x-hasura-user-id'];
        console.log('verfied', verfied);
    } catch (e) {

        console.error('invalid token', e);
        throw e
    }

    const doc = splitDocName(documentName);
    //console.log('onAuth', documentName, doc.orgId);


    const { rows } = await pool.query(USER_ORG_QUERY, [authId, doc.orgId])

    console.log('rows', rows);
    if (!rows || rows.length === 0) {
        throw Error('User not authorized for this org');
    }

    const { id, org_id, name, email, auth_id, code, org_name } = rows[0]

    const user = {
        user: {
            id, name, email, auth_id
        },
        org: {
            id: org_id,
            code,
            name: org_name
        }
    };

    // console.log('user/org', user);

    // // You can set contextual data to use it in other hooks
    return user;
}


console.log("hello??", nanoid());